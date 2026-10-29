/* Primary Steps verified progress v1.
   One earned item per activity+exercise, irrespective of repeat plays.
   This file does not require DOM and is safe to load before activity scripts. */
(function(){
"use strict";
const KEY="ps_verified_progress_v1",OLD_NUMBERS="ps_numbers_trace_verified_v2";
const IDS=["lettersTrace","lettersFind","lettersSounds","numbersCount","numbersTrace"];
const THRESHOLDS=[1,5,12];
function own(obj,key){return Object.prototype.hasOwnProperty.call(obj,key)}
function day(date=new Date()){
 return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");
}
function dayNumber(iso){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(iso||"");
 if(!m)return NaN;
 const utc=Date.UTC(Number(m[1]),Number(m[2])-1,Number(m[3]));
 const d=new Date(utc);
 if(d.getUTCFullYear()!==Number(m[1])||d.getUTCMonth()+1!==Number(m[2])||d.getUTCDate()!==Number(m[3]))return NaN;
 return utc/86400000;
}
function newState(){
 const earned={};
 for(const id of IDS)earned[id]={};
 return{version:1,earned,days:[],priorTraceImported:false};
}
function validItem(id,item){
 if(typeof item!=="string"||item.length>36)return false;
 if(id==="lettersTrace")return/^(upper|lower):[A-Z]$/.test(item);
 if(id==="lettersFind")return/^[0-3]:[A-Z]$/.test(item);
 if(id==="lettersSounds")return/^[0-3]:[A-Z]$/.test(item);
 if(id==="numbersCount")return/^(?:[1-9]|[1-9]\d|100)$/.test(item);
 if(id==="numbersTrace")return/^(?:0|[1-9]|[1-9]\d|100)$/.test(item);
 return false;
}
function load(){
 let s;
 try{s=JSON.parse(localStorage.getItem(KEY)||"null")}catch(_){}
 if(!s||s.version!==1||typeof s.earned!=="object"||!s.earned)s=newState();
 for(const id of IDS){
  const raw=s.earned[id];
  if(!raw||typeof raw!=="object"||Array.isArray(raw))s.earned[id]={};
  for(const key of Object.keys(s.earned[id])){
   if(!validItem(id,key)||!(s.earned[id][key]==="previous"||Number.isFinite(dayNumber(s.earned[id][key]))))delete s.earned[id][key];
  }
 }
 s.days=Array.isArray(s.days)?
  [...new Set(s.days.filter(x=>Number.isFinite(dayNumber(x))))].sort():[];
 if(s.priorTraceImported!==true){
  try{
   const list=JSON.parse(localStorage.getItem(OLD_NUMBERS)||"[]");
   if(Array.isArray(list))for(const value of list){
    const key=String(value);
    if(Number.isInteger(value)&&validItem("numbersTrace",key)&&!own(s.earned.numbersTrace,key)){
     s.earned.numbersTrace[key]="previous";
    }
   }
  }catch(_){}
  s.priorTraceImported=true;
 }
 return s;
}
function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));return true}catch(_){return false}}
function activity(id,s=load()){
 const entries=Object.keys(s.earned[id]||{});
 const unique=entries.length;
 return{unique,stars:THRESHOLDS.filter(n=>unique>=n).length,
  previous:entries.filter(k=>s.earned[id][k]==="previous").length};
}
function summary(){
 const s=load();
 const items={};let totalUnique=0,totalStars=0,active=0;
 for(const id of IDS){
  items[id]=activity(id,s);
  totalUnique+=items[id].unique;totalStars+=items[id].stars;
  if(items[id].unique)active++;
 }
 const today=day(),now=dayNumber(today),todayIndex=s.days.indexOf(today);
 const yesterday=s.days.some(x=>dayNumber(x)===now-1);
 const starts=(todayIndex>=0||yesterday)?(todayIndex>=0?now:now-1):NaN;
 let streak=0;
 if(Number.isFinite(starts)){
  const nums=new Set(s.days.map(dayNumber));
  while(nums.has(starts-streak))streak++;
 }
 const currentWeekStart=now-((new Date().getDay()+6)%7);
 const week=s.days.filter(d=>{const n=dayNumber(d);return n>=currentWeekStart&&n<=now}).length;
 return{items,totalUnique,totalStars,active,days:s.days.slice(),streak,week,
  previousVerifiedTrace:items.numbersTrace.previous,
  updated:today};
}
function record(id,item){
 if(!IDS.includes(id)||!validItem(id,item))return{ok:false,new:false,reason:"Invalid activity or exercise"};
 const s=load();
 if(own(s.earned[id],item))return{ok:true,new:false,...activity(id,s)};
 const when=day();
 s.earned[id][item]=when;
 if(!s.days.includes(when))s.days.push(when);
 s.days.sort();
 if(!save(s))return{ok:false,new:false,reason:"Unable to save progress"};
 return{ok:true,new:true,...activity(id,s)};
}
function clearActivity(id){
 if(!IDS.includes(id))return false;
 const s=load();s.earned[id]={};
 // Keep historical active days from other practice events; don't rewrite history.
 return save(s);
}
function reset(){
 // Clear only verified progress. Activity records remain available for auditing.
 try{localStorage.removeItem(KEY);localStorage.setItem(KEY,JSON.stringify({...newState(),priorTraceImported:true}));return true}catch(_){return false}
}
function history(){
 const out={};
 for(const key of ["ps_progress_v2","ps_stars","ps_progress_stars","ps_numbers_count_progress_v1","ps_numbers_trace_done_v1"]){
  try{const value=localStorage.getItem(key);if(value!==null)out[key]=JSON.parse(value)}catch(_){}
 }
 return out;
}
const api={record,summary,activity,clearActivity,reset,history,validItem,day,dayNumber,KEY};
window.PSProgress=api;
// Import existing verified tracing only once before any new activity completion.
save(load());
})();