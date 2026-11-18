# Connect your own Supabase

The public OnboardFlow demo runs in your browser. It has no staff authentication or shared database. The role walkthrough explains the intended team model; selecting a role does not grant or restrict account access.

For real accounts and shared records, install the full Next.js application with a Supabase project that you control. Separate staff account integration is under development and still needs end-to-end verification against an available backend. Do not assume a demo walkthrough proves production permissions.

## 1. Install the application

Download or fork this repository. Install Node.js 22 or newer, then run `npm ci` in the application folder. The `demo` folder is a separate browser-only preview; configure the full application at the repository root.

## 2. Create your backend

Create a fresh project in [your Supabase dashboard](https://supabase.com/dashboard). Use your own account and retain control of its billing, access and backups. If you have no available project slots, make a slot available before continuing; using this demo does not create a project or authorize an upgrade.

## 3. Configure the application privately

Copy `.env.example` to `.env.local`. Set:

- `NEXT_PUBLIC_SUPABASE_URL`: your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the public key supported by the installed client configuration.
- `SUPABASE_SERVICE_ROLE_KEY`: the privileged server-only key.
- `NEXT_PUBLIC_APP_URL`: `http://localhost:3000` for local testing, or your private installation's domain.

The service-role key bypasses database row policies. Keep it in server environment variables; never put it in a `NEXT_PUBLIC_` variable, demo form, browser script, screenshot or public repository. No keys belong in the public demo. The demo's configuration download contains empty placeholders only.

## 4. Prepare the project

Apply every SQL file in `supabase/migrations` in filename order to your new project. Use the migration files from the same source revision as your application. Configure Supabase Auth's site and allowed redirect URLs for your app. Configure a verified email sender before relying on verification or invitation emails. Keep the `uploads` and `contracts` Storage buckets private.

See [Supabase Auth configuration](https://supabase.com/docs/guides/auth/redirect-urls) and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control).

## 5. Start and verify

```powershell
npm run build
npm start
```

Open `http://localhost:3000`. Register your agency, sign out and sign back in, create a test client and confirm records survive a server restart. Check private file access and test a backup restore.

Before using separate staff accounts with real data, verify invitations, email confirmation, sign-in, assigned-client visibility, permitted updates, manager review and access revocation with distinct test accounts. A staff account must not retrieve other agencies' records or unassigned private client records, even by calling the API directly. This release's public demo cannot perform these cloud checks.

Deploy the full application to a Node.js host and set the same private environment variables there. Serving the `demo` directory on Cloudflare does not deploy the Next.js backend.

## Demo records and other providers

Demo JSON exports restore browser examples only. They are not automatically migrated into Supabase and do not contain private uploads or Auth accounts. Maintain separate database, Storage and Auth backups for the full application. Email delivery and AI require your own provider configuration; connecting Supabase alone does not enable them.
