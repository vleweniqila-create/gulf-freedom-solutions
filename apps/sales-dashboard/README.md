# GFS Sales Dashboard

Internal sales dashboard for Gulf Freedom Solutions: revenue, deals in progress and recent leads.

The app is built and hosted on **Floot** (project "GFS Sales Dashboard"). Floot is the source of
truth and runs the app; this folder is a copy of the app-specific code for version history.
Floot's seeded UI kit (`components/Button`, `Select`, `Dialog`, ...) and generated helpers
(`helpers/db`, `helpers/schema`) are not copied here.

## What it does

- **KPIs**: revenue this month (vs last month), monthly recurring revenue from won deals,
  open pipeline value (one-time fee + 12 months of recurring), new leads in the last 30 days.
- **Revenue chart**: last 6 months, stacked one-time vs recurring, from logged payments.
- **Deals in progress**: discovery / proposal / negotiation deals, stage changeable inline.
- **Recent leads**: newest 12 leads, status changeable inline, click-to-call / email.
- **Add**: lead, deal (prefills GFS prices per service), payment.
- **Example data**: seeded rows are flagged `is_sample`; "Clear example data" deletes only those.

## Default prices used when adding a deal

| Service | One-time | Monthly |
| --- | --- | --- |
| Website build | $1,500 | $149 (Care) |
| Website Care | $0 | $149 |
| Social ads | $0 | $600 |
| Site + ads bundle | $1,500 | $749 |

## Layout

- `db/schema.sql`: Postgres tables and enums
- `endpoints/`: Floot serverless endpoints (`*_GET.ts` / `*_POST.ts` + `.schema.ts`)
- `helpers/`: React Query hooks and shared labels
- `components/QuickAddDialog.*`: add lead / deal / payment dialog
- `pages/_index.*`: the dashboard page
- `base.css`: design tokens (navy, blue, violet, sea green; light + dark)
