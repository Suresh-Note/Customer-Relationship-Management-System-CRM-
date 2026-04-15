# Scripts

One-off utility scripts for maintenance and data fixes.
These are NOT part of the application runtime.

| Script | Purpose |
|--------|---------|
| `fix-encoding.js` | Fix UTF-8 encoding issues in database records |
| `fix-seed-passwords.js` | Re-hash seed user passwords with scrypt |
| `migrate-client-notes.js` | Migrate legacy client notes to the new table |
| `migrate-lead-notes.js` | Migrate legacy lead notes to the new table |

## Usage

```bash
cd backend
node scripts/fix-encoding.js
```
