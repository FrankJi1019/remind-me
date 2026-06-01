# remind-me

A personal morning briefing system that sends you a daily summary email with your upcoming Google Calendar events and Notion todos. Think of it as a self-hosted, scheduled "good morning" digest delivered straight to your inbox.

## What it does

Every morning, it fires off an HTML email containing:

- **Upcoming calendar events** — pulled from Google Calendar, showing the next month of events with dates and times
- **Active todos** — pulled from a Notion database, sorted by due date, with category and status badges, colour-coded urgency, and relative due date labels (e.g. "明天", "已过期3天")
- A bilingual (English/Chinese) layout because that's just how it's set up

The email is formatted as a clean HTML digest — responsive, table-based for email client compatibility, with a purple gradient header.

## Architecture

Four AWS Lambda functions, each with a single responsibility:

```
remind-me (orchestrator)
├── invokes assemble-email
│   ├── invokes get-todos      → Notion API
│   └── invokes get-calendar   → Google Calendar API
└── sends the assembled HTML via SES
```

| Function | What it does |
|---|---|
| `remind-me` | Entry point. Invokes `assemble-email`, then sends the result via AWS SES |
| `assemble-email` | Fetches todos + events in parallel, builds the HTML email body |
| `get-todos` | Queries a Notion database via `@notionhq/client` |
| `get-calendar` | Fetches upcoming events from Google Calendar via `@googleapis/calendar` |

A CloudWatch scheduled event (not in this repo) presumably triggers `remind-me` each morning.

## Tech stack

- **Runtime**: Node.js 22, TypeScript
- **Bundler**: esbuild — bundles each function to a single `index.js` for Lambda deployment
- **AWS**: Lambda, SES (v2), SSM Parameter Store
- **APIs**: Google Calendar API (OAuth2 with refresh token), Notion API
- **Config**: All secrets stored in SSM Parameter Store under `/remind-me/*` — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `NOTION_API_KEY`, `TODO_DATA_SOURCE_ID`, `FROM_EMAIL`, `TO_EMAIL`

## Setup

### Prerequisites

- AWS account with Lambda, SES, and SSM access
- Google OAuth2 credentials with Calendar read scope and a refresh token
- Notion integration token and a database ID with `Task`, `Status`, `Category`, `Due Date` properties
- SES verified sender email

### SSM Parameters

Populate the following in SSM Parameter Store (SecureString recommended):

```
/remind-me/GOOGLE_CLIENT_ID
/remind-me/GOOGLE_CLIENT_SECRET
/remind-me/GOOGLE_REFRESH_TOKEN
/remind-me/NOTION_API_KEY
/remind-me/TODO_DATA_SOURCE_ID
/remind-me/FROM_EMAIL
/remind-me/TO_EMAIL
```

### Build & deploy

```bash
cd service-functions
yarn install

# Build all functions
yarn build

# Deploy individually
yarn deploy:remindme
yarn deploy:todo
yarn deploy:calendar
yarn deploy:assembleemail
```

Each deploy script zips the bundled output and pushes it to the corresponding Lambda function via the AWS CLI.

### Test invocations

```bash
yarn invoke:remindme      # triggers the full flow
yarn invoke:assembleemail # returns the raw HTML
yarn invoke:todo          # returns raw todos JSON
yarn invoke:calendar      # returns raw events JSON
```

## Project structure

```
service-functions/
├── src/
│   ├── remind-me.ts        # Lambda handler + SES send
│   ├── assemble-email.ts   # Email HTML builder
│   ├── get-todos.ts        # Notion integration
│   └── get-calendar.ts     # Google Calendar integration
├── dist/                   # esbuild output (gitignored)
├── package.json
└── tsconfig.json
```