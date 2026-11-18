# Agency demo guide

Use fictional details in the [public demo](https://onboardflow-workflow-demo.ranakaharian1.workers.dev/). Records save in this browser, including staff profiles, client categories, notes, tasks, daily checks and time entries. Separate people cannot share this local workspace over the internet.

## Staff and client categories

Open **Staff & managers → Create staff**. Set a name, example email, department, demo role and profile status. Switch between grid/list or search by name, role or department. **Assigned clients** shows current client and task assignments, including archived clients. Deleting a profile removes its current assignments; past activity text remains in the journal.

Open **Clients → Manage categories** to add or remove categories. The starting categories include Retail, Creative & media, Food & hospitality, Professional services, Nonprofit and Other. Removing a category leaves its clients uncategorised.

Edit a client to choose its category, manager and multiple staff, plus phone, website, Drive folder and social profile links. On desktop, use Ctrl/Cmd or Shift to select multiple people. Client filters combine category, manager, active/archive status and search.

## Client workspace

Each client card has **Client workspace**. Use its tabs to save, edit or delete communication notes, asset links, manual local visibility observations, voucher details, branches, campaigns and dated calendar entries. These records stay attached to the client through archive/restore and JSON backups.

**Local 3 km** is a manual observation log: record a place/result, evidence link and date. The demo does not fetch rankings, locate businesses or claim a measured radius. **Vouchers** stores code/reference notes; it does not redeem a payment. **Communication** stores notes. Contact buttons open email or WhatsApp composition in your own application; they never send automatically. Assets are saved links and notes, not uploaded files.

## Tasks and approvals

The global **Tasks** page shares client tasks with the existing project checklist. Add agency work or select a client, choose multiple assignees, priority, status, start/due dates and a reminder date. Use **Details** for comments. All seven views use the same saved tasks; the calendar uses actual due dates, and timeline bars use actual start/due dates. Undated work is labelled and excluded from the timeline.

**Alerts** lists open tasks whose due/reminder dates have arrived. It is an in-app date check, not an email, scheduled background job or push service.

**Workflows** shows each assignee in order and a final manager check. Complete a stage to hand responsibility to the next person. The final approval completes the task. An available manager profile is required. Mark stuck when work cannot continue, or reopen the task to repeat the workflow.

These are owner-controlled demo actions, not authenticated manager approvals. Real authorisation needs a configured and tested private backend.

## Daily work and hours

In **My Work**, choose a staff member and month. SEO/video tabs select the relevant department. Save a task's daily check as Not started, Working, Stuck or Done, with notes and a date. In **Monthly Report** or **Reports → Daily audit**, approve it as the demo manager. Editing an approved daily record clears its approval so revisions require another check.

**Clock in/out** records actual elapsed browser timer duration. Running timers are labelled and do not contribute completed hours until clock-out. **Record hours** adds a manually entered duration, labelled as manual in reports. Timer records are not proof of online presence or verified attendance. The demo does not record background activity or monitor staff devices.

## Reports, archives and backups

Reports filter by month and staff. Performance counts refer to task due dates in that month; a task assigned to two people counts for both. Hours use completed timer sessions or manual entries started that month. Daily audit uses the check date. Staff logs filter recorded activity text by name; older general events remain in the all-staff view. No performance score is invented.

Export the currently selected report to CSV or choose Print / PDF. Archived client tasks leave active task views, while their original records remain available from **Archive → Client workspace**. Restore the client to return its tasks. Permanent deletion requires confirmation.

Download a JSON backup in Settings before resetting or replacing your browser workspace. Import replaces the whole demo after confirmation. Older v3 backups remain supported; their existing clients/intakes/tasks are retained and the agency tools are added. The browser backup is not a Supabase database/Auth/Storage backup.

## Real staff logins

Profiles and role explanations in the public demo do not authenticate anyone. Read [Connect your own Supabase](CONNECT-SUPABASE.md) for private application setup. The cloud staff integration still needs end-to-end verification against an available project; this demo does not prove account isolation or provider delivery.
