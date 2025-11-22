import * as fs from "fs";
import * as readline from "readline";
import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/spreadsheets",
];

const TOKEN_PATH = "token.json";
const SPREADSHEET_ID = process.env.SpreadSheetID;

async function authorize(): Promise<OAuth2Client> {
  const raw = fs.readFileSync("credentials.json", "utf8");
  const credentials = JSON.parse(raw);
  const installed = (credentials.installed || credentials.web) as any;
  const { client_secret, client_id, redirect_uris } = installed;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client as OAuth2Client;
  }

  return getNewToken(oAuth2Client as unknown as OAuth2Client);
}

function getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
  return new Promise((resolve, reject) => {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: SCOPES,
    });

    console.log("Authorize this app by visiting this URL:");
    console.log(authUrl);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("Enter the code here: ", async (code) => {
      rl.close();
      try {
        const r = await oAuth2Client.getToken(code);
        const token = r.tokens || (r as any).tokens || r;
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log("Token saved ✔");
        oAuth2Client.setCredentials(token);
        resolve(oAuth2Client);
      } catch (err) {
        console.error("Error retrieving token", err);
        reject(err);
      }
    });
  });
}

async function getSheetData(auth: OAuth2Client): Promise<string[][]> {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Recipients!A2:F",
  });

  return (res.data.values as string[][]) || [];
}

async function getEmailTemplate(auth: OAuth2Client): Promise<string> {
  const sheets = google.sheets({ version: "v4", auth });
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "EmailTemplate!A1",
  });

  const values = res.data.values as string[][] | undefined;
  if (!values || !values[0] || !values[0][0]) return "";
  return values[0][0];
}

function personalize(template: string, data: string[]): string {
  return template
    .replace(/{{name}}/g, data[0] || "")
    .replace(/{{company}}/g, data[2] || "")
    .replace(/{{role}}/g, data[3] || "")
    .replace(/{{custom_note}}/g, data[4] || "");
}

function extractSubject(template: string): string {
  const subjectLine = template.split("\n")[0] || "";
  return subjectLine.replace("Subject:", "").trim();
}

function stripSubject(template: string): string {
  return template.split("\n").slice(1).join("\n");
}

async function sendEmail(
  auth: OAuth2Client,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const gmail = google.gmail({ version: "v1", auth });

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=UTF-8",
    "",
    html,
  ].join("\n");

  const raw = Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: { raw },
  });
}

async function markAsSent(auth: OAuth2Client, rowIndex: number) {
  const sheets = google.sheets({ version: "v4", auth });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Recipients!F${rowIndex + 2}`,
    valueInputOption: "RAW",
    requestBody: {
      values: [["Sent"]],
    },
  });
}

async function main(): Promise<void> {
  if (!SPREADSHEET_ID) {
    console.error("SPREADSHEET_ID is not set.");
    process.exit(1);
  }

  try {
    const auth = await authorize();

    const recipients = await getSheetData(auth);
    const template = await getEmailTemplate(auth);

    for (let i = 0; i < recipients.length; i++) {
      const row = recipients[i];

      if (!row) continue;

      if (row[5] === "Sent") continue;

      const email = row[1];
      if (!email) continue;

      const personalized = personalize(template, row);

      const subject = extractSubject(template);
      const htmlBody = stripSubject(personalized);

      console.log("Sending to:", email);

      await sendEmail(auth, email, subject, htmlBody);
      await markAsSent(auth, i);

      console.log(`✔ SENT to ${email}`);
      await new Promise((r) => setTimeout(r, 1500)); // avoid rate limits
    }
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
}

main();
