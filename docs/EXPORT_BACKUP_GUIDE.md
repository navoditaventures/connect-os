# Export & Backup Guide

## Overview

ConnectOS allows you to export all your data as CSV or JSON for backup, analysis, or use in other tools. Your data stays under your control.

## Key Principles

✅ **Your Data, Your Access**
- Download anytime
- No external service required
- Works offline
- No API keys needed
- Keep local copies

❌ **What We Don't Do**
- No automatic backup
- No cloud storage integration (V1)
- No email backups
- No scheduled exports

## Export Formats

### CSV (Spreadsheet-friendly)

Best for:
- Excel/Google Sheets analysis
- Business intelligence tools
- Data warehouses
- Sharing with team members

Format:
```
CONTACTS
ID,Name,Company,Designation,Phone,WhatsApp,Email,Address,Industry,Type
...contact rows...

EVENTS
ID,Name,Date,Location,Description
...event rows...

INTERACTIONS
ID,Contact ID,Event ID,Type,Relationship,Opportunity,Stage,Notes,Follow-up Date,Follow-up Status
...interaction rows...
```

### JSON (Developer-friendly)

Best for:
- Programmatic processing
- Integration with other apps
- Long-term archival
- Full data fidelity

Structure:
```json
{
  "contacts": [
    {
      "id": "...",
      "name": "...",
      "company": "...",
      ...
    }
  ],
  "events": [...],
  "interactions": [...]
}
```

## How to Export

### Step 1: Go to Settings
- Bottom navigation → ⚙️ Settings
- Or: Dashboard → Settings icon

### Step 2: Find Export Data
- Scroll down to "Export Data" section
- See two buttons: CSV and JSON

### Step 3: Click Export Format
- **📊 Export as CSV** → Downloads as .csv file
- **📄 Export as JSON** → Downloads as .json file

### Step 4: File Saves to Downloads
- Filename: `connectos-export-YYYY-MM-DD.csv` (or .json)
- Open in Excel, Sheets, or text editor
- Move to safe location (backup drive, cloud storage)

## What's Included

### ✅ Exported

**Contacts Table**
- Name, company, designation
- Phone, WhatsApp, email, address
- Industry, contact type (active/historical)
- Created/updated timestamps

**Events Table**
- Event name, date, location
- Description
- Timestamps

**Interactions Table**
- Relationship, opportunity, stage
- Notes, follow-up information
- Communication history
- Timestamps

### ❌ Not Exported

- Message templates (custom only; defaults are in Settings)
- User settings (digital profile URL, preferences)
- Photos/images
- WhatsApp message content (only metadata)
- Authentication credentials
- Login sessions

## Use Cases

### Local Backup

```
Weekly Backup Routine:
1. Every Friday → Settings → Export as CSV
2. Save to: ~/Backups/connectos/
3. Label: connectos-export-2026-08-20.csv
4. Keep 12 most recent weekly backups
5. Delete older backups after 3 months
```

### Business Analysis

```
Quarterly Report:
1. Export as CSV
2. Open in Excel
3. Create pivot tables by:
   - Relationship type
   - Opportunity category
   - Event attendance
   - Follow-up status
4. Visualize trends
```

### Team Sharing

```
Share Contact List:
1. Export as CSV
2. Remove sensitive info (notes, personal details)
3. Share with team
4. They can import to their CRM
```

### Switching Tools

```
Migration:
1. Export as CSV or JSON
2. Import into new CRM:
   - Sheets → Use CSV
   - Salesforce → Map CSV fields
   - Pipedrive → CSV import
   - Custom tool → Use JSON
3. Verify data transferred correctly
```

### Data Analysis

```
Python Analysis:
import pandas as pd

contacts = pd.read_csv('connectos-export.csv', skiprows=1, nrows=X)
# Filter/analyze/visualize with pandas
```

### Archive in Cloud

