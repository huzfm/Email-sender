# Mass Customized Emailer 

A complete step-by-step guide to set up your personalized Gmail + Sheets mass email system using Google APIs.
---

## 1. Create Your Google Sheet

Create a new Google Sheet

Your sheet must contain **two tabs**:

### Tab 1 — `Recipients`

### Tab 2 — `EmailTemplate`

---

## 2. Setup Tab 1: Recipients

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

---
Sample sheet link:

```
https://docs.google.com/spreadsheets/d/12vGmeJUBjATmF3jRkPzG4-vkfcweTIW6X7iQucdLfrA/edit
```

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

## 3. Generate OAuth Credentials

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

## ⚙️ 4. Add Environment Variable

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

## 5. Run Script

Run:

```bash
bu index.ts
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
6. Authentication complete 

Next runs will NOT require login again.

---
