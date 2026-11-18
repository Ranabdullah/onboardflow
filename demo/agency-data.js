'use strict';
// Public examples only. This model never contains authentication tokens or provider keys.
window.AgencyData=(()=>{
 const statuses=['To do','In progress','Review','Stuck','Completed'];
 const kinds=['communication','assets','local','vouchers','branches','campaigns','calendar'];
 const str=(v,n=2000)=>typeof v==='string'?v.slice(0,n):'';
 const date=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')?v:'';
 const list=(v,n=500)=>{if(v===undefined)return [];if(!Array.isArray(v)||v.length>n)throw Error('Invalid agency records or record limit exceeded.');return v};
 const ids=v=>list(v,100).map(x=>str(x,100)).filter(Boolean);
 const url=v=>{try{const u=new URL(v);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
 const stamp=v=>Number.isFinite(Date.parse(v))?v:'';
 const defaultStaff=()=>[
  {id:'jamie',name:'Jamie Ellis',email:'jamie@example.invalid',department:'Management',role:'Manager',active:true},
  {id:'sam',name:'Sam Parker',email:'sam@example.invalid',department:'Design',role:'Staff',active:true},
  {id:'casey',name:'Casey Lane',email:'casey@example.invalid',department:'SEO',role:'Staff',active:true},
  {id:'riley',name:'Riley Brooks',email:'riley@example.invalid',department:'Video',role:'Staff',active:true}
 ];
 function task(t){return {description:str(t.description),status:statuses.includes(t.status)?t.status:t.done?'Completed':'To do',priority:['Low','Normal','High','Urgent'].includes(t.priority)?t.priority:'Normal',assignees:ids(t.assignees),start:date(t.start),reminder:date(t.reminder),flowIndex:Number.isInteger(t.flowIndex)?Math.max(0,Math.min(100,t.flowIndex)):0,comments:list(t.comments,200).map(c=>({id:str(c.id,100),text:str(c.text),at:stamp(c.at)}))}}
 function client(c){return {category:str(c.category,80),managerId:str(c.managerId,100),staffIds:ids(c.staffIds),phone:str(c.phone,60),website:url(c.website),drive:url(c.drive),social:url(c.social),records:Object.fromEntries(kinds.map(k=>[k,list(c.records?.[k],200).map(r=>({id:str(r.id,100),title:str(r.title,160),detail:str(r.detail),url:url(r.url),date:date(r.date),status:str(r.status,80),at:stamp(r.at)}))]))}}
 function validate(o){if(!o)return undefined;if(o.schema!==1)throw Error('Unsupported agency backup version.');const staff=list(o.staff,100).map(s=>({id:str(s.id,100),name:str(s.name,80),email:str(s.email,160),department:str(s.department,80),role:['Admin','Manager','Staff'].includes(s.role)?s.role:'Staff',active:s.active!==false}));if(staff.some(s=>!s.id||!s.name)||new Set(staff.map(s=>s.id)).size!==staff.length)throw Error('Invalid staff profiles.');return {schema:1,categories:[...new Set(list(o.categories,50).map(c=>str(c,80)).filter(Boolean))],staff,generalTasks:list(o.generalTasks,200).map(t=>({id:str(t.id,100),title:str(t.title,160),owner:str(t.owner,80),due:date(t.due),done:t.done===true,...task(t)})),daily:list(o.daily,1000).map(d=>({id:str(d.id,100),staffId:str(d.staffId,100),taskId:str(d.taskId,100),date:date(d.date),status:['Not started','Working','Stuck','Done'].includes(d.status)?d.status:'Not started',note:str(d.note),approved:d.approved===true,reviewedAt:stamp(d.reviewedAt)})),time:list(o.time,1000).map(t=>({id:str(t.id,100),staffId:str(t.staffId,100),taskId:str(t.taskId,100),start:stamp(t.start),end:stamp(t.end),note:str(t.note,400)}))}}
 function ensure(s){const fresh=!s.operations;if(!s.operations){s.operations={schema:1,categories:['Creative & media','Retail','Food & hospitality','Professional services','Nonprofit','Other'],staff:defaultStaff(),generalTasks:[],daily:[],time:[]}}const o=s.operations;for(const c of s.clients){if(fresh){const sample=['field-notes','west-quay'].includes(c.id);c.category=c.category||(c.id==='field-notes'?'Retail':c.id==='west-quay'?'Creative & media':'');c.managerId=c.managerId||(sample?'jamie':'');c.staffIds=c.staffIds|| (sample?['sam']:[]);for(const t of c.tasks)if(!t.assignees?.length){const matched=o.staff.find(p=>t.owner&&p.name.toLowerCase().startsWith(t.owner.toLowerCase()));if(matched)t.assignees=[matched.id]}}if(!c.records){Object.assign(c,client({...c,category:c.category||'',managerId:c.managerId||'',staffIds:c.staffIds||[]}))}for(const t of c.tasks)ensureTask(t,o)}for(const t of o.generalTasks)ensureTask(t,o);return o}
 function ensureTask(t,o){if(!t.status){const matched=o.staff.find(s=>t.owner&&s.name.toLowerCase().startsWith(t.owner.toLowerCase()));Object.assign(t,task({...t,assignees:t.assignees|| (matched?[matched.id]:[])}))}if(t.done)t.status='Completed';else if(t.status==='Completed')t.status='To do';}
 return {statuses,kinds,str,date,url,task,client,validate,ensure};
})();
