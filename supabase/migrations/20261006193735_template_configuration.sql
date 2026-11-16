alter table public.questionnaire_templates add column if not exists service_category text not null default 'general';
alter table public.questionnaire_templates add column if not exists step_config jsonb not null default '{}';
alter table public.questionnaire_questions add column if not exists is_archived boolean not null default false;
