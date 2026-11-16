-- ==============================================================================
-- OnboardFlow: Complete Agency Operations & Work Management SaaS Migration
-- ==============================================================================

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_departments_agency_id ON public.departments(agency_id);

-- 2. Staff / Team Members Table
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
    department TEXT NOT NULL DEFAULT 'General',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    is_online BOOLEAN NOT NULL DEFAULT false,
    manager_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_agency_id ON public.staff(agency_id);
CREATE INDEX IF NOT EXISTS idx_staff_department ON public.staff(department);

-- 3. Enhance Clients Table
ALTER TABLE public.clients
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS website TEXT,
    ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS assigned_staff_ids JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS project_status TEXT NOT NULL DEFAULT 'pending_onboarding',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_clients_is_archived ON public.clients(is_archived);
CREATE INDEX IF NOT EXISTS idx_clients_manager_id ON public.clients(manager_id);

-- 4. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('planning', 'active', 'in_review', 'completed', 'on_hold')),
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    manager_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    start_date DATE,
    due_date DATE,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_projects_agency_id ON public.projects(agency_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);

-- 5. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    workflow_stage_id UUID,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    department TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'blocked', 'completed', 'cancelled')),
    due_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    tags JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    attachments JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tasks_agency_id ON public.tasks(agency_id);
CREATE INDEX IF NOT EXISTS idx_tasks_client_id ON public.tasks(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);

-- 6. Task Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);

-- 7. Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workflows_agency_id ON public.workflows(agency_id);
CREATE INDEX IF NOT EXISTS idx_workflows_client_id ON public.workflows(client_id);

-- 8. Workflow Stages Table
CREATE TABLE IF NOT EXISTS public.workflow_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    responsible_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    order_index INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'current', 'completed', 'blocked', 'overdue')),
    due_date DATE,
    completed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_workflow_stages_workflow_id ON public.workflow_stages(workflow_id);

-- 9. Internal Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    recipient_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('task_assigned', 'task_overdue', 'onboarding_completed', 'stage_assigned', 'info')),
    link TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_agency_id ON public.notifications(agency_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id);

-- 10. Activity Logs (Work Audit Ledger)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    actor_id UUID,
    actor_name TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_title TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_agency_id ON public.activity_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- 11. Staff Work Logs (Hours / Attendance / Performance Reports)
