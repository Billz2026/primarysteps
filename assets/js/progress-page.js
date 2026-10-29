/* My Stars view: display verified records without editable star controls. */
(function(){
 "use strict";
 const api=window.PSProgress;
 const byId=id=>document.getElementById(id);
 const ACTIVITIES=[
  {id:"lettersTrace",name:"Trace Letters",icon:"✏️",href:"letters-trace.html",tag:"Follow dotted letters",tint:"mint"},
  {id:"lettersFind",name:"Find Letters",icon:"🔎",href:"letters-find.html",tag:"Find matching letters",tint:"blue"},
  {id:"lettersSounds",name:"Letter Sounds",icon:"🔊",href:"letters-sounds.html",tag:"Listen for beginning sounds",tint:"peach"},
  {id:"numbersCount",name:"Count Numbers",icon:"🔢",href:"numbers-count.html",tag:"Count dots, tens and ones",tint:"yellow"},
  {id:"numbersTrace",name:"Trace Numbers",icon:"🖍️",href:"numbers-trace.html",tag:"Follow number guides",tint:"lavender"}
 ];
 const THRESHOLDS=[1,5,12];
 if(!api){
  byId("pm-activities").textContent="Saved progress is unavailable in this browser.";
  return;
 }
 function element(tag,className,text){
  const n=document.createElement(tag);
  if(className)n.className=className;
  if(text!==undefined)n.textContent=String(text);
  return n;
 }
 function renderActivities(summary){
  const parent=byId("pm-activities");parent.replaceChildren();
  for(const item of ACTIVITIES){
   const data=summary.items[item.id];
   const card=element("article","pm-activity pm-activity--"+item.tint);
   const top=element("div","pm-activity__top");
   const icon=element("span","pm-activity__icon",item.icon);
   icon.setAttribute("aria-hidden","true");
   const copy=element("div","pm-activity__copy");
   copy.appendChild(element("h3","",item.name));
   copy.appendChild(element("p","",item.tag));
   top.appendChild(icon);top.appendChild(copy);
   card.appendChild(top);
   const stars=element("div","pm-activity__stars");
   stars.setAttribute("role","img");
   stars.setAttribute("aria-label",data.stars+" of 3 stars earned");
   for(let index=0;index<3;index++){
    const star=element("span",index<data.stars?"is-earned":"","★");
    star.setAttribute("aria-hidden","true");stars.appendChild(star);
   }
   card.appendChild(stars);
   card.appendChild(element("p","pm-activity__count",data.unique+" different "+(data.unique===1?"challenge":"challenges")+" completed"));
   let note;
   if(data.stars===3)note="All three stars collected!";
   else note="Next star: "+THRESHOLDS[data.stars]+" different completions";
   card.appendChild(element("p","pm-activity__next",note));
   const link=element("a","pm-activity__link","Open "+item.name);
   link.href=item.href;card.appendChild(link);
   parent.appendChild(card);
  }
 }
 function badge(icon,title,detail,achieved){
  const wrap=element("div","pm-badge"+(achieved?" is-earned":""));
  const symbol=element("span","pm-badge__icon",icon);
  symbol.setAttribute("aria-hidden","true");
  wrap.appendChild(symbol);
  const copy=element("div","pm-badge__copy");
  copy.appendChild(element("strong","",title));
  copy.appendChild(element("span","",detail));
  wrap.appendChild(copy);
  wrap.setAttribute("aria-label",title+": "+(achieved?"earned":"not yet earned"));
  return wrap;
 }
 function renderBadges(s){
  const n=byId("pm-badges");n.replaceChildren();
  n.appendChild(badge("✨","First Spark","Complete your first challenge",s.totalUnique>=1));
  n.appendChild(badge("🌈","Curious Learner","Complete 5 different challenges",s.totalUnique>=5));
  n.appendChild(badge("🏅","Keep Growing","Complete 15 different challenges",s.totalUnique>=15));
  n.appendChild(badge("🎓","Every Subject","Complete something in all five activities",s.active===5));
  n.appendChild(badge("👑","Star Collector","Earn all three stars in one activity",Object.values(s.items).some(x=>x.stars===3)));
 }
 function renderHistory(){
  const old=api.history(),wrap=byId("pm-history");
  wrap.replaceChildren();
  const lines=[];
  const v2=old.ps_progress_v2;
  if(v2&&v2.activities){
   const count=Object.values(v2.activities).reduce((sum,item)=>sum+Math.max(0,Math.min(3,Number(item?.stars)||0)),0);
   if(count)lines.push(count+" star(s) in the previous My Stars version (including manually assigned stars)");
  }
  const count=old.ps_numbers_count_progress_v1;
  if(count&&typeof count==="object"){
   const answered=Math.max(0,Math.floor(Number(count.correct)||0));
   if(answered)lines.push(answered+" earlier correct counting answers (may include repetitions)");
   const stars=Math.max(0,Math.floor(Number(count.stars)||0));
   if(stars)lines.push(stars+" earlier Count Numbers activity stars");
  }
  const older=old.ps_numbers_trace_done_v1;
  if(Array.isArray(older)&&older.length)lines.push(older.length+" earlier number-tracing practice entries (unverified)");
  if(typeof old.ps_stars==="number"&&old.ps_stars>0)lines.push(old.ps_stars+" stars in the oldest progress format");
  if(lines.length===0)lines.push("No older saved progress was found on this device.");
  for(const line of lines)wrap.appendChild(element("p","",line));
 }
 function render(){
  const s=api.summary();
  byId("pm-stars").textContent=s.totalStars+" / 15";
  byId("pm-completions").textContent=String(s.totalUnique);
  byId("pm-week").textContent=String(s.week);
  byId("pm-streak").textContent=String(s.streak);
  renderActivities(s);renderBadges(s);renderHistory();
 }
 byId("pm-export").addEventListener("click",()=>{
  const status=byId("pm-export-status");
  const data=api.summary();
  const payload=JSON.stringify({exportedAt:new Date().toISOString(),verified:data,previousHistory:api.history()},null,2);
  try{
   if(navigator.clipboard&&navigator.clipboard.writeText){
    navigator.clipboard.writeText(payload).then(()=>{
     status.textContent="Progress copied to clipboard.";
    }).catch(()=>{
     status.textContent="Copy from the text window.";
     window.prompt("Copy progress:",payload);
    });
   }else{
    status.textContent="Copy from the text window.";
    window.prompt("Copy progress:",payload);
   }
  }catch(_){status.textContent="Unable to copy automatically."}
 });
 window.addEventListener("storage",event=>{
  if(event.key===api.KEY)render();
 });
 render();
})();