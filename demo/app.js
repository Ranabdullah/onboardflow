'use strict';
const $=selector=>document.querySelector(selector);
function view(id){
  for(const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed',button.dataset.view===id);
  for(const panel of document.querySelectorAll('[data-panel]')) panel.hidden=panel.dataset.panel!==id;
}
for(const button of document.querySelectorAll('[data-view]')) button.onclick=()=>view(button.dataset.view);

const tasks=['Review client brief','Prepare sitemap','Draft project proposal'];
const key='onboardflow-sample-v2';
let brief;
const completed=new Set();
try{
  const saved=JSON.parse(localStorage.getItem(key));
  brief=saved?.brief;
  (saved?.completed||[]).forEach(index=>completed.add(index));
}catch{}
function save(){
  try{localStorage.setItem(key,JSON.stringify({brief,completed:[...completed]}));}catch{}
}
function updateProgress(){
  $('#status').textContent=brief?completed.size+' of '+tasks.length+' tasks complete.':'';
  $('#progress').hidden=!brief;
  $('#progress').value=completed.size;
  $('#stage').textContent=brief?(completed.size===tasks.length?'Checklist complete':'Project started'):'Intake requested';
}
function render(){
  $('#goal').textContent=brief ? brief.goal+' · '+brief.priority : 'Submit the sample intake to start the project.';
  $('#assetsSummary').textContent=brief?[brief.site,brief.assets].filter(Boolean).join(' · '):'';
  $('#tasks').replaceChildren();
  updateProgress();
  if(!brief) return;
  tasks.forEach((task,index)=>{
    const row=document.createElement('li');
    const label=document.createElement('label');
    const input=document.createElement('input'); input.type='checkbox';input.style.width='auto';input.checked=completed.has(index);
    input.onchange=()=>{if(input.checked) completed.add(index);else completed.delete(index);save();updateProgress();};
    label.style.display='inline';label.append(input,' '+task);row.append(label);$('#tasks').append(row);
  });
}
let step=1;
function intakeStep(next){
  step=next;
  $('#stepLabel').textContent='Step '+step+' of 2';
  $('#intakeGoal').hidden=step!==1;
  $('#intakeAssets').hidden=step!==2;
  $('#next').hidden=step!==1;
  $('#previous').hidden=step!==2;
  $('#complete').hidden=step!==2;
}
$('#intake').onclick=()=>{intakeStep(1);view('intake');};
$('#previous').onclick=()=>intakeStep(1);
$('#next').onclick=()=>{if($('#brief').elements.goal.reportValidity())intakeStep(2);};
$('#brief').onsubmit=event=>{
  event.preventDefault();
  if(step!==2)return;
  brief=Object.fromEntries(new FormData(event.currentTarget));
  save();render();view('tasks');
};
if(brief)for(const [field,value] of Object.entries(brief))if($('#brief').elements[field])$('#brief').elements[field].value=value;
view('clients');render();