CREATE TABLE IF NOT EXISTS public.staff_work_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    hours_spent NUMERIC(5,2) DEFAULT 0,
    description TEXT,
    status TEXT DEFAULT 'present' CHECK (status IN ('present', 'remote', 'half_day', 'absent')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_staff_work_logs_agency_id ON public.staff_work_logs(agency_id);
CREATE INDEX IF NOT EXISTS idx_staff_work_logs_date ON public.staff_work_logs(date);

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_work_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agencies can manage their departments" ON public.departments FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage their staff" ON public.staff FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage their projects" ON public.projects FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage their tasks" ON public.tasks FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage task comments" ON public.task_comments FOR ALL USING (task_id IN (SELECT t.id FROM public.tasks t JOIN public.agencies a ON a.id = t.agency_id WHERE a.owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage workflows" ON public.workflows FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage workflow stages" ON public.workflow_stages FOR ALL USING (workflow_id IN (SELECT w.id FROM public.workflows w JOIN public.agencies a ON a.id = w.agency_id WHERE a.owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage notifications" ON public.notifications FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can view activity logs" ON public.activity_logs FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));
CREATE POLICY "Agencies can manage staff work logs" ON public.staff_work_logs FOR ALL USING (agency_id IN (SELECT id FROM public.agencies WHERE owner_user_id = auth.uid()));

-- Buyer tenant relationship guard. A valid agency_id must not point at another agency's records.
REVOKE ALL ON public.departments,public.staff,public.projects,public.tasks,public.task_comments,public.workflows,public.workflow_stages,public.notifications,public.activity_logs,public.staff_work_logs FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.departments,public.staff,public.projects,public.tasks,public.task_comments,public.workflows,public.workflow_stages,public.notifications,public.activity_logs,public.staff_work_logs TO authenticated;
GRANT ALL ON public.departments,public.staff,public.projects,public.tasks,public.task_comments,public.workflows,public.workflow_stages,public.notifications,public.activity_logs,public.staff_work_logs TO service_role;
CREATE FUNCTION public.buyer_relation_agency(target_table text, target_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE result uuid;
BEGIN
 IF target_table IN ('clients','staff','projects','tasks','workflows','questionnaire_templates','checklist_templates') THEN
  EXECUTE format('SELECT agency_id FROM public.%I WHERE id=$1',target_table) INTO result USING target_id;
 ELSIF target_table='questionnaire_questions' THEN
  SELECT t.agency_id INTO result FROM public.questionnaire_questions q JOIN public.questionnaire_templates t ON t.id=q.template_id WHERE q.id=target_id;
 ELSIF target_table='checklist_template_items' THEN
  SELECT t.agency_id INTO result FROM public.checklist_template_items q JOIN public.checklist_templates t ON t.id=q.template_id WHERE q.id=target_id;
 ELSIF target_table='workflow_stages' THEN
  SELECT w.agency_id INTO result FROM public.workflow_stages s JOIN public.workflows w ON w.id=s.workflow_id WHERE s.id=target_id;
 ELSE RAISE EXCEPTION 'Unsupported relationship';
 END IF;
 RETURN result;
END $$;
CREATE FUNCTION public.buyer_relation_guard() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE doc jsonb:=to_jsonb(NEW); agency uuid; ref uuid; i integer;
BEGIN
 IF TG_ARGV[0]='agency_id' THEN agency:=(doc->>'agency_id')::uuid;
 ELSE agency:=public.buyer_relation_agency(TG_ARGV[0],(doc->>TG_ARGV[1])::uuid); END IF;
 IF agency IS NULL THEN RAISE EXCEPTION 'A valid agency is required'; END IF;
 i:=2;
 WHILE i<TG_NARGS LOOP
  ref:=(doc->>TG_ARGV[i])::uuid;
  IF ref IS NOT NULL AND public.buyer_relation_agency(TG_ARGV[i+1],ref) IS DISTINCT FROM agency THEN RAISE EXCEPTION 'Related records must belong to the same agency'; END IF;
  i:=i+2;
 END LOOP;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.buyer_relation_agency(text,uuid),public.buyer_relation_guard() FROM PUBLIC;
CREATE TRIGGER buyer_clients_relations BEFORE INSERT OR UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','manager_id','staff','questionnaire_template_id','questionnaire_templates','checklist_template_id','checklist_templates');
CREATE TRIGGER buyer_staff_relations BEFORE INSERT OR UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','manager_id','staff');
CREATE TRIGGER buyer_projects_relations BEFORE INSERT OR UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','client_id','clients','manager_id','staff');
CREATE TRIGGER buyer_tasks_relations BEFORE INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','client_id','clients','project_id','projects','assigned_to','staff','manager_id','staff','workflow_stage_id','workflow_stages');
CREATE TRIGGER buyer_comments_relations BEFORE INSERT OR UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('tasks','task_id','author_id','staff');
CREATE TRIGGER buyer_workflows_relations BEFORE INSERT OR UPDATE ON public.workflows FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','client_id','clients','project_id','projects');
CREATE TRIGGER buyer_stages_relations BEFORE INSERT OR UPDATE ON public.workflow_stages FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('workflows','workflow_id','responsible_staff_id','staff');
CREATE TRIGGER buyer_notifications_relations BEFORE INSERT OR UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','recipient_id','staff');
CREATE TRIGGER buyer_logs_relations BEFORE INSERT OR UPDATE ON public.staff_work_logs FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('agency_id','','staff_id','staff','task_id','tasks');
CREATE TRIGGER buyer_responses_relations BEFORE INSERT OR UPDATE ON public.questionnaire_responses FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('clients','client_id','question_id','questionnaire_questions');
CREATE TRIGGER buyer_checklist_relations BEFORE INSERT OR UPDATE ON public.client_checklist_status FOR EACH ROW EXECUTE FUNCTION public.buyer_relation_guard('clients','client_id','checklist_item_id','checklist_template_items');
