import {
  Agency,
  Client,
  QuestionnaireTemplate,
  QuestionnaireQuestion,
  ChecklistTemplate,
  ChecklistTemplateItem,
  Upload,
  ProjectBrief,
  ClientWithDetails,
  ServiceCategory,
  Staff,
  Department,
  Project,
  Task,
  TaskComment,
  Workflow,
  WorkflowStage,
  Notification,
  ActivityLog,
  StaffWorkLog,
  PerformanceReport,
} from '@/types';

import { workspaceContext } from "./workspace-context";

export class LocalDataStore {
  private static instance: LocalDataStore;

  public agency: Agency = {
    id: '32c8d149-f62a-405c-94eb-eaf411d82261',
    owner_user_id: 'b8c03c95-4cb7-44ec-ab89-61eb5e664d5b',
    name: 'OnboardFlow Demo',
    slug: 'onboardflow-demo',
    logo_url: null,
    brand_color: '#3B82F6',
    website: '',
    support_email: 'demo@example.invalid',
    webhook_url: null,
    whatsapp_webhook_url: null,
    slack_webhook_url: null,
    stripe_payment_link: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Pre-configured Service & Industry Specific Questionnaire Templates
  public templates: QuestionnaireTemplate[] = [
    {
      id: 'tpl_social_media',
      agency_id: 'demo-agency-001',
      title: 'Social Media Management & Content Retainer',
      description: 'Intake for Instagram, Facebook, TikTok posting and monthly content calendar creation.',
      service_category: 'social_media',
      is_default: true,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: true,
        enable_payment_step: true,
        media_upload_label: 'Brand Assets, Vector Logos & Raw Media',
        contract_upload_label: 'Signed Social Media Service Agreement',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'sm_q1',
          template_id: 'tpl_social_media',
          label: 'What is the primary theme or goal for this month’s social media content?',
          description: 'e.g. Promote new spring drop, drive website visits, establish thought leadership.',
          placeholder: 'e.g. Launch our new seasonal product line and increase Instagram engagement...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sm_q2',
          template_id: 'tpl_social_media',
          label: 'What is your desired posting frequency and target channels?',
          description: 'Select the primary channels you want us to produce graphics and copy for.',
          placeholder: '',
          type: 'single_choice',
          options: [
            '3x per week (Instagram & Facebook)',
            '5x per week (Instagram, TikTok & Facebook)',
            'Daily Stories & Reels (High-growth package)',
          ],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sm_q3',
          template_id: 'tpl_social_media',
          label: 'What tone of voice and aesthetic best describes your brand?',
          description: 'Explain the visual vibe and caption writing style.',
          placeholder: 'e.g. Minimalist, modern luxury, playful, educational, bold...',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_accounting',
      agency_id: 'demo-agency-001',
      title: 'Accounting, Bookkeeping & Tax Filing',
      description: 'Intake for accounting, tax filings, payroll, and financial statements without media clutter.',
      service_category: 'accounting',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Prior Tax Returns, P&L & Bank Statements',
        contract_upload_label: 'Signed Accounting Engagement Letter & NDA',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'ac_q1',
          template_id: 'tpl_accounting',
          label: 'What is your primary entity structure and Tax ID (EIN / VAT)?',
          description: 'e.g. LLC, S-Corp, C-Corp, Sole Proprietorship.',
          placeholder: 'e.g. S-Corp, EIN: 12-3456789',
          type: 'short_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'ac_q2',
          template_id: 'tpl_accounting',
          label: 'What accounting or bookkeeping software do you currently use?',
          description: 'Select your primary financial system.',
          placeholder: '',
          type: 'single_choice',
          options: ['QuickBooks Online', 'Xero', 'FreshBooks', 'Excel / Manual Spreadsheets', 'None yet'],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
        {
          id: 'ac_q3',
          template_id: 'tpl_accounting',
          label: 'What are your urgent tax deadlines or compliance priorities?',
          description: 'List upcoming quarterly filings, payroll deadlines, or back tax needs.',
          placeholder: 'e.g. Q3 Estimated Taxes due next month, need 2025 W-2s filed...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_supplier',
      agency_id: 'demo-agency-001',
      title: 'Supplier & Vendor Procurement Intake',
      description: 'Intake for supplier qualification, manufacturing capacity, MOQ, and shipping terms.',
      service_category: 'supplier_vendor',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: false,
        media_upload_label: 'Product Catalogs, Spec Sheets & Certifications',
        contract_upload_label: 'Vendor Master Services Agreement & W-9',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'sup_q1',
          template_id: 'tpl_supplier',
          label: 'What is your primary product category and manufacturing turnaround time?',
          description: 'Specify typical production turnaround and sample delivery times.',
          placeholder: 'e.g. Custom apparel manufacturing, 3 weeks lead time, 5 days samples...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
        {
          id: 'sup_q2',
          template_id: 'tpl_supplier',
          label: 'What are your Minimum Order Quantities (MOQ) and tiered price discounts?',
          description: 'Detail MOQ requirements per unit or SKU.',
          placeholder: 'e.g. Minimum 100 units per style, 15% discount for 500+ units...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
        },
      ],
    },
    {
      id: 'tpl_branding',
      agency_id: 'demo-agency-001',
      title: 'Brand Identity & Digital Artwork',
      description: 'Intake for custom illustration, logo design, vector branding, and color palettes.',
      service_category: 'brand_design',
      is_default: false,
      step_config: {
        enable_media_uploads: true,
        enable_contract_upload: true,
        enable_platform_access: false,
        enable_payment_step: true,
        media_upload_label: 'Existing Logos, Moodboards & References',
        contract_upload_label: 'Signed Design Agreement',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      questions: [
        {
          id: 'br_q1',
          template_id: 'tpl_branding',
          label: 'What emotions or feelings should your brand artwork evoke?',
          description: 'Describe the impression someone should have when seeing your visual identity.',
          placeholder: 'e.g. Premium, trustworthy, futuristic, organic...',
          type: 'long_text',
          options: [],
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
        },
      ],
    },
  ];

  public checklistItems: ChecklistTemplateItem[] = [
    {
      id: 'c1',
      template_id: 'demo-c-001',
      label: 'Complete Intake Questionnaire',
      description: 'Answer required questions.',
      category: 'questionnaire',
      required: true,
      order_index: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c2',
      template_id: 'demo-c-001',
      label: 'Upload Signed Contract / Agreement',
      description: 'Provide signed service agreement or engagement letter.',
      category: 'contract',
      required: true,
      order_index: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: 'c3',
      template_id: 'demo-c-001',
      label: 'Upload Required Documents or Assets',
      description: 'Upload required files, tax docs, or brand assets.',
      category: 'asset',
      required: true,
      order_index: 3,
      created_at: new Date().toISOString(),
    },
  ];

  public departments: Department[] = [
    { id: 'dept_management', agency_id: 'demo-agency-001', name: 'Management', description: 'Executive & Strategy', color: '#059669', created_at: new Date().toISOString() },
    { id: 'dept_seo', agency_id: 'demo-agency-001', name: 'SEO & Content', description: 'Search optimization & copywriting', color: '#3B82F6', created_at: new Date().toISOString() },
    { id: 'dept_design', agency_id: 'demo-agency-001', name: 'Design & Creative', description: 'Branding, UI & visual assets', color: '#8B5CF6', created_at: new Date().toISOString() },
    { id: 'dept_video', agency_id: 'demo-agency-001', name: 'Video & Motion', description: 'Reels, YouTube & short-form video', color: '#F59E0B', created_at: new Date().toISOString() },
    { id: 'dept_dev', agency_id: 'demo-agency-001', name: 'Web Development', description: 'Websites, web apps & integrations', color: '#10B981', created_at: new Date().toISOString() },
    { id: 'dept_account', agency_id: 'demo-agency-001', name: 'Account Management', description: 'Client onboarding & relations', color: '#EC4899', created_at: new Date().toISOString() },
  ];

  public staff: Map<string, Staff> = new Map();
  public projects: Map<string, Project> = new Map();
  public tasks: Map<string, Task> = new Map();
  public taskComments: Map<string, TaskComment[]> = new Map();
  public workflows: Map<string, Workflow> = new Map();
  public notifications: Notification[] = [];
  public activityLogs: ActivityLog[] = [];
  public workLogs: StaffWorkLog[] = [];

  public clients: Map<string, Client> = new Map();
  public responses: Map<string, Map<string, any>> = new Map();
  public checklistStatus: Map<string, Map<string, boolean>> = new Map();
  public uploads: Map<string, Upload[]> = new Map();
  public briefs: Map<string, ProjectBrief> = new Map();

  public constructor() {}

  public static getInstance(): LocalDataStore {
    if (!(globalThis as any).__localStoreInstance) {
      (globalThis as any).__localStoreInstance = new LocalDataStore();
    }
    return (globalThis as any).__localStoreInstance;
  }

  public toggleClientStar(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_starred = !client.is_starred;
    client.updated_at = new Date().toISOString();
    return client.is_starred;
  }

  public setClientStar(clientId: string, isStarred: boolean): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_starred = isStarred;
    client.updated_at = new Date().toISOString();
    return client.is_starred;
  }

  public getClientByToken(token: string): Client | undefined {
    for (const client of this.clients.values()) {
      if (client.onboarding_token === token) return client;
    }
    return undefined;
  }

  public getClientByShareToken(shareToken: string): Client | undefined {
    for (const client of this.clients.values()) {
      if (client.package_share_token === shareToken) return client;
    }
    return undefined;
  }

  public getTemplate(id?: string | null): QuestionnaireTemplate {
    if (!id) return this.templates[0];
    const found = this.templates.find((t) => t.id === id);
    return found || this.templates[0];
  }

  public addTemplate(template: QuestionnaireTemplate) {
    this.templates.unshift(template);
  }

  public getClientWithDetails(clientId: string): ClientWithDetails | undefined {
    const client = this.clients.get(clientId);
    if (!client) return undefined;

    const template = this.getTemplate(client.questionnaire_template_id);
    const questions = template.questions || [];

    const respMap = this.responses.get(clientId) || new Map();
    const responses = Array.from(respMap.entries()).map(([qId, ans]) => ({
      id: `resp_${qId}`,
      client_id: clientId,
      question_id: qId,
      answer: typeof ans === 'string' ? ans : JSON.stringify(ans),
      answer_json: typeof ans !== 'string' ? ans : null,
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      question: questions.find((q) => q.id === qId) || {
        id: qId,
        template_id: template.id,
        label: 'Intake Question',
        description: null,
        placeholder: null,
        type: 'long_text' as const,
        required: true,
        order_index: 1,
        created_at: new Date().toISOString(),
      },
    }));

    const checkMap = this.checklistStatus.get(clientId) || new Map();
    const checklist_status = Array.from(checkMap.entries()).map(([cId, isCompleted]) => ({
      id: `chk_${cId}`,
      client_id: clientId,
      checklist_item_id: cId,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      notes: null,
      item: this.checklistItems.find((c) => c.id === cId),
    }));

    const uploads = this.uploads.get(clientId) || [];
    const brief = this.briefs.get(clientId) || null;
    const manager = client.manager_id ? this.staff.get(client.manager_id) : null;
    const assigned_staff = (client.assigned_staff_ids || []).map((sId) => this.staff.get(sId)).filter(Boolean) as Staff[];

    return {
      ...client,
      agency: this.agency,
      manager,
      assigned_staff,
      questionnaire_template: template,
      checklist_template: {
        id: 'demo-c-001',
        agency_id: this.agency.id,
        title: 'Standard Onboarding Checklist',
        is_default: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        items: this.checklistItems,
      },
      responses,
      checklist_status,
      uploads,
      brief,
    };
  }

  // --- Staff Methods ---
  public getAllStaff(): Staff[] {
    return Array.from(this.staff.values()).map((s) => {
      const activeTasks = Array.from(this.tasks.values()).filter((t) => t.assigned_to === s.id && t.status !== 'completed').length;
      const completedTasks = Array.from(this.tasks.values()).filter((t) => t.assigned_to === s.id && t.status === 'completed').length;
      const overdueTasks = Array.from(this.tasks.values()).filter((t) => {
        if (t.assigned_to !== s.id || t.status === 'completed' || !t.due_date) return false;
        return new Date(t.due_date).getTime() < Date.now();
      }).length;
      const assignedClients = Array.from(this.clients.values()).filter((c) => !c.is_archived && (c.manager_id === s.id || (c.assigned_staff_ids || []).includes(s.id))).length;

      return {
        ...s,
        active_tasks_count: activeTasks,
        completed_tasks_count: completedTasks,
        overdue_tasks_count: overdueTasks,
        assigned_clients_count: assignedClients,
      };
    });
  }

  public getStaffById(id: string): Staff | undefined {
    return this.staff.get(id);
  }

  public saveStaff(staff: Staff): Staff {
    this.staff.set(staff.id, staff);
    return staff;
  }

  public deleteStaff(id: string): boolean {
    return this.staff.delete(id);
  }

  // --- Project Methods ---
  public getAllProjects(): Project[] {
    return Array.from(this.projects.values()).map((p) => ({
      ...p,
      client: this.clients.get(p.client_id),
      manager: p.manager_id ? this.staff.get(p.manager_id) : null,
    }));
  }

  public getProjectById(id: string): Project | undefined {
    const p = this.projects.get(id);
    if (!p) return undefined;
    return {
      ...p,
      client: this.clients.get(p.client_id),
      manager: p.manager_id ? this.staff.get(p.manager_id) : null,
    };
  }

  public saveProject(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  // --- Task Methods ---
  public getAllTasks(filters?: { clientId?: string; assignedTo?: string; status?: string; priority?: string }): Task[] {
    let list = Array.from(this.tasks.values()).map((t) => ({
      ...t,
      client: t.client_id ? this.clients.get(t.client_id) : null,
      assignee: t.assigned_to ? this.staff.get(t.assigned_to) : null,
      manager: t.manager_id ? this.staff.get(t.manager_id) : null,
      comments: this.taskComments.get(t.id) || [],
    }));

    if (filters?.clientId) list = list.filter((t) => t.client_id === filters.clientId);
    if (filters?.assignedTo) list = list.filter((t) => t.assigned_to === filters.assignedTo);
    if (filters?.status && filters.status !== 'all') list = list.filter((t) => t.status === filters.status);
    if (filters?.priority && filters.priority !== 'all') list = list.filter((t) => t.priority === filters.priority);

    return list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public getTaskById(id: string): Task | undefined {
    const t = this.tasks.get(id);
    if (!t) return undefined;
    return {
      ...t,
      client: t.client_id ? this.clients.get(t.client_id) : null,
      assignee: t.assigned_to ? this.staff.get(t.assigned_to) : null,
      manager: t.manager_id ? this.staff.get(t.manager_id) : null,
      comments: this.taskComments.get(t.id) || [],
    };
  }

  public saveTask(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  public deleteTask(id: string): boolean {
    return this.tasks.delete(id);
  }

  public addTaskComment(taskId: string, comment: TaskComment): TaskComment {
    const list = this.taskComments.get(taskId) || [];
    list.push(comment);
    this.taskComments.set(taskId, list);
    return comment;
  }

  // --- Workflow Methods ---
  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values()).map((w) => ({
      ...w,
      client: this.clients.get(w.client_id),
      project: w.project_id ? this.projects.get(w.project_id) : null,
      stages: w.stages.map((s) => ({
        ...s,
        responsible_staff: s.responsible_staff_id ? this.staff.get(s.responsible_staff_id) : null,
        tasks: Array.from(this.tasks.values()).filter((t) => t.workflow_stage_id === s.id),
      })),
    }));
  }

  public getWorkflowById(id: string): Workflow | undefined {
    const w = this.workflows.get(id);
    if (!w) return undefined;
    return {
      ...w,
      client: this.clients.get(w.client_id),
      project: w.project_id ? this.projects.get(w.project_id) : null,
      stages: w.stages.map((s) => ({
        ...s,
        responsible_staff: s.responsible_staff_id ? this.staff.get(s.responsible_staff_id) : null,
        tasks: Array.from(this.tasks.values()).filter((t) => t.workflow_stage_id === s.id),
      })),
    };
  }

  public saveWorkflow(wf: Workflow): Workflow {
    this.workflows.set(wf.id, wf);
    return wf;
  }

  public advanceWorkflowStage(workflowId: string, stageId: string, newStatus: any): Workflow | undefined {
    const wf = this.workflows.get(workflowId);
    if (!wf) return undefined;
    wf.stages = wf.stages.map((s) => {
      if (s.id === stageId) {
        return {
          ...s,
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : s.completed_at,
          updated_at: new Date().toISOString(),
        };
      }
      return s;
    });
    wf.updated_at = new Date().toISOString();
    this.workflows.set(workflowId, wf);
    return wf;
  }

  // --- Client Archive Methods ---
  public archiveClient(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_archived = true;
    client.archived_at = new Date().toISOString();
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: 'Agency Admin',
      action: 'client_archived',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.name,
      metadata: { company: client.company },
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public unarchiveClient(clientId: string): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;
    client.is_archived = false;
    client.archived_at = null;
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: 'Agency Admin',
      action: 'client_unarchived',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.name,
      created_at: new Date().toISOString(),
    });
    return true;
  }

