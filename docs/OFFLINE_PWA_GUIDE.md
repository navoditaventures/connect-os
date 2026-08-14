# Offline & PWA Guide

## Overview

ConnectOS is fully functional as a Progressive Web App (PWA) and works seamlessly offline. Scan business cards without connectivity; they're automatically synced when you're back online.

## Key Features

✅ **Scan Offline**
- Camera works without internet
- Business cards saved locally
- No data loss

✅ **Auto-Sync**
- Automatic sync when online
- Status bar shows progress
- Retry failed items

✅ **Installable**
- Add to home screen
- Works like native app
- No app store needed

✅ **Reliable**
- Service Worker for offline shell
- IndexedDB for local data
- Encrypted secure storage

## Offline Workflow

### Scenario: At an event with no WiFi

**Before Event**
1. Open ConnectOS before leaving
2. App downloads offline-capable shell
3. Ready to work without internet

**During Event (No Connection)**
1. Open app (works offline)
2. Start or select event
3. Scan business card
4. Camera works normally
5. Card saved to local queue
6. See: "1 card waiting to sync"

**Between Cards (Still Offline)**
- Continue scanning
- UI shows: "5 cards waiting to sync"
- All data stored locally

**After Event (Back Online)**
1. Return to office/WiFi
2. App detects connection
3. See: "Syncing..."
4. Automatic upload begins
5. See: "✓ Synced 25 cards"

**Verification**
- Check Contacts page
- All cards now in cloud
- Can share/export

## Sync Status Indicators

### Bottom Status Bar

The app always shows sync status (mobile) or in status area (desktop):

**Offline Mode**
```
📡 Offline Mode
5 cards waiting to sync
```
- Red indicator
- Auto-syncs when online

**Syncing**
```
⟳ Syncing...
2 syncing, 3 pending
```
- Animated spinner
- Progress shown

**Sync Failed**
```
⚠️ Sync Failed
2 items failed
[Retry] button
```
- Manual retry available
- Shows what failed

**All Synced**
```
✓ All Synced
Your data is up to date
```
- Green checkmark
- Everything current

## Installation as PWA

### On iPhone

1. Open app in Safari
2. Tap **Share** button
3. Tap **Add to Home Screen**
4. Name: ConnectOS (or any name)
5. Tap **Add**
6. Now on your home screen
7. Tap to launch like native app

### On Android

1. Open app in Chrome
2. Tap **⋯** (menu)
3. Tap **Install App** or **Add to Home Screen**
4. Confirm installation
5. Now on your home screen
6. Tap to launch

### On Desktop (Chrome/Edge)

1. Open app
2. Click **⊕** (install icon) in address bar
3. Confirm installation
4. Opens in dedicated window
5. Like a native desktop app

## Offline Capabilities

### ✅ What Works Offline

- **Scan Cards**
  - Camera functionality
  - OCR processing (Tesseract runs locally)
  - Card saving

- **Browse Contacts**
  - View existing contacts
  - Search local database
  - View interaction history

- **View Events**
  - List all events
  - View event details
  - See captured cards per event

- **Manage Locally**
  - Edit contact info
  - Add notes
  - Update relationships
  - Create local interactions

### ❌ What Needs Internet

- **Cloud Sync**
  - Upload new contacts
  - Update Supabase
  - Export to Google Sheets (when implemented)

- **Real-time Updates**
  - Settings changes
  - Template changes
  - Team features (future)

## Technical Details

### Local Storage

**Offline Queue**
- Stored in browser localStorage
- Contact data: ~1KB per contact
- 500 contacts: ~500KB
- Automatic cleanup after sync

**SQLite Database** (future)
- More efficient storage
- Larger capacity
- Full offline search

### Service Worker

Handles:
- **Static Assets Caching**
  - HTML, CSS, JavaScript
  - Icons, fonts
  - App shell loads offline

- **Network Requests**
  - Intercepts API calls
  - Serves cached data if offline
  - Queues writes for later

### Sync Algorithm

1. **Detect Connection**
   - Monitor online/offline events
   - Periodic connectivity check

2. **Auto-Sync on Connect**
   - Batches pending items
   - Uploads to Supabase
   - Tracks progress

