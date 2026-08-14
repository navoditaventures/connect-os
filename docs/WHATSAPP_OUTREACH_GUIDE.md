# WhatsApp Outreach Guide

## Overview

ConnectOS helps you send personalized WhatsApp messages to contacts at scale, while keeping you in full control of your account. No automated posting to your WhatsApp account — you approve every message before sending.

## Key Philosophy

**Your Account, Your Control**

- ✅ You open WhatsApp yourself
- ✅ You review each message
- ✅ You tap Send in WhatsApp
- ✅ The app tracks what was sent
- ❌ No automated sending
- ❌ No third-party access to your account

This approach maximizes safety for your personal WhatsApp account while automating the tedious parts (template selection, message generation, contact queuing).

## Workflow

### Setup (One-time)

1. **Settings → Digital Profile**
   - Enter your portfolio/website URL
   - Used in all messages as `{{digital_profile_url}}`
   
2. **Settings → Message Templates**
   - Review default templates (General, Potential Client, Referral Partner)
   - Create custom templates as needed
   - Use variables for personalization

### Campaign

**Step 1: Start Campaign**
- WhatsApp Outreach page
- Choose event (optional) or all contacts
- Filters to message only specific relationship types

**Step 2: Select Contacts**
- List shows all qualifying contacts
- Filter by name, company, relationship
- Checkbox to select which to message
- Must have phone or WhatsApp number

**Step 3: Choose Template**
- Pick from your library
- Default templates provided
- Shows preview of message structure

**Step 4: Preview & Personalize**
- See message personalized for first contact
- Edit if needed (rare)
- One at a time
- Navigate with Previous/Next

**Step 5: Open WhatsApp**
- Click "💬 Open WhatsApp & Send"
- Opens WhatsApp in new tab
- Message ready to send
- You manually tap Send

**Step 6: Return & Continue**
- Come back to preview
- Move to next contact
- Repeat until done

**Step 7: Complete**
- Campaign marked complete
- All communications logged
- Ready for follow-up tracking

## Message Templates

### Variables

All templates support these variables for personalization:

```
{{first_name}}            John
{{full_name}}             John Smith
{{company_name}}          Acme Corp
{{designation}}           CEO
{{event_name}}            KVV Chapter Launch
{{event_date}}            August 14, 2026
{{industry}}              Interior Design
{{relationship}}          Potential Client
{{opportunity}}           Website
{{notes}}                 Discussed redesign needs
{{digital_profile_url}}   https://navodita.com
```

### Default Templates

**1. General Introduction**
```
Hi {{first_name}},

Great meeting you at {{event_name}}.

I'm Vinay from Navodita. We help businesses with branding, 
creative design, websites and digital solutions.

Here's my digital profile and portfolio:

{{digital_profile_url}}

Would be great to stay connected.
```

**2. Potential Client**
```
Hi {{first_name}},

It was great meeting you at {{event_name}}.

I enjoyed learning a little about {{company_name}}.

I'm sharing my digital profile and portfolio here so you can 
have a quick look at what we do at Navodita:

{{digital_profile_url}}

Would be happy to continue our conversation whenever convenient.
```

**3. Referral Partner**
```
Hi {{first_name}},

Really enjoyed meeting you at {{event_name}}.

I thought it would be good for us to stay connected, especially 
since there could be opportunities where we can refer business 
to each other.

Here's my digital profile:

{{digital_profile_url}}

Looking forward to staying connected.
```

### Creating Custom Templates

1. **Settings → Message Templates**
2. Click **+ New Template**
3. Fill in:
   - **Template Name** - e.g., "Post-Event 3-Day Follow-up"
   - **Message Body** - Use variables for personalization
4. Click **Create**

**Tips:**
- Use variables for personalization (not all contacts need them)
- Keep messages concise (WhatsApp has no character limit, but long messages are harder to read)
- One paragraph per idea
- Include call-to-action or next step
- Use professional but friendly tone

### Editing Templates

1. **Settings → Message Templates**
2. Click **Edit** on the template
3. Modify name or content
4. Click **Update**

Note: Only custom templates can be edited or deleted. Default templates are locked.

## Sending Messages

### Before You Start

✅ **Set Digital Profile URL** (Settings → Digital Profile)  
✅ **Create Event** (if organizing by event)  
✅ **Review Templates** (Settings → Message Templates)  
✅ **Scan/Import Contacts** (at least phone or WhatsApp number)  

### During Campaign

1. **WhatsApp Outreach → Start WhatsApp Campaign**
2. Select event (optional)
3. Next screen shows contact selection
4. Search/filter by:
   - Name or company
   - Relationship category
5. Use "Select All" or check boxes individually
6. Click **Next: Choose Template**
7. Pick template
8. Click **Next** to preview
9. Review personalized message
10. Edit if needed (rare)
11. **Open WhatsApp & Send** → Opens WhatsApp in new tab
12. Review message in WhatsApp
13. Tap Send in WhatsApp
14. Return to preview screen
15. Navigate to next contact
16. Repeat steps 11-15 for all contacts
17. Campaign marked complete when done