  public deleteClientPermanently(clientId: string): boolean {
    this.responses.delete(clientId);
    this.checklistStatus.delete(clientId);
    this.uploads.delete(clientId);
    this.briefs.delete(clientId);
    return this.clients.delete(clientId);
  }

  // --- Notifications ---
  public getAllNotifications(): Notification[] {
    return this.notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public markNotificationAsRead(id: string): boolean {
    const notif = this.notifications.find((n) => n.id === id);
    if (!notif) return false;
    notif.is_read = true;
    return true;
  }

  public markAllNotificationsAsRead(): void {
    this.notifications.forEach((n) => (n.is_read = true));
  }

  public addNotification(notif: Notification): Notification {
    this.notifications.unshift(notif);
    return notif;
  }

  // --- Activity / Work Audit ---
  public getActivityLogs(limit = 50): ActivityLog[] {
    return this.activityLogs
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  public logActivity(entry: ActivityLog): ActivityLog {
    this.activityLogs.unshift(entry);
    return entry;
  }

  // --- Work Logs & Reports ---
  public getStaffWorkLogs(): StaffWorkLog[] {
    return this.workLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  public addWorkLog(log: StaffWorkLog): StaffWorkLog {
    this.workLogs.unshift(log);
    return log;
  }

  public getPerformanceReports(): PerformanceReport[] {
    const allStaff = this.getAllStaff();
    return allStaff.map((s) => {
      const totalAssigned = (s.active_tasks_count || 0) + (s.completed_tasks_count || 0) + (s.overdue_tasks_count || 0);
      const completionRate = totalAssigned > 0 ? Math.round(((s.completed_tasks_count || 0) / totalAssigned) * 100) : 0;
      const hoursLogged = this.workLogs
        .filter((w) => w.staff_id === s.id)
        .reduce((sum, item) => sum + (Number(item.hours_spent) || 0), 0);

      return {
        staff_id: s.id,
        staff_name: s.name,
        avatar_url: s.avatar_url,
        department: s.department,
        role: s.role.toUpperCase(),
        tasks_assigned: totalAssigned,
        tasks_completed: s.completed_tasks_count || 0,
        tasks_overdue: s.overdue_tasks_count || 0,
        completion_rate: completionRate,
        hours_logged: hoursLogged,
        active_clients_count: s.assigned_clients_count || 0,
        performance_score: completionRate,
      };
    });
  }

  // --- Core Differentiator: Automated Onboarding -> Project Provisioning ---
  public provisionProjectFromOnboarding(clientId: string): { project: Project; workflow: Workflow; tasks: Task[] } | null {
    const client = this.clients.get(clientId);
    if (!client) return null;

    const prior=Array.from(this.workflows.values()).find(w=>w.client_id===clientId);
    if(prior?.project_id){const project=this.projects.get(prior.project_id);if(project)return {project,workflow:prior,tasks:Array.from(this.tasks.values()).filter(t=>t.project_id===project.id)};}

    client.status = 'completed';
    client.project_status = 'ready_for_project';
    client.completed_at = new Date().toISOString();
    client.updated_at = new Date().toISOString();
    this.clients.set(clientId, client);

    const projectId = crypto.randomUUID();
    const workflowId = crypto.randomUUID();

    // 1. Create Project
    const project: Project = {
      id: projectId,
      agency_id: client.agency_id,
      client_id: client.id,
      title: `${client.company || client.name} — Agency Project`,
      description: `Delivery workspace for ${client.name}. Review the saved onboarding answers and brief.`,
      status: 'active',
      priority: 'high',
      manager_id: client.manager_id || null,
      start_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.projects.set(projectId, project);

    // 2. Create 5-Stage Delivery Workflow
    const workflow: Workflow = {
      id: workflowId,
      agency_id: client.agency_id,
      client_id: client.id,
      project_id: projectId,
      name: `${client.company || client.name} Delivery Workflow`,
      description: 'Standard 5-stage agency fulfillment workflow',
      status: 'active',
      current_stage_index: 1,
      stages: [
        {
          id: `stg_${Date.now()}_1`,
          workflow_id: workflowId,
          title: 'Stage 1: Weekly Audit of Client & Check Issues',
          description: 'Audit uploaded brand assets, credentials, and questionnaire scope.',
          responsible_staff_id: null,
          order_index: 1,
          status: 'current',
          due_date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: 'Auto-initiated upon client submission.',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_2`,
          workflow_id: workflowId,
          title: 'Stage 2: Strategy & Kickoff Meeting',
          description: 'Review synthesized AI Project Brief with client.',
          responsible_staff_id: client.manager_id || null,
          order_index: 2,
          status: 'pending',
          due_date: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_3`,
          workflow_id: workflowId,
          title: 'Stage 3: Client Work Execution',
          description: 'Deliver core project milestones and assets.',
          responsible_staff_id: null,
          order_index: 3,
          status: 'pending',
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_4`,
          workflow_id: workflowId,
          title: 'Stage 4: Quality Review & Client Feedback',
          description: 'Internal QC and client revisions.',
          responsible_staff_id: null,
          order_index: 4,
          status: 'pending',
          due_date: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: `stg_${Date.now()}_5`,
          workflow_id: workflowId,
          title: 'Stage 5: Final Delivery & Retainer Activation',
          description: 'Signoff, asset handoff, and monthly retainer onboarding.',
          responsible_staff_id: null,
          order_index: 5,
          status: 'pending',
          due_date: new Date(Date.now() + 28 * 86400000).toISOString().split('T')[0],
          completed_at: null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.workflows.set(workflowId, workflow);

    // 3. Create Kickoff Tasks
    const initialTasks: Task[] = [
      {
        id: crypto.randomUUID(),
        agency_id: client.agency_id,
        client_id: client.id,
        project_id: projectId,
        workflow_stage_id: workflow.stages[0].id,
        title: `Audit submitted assets & responses for ${client.name}`,
        description: 'Verify all brand guidelines, vector files, and questionnaire answers.',
        assigned_to: null,
        manager_id: client.manager_id || null,
        department: 'SEO & Content',
        priority: 'high',
        status: 'open',
        due_date: new Date(Date.now() + 2 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Onboarding', 'Audit', 'Kickoff'],
        checklist: [
          { id: 'c_1', text: 'Verify uploaded vector logos', completed: false },
          { id: 'c_2', text: 'Check platform locker logins', completed: false },
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        agency_id: client.agency_id,
        client_id: client.id,
        project_id: projectId,
        workflow_stage_id: workflow.stages[1].id,
        title: `Prepare kickoff alignment call & share AI Brief with ${client.name}`,
        description: 'Send calendar invite and present the synthesized AI Project Brief.',
        assigned_to: client.manager_id || null,
        manager_id: client.manager_id || null,
        department: 'Account Management',
        priority: 'medium',
        status: 'open',
        due_date: new Date(Date.now() + 5 * 86400000).toISOString(),
        completed_at: null,
        tags: ['Meeting', 'Kickoff'],
        checklist: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    initialTasks.forEach((t) => this.tasks.set(t.id, t));

    // 4. Send Internal Notifications
    this.addNotification({
      id: `notif_${Date.now()}`,
      agency_id: client.agency_id,
      recipient_id: client.manager_id || 'agency-owner',
      title: 'New Client Project Provisioned 🚀',
      message: `${client.company || client.name} finished onboarding. Project & Workflow ready.`,
      type: 'onboarding_completed',
      link: `/clients/${client.id}`,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    // 5. Work Audit Event
    this.logActivity({
      id: `act_${Date.now()}`,
      agency_id: client.agency_id,
      actor_name: client.name,
      action: 'onboarding_completed',
      entity_type: 'client',
      entity_id: client.id,
      entity_title: client.company || client.name,
      metadata: { project_id: projectId, workflow_id: workflowId },
      created_at: new Date().toISOString(),
    });

    return { project, workflow, tasks: initialTasks };
  }
}

export const localStore = new Proxy({} as LocalDataStore, {get(_target,key){const store=workspaceContext.getStore();if(!store)throw new Error('Workspace context is required.');const value=store[key];return typeof value==='function'?value.bind(store):value;},set(_target,key,value){const store=workspaceContext.getStore();if(!store)throw new Error('Workspace context is required.');store[key]=value;return true;}});
