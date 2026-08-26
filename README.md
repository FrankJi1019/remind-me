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
| `remind-me` | Orchestrator — invokes `assemble-email`, then sends the result via SES |
| `assemble-email` | Fetches todos + calendar events in parallel, renders the HTML email |
| `get-todos` | Queries a Notion database for active tasks |
| `get-calendar` | Fetches upcoming events from Google Calendar |
| `manage-ssm` | CRUD operations for SSM Parameter Store values |
| `email-schedule` | Reads/toggles the daily email schedule (enables/disables the `remind-me-trigger` EventBridge rule) |
| `email-stats` | Derives delivery statistics (streak, totals, success rate, avg duration, daily activity) from CloudWatch metrics for `remind-me` |
| `email-logs` | Groups `remind-me` CloudWatch log events into human-readable per-run summaries |

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
│   │   ├── remind-me.ts          # Orchestrator + SES send
│   │   ├── assemble-email.ts     # Email HTML builder
│   │   ├── get-todos.ts          # Notion integration
│   │   ├── get-calendar.ts       # Google Calendar integration
│   │   ├── manage-ssm.ts         # SSM parameter management
│   │   ├── email-schedule.ts     # Toggle the daily email EventBridge rule
│   │   ├── email-stats.ts        # Delivery statistics from CloudWatch metrics
│   │   └── email-logs.ts         # Human-readable per-run log summaries
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
