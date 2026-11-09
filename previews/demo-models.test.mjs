import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seed,applyAction} from './demo-models.mjs';
import {analyzeMessage} from './scam-rules.mjs';
test('enrollment rejects duplicates and full courses without changing current records',()=>{
  const initial=seed('seis');
  assert.throws(()=>applyAction(initial,'seis','enroll',{studentId:'S1',courseId:'C1'}),/already enrolled/);
  const full=applyAction(initial,'seis','enroll',{studentId:'S2',courseId:'C1'});
  assert.throws(()=>applyAction(full,'seis','enroll',{studentId:'S3',courseId:'C1'}),/full/);
  assert.equal(initial.enrollments.length,1);assert.equal(full.enrollments.length,2);
});
test('a student can be registered, enrolled, withdrawn, and enrolled again',()=>{
  let s=applyAction(seed('seis'),'seis','student',{name:'Demo learner',program:'BSCS'});
  const studentId=s.students.at(-1).id;
  s=applyAction(s,'seis','enroll',{studentId,courseId:'C2'});
  s=applyAction(s,'seis','withdraw',{studentId,courseId:'C2'});
  assert(!s.enrollments.some(e=>e.studentId===studentId));
  s=applyAction(s,'seis','enroll',{studentId,courseId:'C2'});
  assert(s.enrollments.some(e=>e.studentId===studentId));
});
test('enrollment validates capacity and record references',()=>{
  const s=seed('seis');
  for(const capacity of ['0','1.5','abc','1000'])assert.throws(()=>applyAction(s,'seis','course',{name:'Demo',capacity}));
  assert.throws(()=>applyAction(s,'seis','enroll',{studentId:'missing',courseId:'C2'}));
  assert.throws(()=>applyAction(s,'seis','student',{name:'  ',program:'BSCS'}));
});
test('a dose consumes stock once, rejects duplicate outcomes, and retains undo history',()=>{
  let s=seed('alaga');const stock=s.medicines[0].stock;
  s=applyAction(s,'alaga','record',{id:'D1',status:'Taken'});
  assert.equal(s.medicines[0].stock,stock-1);
  assert.throws(()=>applyAction(s,'alaga','record',{id:'D1',status:'Taken'}));
  s=applyAction(s,'alaga','undo',{id:'D1'});
  assert.equal(s.medicines[0].stock,stock);assert.equal(s.doses[0].status,'Not recorded');assert(s.history[0].undone);
  assert.throws(()=>applyAction(s,'alaga','undo',{id:'D1'}));
});
test('snooze does not consume stock; undoing a later Taken record restores Snoozed',()=>{
  let s=seed('alaga');const stock=s.medicines[0].stock;
  s=applyAction(s,'alaga','record',{id:'D1',status:'Snoozed'});
  assert.equal(s.medicines[0].stock,stock);
  s=applyAction(s,'alaga','record',{id:'D1',status:'Taken'});
  s=applyAction(s,'alaga','undo',{id:'D1'});
  assert.equal(s.doses[0].status,'Snoozed');assert.equal(s.medicines[0].stock,stock);
});
test('zero inventory cannot be consumed; refill validates whole units',()=>{
  let s=seed('alaga');s.medicines[0].stock=0;
  assert.throws(()=>applyAction(s,'alaga','record',{id:'D1',status:'Taken'}),/No demo units/);
  assert.throws(()=>applyAction(s,'alaga','refill',{id:'M1',amount:'0.5'}));
  s=applyAction(s,'alaga','refill',{id:'M1',amount:'4'});assert.equal(s.medicines[0].stock,4);
});
test('Boja links a document and deadline to a newly created case, then completes and reopens it',()=>{
  let s=applyAction(seed('boja'),'boja','case',{title:'Demo review'});const caseId=s.cases.at(-1).id;
  s=applyAction(s,'boja','document',{caseId,title:'Sample note'});
  s=applyAction(s,'boja','deadline',{caseId,title:'Sample review',date:'2026-11-20'});
  assert.equal(s.documents.at(-1).caseId,caseId);assert.equal(s.deadlines.at(-1).caseId,caseId);
  const id=s.deadlines.at(-1).id;
  s=applyAction(s,'boja','complete',{id});assert.equal(s.deadlines.at(-1).status,'Done');
  s=applyAction(s,'boja','complete',{id});assert.equal(s.deadlines.at(-1).status,'Pending');
});
test('Boja rejects orphaned references, impossible dates, and invalid case status',()=>{
  const s=seed('boja');
  assert.throws(()=>applyAction(s,'boja','document',{caseId:'missing',title:'Sample'}));
  assert.throws(()=>applyAction(s,'boja','deadline',{caseId:'B1',title:'Sample',date:'2026-02-30'}));
  assert.throws(()=>applyAction(s,'boja','caseStatus',{id:'B1',status:'invented'}));
});
test('ScamSignal recognizes risky patterns and treats neutral text as unproven, not verified safe',()=>{
  const result=analyzeMessage('Urgent! Share your OTP now to claim your reward at https://gcash-verify.example.');
  assert.deepEqual(result.hits.map(h=>h.code),['urgency','credential_request','bait','lookalike_domain']);
  assert.deepEqual(result.urls,['https://gcash-verify.example']);
  assert.equal(analyzeMessage('Our study group meets at the library on Friday.').hits.length,0);
});
test('ScamSignal detects Filipino bait and shortened links, but not an official domain as a lookalike',()=>{
  assert(analyzeMessage('Nanalo ka! Ibigay ang OTP ngayon: https://bit.ly/demo').hits.some(h=>h.code==='shortened_link'));
  assert(!analyzeMessage('Read https://www.gcash.com').hits.some(h=>h.code==='lookalike_domain'));
  assert.throws(()=>analyzeMessage('   '));assert.throws(()=>analyzeMessage('a'.repeat(5001)));
});
