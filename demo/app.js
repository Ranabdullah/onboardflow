'use strict';
const $=selector=>document.querySelector(selector);
function view(id){
  for(const button of document.querySelectorAll('[data-view]')) button.setAttribute('aria-pressed',button.dataset.view===id);
  for(const panel of document.querySelectorAll('[data-panel]')) panel.hidden=panel.dataset.panel!==id;
}
for(const button of document.querySelectorAll('[data-view]')) button.onclick=()=>view(button.dataset.view);

const tasks=['Review client brief','Prepare sitemap','Draft project proposal'];
let brief;
const completed=new Set();
function render(){
  $('#stage').textContent=brief?'Project started':'Intake requested';
  $('#goal').textContent=brief ? brief.goal+' · '+brief.priority : 'Submit the sample intake to start the project.';
  $('#tasks').replaceChildren();
  if(!brief) return;
  tasks.forEach((task,index)=>{
    const row=document.createElement('li');
    const label=document.createElement('label');
    const input=document.createElement('input'); input.type='checkbox';input.style.width='auto';input.checked=completed.has(index);
    input.onchange=()=>{if(input.checked) completed.add(index);else completed.delete(index);$('#status').textContent=completed.size+' of '+tasks.length+' tasks complete.';};
    label.style.display='inline';label.append(input,' '+task);row.append(label);$('#tasks').append(row);
  });
  $('#status').textContent=completed.size+' of '+tasks.length+' tasks complete.';
}
$('#intake').onclick=()=>view('intake');
$('#brief').onsubmit=event=>{event.preventDefault();brief=Object.fromEntries(new FormData(event.currentTarget));render();view('tasks');};
view('clients');render();