3. **Handle Failures**
   - Retryable errors
   - Manual retry available
   - Shows error details

4. **Completion**
   - Updates UI status
   - Clears local queue
   - Refreshes data

## Best Practices

### For Event Scanning

✅ **Do**
- Scan before internet access issues
- Continue scanning offline
- Check sync status after reconnecting
- Verify cards synced before leaving office

❌ **Don't**
- Assume cards are synced until you see ✓
- Turn off phone during sync
- Delete app data during pending sync
- Share device while syncing

### For Reliability

✅ **Do**
- Keep app updated (install latest)
- Test offline mode before event
- Monitor sync status
- Retry if sync fails

❌ **Don't**
- Force-quit app while syncing
- Clear browser data frequently
- Use app in low-storage situations
- Ignore sync errors

## Troubleshooting

### "X cards waiting to sync" won't clear

**Issue:** Cards stuck in queue  
**Cause:** Network error, server timeout, or data issue  
**Fix:**
1. Check internet connection
2. Click Retry in sync status
3. Wait 30 seconds for auto-sync
4. If still stuck: refresh page
5. Last resort: export data as backup

### App feels slow offline

**Issue:** Sluggish performance without internet  
**Cause:** Local processing is slower than server  
**Fix:**
- This is normal for large datasets
- Offline processing is safe but slower
- Sync when back online for responsiveness

### Cards disappeared after sync

**Issue:** Expected cards not showing  
**Possible Causes:**
- Sync completed but UI didn't refresh
- Device crashed during sync
- Browser data was cleared

**Fix:**
1. Refresh the page (F5)
2. Check sync status bar
3. Go to Contacts → Search for card
4. If still missing: check backup export

### Sync shows "Retry" but won't work

**Issue:** Retry button does nothing  
**Cause:** Still offline or server error  
**Fix:**
1. Ensure WiFi/data is connected
2. Wait a few seconds
3. Try Retry again
4. Check browser console for errors
5. Contact support if persists

### "Can't install app"

**iPhone:**
- iOS 11.3+ required
- Try Safari (not Chrome)
- Ensure enough storage (20MB+)

**Android:**
- Chrome 40+ required
- Ensure enough storage
- Check Chrome version

## Advanced: Manual Queue Management

If needed, you can manually inspect the offline queue (developer tools required):

```javascript
// In browser console:
JSON.parse(localStorage.getItem('connectos_offline_queue'))

// Shows:
[
  {
    "id": "contact-1234567890",
    "type": "contact",
    "status": "pending",
    "data": {...contact object...},
    "timestamp": 1234567890
  }
]

// Clear queue (only if you understand what you're doing):
localStorage.removeItem('connectos_offline_queue')
```

## FAQ

**Q: How much data can I store offline?**
A: ~50MB of local cache. Practically, 5,000+ contacts are supported.

**Q: Do I need to manually sync?**
A: No, it's automatic. You can click Retry if sync fails.

**Q: What if I lose internet mid-sync?**
A: No problem. Sync resumes automatically when reconnected. Failed items can be retried.

**Q: Can I use multiple devices?**
A: Yes, but each device has separate offline queue. Sync syncs them both to cloud.

**Q: Does offline work on desktop?**
A: Yes, same as mobile. All features work offline.

**Q: Can I share offline contacts?**
A: Only after they sync. Once synced, they're available in Contacts/Search.

**Q: What happens to data if browser is cleared?**
A: Local queue is lost. Keep backups (use Export feature regularly).

## Future Enhancements

- [ ] SQLite for larger offline capacity
- [ ] Better conflict detection on re-sync
- [ ] Offline follow-up scheduling
- [ ] Offline template editing
- [ ] Two-way sync (from Sheets back to app)
- [ ] Peer-to-peer sync between devices

## Getting Started

1. **Test Offline**
   - Open app
   - Toggle airplane mode
   - Verify camera still works
   - Create a test card

2. **Enable PWA**
   - Install app to home screen
   - Close browser version
   - Reopen from home screen
   - Full app experience without browser

3. **Monitor Sync**
   - Pay attention to status bar
   - Verify sync completes
   - Enjoy seamless offline/online transitions

The goal: you never think about connectivity again. Just scan and keep networking.
