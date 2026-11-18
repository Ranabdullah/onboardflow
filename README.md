# OnboardFlow

A client onboarding workspace for agencies: collect a clear brief, organise the handoff and keep project tasks moving.

[Try the interactive demo](https://onboardflow-workflow-demo.ranakaharian1.workers.dev/) · [Portfolio](https://ranova.vercel.app/technical-projects)

![OnboardFlow agency workspace](docs/workspace.png)

## What you can try

- **Overview:** client pipeline, intake counts and upcoming dated tasks.
- **Clients:** add and edit fictional clients, search, archive and restore records.
- **Client intake:** a three-step questionnaire for goals, deliverables, launch date, budget, assets and constraints. Drafts save as you type.
- **Projects & tasks:** a structured brief from the original answers, kickoff checklist, custom tasks with owners and dates, filters and completion progress. Revising an intake preserves the task list.
- **Activity:** dated changes and a CSV client report.
- **Settings & help:** agency name and colour with automatic button text contrast, a replayable guided tour, JSON backup/import and demo reset.
- **Connect Supabase:** an Owner / Manager / Staff role walkthrough, private installation steps and an empty configuration template. Real staff access requires a configured backend and end-to-end verification. [Read the connection guide](docs/CONNECT-SUPABASE.md).
- **Exports:** download the project brief as text or use Print / PDF. CSV reports open in Excel.

The public demo uses fictional data and browser storage. It has no public signup, cloud sync, real uploads, email delivery or external AI calls. Its brief is extracted from the answers. Do not enter real client information. A demo JSON backup restores records and tasks, not cloud files or credentials.

## How to use

1. Open **Quick tour**, or explore the sample pipeline.
2. Choose **New client**, add fictional details and save. Open that client's intake.
3. Complete **The project**, then **The details**. Check the review and submit.
4. Open **Projects & tasks**. Review the brief, add a task, set its owner/date and mark work complete.
5. Download or print the brief. **Activity** exports a CSV report.
6. **Settings & help → Download backup** saves all demo records. **Import backup** replaces this browser workspace after confirmation. Export first if you want to keep its current records.
7. Archive a client to retain the record outside the active pipeline. Restore it from the archived filter.

## Run the demo locally

From the extracted repository, with Python installed:

```powershell
python -m http.server 8080 --directory demo
```

Open **http://localhost:8080**. No keys or account needed.

## Install your own workspace

The full application uses TypeScript, React, Next.js and Supabase PostgreSQL, Auth and private Storage. It includes agency login, branding, questionnaire/checklist templates, client portals, private uploads, projects, tasks, staff profiles, workflows and reports. Staff profiles are records; they are not separate staff login accounts. Optional AI and email require provider configuration.

1. Download or fork this repository. Use Node.js 22 or newer.
2. Create a fresh Supabase project in your own account.
3. Copy `.env.example` to `.env.local`. Add your Supabase project URL, public key, private service-role key and app URL. Keep this file private.
4. In Supabase's SQL editor, apply the files in `supabase/migrations` in order: `001`, `002`, `003`, `004`, `005`, `006`, `20261005214234_persistent_workspace.sql`, `20261006193735_template_configuration.sql`.
5. Set Supabase Auth's site and redirect URLs to your app domain. Configure a verified email sender before inviting real users. Keep `uploads` and `contracts` buckets private.
6. Run:

```powershell
npm ci
npm run build
npm start
```

Open **http://localhost:3000**. Create an agency account, configure a template, create a client and copy their private onboarding link. Anyone holding that client link can access its allowed portal; share it privately.

Deploy the full app to a **Node.js host**, such as Vercel, and set its environment variables there. Static Cloudflare hosting alone cannot run the full Next.js backend. Follow [setup and verification notes](README-FIRST.md) for the remaining service checks.

## Publish your own public demo on Cloudflare

For the browser-only demo, connect your fork in Cloudflare's static-site deployment flow. Use `demo` as the asset/output directory; no build command or backend keys are required. Alternatively, upload the contents of `demo` through the static-site upload flow.

For an API-uploaded Worker bundle:

```powershell
node scripts/build-demo.mjs
```

This generates `dist-demo/worker.mjs`, a self-contained Worker with the public demo assets and response security headers. Use your own Cloudflare account's deployment tooling to upload it as an ES module. No Supabase credentials belong in this demo.

## Backups, ownership and limits

Fork creates your own GitHub copy. Download ZIP gives you the source without Git history. Repository transfer is available to the owner under GitHub **Settings → General → Transfer ownership**. A source transfer does not transfer hosting, Supabase data, accounts, files or provider credentials; set those up separately.

Back up all application tables, including `agency_workspaces`, private upload/contract objects, and your Auth configuration. Test a restore into a separate project. The demo's JSON export is not a full-app disaster recovery backup.

Demo limits: 100 clients, 200 tasks per client, 200 recent activity entries, 2 MB JSON imports. Clearing browser storage removes demo records. The full app's provider delivery, separately authenticated staff accounts, recovery and AI accuracy require further validation before customer production use.

## Validation and languages

The release build and TypeScript check pass. Browser tests cover client creation/search, draft persistence, all intake steps, repeat submissions, tasks, branding contrast, exports, backup restoration, archive/restore and the guided tour. All six demo screens were checked at 320, 390, 768 and 1440 pixels. These checks do not verify live email or payment delivery.

TypeScript, JavaScript, HTML, CSS and SQL; React, Next.js, Supabase and Cloudflare Workers.
