import {seed,applyAction} from './demo-models.mjs';
import {analyzeMessage} from './scam-rules.mjs';
const project=document.body.dataset.project;
const config={
  seis:{name:'Student Enrollment',subtitle:'Register a sample student, enroll them in a course, and inspect the report.',views:['Dashboard','Students','Enrollment','Courses','Reports'],repo:'https://github.com/ling-cosmos/Student-Enrollment-Information-System-Public'},
  alaga:{name:'Alaga',subtitle:'Try recording, snoozing, and undoing a synthetic dose, then inspect inventory and history.',views:['Today','Medicines','History'],repo:'https://github.com/kaelxoxo/prog_lang'},
  boja:{name:'Boja',subtitle:'Create a fictional case, connect a document entry, and track a sample deadline.',views:['Overview','Cases','Documents','Deadlines'],repo:'https://github.com/kaelxoxo/boja-law-office-project-vault'},
  scamsignal:{name:'ScamSignal',subtitle:'Try the project’s deterministic message checks directly in your browser.',views:['Message checker'],repo:'https://github.com/ling-cosmos/scamsignal'},
}[project];
const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let state=project==='scamsignal'?null:seed(project),view=config.views[0],query='',pending=null;
const samples={risky:'Urgent! Your GCash account will be closed. Share your OTP immediately at https://gcash-verify.example and claim your reward.',routine:'Our study group meets at the library at 3 PM on Friday. Please bring your notes.',filipino:'Nanalo ka ng premyo! Ibigay ang OTP ngayon para makuha ang gantimpala: https://bit.ly/demo-only'};
const names=(list,key='name')=>list.map(r=>[r.id,r[key]]);
const button=(label,action,id='',value='',disabled=false)=>`<button class="demo-button" type="button" data-action="${action}" data-id="${esc(id)}" data-value="${esc(value)}" ${disabled?'disabled':''}>${esc(label)}</button>`;
const input=(name,label,type='text',extra='')=>`<label>${label}<input name="${name}" type="${type}" required ${type==='text'?'maxlength="100"':''} ${extra}></label>`;
const select=(name,label,options,current)=>`<label>${label}<select name="${name}" required>${options.map(([id,label])=>`<option value="${esc(id)}" ${id===current?'selected':''}>${esc(label)}</option>`).join('')}</select></label>`;
const form=(action,fields,label)=>`<form class="demo-form" data-action="${action}">${fields}<button class="demo-button primary" type="submit">${label}</button></form>`;
const panel=(title,body)=>`<section class="demo-panel"><h2>${title}</h2>${body}</section>`;
const stat=(value,label)=>`<div class="demo-stat"><strong>${esc(value)}</strong><span>${esc(label)}</span></div>`;
const row=body=>`<div class="demo-row">${body}</div>`;
const empty=(list,content)=>list.length?content:'<p class="empty">No matching demo records.</p>';
const caseName=id=>state.cases.find(c=>c.id===id)?.title??'Unknown sample case';
function stats(){
  if(project==='seis')return stat(state.students.length,'Students')+stat(state.courses.length,'Courses')+stat(state.enrollments.length,'Enrollments');
  if(project==='alaga')return stat(state.doses.filter(d=>['Taken','Skipped'].includes(d.status)).length+'/'+state.doses.length,'Final dose records')+stat(state.medicines.reduce((sum,m)=>sum+m.stock,0),'Demo stock units')+stat(state.history.length,'History entries');
  return stat(state.cases.length,'Sample cases')+stat(state.documents.length,'Document entries')+stat(state.deadlines.filter(d=>d.status==='Pending').length,'Pending deadlines');
}
function enrollmentRows(){return empty(state.enrollments,state.enrollments.map(e=>row(`<strong>${esc(state.students.find(s=>s.id===e.studentId).name)}</strong><small>${esc(state.courses.find(c=>c.id===e.courseId).name)}</small>${view==='Enrollment'?button('Withdraw demo enrollment','withdraw',e.studentId,e.courseId):''}`)).join(''));}
function seis(){
  if(view==='Dashboard')return `<div class="demo-stats">${stats()}</div><div class="demo-grid">${panel('Recent enrollments',enrollmentRows())}${panel('Try a complete workflow','<p>1. Add a fictional student in Students.</p><p>2. Open Enrollment and choose a course.</p><p>3. Check course capacity and the enrollment report.</p><p>Duplicate enrollments and full courses are rejected.</p>')}</div>`;
  if(view==='Students'){
    const list=state.students.filter(s=>(s.name+' '+s.program).toLowerCase().includes(query.toLowerCase()));
    return `<div class="demo-grid">${panel('Student directory',form('search',`<label>Search students<input name="query" value="${esc(query)}" maxlength="100"></label>`,'Search students')+empty(list,list.map(s=>row(`<strong>${esc(s.name)}</strong><small>${esc(s.id)} · ${esc(s.program)}</small>`)).join('')))}${panel('Add a sample student',form('student',input('name','Student name')+select('program','Program',[['BSCS','BS Computer Science'],['BSIT','BS Information Technology']]),'Add student'))}</div>`;
  }
  if(view==='Enrollment')return `<div class="demo-grid">${panel('Enroll a student',form('enroll',select('studentId','Student',names(state.students))+select('courseId','Course',names(state.courses)),'Enroll student'))}${panel('Current enrollments',enrollmentRows())}</div>`;
  if(view==='Courses')return `<div class="demo-grid">${panel('Course capacity',state.courses.map(c=>row(`<strong>${esc(c.name)}</strong><small>${state.enrollments.filter(e=>e.courseId===c.id).length} / ${c.capacity} places filled</small>`)).join(''))}${panel('Add a demo course',form('course',input('name','Course name')+input('capacity','Capacity','number','min="1" max="999" step="1"'),'Add course'))}</div>`;
  return `<div class="demo-stats">${stats()}</div>${panel('Enrollment report','<div class="table-wrap"><table class="demo-table"><thead><tr><th>Student</th><th>Program</th><th>Enrolled courses</th></tr></thead><tbody>'+state.students.map(s=>`<tr><td>${esc(s.name)}</td><td>${esc(s.program)}</td><td>${esc(state.enrollments.filter(e=>e.studentId===s.id).map(e=>state.courses.find(c=>c.id===e.courseId).name).join(', ')||'Not enrolled')}</td></tr>`).join('')+'</tbody></table></div>')}`;
}
function alaga(){
  if(view==='Today')return `<div class="demo-stats">${stats()}</div>${panel('Demo patient · Synthetic care schedule','<p>Each Taken action uses one fictional stock unit. Snooze only changes the demo status; no notification is scheduled.</p>'+state.doses.map(d=>{
    const m=state.medicines.find(m=>m.id===d.medicineId),final=['Taken','Skipped'].includes(d.status),hasHistory=state.history.some(e=>e.doseId===d.id&&!e.undone);
    return row(`<strong>${d.time} · ${esc(m.name)}</strong><small>1 synthetic unit · ${m.stock} units in stock</small><span class="dose-status">${d.status}</span><div class="row-actions">${button('Taken','record',d.id,'Taken',final)}${button('Skip','record',d.id,'Skipped',final)}${button('Snooze','record',d.id,'Snoozed',final||d.status==='Snoozed')}${button('Undo last record','undo',d.id,'',!hasHistory)}</div>`);
  }).join(''))}`;
  if(view==='Medicines')return `<div class="demo-grid">${panel('Synthetic medicine inventory',state.medicines.map(m=>row(`<strong>${esc(m.name)}</strong><small>${m.stock} demo units remaining</small>`)).join(''))}${panel('Add demo stock',form('refill',select('id','Demo medicine',names(state.medicines))+input('amount','Units to add','number','min="1" max="999" step="1"'),'Add stock'))}</div>`;
  return panel('Retained demo history',empty(state.history,[...state.history].reverse().map(e=>row(`<strong>${esc(e.medicine)} · ${e.time} · ${e.status}</strong><small>Demo caregiver · ${esc(e.id)}${e.undone?' · Reversed by an undo action':' · Current history entry'}</small>`)).join('')));
}
function boja(){
  if(view==='Overview')return `<div class="demo-stats">${stats()}</div><div class="demo-grid">${panel('Pending sample deadlines',empty(state.deadlines.filter(d=>d.status==='Pending'),state.deadlines.filter(d=>d.status==='Pending').sort((a,b)=>a.date.localeCompare(b.date)).map(d=>row(`<strong>${esc(d.title)}</strong><small>${d.date} · ${esc(caseName(d.caseId))}</small>`)).join('')))}${panel('Try a connected workflow','<p>Add a fictional case, create a document index entry for that case, and schedule a sample deadline. Then mark the deadline done.</p><p>This is an interactive portfolio concept, not the team’s application or approved design. No legal dates are calculated and no client files are uploaded.</p>')}</div>`;
  if(view==='Cases')return `<div class="demo-grid">${panel('Case workspace',state.cases.map(c=>row(`<strong>${esc(c.title)}</strong><small>${esc(c.id)} · ${state.documents.filter(d=>d.caseId===c.id).length} documents · ${state.deadlines.filter(d=>d.caseId===c.id).length} deadlines</small>`+form('caseStatus',`<input type="hidden" name="id" value="${esc(c.id)}">`+select('status','Case status',[['In progress','In progress'],['In review','In review'],['Closed','Closed']],c.status),'Update case status'))).join(''))}${panel('Add a fictional case',form('case',input('title','Case title'),'Create case'))}</div>`;
  if(view==='Documents')return `<div class="demo-grid">${panel('Document index',state.documents.map(d=>row(`<strong>${esc(d.title)}</strong><small>${esc(caseName(d.caseId))} · ${esc(d.id)}</small>`)).join(''))}${panel('Add a document entry','<p>Record a fictional document title. This demo does not upload files.</p>'+form('document',input('title','Document title')+select('caseId','Linked case',names(state.cases,'title')),'Add document entry'))}</div>`;
  return `<div class="demo-grid">${panel('Sample deadlines',state.deadlines.map(d=>row(`<strong>${esc(d.title)}</strong><small>${d.date} · ${esc(caseName(d.caseId))} · ${d.status}</small>${button(d.status==='Done'?'Reopen deadline':'Mark done','complete',d.id)}`)).join(''))}${panel('Schedule a sample deadline',form('deadline',input('title','Task title')+select('caseId','Linked case',names(state.cases,'title'))+input('date','Sample due date','date'),'Add deadline'))}</div>`;
}
function scam(){return `<div class="demo-grid">${panel('Message to check','<p>Text is processed locally. No AI service is called and no links are opened.</p><div class="sample-buttons">'+button('Load risky sample','sample','risky')+button('Load routine sample','sample','routine')+button('Load Filipino sample','sample','filipino')+'</div>'+form('analyze','<label>Message<textarea name="message" maxlength="5000" required placeholder="Use sample text; do not enter passwords or OTPs."></textarea></label>','Check message')+button('Clear message','clear'))}${panel('Signal report','<div id="signal-result" class="demo-results" aria-live="polite"><p>Load a sample or enter a message, then choose Check message.</p></div>')}</div>`;}
function render(){
  $('#demo-content').innerHTML=project==='seis'?seis():project==='alaga'?alaga():project==='boja'?boja():scam();
  $('#demo-nav').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
  $('#confirm-area').innerHTML=pending?`<section class="confirm-panel" aria-label="Confirm demo care record"><strong>Record ${esc(pending.status)} for ${esc(state.medicines.find(m=>m.id===state.doses.find(d=>d.id===pending.id).medicineId).name)}?</strong><p>This only changes synthetic demo data.</p><div class="row-actions">${button('Confirm demo record','confirm')}${button('Cancel','cancel')}</div></section>`:'';
}
function notice(message,error=false){const node=$('#demo-status');node.textContent=message;node.className=error?'demo-status demo-error':'demo-status';node.setAttribute('role',error?'alert':'status');}
function act(action,data){
  try{
    if(action==='search'){query=data.query.trim();render();notice('Student search updated.');return;}
    if(action==='analyze'){
      const {hits,urls}=analyzeMessage(data.message);
      $('#signal-result').innerHTML=`<h3>${hits.length?`${hits.length} warning sign${hits.length===1?'':'s'} found`:'No configured warning signs found'}</h3><ul class="signal-list">${hits.map(h=>`<li>${esc(h.label)}</li>`).join('')}</ul><p>${hits.length?'Verify the sender independently before responding, sharing credentials, or paying.':'This does not prove the message is safe. These checks can miss scams and can flag legitimate text.'}</p>${urls.length?'<h4>Detected addresses (not opened)</h4><ul>'+urls.map(u=>`<li><code>${esc(u)}</code></li>`).join('')+'</ul>':''}<p class="demo-help">Deterministic pattern checks from ScamSignal. No sender verification, browsing, or AI assessment is performed in this demo.</p>`;
      notice('Message checked locally.');return;
    }
    state=applyAction(state,project,action,data);pending=null;render();notice('Demo updated. Changes apply only to this visit.');
  }catch(error){notice(error.message,true);}
}
$('#demo-content').addEventListener('submit',event=>{event.preventDefault();act(event.target.dataset.action,Object.fromEntries(new FormData(event.target)));});
document.addEventListener('click',event=>{
  const b=event.target.closest('button[data-action]');if(!b)return;
  const {action,id,value}=b.dataset;
  if(action==='record'){pending={id,status:value};render();notice('Review and confirm the synthetic care record.');$('#confirm-area button')?.focus();return;}
  if(action==='confirm'){if(pending)act('record',pending);return;}
  if(action==='cancel'){pending=null;render();notice('Demo action cancelled.');return;}
  if(action==='sample'){$('[name=message]').value=samples[id];$('#signal-result').innerHTML='<p>Sample loaded. Choose Check message to analyze it.</p>';notice('Sample message loaded.');return;}
  if(action==='clear'){$('[name=message]').value='';$('#signal-result').innerHTML='<p>Message cleared. Load a sample to try another check.</p>';notice('Message cleared.');return;}
  act(action,{id,status:value,studentId:id,courseId:value});
});
$('#demo-title').textContent=config.name;$('#demo-subtitle').textContent=config.subtitle;
$('#demo-nav').innerHTML=config.views.map(v=>`<button class="demo-button" data-view="${v}" aria-pressed="false">${v}</button>`).join('');
$('#demo-nav').addEventListener('click',event=>{const b=event.target.closest('[data-view]');if(b)location.hash=b.dataset.view.toLowerCase().replaceAll(' ','-');});
function navigate(){view=config.views.find(v=>v.toLowerCase().replaceAll(' ','-')===location.hash.slice(1))||config.views[0];pending=null;render();notice('');}
window.addEventListener('hashchange',navigate);
$('#reset-demo').addEventListener('click',()=>{if(project!=='scamsignal')state=seed(project);query='';pending=null;render();notice('Sample data restored.');});
$('#source-link').href=config.repo;
const destinations={cabus:'cabus/index.html',seis:'seis.html',scamsignal:'scamsignal.html',alaga:'alaga.html',boja:'boja.html'};
$('#project-choice').value=project;$('#project-choice').addEventListener('change',event=>{location.href=destinations[event.target.value];});
if(project==='boja')$('#demo-type').textContent='Interactive concept · Fictional data';
if(project==='alaga')$('#extra-link').innerHTML='<a href="alaga-screenshots.html">View actual Android screenshots ↗</a>';
if(project==='boja')$('#extra-link').innerHTML='<a href="boja-overview.html">View concept overview ↗</a>';
navigate();
