# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GmailAutomate is an Express.js REST API service for WE Educación Ejecutiva that sends templated HTML emails to students via Zeptomail SMTP. It handles multiple email campaigns: welcome emails (24h/48h), SAP/PowerApps system credentials, FICO payment reminders, and online course notifications.

## Running the Project

```bash
# Install dependencies
npm install

# Start server (runs on port 4111)
node app.js

# Docker
docker build -t gmailautomate .
docker run -p 4111:4111 gmailautomate
```

## Manual Testing

Test files make live HTTP requests to the running server — start the server first, then run the test:

```bash
node prueba.js          # Google Sheets read test
node prueba-fico.js     # FICO email endpoint test
node prueba-zoho.js     # FICO payment reminder test
node test_sap.js        # SAP credentials endpoint
node test_apps.js       # PowerApps endpoint
node test_MM_ONLINE.js  # Online course emails
node test_zepto.js      # Zeptomail connection test
```

There is no `npm test` script configured.

## Architecture

### Core Application (`app.js`)

Single-file Express app (501 lines) with:
- **5 Nodemailer/Zeptomail SMTP transporters** — one per campaign type, allowing separate tracking/analytics per sender
- **HTML templates loaded into memory at startup** — 6 campaign templates + shared footer and FICO seal fragments
- **Token authentication** — all endpoints check `req.body.token === API_SECRET` before processing
- **Batch processing with 100ms delay** between emails to avoid Zeptomail rate limits

### API Endpoints (all POST, all require `token` field)

| Endpoint | Purpose |
|----------|---------|
| `/api/send-emails-json` | Batch 24h/48h welcome emails (selects transporter by `type` field) |
| `/api/send-inscription` | Single inscription/payment email |
| `/api/send-welcome` | Custom welcome email |
| `/api/send-fico-proxima` | FICO next payment notification |
| `/api/send-fico-cuotas` | Batch FICO payment reminders |
| `/api/send-sap-emails` | Batch SAP credentials emails |
| `/api/send-pwapps-emails` | Batch PowerApps credentials emails |

Batch endpoints return `{ success, message, sentCount, errorCount }`.

### Template System

Templates use `<?= variable ?>` syntax (legacy PHP/Apps Script style). Variable substitution is done with regex `.replace()` on the raw HTML string. Shared fragments (`footer.html`, `sello_fico.html`) are concatenated into templates at startup.

### Logging (`utils/logger.js`)

Winston logger with daily rotation into `logs/` directory:
- `app-YYYY-MM-DD.log` — all logs
- `error-YYYY-MM-DD.log` — errors only
- Files compressed after 14 days, deleted after 30 days

### Credentials

- `credentials/credentials.json` — Google OAuth credentials (for Sheets API, used in `prueba.js`)
- `credentials/service.json` — Google service account key
- Both are gitignored; SMTP credentials are currently hardcoded in `app.js`

## Key Configuration

- **Port:** 4111 (hardcoded in `app.js`)
- **API Secret:** hardcoded in `app.js` as `API_SECRET`
- **SMTP provider:** Zeptomail (`smtp.zeptomail.com:587`)
- **Sender address:** `alumno.we@we-educacion.com`
