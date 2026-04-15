# Seed Data

SQL files used to populate the database with sample/test data.
Run these manually after applying migrations.

| File | Purpose |
|------|---------|
| `seed.sql` | Core seed data (users, teams, sample leads/clients) |
| `seed-100-clients.sql` | 100 realistic client records |
| `seed-expand-all.sql` | Expanded data across all modules |
| `fix-all-issues.sql` | Data corrections and constraint fixes |
| `fix-names.sql` | Name normalization fixes |

## Usage

```bash
psql -U postgres -d CRM -f backend/seeds/seed.sql
```
