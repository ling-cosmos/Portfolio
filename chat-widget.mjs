import {EMAIL,createChatState,welcome,respond,buildBrief,draftLinks} from './chat-model.mjs?v=3';

const launcher=document.querySelector('#chat-launcher');
const panel=document.querySelector('#portfolio-chat');
const standalone=panel.dataset.layout==='page';
const portfolioBase=new URL('./',import.meta.url);
const log=document.querySelector('#chat-log');
const form=document.querySelector('#chat-form');
const input=document.querySelector('#chat-message');
const suggestions=document.querySelector('#chat-suggestions');
const conversation=document.querySelector('#chat-conversation');
const review=document.querySelector('#chat-review');
const summary=document.querySelector('#chat-summary');
const draftStatus=document.querySelector('#chat-draft-status');
let state=createChatState(),briefKey='';

function closeChat(){if(standalone)return;panel.hidden=true;launcher?.setAttribute('aria-expanded','false');launcher?.focus();}
function openChat(){panel.hidden=false;launcher?.setAttribute('aria-expanded','true');(review.hidden?input:summary).focus();}
function message(role,text,links=[]){
  const entry=document.createElement('div');entry.className=`chat-message chat-${role}`;
  const label=document.createElement('span');label.className='chat-author';label.textContent=role==='visitor'?'You':'Portfolio guide';
  const body=document.createElement('p');body.textContent=text;entry.append(label,body);
  if(links.length){
    const group=document.createElement('div');group.className='chat-links';
    links.forEach(([label,url])=>{
      const link=document.createElement('a');link.textContent=label;link.href=standalone||!url.startsWith('#')?new URL(url,portfolioBase).href:url;
      if(standalone||!url.startsWith('#')){link.target='_blank';link.rel='noreferrer';}
      else link.addEventListener('click',closeChat);
      group.append(link);
    });entry.append(group);
  }
  log.append(entry);log.scrollTop=log.scrollHeight;
}
function choices(items){
  suggestions.replaceChildren();
  items.forEach(([command,label])=>{
    const button=document.createElement('button');button.type='button';button.textContent=label;
    button.addEventListener('click',()=>send('',command,label));suggestions.append(button);
  });
}
function updateDraftLinks(){
  const links=draftLinks(summary.value);
  document.querySelector('#chat-gmail').href=links.gmail;
  document.querySelector('#chat-email-app').href=links.email;
}
function showReview(){
  const key=JSON.stringify(state.brief);
  if(key!==briefKey){summary.value=buildBrief(state);briefKey=key;}
  updateDraftLinks();conversation.hidden=true;review.hidden=false;
  draftStatus.textContent='Review your draft, then choose an email option. This chat does not send email or notify John.';
  summary.focus();
}
function send(text,command='',display=text){
  if(!text.trim()&&!command)return;
  message('visitor',display);
  const result=respond(state,text,command);state=result.state;
  if(command==='start'||command==='cancel'){briefKey='';summary.value='';updateDraftLinks();}
  message('guide',result.reply.text,result.reply.links);choices(result.reply.choices);
  input.placeholder=state.stage==='idle'?'Ask about skills, projects, or an inquiry…':state.stage==='request'?'Describe your project…':state.stage==='timing'?'Target date / budget, or “not sure”…':'Name / reply email, or “skip”…';
  if(result.handoff)showReview();else input.focus();
}
launcher?.addEventListener('click',()=>panel.hidden?openChat():closeChat());
document.querySelector('#chat-close')?.addEventListener('click',closeChat);
document.querySelector('#chat-contact').addEventListener('click',()=>send('','contact','Contact John'));
document.querySelector('#chat-new').addEventListener('click',()=>{
  state=createChatState();briefKey='';summary.value='';updateDraftLinks();input.value='';input.placeholder='Ask about skills, projects, or an inquiry…';
  review.hidden=true;conversation.hidden=false;log.replaceChildren();message('guide',welcome.text);choices(welcome.choices);input.focus();
});
document.querySelector('#chat-back').addEventListener('click',()=>{review.hidden=true;conversation.hidden=false;input.focus();});
document.querySelector('#chat-copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText(summary.value);draftStatus.textContent=`Inquiry copied. Paste it into an email to ${EMAIL} and send when ready.`;}
  catch{summary.focus();summary.select();draftStatus.textContent='Copy is unavailable here. The draft is selected; use your device’s Copy command.';}
});
summary.addEventListener('input',updateDraftLinks);
form.addEventListener('submit',event=>{event.preventDefault();const value=input.value.trim();if(!value)return;input.value='';send(value);});
input.addEventListener('keydown',event=>{if(event.key==='Enter'&&!event.shiftKey&&!event.isComposing){event.preventDefault();form.requestSubmit();}});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!standalone&&!panel.hidden){event.preventDefault();closeChat();}});
document.querySelector('#chat-recipient').textContent=EMAIL;
log.replaceChildren();message('guide',welcome.text);choices(welcome.choices);
form.querySelector('[type="submit"]').disabled=false;
if(launcher)launcher.hidden=false;
