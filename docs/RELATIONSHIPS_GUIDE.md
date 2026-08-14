# Relationship Management Guide

## Overview

ConnectOS tracks detailed relationship information for each contact, including relationship type, opportunity category, conversation stage, and follow-up scheduling.

## Key Concepts

### Relationship Categories

Who is this person in your network?

```
- Potential Client      → Not yet a customer, but could be
- Existing Client       → Already working with them
- Referral Partner      → Can exchange referrals
- Strategic Partner     → Long-term partnership potential
- Vendor               → Supply goods/services
- Business Connection  → Professional acquaintance
- Personal Connection  → Friend/family
- Other                → Doesn't fit above
```

**When to use:**
- Set during initial scan or later edit
- Reflects primary relationship type
- Can change as relationship evolves

### Opportunity Categories

What could you work on together?

```
- Branding        → Logo, brand strategy
- Website         → Website design/development
- UI/UX           → User experience/interface design
- Packaging       → Product packaging design
- Print           → Brochures, business cards, etc.
- AI              → AI/ML integration
- Other           → Miscellaneous
```

**When to use:**
- Specific to Navodita's services (customize in Settings)
- One primary opportunity per interaction
- Multiple interactions can have different opportunities

### Relationship Stages

Where are you in the sales/relationship journey?

```
1. New           → Just met
2. Contacted     → Reached out (email, call, WhatsApp)
3. Conversation  → Had substantive discussion
4. Opportunity   → Specific project/deal in discussion
5. Client        → Actively working together
6. Lost          → Decision made not to work together
```

**Workflow:**
```
New → Contacted → Conversation → Opportunity → Client
                                           ↘ Lost
```

### Follow-up Scheduling

Track when you need to circle back.

**Fields:**
- **Follow-up Date** - When you should contact them
- **Follow-up Status** - pending / completed / not_required

**Rules:**
- Set during contact creation or later
- Appears in Follow-ups page
- Flagged as "overdue" if date is in past and still pending
- Can be marked complete or re-opened

## Scanner Review Workflow

When scanning a new business card:

### Step 1: Contact Information
- Auto-extracted from OCR
- Verify/edit name, company, email, phone

### Step 2: Relationship (Optional)
- Set relationship category (default: "Business Connection")
- Set opportunity (default: "Other")
- Set initial stage (default: "New")
- Set follow-up date (optional)

### Step 3: Notes
- Add context that the business card doesn't show
- e.g., "Interested in website redesign, asked me to send portfolio"

### Step 4: Save
- Creates contact + interaction
- Interaction linked to event (if active)
- Ready for next card

## Contact Detail Page

View and manage all information about one contact.

### Sections

**Contact Information**
- Email, phone, WhatsApp, address, industry
- Type (active/historical)
- Edit/delete options

**Current Relationship** (if interactions exist)
- Primary relationship category
- Primary opportunity
- Current stage
- Next follow-up date
- Edit button to update

**Interaction History**
- Timeline of all meetings/touchpoints
- Each interaction shows:
  - Date met
  - Relationship type
  - Opportunity
  - Stage
  - Notes
  - Follow-up details

### Adding an Interaction

Beyond the initial scan, you can add interactions manually:

1. Click **+ Add** in Interaction History
2. Fill in relationship information
3. Optionally set follow-up date and notes
4. Click **Save**

**Use cases:**
- Phone call after initial meeting
- Email exchange
- Follow-up meeting
- Proposal sent
- Project update

## Follow-ups Page

Centralized view of all pending follow-ups.

### Statistics

**At the top:**
- **Pending** - Follow-ups not yet completed
- **Overdue** - Past follow-up date, still pending
- **Completed** - Finished follow-ups

### Filtering

View by:
- Pending only (default)
- Completed only
- All follow-ups

### Follow-up Card

Each follow-up shows:
- Contact name and company
- Follow-up date (highlighted if overdue)
- Relationship type
- Opportunity (if set)
- Notes (if any)
- Action buttons

### Managing Follow-ups

**Mark as Complete**
- Click "Mark Done" when completed
- Interaction status updated
- Removed from pending list

**Reopen Completed**
- Click "Reopen" if not actually done
- Returns to pending list

**Navigate to Contact**
- Click card to open full contact detail
- Edit relationship information there

### Workflow Example

**Scenario:** You met a potential client at an event.

1. **Scan card** → "Potential Client", opportunity "Website"
2. **Set follow-up** → 3 days out
3. **Send email** → Day 2
4. **Phone call** → Day 3
   - Go to Follow-ups page
   - Click "Mark Done" on their card
5. **New opportunity** → Discuss project scope
   - Go to contact detail
   - Click "Edit relationship"
   - Update stage to "Opportunity"
   - Set new follow-up for next week
6. **Proposal sent** → Day 10
   - Create new interaction with date
   - Set stage to "Opportunity"
   - Notes: "Sent proposal for website redesign"
   - Follow-up: 1 week to hear back

## Editing Relationships

