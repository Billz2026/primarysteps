/* Primary Steps · Trace Numbers v2.
   Forgiving stroke-guide coverage, not handwriting recognition.
   Previously saved "Done" practice is kept separate from checked completions. */
(function(){
 "use strict";
 const DIGITS={
  "0":["M50 14 C27 14 19 31 19 52 C19 76 30 89 50 89 C70 89 81 76 81 52 C81 31 72 14 50 14"],
  "1":["M30 35 L51 15 L51 88"],
  "2":["M22 30 Q29 13 51 14 Q78 13 78 37 Q78 56 23 86 L80 86"],
  "3":["M23 23 Q50 8 70 24 Q82 40 58 50 Q81 56 76 73 Q67 97 22 80"],
  "4":["M68 14 L22 65 L80 65","M68 14 L68 88"],
  "5":["M75 15 L26 15 L26 49 Q45 39 64 45 Q82 53 76 73 Q62 96 23 80"],
  "6":["M72 20 Q44 8 26 40 Q13 79 44 88 Q70 95 77 72 Q81 48 55 48 Q31 47 24 64"],
  "7":["M20 15 L80 15 L40 88"],
  "8":["M50 50 C22 34 29 14 50 14 C72 14 79 34 50 50 C20 63 28 90 50 90 C73 90 81 62 50 50"],
  "9":["M73 48 C71 15 53 9 36 19 Q18 35 29 53 Q45 72 70 54 Q80 39 73 20 Q86 77 41 90"]
 };
 const RANGES=[{start:0,end:10},{start:11,end:20},{start:21,end:50},{start:51,end:100}];
 const VERIFIED_KEY="ps_numbers_trace_verified_v2";
 const LEGACY_KEY="ps_numbers_trace_done_v1";
 const byId=id=>document.getElementById(id);
 const canvas=byId("np-canvas"),ctx=canvas.getContext("2d");
 const heading=byId("np-current"),word=byId("np-number-word"),voice=byId("np-voice-note");
 const feedback=byId("np-feedback"),selector=byId("np-range");
 const checkedLabel=byId("np-progress"),olderLabel=byId("np-older-practice");
 const guideLabel=byId("np-guide-progress"),digitLabel=byId("np-digit-progress");
 const clearButton=byId("np-clear"),doneButton=byId("np-done");
 const nextButton=byId("np-next"),prevButton=byId("np-prev");
 const simple=()=>window.PSSettings?.load?.().simplePlay!==false;
 let verified=new Set(),older=new Set();
 function readSet(key){
  try{
   const data=JSON.parse(localStorage.getItem(key)||"[]");
   if(Array.isArray(data))return new Set(data.filter(n=>Number.isInteger(n)&&n>=0&&n<=100));
  }catch(_){}
  return new Set();
 }
 verified=readSet(VERIFIED_KEY);
 older=readSet(LEGACY_KEY);
 function saveVerified(){
  try{localStorage.setItem(VERIFIED_KEY,JSON.stringify([...verified].sort((a,b)=>a-b)))}catch(_){}
 }
 function updateSaved(){
  checkedLabel.textContent=String(verified.size);
  olderLabel.textContent=String(older.size);
 }
 function message(state,text){
  feedback.dataset.state=state;feedback.textContent=text;
  feedback.hidden=state==="idle";
 }
 function numberName(value){
  const ones=["zero","one","two","three","four","five","six","seven","eight","nine","ten",
   "eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"];
  const tens=["","","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"];
  if(value<=19)return ones[value];
  if(value===100)return "one hundred";
  const ten=Math.floor(value/10),rem=value%10;
  return tens[ten]+(rem?"-"+ones[rem]:"");
 }
 let rangeIndex=0,current=0,pointer=null,activeStroke=null;
 let strokes=[],width=1,height=1,dpr=1,transforms=[],guidePaths=[],canCheck=true;
 const THRESHOLD=.72;
 function geometry(){
  const digits=String(current).split("");
  const advance=108;
  const scale=Math.max(.1,Math.min((width-28)/(digits.length*advance),(height-28)/110));
  const x=(width-digits.length*advance*scale)/2;
  const y=(height-110*scale)/2;
  transforms=digits.map((digit,index)=>({
   digit,index,x:x+index*advance*scale,y,scale
  }));
 }
 function prepareGuides(){
  guidePaths=[];canCheck=true;
  try{
   for(const t of transforms){
    for(const [pathIndex,d] of DIGITS[t.digit].entries()){
     const path=document.createElementNS("http://www.w3.org/2000/svg","path");
     path.setAttribute("d",d);
     const length=path.getTotalLength();
     if(!Number.isFinite(length)||length<=0)throw Error("Invalid SVG path");
     const count=Math.max(4,Math.ceil(length*t.scale/3));
     const samples=[];
     for(let i=0;i<=count;i++){
      const p=path.getPointAtLength(length*i/count);
      samples.push({x:t.x+p.x*t.scale,y:t.y+p.y*t.scale,hit:false});
     }
     guidePaths.push({digitIndex:t.index,pathIndex,d,samples});
    }
   }
  }catch(_){
   guidePaths=[];canCheck=false;
  }
 }
 function ratio(guide){
  return guide.samples.filter(p=>p.hit).length/guide.samples.length;
 }
 function status(){
  if(!canCheck||!guidePaths.length)return{
   complete:false,followed:0,total:0,digits:0,digitCount:transforms.length
  };
  const followed=guidePaths.filter(g=>ratio(g)>=THRESHOLD).length;
  const digitCount=transforms.length;
  const digits=transforms.filter(t=>{
   const parts=guidePaths.filter(g=>g.digitIndex===t.index);
   return parts.length>0&&parts.every(g=>ratio(g)>=THRESHOLD);
  }).length;
  return{followed,total:guidePaths.length,digits,digitCount,complete:followed===guidePaths.length};
 }
 function updateGuideProgress(){
  const s=status();
  guideLabel.textContent=s.total
   ?s.followed+" of "+s.total+" guide "+(s.total===1?"line":"lines")+" followed"
   :"Guide checking is unavailable on this browser";
  digitLabel.textContent=s.digits+" of "+s.digitCount+" digits followed";
  return s;
 }
 function markSegment(a,b){
  if(!canCheck||!guidePaths.length)return;
  const ax=a.x*width,ay=a.y*height,bx=b.x*width,by=b.y*height;
  const dx=bx-ax,dy=by-ay,denom=dx*dx+dy*dy;
  const radius=Math.max(8,Math.min(19,transforms[0].scale*7));
  const r2=radius*radius;
  for(const g of guidePaths){
   for(const p of g.samples){
    if(p.hit)continue;
    const t=denom?Math.max(0,Math.min(1,((p.x-ax)*dx+(p.y-ay)*dy)/denom)):0;
    const x=ax+t*dx,y=ay+t*dy;
    if((p.x-x)**2+(p.y-y)**2<=r2)p.hit=true;
   }
  }
 }
 function replayInk(){
  for(const g of guidePaths)for(const p of g.samples)p.hit=false;
  for(const stroke of strokes){
   if(!stroke.length)continue;
   markSegment(stroke[0],stroke[0]);
   for(let i=1;i<stroke.length;i++)markSegment(stroke[i-1],stroke[i]);
  }
  updateGuideProgress();
 }
 function canvasSize(){
  const box=canvas.getBoundingClientRect();
  width=Math.max(1,box.width);height=Math.max(1,box.height);
  dpr=Math.min(2,window.devicePixelRatio||1);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  if(ctx)ctx.setTransform(dpr,0,0,dpr,0,0);
  geometry();prepareGuides();replayInk();render();
 }
 function render(){
  if(!ctx)return;
  ctx.clearRect(0,0,width,height);
  const focus=guidePaths.findIndex(g=>ratio(g)<THRESHOLD);
  const guidesByKey=new Map(guidePaths.map((g,index)=>[g.digitIndex+":"+g.pathIndex,{guide:g,index}]));
  for(const t of transforms){
   ctx.save();ctx.translate(t.x,t.y);ctx.scale(t.scale,t.scale);
   ctx.lineCap="round";ctx.lineJoin="round";ctx.setLineDash([2.6,4.2]);
   DIGITS[t.digit].forEach((d,i)=>{
    const result=guidesByKey.get(t.index+":"+i);
    const progress=result?ratio(result.guide):0;
    ctx.strokeStyle=progress>=THRESHOLD?"#368A68":result?.index===focus?"#176B75":"#83B7C3";
    ctx.lineWidth=result?.index===focus?4.6:4.2;
    ctx.stroke(new Path2D(d));
   });
   ctx.setLineDash([]);
   const seen=[];
   DIGITS[t.digit].forEach((d,i)=>{
    const tokens=d.match(/[A-Za-z]|-?\d+(?:\.\d+)?/g);
    if(!tokens||tokens[0]!=="M"||tokens.length<6)return;
    const sx=Number(tokens[1]),sy=Number(tokens[2]),cx=Number(tokens[4]),cy=Number(tokens[5]);
    const len=Math.hypot(cx-sx,cy-sy)||1,dx=(cx-sx)/len,dy=(cy-sy)/len;
    const overlap=seen.filter(p=>Math.hypot(p.x-sx,p.y-sy)<13).length;
    seen.push({x:sx,y:sy});
    const px=sx+overlap*15,py=sy-overlap*11;
    const result=guidesByKey.get(t.index+":"+i);
    ctx.beginPath();ctx.arc(px,py,5.6,0,Math.PI*2);
    ctx.fillStyle=result?.index===focus?"#176B75":"#477F98";ctx.fill();
    ctx.fillStyle="#FFFFFF";ctx.textAlign="center";ctx.textBaseline="middle";
    ctx.font="900 7.2px system-ui";ctx.fillText(String(i+1),px,py);
    const ex=sx+dx*18,ey=sy+dy*18;
    ctx.beginPath();ctx.moveTo(ex,ey);
    ctx.lineTo(ex-dx*7-dy*4,ey-dy*7+dx*4);
    ctx.lineTo(ex-dx*7+dy*4,ey-dy*7-dx*4);
    ctx.closePath();ctx.fillStyle="#247D91";ctx.fill();
   });
   ctx.restore();
  }
  ctx.save();ctx.lineWidth=Math.max(5,Math.min(12,transforms[0].scale*4));
  ctx.strokeStyle="#226F96";ctx.lineCap="round";ctx.lineJoin="round";
  for(const points of strokes){
   if(!points.length)continue;
   ctx.beginPath();ctx.moveTo(points[0].x*width,points[0].y*height);
   for(let i=1;i<points.length;i++)ctx.lineTo(points[i].x*width,points[i].y*height);
   if(points.length===1)ctx.lineTo(points[0].x*width+.1,points[0].y*height+.1);
   ctx.stroke();
  }
  ctx.restore();
 }
 function point(event){
  const box=canvas.getBoundingClientRect();
  return{
   x:Math.min(1,Math.max(0,(event.clientX-box.left)/Math.max(1,box.width))),
   y:Math.min(1,Math.max(0,(event.clientY-box.top)/Math.max(1,box.height)))
  };
 }
 function setNumber(value){
  const r=RANGES[rangeIndex];
  current=Math.max(r.start,Math.min(r.end,value));
  pointer=null;activeStroke=null;strokes=[];
  heading.textContent="Trace "+current;word.textContent=numberName(current);
  canvas.setAttribute("aria-label","Follow the dotted guides to trace number "+current+" with a finger, mouse or stylus");
  voice.textContent="";message("idle","");
  geometry();prepareGuides();replayInk();render();
 }
 function setRange(index){
  rangeIndex=Math.max(0,Math.min(RANGES.length-1,index));
  selector.value=String(rangeIndex);
  setNumber(RANGES[rangeIndex].start);
 }
 function down(event){
  if(pointer!==null||(event.pointerType==="mouse"&&event.button!==0))return;
  event.preventDefault();pointer=event.pointerId;
  try{canvas.setPointerCapture(pointer)}catch(_){}
  const p=point(event);activeStroke=[p];strokes.push(activeStroke);
  markSegment(p,p);render();
 }
 function move(event){
  if(pointer!==event.pointerId||!activeStroke)return;
  event.preventDefault();
  const p=point(event),old=activeStroke[activeStroke.length-1];
  activeStroke.push(p);markSegment(old,p);render();
 }
 function end(event){
  if(pointer!==event.pointerId)return;
  pointer=null;activeStroke=null;
  const s=updateGuideProgress();
  if(s.complete)message("good","⭐ All guides followed! Tap Check tracing to save your completion.");
  else if(s.followed)message("neutral","Keep going. "+s.followed+" of "+s.total+" guide lines followed.");
  else message("neutral","Try tracing along the highlighted dotted line.");
  render();
 }
 if(!ctx||typeof Path2D==="undefined"){
  message("try","Your browser cannot display this tracing board.");
  doneButton.disabled=true;return;
 }
 canvas.addEventListener("pointerdown",down);
 canvas.addEventListener("pointermove",move);
 canvas.addEventListener("pointerup",end);
 canvas.addEventListener("pointercancel",end);
 window.addEventListener("pointerup",end);
 window.addEventListener("pointercancel",end);
 window.addEventListener("resize",canvasSize);
 window.addEventListener("blur",()=>{pointer=null;activeStroke=null});
 clearButton.addEventListener("click",()=>{
  pointer=null;activeStroke=null;strokes=[];
  replayInk();render();message("neutral","Board cleared. Follow the dotted guide.");
 });
 doneButton.addEventListener("click",()=>{
  const s=updateGuideProgress();
  if(!s.complete){
   message("try",canCheck
    ?"Not quite yet. Follow every highlighted guide, or choose Next to practise another number."
    :"This browser cannot check completion. You can still practise, but no completion star will be saved.");
   return;
  }
  if(verified.has(current)){
   message("good","⭐ You've already completed "+current+". You can practise it again.");
   return;
  }
  verified.add(current);saveVerified();updateSaved();
  // Only first checked completion per distinct number affects the shared progress bridge.
  window.PSNumbersProgress?.record(verified.size%5===0);
  message("good","⭐ Number "+current+" completed! Great tracing. Tap Next when you're ready.");
 });
 byId("np-hear").addEventListener("click",()=>{
  if(!window.PSVoice){voice.textContent="Voice unavailable.";return}
  window.PSVoice.speak("Trace the number "+current+". Follow each dotted line. Then tap Check tracing.",voice);
 });
 prevButton.addEventListener("click",()=>{
  const r=RANGES[rangeIndex];
  setNumber(current===r.start?r.end:current-1);
 });
 nextButton.addEventListener("click",()=>{
  const r=RANGES[rangeIndex];
  setNumber(current===r.end?r.start:current+1);
 });
 selector.disabled=simple();
 byId("np-range-note").textContent=simple()
  ?"Simple Play keeps numbers 0–10. Switch off Simple Play in Parent Zone to use larger numbers."
  :"Choose a range to practise more numbers.";
 selector.addEventListener("change",()=>{
  if(simple()){selector.value="0";return}
  setRange(Number(selector.value)||0);
 });
 byId("np-reset").addEventListener("click",()=>{
  if(!window.confirm("Clear checked tracing completions? Earlier practice and previously earned My Stars will be kept."))return;
  verified.clear();saveVerified();updateSaved();
  message("neutral","Checked completions cleared. Earlier practice remains saved.");
 });
 window.addEventListener("keydown",event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
  if(event.key==="ArrowLeft"){event.preventDefault();prevButton.click()}
  if(event.key==="ArrowRight"){event.preventDefault();nextButton.click()}
 });
 updateSaved();canvasSize();setRange(0);
})();