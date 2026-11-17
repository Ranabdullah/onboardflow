# OnboardFlow developer review kit

## Release status

REVIEW ONLY — durable agency portal and restart tests passed; live shop/email/recovery checks remain

Verified: Production build; real sign-in; two-agency isolation; private token upload/download; client archive/restore; persistent template fields and questions, team profiles, tasks, projects, workflows, reports and answers; full app server restart; repeat submission creates one workflow; stale revision protection; 390px client page. Invalid cross-agency assignments are rejected. Removed questions are archived without deleting saved answers. Metrics derive from saved work and hours rather than fabricated performance.

Remaining: Real email delivery, separate staff login accounts, AI brief accuracy, end-to-end marketplace purchase verification, accessibility and complete database/Auth/Storage disaster recovery remain. Staff profiles are agency records, not separately verified staff accounts. Payment-step details are client-supplied answers, not proof of checkout. No automatic cross-provider failover is implemented.

## Start

Node.js 22+ and your own fresh Supabase project are required. Apply SQL migrations in this order: 001, 002, 003, 004, 005, 006, 20261005214234_persistent_workspace.sql, 20261006193735_template_configuration.sql. Copy .env.example into your server environment file, set your own Supabase URL/public key and private service-role key. Configure Auth site/redirect URLs. Run npm ci, npm run build, npm start. Keep upload and contract buckets private. Never expose service-role, AI, email or cron secrets in NEXT_PUBLIC variables.

## Using the app

Sign up as an agency, configure a questionnaire, create a client and copy its private onboarding link. The client can save answers and upload authorised files. Submit provisions a project/workflow once; team tasks and changes remain after restarting the server. Team/report information saves to agency-owned durable storage. If a conflict is reported, reload before changing again. Removed template questions remain archived to retain older answers. AppSumo redemption is explicitly disconnected; use the purchase activation settings after seller setup. Client bearer links are private: anyone holding a valid link can access its allowed portal.

## Data & backups

Back up every application table (including agency_workspaces and its revision), private upload/contract objects and appropriate Auth metadata/configuration. Keep credentials and Local Data/purchase-activation.json separately/private. A JSON table export omits passwords, signing keys and provider settings. Restore to a separate instance before trusting a backup. Browser cache and the customer ZIP do not contain cloud customer records.

## Own cloud

The application depends on PostgreSQL, Supabase Auth/private Storage and a Node app server. Firestore/D1 are not drop-in database replacements. Cloudflare/Firebase can host compatible supporting services, but static hosting alone cannot run this app. Configure your own email/AI provider deliberately and verify real delivery. Blank buyer connection values remain in this kit.

## Purchase activation

Purchase activation is integrated in these three review kits. The seller service and signing database are prepared on free Cloudflare. Your real itch.io/Gumroad listings do not exist yet, so these copies keep ACTIVATION_REQUIRED=false and blank seller connection values. After creating listings, configure the exact shop product IDs, privately add the itch API key, set the seller URL/public verification key in the app server, and enable ACTIVATION_REQUIRED=true. Verify real purchase, wrong key, copied key, refund and renewal before uploading a customer release. The server assigns a signed installation code; certificates last 30 days and renew by verifying the receipt again. This is one logical server installation per purchase, not unbreakable DRM or a guarantee against copied editable source. Keep the signing private key only on the seller service. Ledger and Gods App were not changed. Link Launcher retains its existing seller-issued licence system; automatic shop activation was not added there.