### Editing Messages

Each preview shows the personalized message. You can:

- Edit the message text before sending
- Change specific phrases
- Update URLs or details

Common edits:
- Add personal note about previous conversation
- Mention specific product/service
- Add urgency ("Ends Friday")
- Reference mutual connection

### Message Tracking

When you mark a message as sent:
- Creates a Communication record
- Links to contact and interaction
- Timestamp captured
- Template tracked for analytics

View communication history:
- **Contact Detail Page** → Interaction History
- Shows all sent messages
- Date, template, status
- Part of relationship timeline

## Follow-up Management

### After Sending

Messages appear in:
- **Contact's interaction timeline** (Contact Detail Page)
- **Follow-ups page** (if you set follow-up date)
- **Communication history** (for reporting)

### Setting Follow-ups

During contact scanning or interaction editing:
- Set follow-up date
- Set follow-up status (pending/completed)
- Add notes

Then:
- **Follow-ups page** shows all pending
- Sort by date
- Overdue highlighted in red
- Mark as complete when done

### Workflow

```
Send WhatsApp Message
        ↓
Set follow-up date (3-5 days)
        ↓
Check Follow-ups page daily
        ↓
When date arrives: Call/Email/WhatsApp
        ↓
Mark as Completed
        ↓
Next contact or move to opportunity stage
```

## Tips & Tricks

### For Efficiency

- **Same template, many contacts?** Select all at once
- **Personalize in batch?** Use templates with variables
- **Different audiences?** Create multiple campaigns with filters
- **Quick edits?** Edit in preview before opening WhatsApp

### For Better Results

- **Timing:** Send 9-10am or 6-7pm for best open rates
- **Personalization:** Use {{first_name}} and {{company_name}} for warmth
- **Call-to-action:** Tell them what to do next
- **Follow-up:** Set date before sending (not after)
- **Multiple attempts:** Different template for second follow-up

### Message Best Practices

✅ **Do:**
- Keep to 2-3 paragraphs
- Mention specific conversation point
- Include clear CTA
- Use professional but friendly tone
- Proofread before sending

❌ **Don't:**
- Send at midnight
- Overuse capital letters
- Include unrelated promotions
- Send to wrong contact (check phone number!)
- Send duplicate to same person

## Troubleshooting

### "No phone/WhatsApp number"
**Issue:** Contact can't be messaged  
**Fix:** Go to Contact Detail → Add phone or WhatsApp number

### "Set Digital Profile URL first"
**Issue:** Campaign won't start  
**Fix:** Settings → Digital Profile → Enter URL → Save

### Message didn't send
**Issue:** WhatsApp didn't open or message not captured  
**Cause:** Browser popup blocker or lost connection  
**Fix:** 
- Try again
- If repeatedly fails, send manually and log in app

### Wrong message sent
**Issue:** Sent message with errors  
**No fix available** - WhatsApp has no edit/unsend for others  
**Prevent:**
- Always preview
- Edit in preview before sending
- Test templates with yourself first

### Contact appears twice
**Issue:** Same person listed multiple times  
**Cause:** Duplicates in system  
**Fix:** Go to Contacts → Find duplicates → Delete one
- System prevents exact duplicates, but close matches possible

## Advanced Usage

### Bulk Campaigns

For 50+ contacts:
1. Create event
2. Add all contacts to event (via scanner)
3. Filter by relationship type
4. Send same template to related contacts
5. Customize only where needed

Example: "All Potential Clients from KVV"

### Multi-Template Approach

**First Follow-up (immediate):**
- "General Introduction" template
- Day of event

**Second Follow-up (3-5 days):**
- "Potential Client" template
- References conversation

**Third Follow-up (1-2 weeks):**
- Custom template
- Share specific case study
- Stronger CTA

### Relationship-Based Campaigns

Create campaigns by relationship type:

**Potential Clients**
- "Potential Client" template
- Share portfolio
- Ask about timeline

**Referral Partners**
- "Referral Partner" template
- Suggest collaboration
- Share mutual benefit

**Strategic Partners**
- Custom template
- Discuss bigger picture
- Monthly cadence

## Data & Privacy

### What's Stored

✅ Message sent to whom  
✅ When it was sent  
✅ Which template used  
✅ Any edits made  

❌ Actual WhatsApp messages (you send in WhatsApp)  
❌ WhatsApp read receipts  
❌ WhatsApp replies  

### Your Control

- Delete contact → deletes communication history
- No automatic replies captured
- All data stays in app (not in WhatsApp)
- Exportable to Google Sheets

## Limitations (V1)

- One message per contact per campaign
- No scheduled sending (manual only)
- No templates from AI (you write them)
- No WhatsApp inbox integration
- No automatic reply reading

## Future Enhancements (V2+)

- Schedule messages for specific time
- AI-generate personalized messages
- Template A/B testing
- WhatsApp message history in app
- Bulk reply imports
- Contact response tracking
- Automated follow-up scheduling