Two places to update relationship information:

### Scanner Review (New Contact)
- Before saving after scan
- Set initial relationship, opportunity, stage
- Fastest for new contacts

### Contact Detail Page (Existing Contact)
- Edit current relationship or add new interaction
- "Edit relationship" → Updates most recent interaction
- "+ Add" → Creates new interaction (for timeline)

### Which to use?

**Edit Relationship:**
- Change stage of ongoing relationship
- Update follow-up date
- Clear mistake in initial scan

**Add Interaction:**
- New phone call or meeting
- Different opportunity discussion
- Want to preserve timeline of different conversations

## Relationship Status Examples

### Potential Client
```
Relationship: Potential Client
Opportunity: Website
Stage: New → Contacted → Conversation → Opportunity
Follow-up: Every 3-5 days until decision
Status: Close when becomes Client or Lost
```

### Referral Partner
```
Relationship: Referral Partner
Opportunity: N/A (different model)
Stage: New → Contacted → Conversation
Follow-up: Monthly check-in
Status: Ongoing relationship management
```

### Existing Client
```
Relationship: Existing Client
Opportunity: Current project (e.g., UI/UX)
Stage: Client
Follow-up: As needed for project
Status: Project-based interactions
```

## Best Practices

### Consistent Updates
- Update stage as relationship progresses
- Add notes after each touchpoint
- Set follow-up dates immediately
- Mark follow-ups complete when done

### Avoid Stale Data
- Review follow-ups daily (2-3 mins)
- Don't let contacts go unstaged
- Update stage when conversation advances
- Archive lost opportunities

### Use Notes Effectively
- "Interested in website for interior design business"
- "Has budget Q3 2026, wants 3 quotes"
- "Decision maker is co-founder Sarah"
- "Similar competitor used ABC agency"

### Follow-up Frequency
| Relationship | Frequency |
|---|---|
| Potential Client | Every 3-5 days |
| Existing Client | Daily (project) |
| Referral Partner | Weekly/Monthly |
| Strategic Partner | Monthly |
| Business Connection | Quarterly |

## Defaults & Customization

### Default Values (On Scan)
- Relationship: "Business Connection"
- Opportunity: "Other"
- Stage: "New"
- Follow-up: None (optional)

### Categories (Customize in Settings)
- Relationship categories can be added/removed
- Opportunity categories can be customized for your business
- Settings → Categories → Add/Edit

## Data Structure

### Interaction Record

```typescript
{
  id: string;
  contact_id: string;           // Who
  event_id?: string;            // Where (optional)
  interaction_type: string;     // "met", "call", "email"
  relationship: string;         // Category
  opportunity?: string;         // What service/product
  stage: string;               // New, Contacted, etc.
  notes?: string;              // Context
  follow_up_date?: string;     // When to follow up
  follow_up_status: string;    // pending/completed/not_required
  created_at: string;          // When was this recorded
  updated_at: string;          // Last updated
}
```

### One Contact, Multiple Interactions

Same person, different conversations:

```
Contact: John Smith, ABC Corp

Interaction #1 (14 Aug 2026)
- Met at KVV event
- Potential Client / Website
- Stage: New
- Notes: "Interested in website redesign"
- Follow-up: 17 Aug

Interaction #2 (17 Aug 2026)
- Phone call
- Same relationship
- Stage: Contacted
- Notes: "Discussed budget and timeline"
- Follow-up: 21 Aug

Interaction #3 (21 Aug 2026)
- Email exchange
- Stage: Conversation
- Notes: "Sent portfolio and 3 case studies"
- Follow-up: 3 weeks (decision date)
```

## Integration Points

### With Scanner
- Relationship info auto-created with contact
- Default values: Business Connection / Other / New

### With Follow-ups Page
- All follow-up_dates appear there
- Status updated when marked complete

### With Google Sheets Export
- Relationship, opportunity, stage columns
- Follow-up date and status columns
- Enables external tracking/reporting

### With WhatsApp Outreach (Phase 5)
- Will use relationship category for template selection
- Can customize message based on opportunity
- Track outreach in interaction history

## Troubleshooting

**Q: Can I have multiple opportunities per contact?**
A: V1 supports one per interaction. Create new interaction for different opportunity.

**Q: Should I change stage or add new interaction?**
A: Change stage if it's the same conversation. Add interaction if it's a new touchpoint.

**Q: How do I remember what I discussed?**
A: Use Notes field. Include specifics: "Discussed branding for new product launch Q3"

**Q: What if follow-up date is past?**
A: It's "overdue". View in Follow-ups page. Either do it now or set new date.

**Q: Can I delete an interaction?**
A: Currently no (V1). You can mark unneeded follow-ups as "not_required".

## Future Enhancements (V2+)

- Relationship scoring (likelihood to convert)
- Activity timeline with emails/calls
- Automatic stage suggestions based on interactions
- Bulk follow-up reminders
- Relationship insights ("haven't heard from in 60 days")
- Custom relationship pipelines per industry
