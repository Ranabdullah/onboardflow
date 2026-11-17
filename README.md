# OnboardFlow

OnboardFlow helps an agency collect a client brief and turn it into project work.

[Try the browser demo](https://onboardflow-workflow-demo.ranakaharian1.workers.dev/) · [See the portfolio](https://ranova.vercel.app/technical-projects)

## Features

The public demo provides a two-step questionnaire for goals, priorities, website details and assets. Submitting creates a three-task project checklist with a progress indicator. Answers and completed tasks persist in the same browser.

The full application source includes agency accounts and branding, reusable questionnaire and checklist templates, client records, private client links, uploads, project workflows, tasks, team profiles and reports. Optional email and AI brief generation use provider settings from your server environment.

## Try the demo

1. Open **Clients**, then **Open the sample client questionnaire**.
2. Enter an example goal and choose a priority.
3. Select **Continue**, then add an example website and assets.
4. Select **Submit sample intake** to open the project checklist.
5. Tick a task. The progress count updates and survives a reload.
6. Return to **Clients** or **Client intake** to review the sample record and answers.

The demo uses fictional information and browser storage. Its controls demonstrate the intake and task flow. Full agency accounts, uploads and provider services require the installation below.

## Install your own workspace

Use Node.js 22 or newer and a fresh Supabase project.

1. Download this repository and extract it.
2. Copy `.env.example` to `.env.local`. Enter your Supabase URL, public key, private service-role key and application URL.
3. Apply the SQL files in `supabase/migrations` in this order: `001`, `002`, `003`, `004`, `005`, `006`, `20261005214234_persistent_workspace.sql`, `20261006193735_template_configuration.sql`.
4. Configure your Supabase Auth site and redirect URLs for your own domain.
5. Run the commands below from the extracted folder.

```powershell
npm ci
npm run build
npm start
```

Open **http://localhost:3000**. Create your agency account, configure the questionnaire and checklist templates, then create a client and copy their private onboarding link. Follow the client’s responses from the agency dashboard and manage the resulting project tasks.

Keep server secrets in private environment variables. Email delivery needs your own configured sender. Back up database tables, private uploaded files and account configuration. See [the full setup and verification notes](README-FIRST.md) for provider setup and remaining checks.

## Source notes

The supplied `onboardflow-main.zip` was compared with this release. This repository retains the updated dependencies, durable workspace handling and access controls added during the release review. The public walkthrough is in `demo/`.

## Languages and tools

TypeScript, JavaScript, React, Next.js, CSS, Supabase PostgreSQL, Auth and Storage. The browser demo uses HTML, CSS and JavaScript.
