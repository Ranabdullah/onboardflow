'use strict';
(()=>{
 const roles={
  owner:{title:'Agency owner',description:'Manage the agency workspace and who can access it.',items:['Create staff profiles and invite individual accounts.','Choose a role and revoke access when needed.','Manage agency settings and review team work.']},
  manager:{title:'Team manager',description:'Coordinate assigned clients and review the work submitted by staff.',items:['Plan tasks, owners and due dates.','Check submissions and request changes.','Review team work logs and delivery progress.']},
  staff:{title:'Staff member',description:'Sign in to see the work assigned to you.',items:['View assigned clients and tasks.','Update work status and record time or notes.','Submit work for a manager to review.']}
 };
 function renderRole(role){
  const selected=roles[role];if(!selected)return;
  document.querySelectorAll('[data-role-preview]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.rolePreview===role)));
  const heading=document.createElement('h3'),description=document.createElement('p'),list=document.createElement('ul');
  heading.textContent=selected.title;description.textContent=selected.description;
  for(const item of selected.items){const row=document.createElement('li');row.textContent=item;list.append(row)}
  document.querySelector('#rolePreview').replaceChildren(heading,description,list);
 }
 document.querySelectorAll('[data-role-preview]').forEach(button=>button.addEventListener('click',()=>renderRole(button.dataset.rolePreview)));
 document.querySelector('#downloadEnvTemplate').addEventListener('click',()=>{
  const template='# OnboardFlow - configure only in your private app or hosting environment.\n# Never enter a server secret in the public demo.\nNEXT_PUBLIC_SUPABASE_URL=\nNEXT_PUBLIC_SUPABASE_ANON_KEY=\nSUPABASE_SERVICE_ROLE_KEY=\nNEXT_PUBLIC_APP_URL=http://localhost:3000\n';
  const url=URL.createObjectURL(new Blob([template],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='onboardflow.env.example';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 renderRole('owner');
})();
