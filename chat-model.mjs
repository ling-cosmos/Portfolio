// Grounded portfolio FAQ and inquiry flow. No model service or network access.
export const EMAIL = 'j.cabarles.555471@umindanao.edu.ph';
export const PROJECTS = [
  {name:'CABUS',pattern:/\bcabus\b/i,url:'https://cabus-tracker.repulse-coach-worker.workers.dev/',text:'CABUS brings goals, tasks, fitness, and expenses together. Open the original hosted app to sign in or create an account. Its separate sample demo remains available on the project card.'},
  {name:'Student Enrollment',pattern:/\bseis\b|\bseas\b|student.*enrol|enrol.*system/i,url:'projects/seis.html',text:'The Student Enrollment Information System is an original PHP and MySQL application. View its real interface and source code. The hosted original-app demo is awaiting database setup; the separate simplified demo is labeled accordingly.'},
  {name:'ScamSignal',pattern:/scam\s*signal/i,url:'https://scamsignal-portfolio.vercel.app/',text:'ScamSignal looks for warning signs in messages and links. Open the original Next.js app with English, Filipino, and Bisaya rule-based checks. AI analysis is disabled in this portfolio deployment. Results are not a guarantee of safety.'},
  {name:'Alaga',pattern:/\balaga\b/i,url:'projects/alaga.html',text:'Alaga is a team medicine care-log app built with Expo and PostgreSQL. View its actual web interface, Android screenshots, and source code. Its hosted original-app demo is awaiting database setup. The separate simplified demo does not deliver reminders.'},
  {name:'Boja',pattern:/\bboja\b/i,url:'projects/boja.html',text:'Boja is a team law-office workflow project. Its original Figma prototype currently requires Figma access. A separate public sample concept uses fictional cases, document entries, and deadlines; that concept is not the original team application.'},
  {name:'Client Chatbot',pattern:/client chat(?:bot)?|portfolio (chatbot|guide)|\bchatbot\b/i,url:'previews/chatbot.html',text:'Client Chatbot is John’s automated portfolio FAQ and inquiry guide. Its full-page demo answers portfolio questions and prepares an editable email draft for the visitor to review and send. It does not send email automatically or provide live human support.'},
];
const prompts = {
  request:'What would you like to build or improve, and who is it for? A few sentences are enough.',
  timing:'Do you have a target date or budget in mind? You can say “not sure” or skip this.',
  contact:'What name and reply email should John use? This is optional; you can add contact details in your email instead.',
};
const homeChoices = [
  ['start','Discuss a project'],['projects','Try project demos'],['skills','Skills & experience'],['contact','Contact John'],
];
export const welcome = {text:'Hi! I’m John’s automated portfolio guide. I can explain his skills, show project demos, or help you prepare a project inquiry. John handles inquiries by email; you review and send the draft when ready.',choices:homeChoices};
export function createChatState(){return {stage:'idle',brief:{},misses:0,lastQuestion:''};}
function answer(state,text,{links=[],choices=homeChoices,handoff=false}={}){return {state,reply:{text,links,choices},handoff};}
function faq(input){
  if(/\b(who are you|are you (an? )?(ai|bot|chatbot|human)|what can you do|what do you do|what can you help|how can you help)\b|^help$/i.test(input))return 'guide';
  if(/\b(pric(?:e|ing)|cost|rates?|quote|budget|availability|available|turnaround|deadline|how long|how much|freelanc\w*)\b/i.test(input))return 'pricing';
  if(/\b(certificat\w*|credential\w*|certiport)\b/i.test(input))return 'certificate';
  if(PROJECTS.some(p=>p.pattern.test(input)))return 'named';
  if(/\b(skills?|stack|technolog\w*|languages?|services?|experience|html|css|javascript|python|php|mysql|java|bootstrap)\b/i.test(input))return 'skills';
  if(/\b(projects?|demos?|portfolio|samples?)\b/i.test(input))return 'projects';
  if(/\bwho (is|are) (john|you)\b|\babout (john|you|the developer)\b|\bwhere (is|are) (john|you)\b|\b(your|his) (background|location|education)\b|\b(john|you).*(student|based|from)\b|\bphilippines\b/i.test(input))return 'about';
  if(/^(hi|hello|hey|good morning|good afternoon|good evening)[!. ]*$/i.test(input))return 'hello';
  if(/^(thank you|thanks|salamat)[!. ]*$/i.test(input))return 'thanks';
  return null;
}
function faqAnswer(state,intent,input){
  let text='',links=[];
  if(intent==='guide')text='I’m John’s automated FAQ and inquiry guide. I can explain the portfolio, link to project demos, and help prepare an email inquiry. John reviews inquiries by email; this chat does not book work, send messages, or provide live human support.';
  if(intent==='skills'){text='John is a Computer Science student developing web interfaces, application logic, and database workflows. His listed tools are HTML, CSS, JavaScript, Bootstrap, Java, PHP, Python, MySQL, Git, and GitHub. Project fit is something to discuss with him directly.';links=[['View skills','#skills']];}
  if(intent==='projects'){text=`Explore ${PROJECTS.length} projects. CABUS and ScamSignal open their original hosted apps. Student Enrollment and Alaga show their original interfaces while hosted database setup is pending. Boja links to its team prototype, which requires Figma access. Separate simplified demos are labeled on the project cards.`;links=PROJECTS.map(p=>[`View ${p.name}`,p.url]);}
  if(intent==='named'){const matches=PROJECTS.filter(p=>p.pattern.test(input));text=matches.map(p=>p.text).join('\n\n');links=matches.map(p=>[`View ${p.name}`,p.url]);}
  if(intent==='about'){text='John Cabarles is a Computer Science student based in the Philippines. His portfolio focuses on practical applications for productivity, academic administration, digital safety, and team projects.';links=[['Read about John','#story']];}
  if(intent==='certificate'){text='The portfolio includes an Information Technology Specialist certificate in Databases from Certiport, awarded March 6, 2026 and valid through March 6, 2031. You can view the certificate on the page.';links=[['View certificate','#certificates']];}
  if(intent==='pricing')text='John has not published rates, availability, or delivery times on this portfolio. He needs to review your requirements before confirming scope, a quote, or a schedule. I can help you prepare that inquiry.';
  if(intent==='hello')text='Hello! I can help with John’s skills, project demos, or preparing a project inquiry.';
  if(intent==='thanks')text='You’re welcome. You can explore a demo or prepare an inquiry whenever you’re ready.';
  state.misses=0;
  if(state.stage!=='idle')return answer(state,text+'\n\nTo continue your inquiry: '+prompts[state.stage],{links,choices:[['skip','Skip this detail'],['cancel','Cancel inquiry'],['contact','Contact John']]});
  return answer(state,text,{links});
}
export function respond(current,input='',command=''){
  const state=structuredClone(current),value=String(input).trim();
  if(value.length>700)return answer(state,'Please keep each message to 700 characters or fewer. Your current inquiry details are unchanged.');
  if(!value&&!command)return answer(state,'Type a question, or choose one of the options below.');
  if(command==='cancel'||/^(cancel|cancel inquiry|stop|start over|restart)$/i.test(value))return answer(createChatState(),'Inquiry preparation stopped. You can ask another question or start a new inquiry.');
  if(!command&&faq(value)==='guide')return faqAnswer(state,'guide',value);
  if(command==='contact'||/\bhuman\b|\b(real person|talk to john|speak to john|contact john|email john|book a call|schedule a meeting)\b/i.test(value)){
    state.stage='idle';
    if(!state.brief.request)state.brief.request=state.lastQuestion||'I would like to discuss a project or ask a question.';
    return answer(state,'You can reach John by email. I’ve prepared a draft you can review and edit. Opening a draft does not send it; your email service handles sending.',{choices:homeChoices,handoff:true});
  }
  if(command==='start'){
    state.stage='request';state.brief={};state.misses=0;
    return answer(state,prompts.request,{choices:[['cancel','Cancel inquiry'],['contact','Contact John']]});
  }
  const intent=command||faq(value);
  const question=/\?|^(what|how|can|do|does|is|are|where|when|tell|show)\b/i.test(value);
  if(state.stage!=='idle'){
    if(command!=='skip'&&intent&&intent!=='named'&&(command||question))return faqAnswer(state,intent,value);
    if(intent==='named'&&question)return faqAnswer(state,intent,value);
    const detail=command==='skip'||/^(skip|not sure|unsure|prefer not to say)$/i.test(value)?'Not specified':value;
    state.brief[state.stage]=detail;
    if(state.stage==='request')state.stage='timing';
    else if(state.stage==='timing')state.stage='contact';
    else{state.stage='idle';return answer(state,'Your inquiry draft is ready. Review it, make any changes, and send it using your email service. John will confirm project fit, pricing, and timing directly.',{handoff:true});}
    return answer(state,prompts[state.stage],{choices:[['skip','Skip this detail'],['cancel','Cancel inquiry'],['contact','Contact John']]});
  }
  state.lastQuestion=value||state.lastQuestion;
  if(/\b(i need|we need|i want|we want|looking for|hire|new website|new project|project inquiry|build me|build a|improve my|redesign my)\b|\bcan (you|john) (build|make|create|design|develop)\b/i.test(value)){
    state.brief={request:value};state.stage='timing';state.misses=0;
    return answer(state,'I can help put that into an inquiry for John. '+prompts.timing,{choices:[['skip','Not sure yet'],['cancel','Cancel inquiry'],['contact','Contact John']]});
  }
  if(intent)return faqAnswer(state,intent,value);
  state.misses++;
  if(state.misses>=2){state.brief.request=value;return answer(state,'That question needs John’s input. You can review an email draft with your question and send it to him directly.',{handoff:true});}
  return answer(state,'I don’t have a verified answer to that. I can help with skills, project demos, the database certificate, or preparing an inquiry. You can also contact John directly.');
}
export function buildBrief(state){
  const b=state.brief;
  return `Hello John,\n\nI’m contacting you through your portfolio.\n\nProject / question:\n${b.request||state.lastQuestion||'I would like to discuss a project.'}\n\nTarget date / budget:\n${b.timing||'Not specified'}\n\nName / reply contact:\n${b.contact||'I will add my contact details when sending.'}\n\nPlease let me know whether this is a suitable project and confirm scope, pricing, and timing.\n\nThank you.`;
}
export function draftLinks(body){
  const subject='Portfolio inquiry for John Cabarles';
  const gmail=new URL('https://mail.google.com/mail/');
  gmail.search=new URLSearchParams({view:'cm',fs:'1',to:EMAIL,su:subject,body:String(body).slice(0,5000)}).toString();
  return {gmail:gmail.href,email:`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(String(body).slice(0,5000))}`};
}
