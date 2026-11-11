# Early sleep calendar

A DeepSeek Harness plugin that adds an **early-sleep check-in calendar** to the Web UI.

- **Sidebar panel** (`early-sleep`): month calendar and year overview views.
- **Click any day** to add or edit a sleep record (bedtime + optional note); delete with one click.
- **Failure rule**: a bedtime from 00:00 through 11:59 means the night went past midnight, so it is marked failed (warning color) and excluded from the success stats and streaks.
- **Stats**: successful nights, current streak, longest streak, this-month successes; the footer lists total records including past-midnight failures.
- **Quick check-in** button for tonight in the panel header.
- Records are stored on the Host in `<DSH_HOME>/early-sleep/records.json` (atomic writes, one record per date).

## API

Host route `GET|POST|DELETE /api/early-sleep/records`:

- `GET` → `{ ok, records: [{ date, time, note, createdAt }] }`
- `POST` body `{ date: "YYYY-MM-DD", time?: "HH:MM", note?: string }` → upsert, returns the full list
- `DELETE ?date=YYYY-MM-DD` → remove, returns the full list

`config.dataFile` overrides the storage path in `cordis.patch.yml` if needed.
