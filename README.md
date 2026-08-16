# CF Webmail

Cloudflare Workers webmail for [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/). Incoming mail is stored only when the recipient mailbox already exists. Users can sign in and read mail. There is no send path.

## Stack

- Honox, React, TypeScript
- Tailwind CSS and shadcn/ui
- Drizzle ORM with Neon Postgres
- Better Auth (email/password, admin plugin, Drizzle adapter)

## Setup

1. Copy `.env.example` to `.env` and `.dev.vars`. Keep the same values in both files.

```bash
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=generate-a-long-random-string
BETTER_AUTH_URL=http://localhost:5173
```

2. Install and start:

```bash
npm install
npm run db:generate
npm run dev
```

Pending SQL in `drizzle/` is applied automatically at the start of `npm run build` (and therefore `preview` / `deploy`). Use `npm run db:migrate` if you need to apply it without a full build.

3. Open the app. If the database has no users, `/setup` creates the first admin. After that, public signup stays disabled and only admins can create mailboxes.

## Email routing

1. Enable Email Routing on your zone.
2. Deploy the worker (`npm run deploy`).
3. Add a catch-all or address rule that sends mail to this worker.
4. Create a user whose email matches the destination address. Mail for unknown addresses is dropped and not stored.

Auth allowed hosts come from `BETTER_AUTH_URL`. Keep localhost in `.env` / `.dev.vars` for development, and set the public origin in `.env.production` (see `.env.production.example`). `npm run deploy` uploads `DATABASE_URL`, `BETTER_AUTH_SECRET`, and that public `BETTER_AUTH_URL`. Extra hosts can go in `BETTER_AUTH_ALLOWED_HOSTS`.

## Local email test

After `npm run preview`, send a raw RFC 5322 message to the local email handler:

```bash
curl --request POST 'http://localhost:8787/cdn-cgi/handler/email' \
  --url-query 'from=sender@example.com' \
  --url-query 'to=you@your-domain.com' \
  --data-raw 'From: sender@example.com
To: you@your-domain.com
Subject: Test message
Message-ID: <test@local>
Content-Type: text/plain; charset=utf-8

Hello from local Email Workers.
'
```

The `to` address must match an existing user email.
