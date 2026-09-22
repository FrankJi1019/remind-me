# remind-me

A self-hosted morning briefing system. Every day, it assembles and delivers an HTML email digest with your upcoming Google Calendar events and Notion todos — a personal "good morning" summary straight to your inbox.

The email is bilingual (English/Chinese), responsive, and formatted with table-based layouts for broad email client compatibility.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CloudWatch Schedule                          │
│                         (daily trigger)                             │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     remind-me       │
                    │   (orchestrator)    │
                    └────────┬────────────┘
                             │
                  invokes    │    sends email
              ┌──────────────┼──────────────────┐
              ▼              │                  ▼
  ┌───────────────────┐      │         ┌────────────────┐
  │  assemble-email   │      │         │    AWS SES     │
  │  (HTML builder)   │      │         └────────────────┘
  └────────┬──────────┘      │
           │                 │
     ┌─────┴─────┐           │
     ▼           ▼           │
┌──────────┐ ┌────────────┐  │
│ get-todos│ │get-calendar│  │
└────┬─────┘ └─────┬──────┘  │
     │              │        │
     ▼              ▼        │
┌──────────┐ ┌────────────┐  │
│Notion API│ │Google Cal. │  │
└──────────┘ └────────────┘  │
                             │
         ┌───────────────────┘
         ▼
┌─────────────────┐       ┌──────────────────────┐
│  manage-ssm     │       │    admin-portal      │
│  (CRUD params)  │       │  (React dashboard)   │
└────────┬────────┘       └──────────┬───────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌─────────────────────┐
│ SSM Param Store │       │  HTTP API (Lambda)  │
└─────────────────┘       └─────────────────────┘
```

### Lambda Functions

| Function | Responsibility |
|---|---|
| `remind-me` | Orchestrator — invokes `assemble-email` for the template data, then sends via the `remind-me-daily-briefing` SES template |
| `assemble-email` | Fetches todos + calendar events, pre-computes the SES template data; also renders a live HTML preview from the SES template |
| `get-todos` | Queries a Notion database for active tasks |
| `get-calendar` | Fetches upcoming events from Google Calendar |
| `manage-ssm` | CRUD operations for SSM Parameter Store values |
| `email-schedule` | Reads/updates the daily email schedule — on/off and send time — by editing the `remind-me-trigger` EventBridge rule |
| `email-stats` | Derives delivery statistics (streak, totals, success rate, avg duration, daily activity) from CloudWatch metrics for `remind-me` |
| `email-logs` | Groups `remind-me` CloudWatch log events into human-readable per-run summaries |
| `email-template` | Lists the available email designs and gets/sets the selected one (SSM `EMAIL_TEMPLATE`) |

### Email template

The daily email uses **selectable SES v2 templates** — pick a design from the admin portal.
Four designs ship today, each a genuinely different layout (not just recolours):

| Template | Design |
|---|---|
| `remind-me-daily-briefing` | **Classic** — card layout with colour-coded tables and badges |
| `remind-me-tech` | **Boarding Pass** — the day as a travel ticket: a departures board and a task manifest |
| `remind-me-timeline` | **Day Planner** — a planner page: ruled agenda with a time column and a checklist |
| `remind-me-digest` | **Minimal Note** — a quiet typographic letter: no cards, just clean type on paper |

All templates consume the **same template data**, so any can render the same content. The Handlebars
sources live in `service-functions/ses-templates/`. The selected template id is stored in SSM
(`/remind-me/EMAIL_TEMPLATE`).

- `assemble-email` computes the **template data** (formatted dates, sorted/active todos, resolved
  badge colours, due labels) and returns it as JSON. On the `GET /email/preview` path it renders the
  **currently selected** template with Handlebars to return live preview HTML.
- `remind-me` sends via `SendEmail` with `Content.Template`, using the selected template.
- `email-template` (`GET/PUT /email/template`) lists designs (including each template's raw
  Handlebars HTML) and reads/writes the selection. The admin portal's **Themes** page previews each
  design client-side with **mock sample data** and only applies a change when you press **Confirm**.

Create or update a template in AWS after editing its JSON:

```bash
aws sesv2 create-email-template --cli-input-json file://service-functions/ses-templates/<name>.json
# or, if it already exists:
aws sesv2 update-email-template --cli-input-json file://service-functions/ses-templates/<name>.json
```

### Admin Portal

A lightweight dashboard for managing configuration and viewing system state.

- React 19, TypeScript, Vite
- Tailwind CSS 4
- React Query for server state
- React Router for navigation
- Dockerised for deployment

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22, TypeScript |
| Bundler | esbuild (single-file bundles per Lambda) |
| Compute | AWS Lambda |
| Email | AWS SES v2 |
| Secrets | AWS SSM Parameter Store |
| Calendar | Google Calendar API (OAuth2 refresh token) |
| Todos | Notion API |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Query |
| Deployment | AWS CLI (zip + `update-function-code`) |

## Project Structure

```
.
├── service-functions/
│   ├── src/
│   │   ├── remind-me.ts          # Orchestrator — sends via the SES template
│   │   ├── assemble-email.ts     # Builds SES template data + renders preview
│   │   ├── get-todos.ts          # Notion integration
│   │   ├── get-calendar.ts       # Google Calendar integration
│   │   ├── manage-ssm.ts         # SSM parameter management
│   │   ├── email-schedule.ts     # Toggle / set send time of the daily email rule
│   │   ├── email-stats.ts        # Delivery statistics from CloudWatch metrics
│   │   ├── email-logs.ts         # Human-readable per-run log summaries
│   │   └── email-template.ts     # List / select the email design (SSM)
│   ├── ses-templates/            # SES v2 email templates (source of truth)
│   │   ├── remind-me-daily-briefing.json   # Classic
│   │   ├── remind-me-tech.json             # Terminal
│   │   ├── remind-me-timeline.json         # Timeline
│   │   └── remind-me-digest.json           # Digest
│   ├── dist/                     # esbuild output (gitignored)
│   └── package.json
│
└── admin-portal/
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   ├── api-hooks/
    │   ├── containers/
    │   ├── providers/
    │   ├── routes/
    │   ├── types/
    │   └── utils/
    ├── Dockerfile
    └── package.json
```
