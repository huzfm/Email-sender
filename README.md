# Devark Mass Emailer – Full Setup Guide

A complete step-by-step guide to set up your personalized Gmail + Sheets mass email system using Google APIs. This document explains everything from creating your sheet → building templates → generating OAuth credentials → running your program.

---

## 📝 1. Create Your Google Sheet

Create a new Google Sheet and name it **Devark Mass Emailer**.

Your sheet must contain **two tabs**:

### ✔ Tab 1 — `Recipients`

### ✔ Tab 2 — `EmailTemplate`

---

## 📄 2. Setup Tab 1: Recipients

Create a sheet named **Recipients**.

Add these exact columns:

| Column | Header      | Description                                     |
| ------ | ----------- | ----------------------------------------------- |
| A      | Name        | Recipient's first/last name                     |
| B      | Email       | Recipient’s email                               |
| C      | Company     | Their company name                              |
| D      | Role        | Their job role / position                       |
| E      | Custom Note | Personalized note about them                    |
| F      | Status      | Script marks as “Sent” after email is delivered |

### Example:

| Name     | Email               | Company    | Role    | Custom Note             | Status |
| -------- | ------------------- | ---------- | ------- | ----------------------- | ------ |
| John Doe | johndoe@gmail.com   | Acme Inc   | CEO     | Big fan of your work    |        |
| Sara Ali | sara@startuphub.com | StartupHub | Founder | Loved your last webinar |        |

> ⚠️ Do NOT manually add “Sent”. The script updates this.

---

## ✉️ 3. Setup Tab 2: EmailTemplate

Create another tab named **EmailTemplate**.

### **A1 → Email Body Template**

Supports these placeholders:

- `{{name}}`
- `{{company}}`
- `{{role}}`
- `{{custom_note}}`

Example template:

```
Hi {{name}},

I’ve been following your work at {{company}}, and I’m impressed by your contribution as a {{role}}.

{{custom_note}}

Would you be open to a quick call sometime this week?

Best regards,
Huzaif
```

### **A2 → Common Subject**

```
CommonSubject: Opportunity for Collaboration with Devark
```

---

## 🔧 4. Install Dependencies

Run:

```bash
npm install googleapis google-auth-library
```

---

## 🔑 5. Generate OAuth Credentials

1. Go to **Google Cloud Console**  
   https://console.cloud.google.com
2. Create a new project
3. Enable APIs:
   - Gmail API
   - Google Sheets API
4. Go to **Credentials → Create Credentials → OAuth Client ID**
5. Choose: **Desktop App**
6. Download `credentials.json`
7. Place it in your project root:

```
/project
  ├── credentials.json
  ├── index.ts
  └── token.json  (auto-created)
```

### Why Desktop App?

Because it avoids Test User restrictions — you can instantly use it.

---

## ⚙️ 6. Add Environment Variable

Create `.env`:

```
SpreadSheetID=YOUR_SHEET_ID
```

Your sheet link:

```
https://docs.google.com/spreadsheets/d/12vGmeJUBjATmF3jRkPzG4-vkfcweTIW6X7iQucdLfrA/edit
```

The ID is:

```
12vGmeJUBjATmF3jRkPzG4-vkfcweTIW6X7iQucdLfrA
```

---

## 🔐 7. Run Authentication

Run:

```bash
node dist/index.js
```

You’ll see:

```
Authentication required:
https://accounts.google.com/o/oauth2/v2/auth?...
Enter the code:
```

Steps:

1. Open the link
2. Login to Gmail
3. Copy the verification code
4. Paste into terminal
5. Your `token.json` is saved
6. Authentication complete 🎉

Next runs will NOT require login again.

---

## 🧠 8. Placeholder System

Your template can use:

| Placeholder       | Description       |
| ----------------- | ----------------- |
| `{{name}}`        | Recipient name    |
| `{{company}}`     | Company           |
| `{{role}}`        | Job role          |
| `{{custom_note}}` | Personalized note |

The system automatically supports:

```
{{ name }}
{{Name}}
{{ custom note }}
{{custom_note}}
```

---

## 🚀 9. Running the Email Script

To send emails:

```bash
node dist/index.js
```

What happens:

- Reads your recipients list
- Loads your HTML email template
- Loads your common subject
- Personalizes each email
- Sends using Gmail API
- Marks each row as “Sent”
- Moves to next automatically
- Skips automatically if already “Sent”

---

## 📧 10. Gmail API Send Limits

For a **personal Gmail account**:

| Action Type       | Limit        |
| ----------------- | ------------ |
| Gmail API sending | ~100–150/day |
| Gmail normal UI   | ~500/day     |

Your script already uses a delay:

```ts
await new Promise((r) => setTimeout(r, 1500));
```

This avoids throttling.

---

## 🛡️ 11. Security Notes

- OAuth credentials stay local
- token.json stays local
- Emails send from YOUR Gmail only
- No server-side dependency
- No exposing Gmail password
- OOB mode avoids localhost issues

---

## 🎉 You're Done!

You now have:

✔ Gmail API mass emailing  
✔ Google Sheets-powered contacts  
✔ Customizable templates  
✔ Personalization tags  
✔ Common subject  
✔ Safety throttling  
✔ Automatic status tracking

---

## Optional Advanced Features

Available upon request:

- Duplicate-prevention (hashing + cache)
- Retry logic for failed sends
- Error column in sheet
- Preview mode (no sending)
- Logging dashboard
- Next.js frontend UI
- Drag-and-drop email builder

Just ask if you want these added!