```
Cloud Backup Strategy:
1. Export each month
2. Upload to Google Drive:
   folder: /Backups/ConnectOS/
   naming: connectos-YYYY-MM.csv
3. Or upload to:
   - Dropbox
   - OneDrive
   - AWS S3
   - GitHub (private repo)
```

## Best Practices

### Regular Backups
- ✅ Export monthly minimum
- ✅ Keep multiple recent copies
- ✅ Store in multiple locations
- ✅ Test restore from backup

### Data Protection
- ✅ Treat exported files as sensitive (contains contact info)
- ✅ Use encrypted storage for cloud backups
- ✅ Delete old backups securely
- ✅ Don't share files publicly

### Version Control
- ✅ Include date in filename
- ✅ Keep exports for at least 1 year
- ✅ Label with purpose (e.g., "backup", "analysis", "share")
- ✅ Store with metadata about what changed

### Example Folder Structure
```
Backups/ConnectOS/
├── Weekly/
│   ├── connectos-export-2026-08-13.csv
│   ├── connectos-export-2026-08-20.csv
│   └── connectos-export-2026-08-27.csv
├── Monthly/
│   ├── connectos-export-2026-08-full.csv
│   └── connectos-export-2026-09-full.csv
└── Analysis/
    ├── q3-2026-report.xlsx
    └── event-roi-analysis.csv
```

## Disaster Recovery

### If You Lose Data

Unfortunately V1 doesn't support direct restore, but you can:

1. **If you have a CSV backup:**
   - Manually re-enter contacts from CSV
   - Use CSV as reference
   - Don't re-scan cards

2. **If you have JSON backup:**
   - Technical team can parse JSON
   - Recreate database records
   - Preserve timestamps

3. **If no backup exists:**
   - Rescan business cards
   - Check email for contact info
   - Recreate from notes

### Prevention

- Export monthly automatically (set phone reminder)
- Store backups in 2+ locations
- Test restore ability annually
- Keep 1-year rolling archive

## Technical Details

### CSV Encoding
- UTF-8 encoding
- Commas as delimiters
- Quotes around fields with commas/quotes
- Newlines between rows

### JSON Schema
```json
{
  "contacts": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "contact_type": "active|historical",
      "name": "string",
      "company": "string|null",
      "designation": "string|null",
      "phone": "string|null",
      "whatsapp": "string|null",
      "email": "string|null",
      "address": "string|null",
      "industry": "string|null",
      "created_at": "ISO8601",
      "updated_at": "ISO8601"
    }
  ],
  "events": [...],
  "interactions": [...]
}
```

### File Size
- Typical export: 100-500 KB (1,000 contacts)
- Large export: 1-5 MB (10,000 contacts)
- JSON slightly larger than CSV

## Automation Ideas (Future)

- [ ] Scheduled exports (daily/weekly)
- [ ] Email backup delivery
- [ ] Google Drive integration (auto-upload)
- [ ] Dropbox sync
- [ ] Database restore from backup
- [ ] Differential backups (only changes)
- [ ] Encrypted backups
- [ ] Version history

## Support

**Q: Can I import data back into ConnectOS?**
A: Not in V1. Future versions may support CSV/JSON import.

**Q: Is exported data secure?**
A: You control it entirely. Treat it like personal information (contains emails, phones, notes).

**Q: How much data can I export?**
A: Unlimited. Export size depends on number of contacts/events.

**Q: Can I export a subset (e.g., one event)?**
A: Not yet. V1 exports everything. Future: selective export.

**Q: Does export include WhatsApp messages?**
A: No, only communication metadata (who, when, template used).

**Q: Can I automate exports?**
A: Not in V1 (no API). Set a recurring phone reminder instead.

## Getting Started

1. **Today:** Export for the first time
2. **This week:** Set up backup location
3. **Next month:** Schedule recurring export
4. **Quarterly:** Verify backup integrity
5. **Annually:** Test full restore process

Your data is yours. Export regularly to keep it safe.
