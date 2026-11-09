// Browser adaptation of ScamSignal's features/scam-check/domain/analyze-message.ts.
// Uses the project's deterministic rules; no remote AI, URL requests, or message storage.
const urlPattern = /(?:https?:\/\/|www\.)[^\s<>"']+|(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?/gi;
const shorteners = new Set(['bit.ly','tinyurl.com','t.co','goo.gl','is.gd','cutt.ly','ow.ly','buff.ly','rb.gy','shorturl.at']);
const brands = new Map([['gcash',new Set(['gcash.com','www.gcash.com'])],['maya',new Set(['maya.ph','www.maya.ph'])],['bdo',new Set(['bdo.com.ph','www.bdo.com.ph'])]]);
const rules = [
  ['urgency','Urgency or threat',/\b(urgent|immediately|right now|act now|now|last chance|account will be closed|expire|suspend|karon|dali|dayon|karon dayon|agad|ngayon|kaagad|mapuputol)\b/i],
  ['credential_request','Requests a secret code or credential',/\b(otp|one[- ]time password|pin|password|passcode|security code|verification code|login details|send your code|share your otp|ibigay ang otp|ipadala ang pin)\b/i],
  ['bait','Prize, job, or fee bait',/\b(you won|winner|prize|reward|cash grant|free money|job offer|hired|parcel fee|delivery fee|customs fee|claim now|congratulations|nanalo|premyo|trabaho|bayad sa parcel|bayad sa delivery|gantimpala)\b/i],
];
export function analyzeMessage(message) {
  const value=String(message).trim();
  if (!value || value.length>5000) throw Error('Enter a message between 1 and 5,000 characters.');
  const hits=rules.filter(([, ,pattern])=>pattern.test(value)).map(([code,label])=>({code,label}));
  const urls=[...new Set((value.match(urlPattern)||[]).map(u=>u.replace(/[),.!?:;]+$/,'').replace(/[)>]+$/,'')))];
  const hosts=urls.flatMap(u=>{try{return [new URL(u.startsWith('http')?u:`https://${u}`).hostname.toLowerCase()];}catch{return [];}});
  if(hosts.some(h=>shorteners.has(h)))hits.push({code:'shortened_link',label:'Shortened link hides its destination'});
  if(hosts.some(h=>[...brands].some(([brand,official])=>h.includes(brand)&&!official.has(h)&&h.split('.').slice(-2).join('.')!==brand)))hits.push({code:'lookalike_domain',label:'Domain resembles a known service'});
  return {hits,urls};
}
