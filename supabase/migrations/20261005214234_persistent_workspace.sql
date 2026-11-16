-- Durable team state; each agency is isolated by its verified owner account.
create table if not exists public.agency_workspaces (
 agency_id uuid primary key references public.agencies(id) on delete cascade,
 state jsonb not null default '{}'::jsonb,
 revision bigint not null default 1 check(revision > 0),
 updated_at timestamptz not null default now(),
 constraint workspace_size check(octet_length(state::text) <= 5242880)
);
alter table public.agency_workspaces enable row level security;
revoke all on public.agency_workspaces from anon;
grant select, insert, update, delete on public.agency_workspaces to authenticated;
grant all on public.agency_workspaces to service_role;
create policy workspace_owner_select on public.agency_workspaces for select to authenticated using (exists(select 1 from public.agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
create policy workspace_owner_insert on public.agency_workspaces for insert to authenticated with check (exists(select 1 from public.agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
create policy workspace_owner_update on public.agency_workspaces for update to authenticated using (exists(select 1 from public.agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid()))) with check (exists(select 1 from public.agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
create policy workspace_owner_delete on public.agency_workspaces for delete to authenticated using (exists(select 1 from public.agencies a where a.id=agency_id and a.owner_user_id=(select auth.uid())));
