import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EMAIL,createChatState,respond,buildBrief,draftLinks,PROJECTS} from './chat-model.mjs';

test('all listed projects have grounded answers and their current project destinations',()=>{
  for(const project of PROJECTS){const r=respond(createChatState(),`Tell me about ${project.name}`);assert(r.reply.text.includes(project.name==='Student Enrollment'?'Enrollment':project.name));assert(r.reply.links.some(([,url])=>url===project.url));assert.equal(r.handoff,false);}
  assert.match(respond(createChatState(),'Is Boja a live application?').reply.text,/concept/);
  assert.match(respond(createChatState(),'Explain Alaga').reply.text,/does not deliver reminders/);
});
test('pricing and availability questions never invent a quote or a promised response time',()=>{
  for(const question of ['How much does it cost?','What are your rates?','Are you available next week?','What is your turnaround?']){
    const result=respond(createChatState(),question);
    assert.match(result.reply.text,/not published/);assert.match(result.reply.text,/review your requirements/);assert.equal(result.state.stage,'idle');
  }
});
test('inquiry flow captures request, constraints, and optional contact in an editable draft',()=>{
  let r=respond(createChatState(),'','start');assert.equal(r.state.stage,'request');
  r=respond(r.state,'A website for a fictional bakery.');assert.equal(r.state.stage,'timing');
  r=respond(r.state,'December, around PHP 5,000 budget');assert.equal(r.state.stage,'contact');
  r=respond(r.state,'Demo Client, client@example.test');assert(r.handoff);
  const brief=buildBrief(r.state);assert.match(brief,/fictional bakery/);assert.match(brief,/PHP 5,000/);assert.match(brief,/client@example.test/);
  assert.doesNotMatch(r.reply.text,/has been sent|received your|booked|guaranteed/i);
});
test('a natural project request begins intake without asking the visitor to repeat the description',()=>{
  for(const question of ['I need a website for my bakery.','Can you build a student portal?']){
    const result=respond(createChatState(),question);assert.equal(result.state.stage,'timing');assert.equal(result.state.brief.request,question);
  }
});
test('FAQ interruptions preserve inquiry progress and do not consume a detail slot',()=>{
  let r=respond(createChatState(),'I need a website.');
  r=respond(r.state,'How much does it cost?');assert.equal(r.state.stage,'timing');assert.equal(r.state.brief.timing,undefined);assert.match(r.reply.text,/continue your inquiry/);
  r=respond(r.state,'','skills');assert.equal(r.state.stage,'timing');assert.match(r.reply.text,/JavaScript/);
  r=respond(r.state,'Next month with a small budget');assert.equal(r.state.stage,'contact');assert.match(r.state.brief.timing,/Next month/);
});
test('optional fields can be skipped and are not invented',()=>{
  let r=respond(createChatState(),'I need a database workflow.');r=respond(r.state,'','skip');r=respond(r.state,'skip');
  assert(r.handoff);assert.equal(r.state.brief.timing,'Not specified');assert.equal(r.state.brief.contact,'Not specified');
});
test('human handoff works immediately and preserves already captured requirements',()=>{
  let r=respond(createChatState(),'I need a landing page.');r=respond(r.state,'Talk to a human');
  assert(r.handoff);assert.equal(r.state.stage,'idle');assert.match(buildBrief(r.state),/landing page/);assert.doesNotMatch(r.reply.text,/online now|will reply within|connected you/i);
});
test('fallback escalates after two misses rather than looping indefinitely',()=>{
  let r=respond(createChatState(),'Tell me about a blue elephant');assert.equal(r.handoff,false);
  r=respond(r.state,'The moon is made of chocolate');assert(r.handoff);assert.match(buildBrief(r.state),/moon is made of chocolate/);
});
test('cancel removes captured details; new inquiries do not leak a previous visitor brief',()=>{
  let r=respond(createChatState(),'I need a private dashboard.');r=respond(r.state,'cancel');assert.deepEqual(r.state.brief,{});
  r=respond(r.state,'','contact');assert.doesNotMatch(buildBrief(r.state),/private dashboard/);
  r=respond(r.state,'','start');assert.deepEqual(r.state.brief,{});
});
test('oversized input does not advance state or change previously supplied fields',()=>{
  const s=respond(createChatState(),'I need a website.').state;
  const r=respond(s,'a'.repeat(701));assert.deepEqual(r.state,s);assert.match(r.reply.text,/700/);
});
test('draft URLs preserve punctuation and newlines without allowing extra recipients or query injection',()=>{
  const body='Request: A & B\nName: Demo Client + team\nFake text: &to=other@example.test';
  const links=draftLinks(body),gmail=new URL(links.gmail),mail=new URL(links.email);
  assert.equal(gmail.origin,'https://mail.google.com');assert.equal(gmail.searchParams.get('to'),EMAIL);assert.equal(gmail.searchParams.get('body'),body);assert.equal(gmail.searchParams.getAll('to').length,1);
  assert.equal(mail.pathname,EMAIL);assert.equal(mail.searchParams.get('body'),body);assert.equal(mail.searchParams.get('subject'),'Portfolio inquiry for John Cabarles');
});
test('respond is pure and untrusted strings remain data',()=>{
  const initial=createChatState(),r=respond(initial,'I need <img src=x onerror=alert(1)> on a sample website.');
  assert.deepEqual(initial,createChatState());assert.match(r.state.brief.request,/<img/);assert.doesNotMatch(r.reply.text,/<img/);
});
test('the guide identifies itself accurately rather than posing as John or a live agent',()=>{
  for(const text of ['Who are you?','Are you a human?','What can you do?']){
    const r=respond(createChatState(),text);assert.match(r.reply.text,/automated FAQ/);assert.match(r.reply.text,/does not book work/);assert.equal(r.handoff,false);
  }
});
