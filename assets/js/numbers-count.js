/* Primary Steps — Count Numbers, progressive concrete-to-grouped counting. */
(function(){
"use strict";
const LEVELS=[
 {min:1,max:5,choices:3,title:"Count 1–5"},
 {min:6,max:10,choices:3,title:"Count 6–10"},
 {min:11,max:20,choices:4,title:"Count to 20"},
 {min:21,max:50,choices:4,title:"Tens and ones"},
 {min:51,max:100,choices:4,title:"Count to 100"}
];
const GOAL=5,KEY="ps_numbers_count_progress_v1",STARS_KEY="ps_progress_stars";
const byId=x=>document.getElementById(x);
const visual=byId("np-visual"),answers=byId("np-answers");
const feedback=byId("np-feedback"),level=byId("np-level");
const next=byId("np-next"),hear=byId("np-hear"),hint=byId("np-hint");
const voice=byId("np-voice-note"),heading=byId("np-count-heading");
const visualCaption=byId("np-visual-caption");
const stageLabel=byId("np-stage-label"),stageCount=byId("np-stage-count");
const progressTrack=byId("np-progress-track"),progressFill=byId("np-progress-fill");
const starsRow=Array.from(document.querySelectorAll("#np-progress-stars span"));
const reset=byId("np-reset-learning");
const stats={correct:byId("np-correct"),tries:byId("np-tries"),streak:byId("np-streak"),stars:byId("np-stars")};
const simple=()=>window.PSSettings?.load?.().simplePlay!==false;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function read(){
 try{
  const raw=JSON.parse(localStorage.getItem(KEY)||"null");
  if(raw&&typeof raw==="object"){
   const count=n=>Number.isSafeInteger(raw[n])&&raw[n]>=0?raw[n]:0;
   const savedStep=Number.isInteger(raw.step)?clamp(raw.step,0,4):0;
   const savedWins=Number.isInteger(raw.wins)?clamp(raw.wins,0,GOAL):0;
   return{correct:count("correct"),tries:count("tries"),streak:count("streak"),stars:count("stars"),
    step:savedStep,wins:savedWins,last:Number.isInteger(raw.last)?raw.last:0};
  }
 }catch(_){}
 return{correct:0,tries:0,streak:0,stars:0,step:0,wins:0,last:0};
}
let data=read(),auto={step:data.step,wins:data.wins,last:data.last};
let step=auto.step,wins=auto.wins,previous=auto.last,target=0,solved=false;
let queue=[],mistakes=0;
function save(){
 if(level.value==="auto")auto={step,wins,last:target};
 try{
  localStorage.setItem(KEY,JSON.stringify({
   correct:data.correct,tries:data.tries,streak:data.streak,stars:data.stars,
   step:auto.step,wins:auto.wins,last:auto.last,rangeIndex:Math.max(0,auto.step-2)
  }));
 }catch(_){}
}
function syncStats(){
 for(const k of Object.keys(stats))stats[k].textContent=String(data[k]);
}
function updateProgress(){
 stageLabel.textContent="Step "+(step+1)+" of "+LEVELS.length+" · "+LEVELS[step].title;
 stageCount.textContent=wins+" of "+GOAL+" correct";
 progressTrack.setAttribute("aria-valuenow",String(wins));
 progressFill.style.width=(wins/GOAL*100)+"%";
 starsRow.forEach((star,i)=>star.classList.toggle("is-earned",i<wins));
}
function message(state,text){
 feedback.dataset.state=state;feedback.textContent=text;feedback.hidden=state==="neutral";
}
function randint(min,max){return min+Math.floor(Math.random()*(max-min+1))}
function shuffle(items){
 const a=items.slice();
 for(let i=a.length-1;i>0;i--){
  const j=randint(0,i);[a[i],a[j]]=[a[j],a[i]];
 }
 return a;
}
function pickTarget(){
 if(!queue.length){
  const range=LEVELS[step],bank=[];
  for(let i=range.min;i<=range.max;i++)if(i!==previous)bank.push(i);
  queue=shuffle(bank);
  if(!queue.length)queue=[range.min];
 }
 return queue.shift();
}
function markable(el,label){
 el.setAttribute("aria-pressed","false");
 el.setAttribute("aria-label",label+". Mark as counted");
 el.addEventListener("click",()=>{
  const counted=el.classList.toggle("is-counted");
  el.setAttribute("aria-pressed",String(counted));
  el.setAttribute("aria-label",label+(counted?". Counted":". Mark as counted"));
 });
 return el;
}
function dot(number){
 const item=document.createElement("button");
 item.type="button";item.className="np-dot";
 item.dataset.countable="true";
 return markable(item,"Dot "+number);
}
function tenBlock(number,total){
 const item=document.createElement("button");
 item.type="button";item.className="np-ten-block";
 const numeral=document.createElement("strong");
 numeral.textContent="10";numeral.setAttribute("aria-hidden","true");
 const label=document.createElement("span");
 label.textContent="one ten";label.setAttribute("aria-hidden","true");
 item.appendChild(numeral);item.appendChild(label);
 return markable(item,"Ten block "+number+" of "+total);
}
function drawDots(){
 visual.dataset.kind="dots";
 const frames=document.createElement("div");
 frames.className="np-frame-set";
 const frameCount=Math.ceil(target/10);
 for(let g=0;g<frameCount;g++){
  const frame=document.createElement("div");
  frame.className="np-tenframe";
  if(step<=1)frame.classList.add("np-tenframe--simple");
  frame.setAttribute("role","group");
  frame.setAttribute("aria-label","Counting group "+(g+1));
  const filled=Math.min(10,target-g*10);
  for(let i=0;i<filled;i++)frame.appendChild(dot(g*10+i+1));
  // Empty positions are not needed for concrete counting.
  frames.appendChild(frame);
 }
 visual.appendChild(frames);
 visual.setAttribute("aria-label","Count "+(target<=10?"the individual dots.":"all of the dots in the groups.")+" Tap each dot as you count.");
 visualCaption.textContent=target<=10?"Tap each dot to count":"Count one group, then the next";
 heading.lastChild.textContent=" How many dots?";
}
function drawTens(){
 visual.dataset.kind="tens";
 const tens=Math.floor(target/10),ones=target%10;
 const pieces=document.createElement("div");
 pieces.className="np-place-value";
 const tensArea=document.createElement("div");
 tensArea.className="np-tens-area";
 const tensTitle=document.createElement("div");
 tensTitle.className="np-place-value__title";tensTitle.textContent="Tens · each block is 10";
 tensArea.appendChild(tensTitle);
 const tenList=document.createElement("div");
 tenList.className="np-tens-list";
 for(let i=0;i<tens;i++)tenList.appendChild(tenBlock(i+1,tens));
 tensArea.appendChild(tenList);pieces.appendChild(tensArea);
 const onesArea=document.createElement("div");
 onesArea.className="np-ones-area";
 const onesTitle=document.createElement("div");
 onesTitle.className="np-place-value__title";onesTitle.textContent="Ones · single dots";
 onesArea.appendChild(onesTitle);
 if(ones){
  const onesList=document.createElement("div");onesList.className="np-ones-list";
  for(let i=0;i<ones;i++)onesList.appendChild(dot(i+1));
  onesArea.appendChild(onesList);
 }else{
  const zero=document.createElement("div");
  zero.className="np-zero-ones";zero.textContent="No extra ones";
  onesArea.appendChild(zero);
 }
 pieces.appendChild(onesArea);visual.appendChild(pieces);
 visual.setAttribute("aria-label","Count the groups of ten and the single ones. Tap each to mark it counted.");
 visualCaption.textContent="Count by tens, then add the ones";
 heading.lastChild.textContent=" How many altogether?";
}
function draw(){
 visual.replaceChildren();
 if(step<3)drawDots();else drawTens();
}
function awardStar(){
 data.stars++;
 try{
  const old=JSON.parse(localStorage.getItem(STARS_KEY)||"{}");
  const stars=old&&typeof old==="object"?old:{};
  stars.numbers=(Number.isSafeInteger(stars.numbers)&&stars.numbers>=0?stars.numbers:0)+1;
  localStorage.setItem(STARS_KEY,JSON.stringify(stars));
 }catch(_){}
}
function answersForTarget(){
 const config=LEVELS[step],need=config.choices;
 const pool=[];
 for(let n=config.min;n<=config.max;n++)if(n!==target)pool.push(n);
 pool.sort((a,b)=>Math.abs(a-target)-Math.abs(b-target)||a-b);
 const closest=pool.slice(0,Math.max(need+3,9));
 const options=[target,...shuffle(closest).slice(0,need-1)];
 answers.replaceChildren();answers.dataset.count=String(options.length);
 for(const value of shuffle(options)){
  const b=document.createElement("button");b.type="button";
  b.className="np-option";b.textContent=String(value);
  b.setAttribute("aria-label","Answer "+value);
  b.addEventListener("click",()=>{
   if(solved||b.disabled)return;
   data.tries++;
   if(value===target){
    solved=true;data.correct++;data.streak++;wins=Math.min(GOAL,wins+1);
    b.classList.add("is-correct");
    answers.querySelectorAll("button").forEach(button=>button.disabled=true);
    const star=(data.streak%5===0);
    if(star)awardStar();
    window.PSNumbersProgress?.record(star);
    updateProgress();
    const finish=wins===GOAL&&level.value==="auto"&&step<LEVELS.length-1&&!(simple()&&step>=1);
    message("good","⭐ Well done! "+target+" is correct."+
     (finish?" You finished this step. Tap Next for a new challenge.": " Tap Next when you're ready."));
   }else{
    data.streak=0;mistakes++;
    b.disabled=true;b.classList.add("is-try");
    message("try",step<3
     ?"Try again. Tap each dot as you count."
     :"Try again. Each ten block is 10. Count the ones too.");
   }
   syncStats();save();
  });
  answers.appendChild(b);
 }
}
function setLevelControls(){
 const isSimple=simple();
 const opts=Array.from(level.querySelectorAll("option"));
 opts.forEach(option=>{
  const idx=Number(option.value);
  if(option.value!=="auto"&&idx>=2)option.disabled=isSimple;
 });
 byId("np-mode-note").textContent=isSimple?
  "Simple Play starts with 1–5 and 6–10. Larger numbers are available when Simple Play is off in Parent Zone.":
  "Automatic play introduces larger numbers gradually. Grown-ups can select a step above.";
}
function newRound(){
 if(level.value==="auto"&&wins>=GOAL&&step<LEVELS.length-1&&!(simple()&&step>=1)){
  step++;wins=0;queue=[];
 }
 previous=target||previous;
 target=pickTarget();solved=false;mistakes=0;
 voice.textContent="";draw();answersForTarget();updateProgress();
 message("neutral","");hint.textContent="💡 Help me count";
 save();
}
next.addEventListener("click",()=>{
 if(!solved){data.streak=0;syncStats();}
 newRound();
});
hear.addEventListener("click",()=>{
 const text=step<3?
  "How many dots can you see? Tap each dot to count, then choose the number.":
  "How many altogether? Count the blocks of ten, then count the single dots. Choose the number.";
 if(!window.PSVoice){voice.textContent="Speech unavailable. Use Help me count.";return}
 window.PSVoice.speak(text,voice);
});
hint.addEventListener("click",()=>{
 message("hint",step<3?
  "Touch each dot once. It changes colour as you count.":
  "Each big block means ten. Count ten, twenty, thirty and so on, then count the single dots.");
});
level.addEventListener("change",()=>{
 if(level.value==="auto"){
  step=simple()?Math.min(auto.step,1):auto.step;
  wins=(step===auto.step)?auto.wins:0;
 }else{
  const selection=Number(level.value);
  if(simple()&&selection>1){level.value="auto";return}
  step=clamp(selection,0,LEVELS.length-1);wins=0;
 }
 previous=0;queue=[];newRound();
});
reset.addEventListener("click",()=>{
 if(!window.confirm("Restart Count Numbers learning steps? Your total correct answers and earned stars will stay."))return;
 auto={step:0,wins:0,last:0};step=0;wins=0;previous=0;queue=[];
 level.value="auto";newRound();
});
syncStats();setLevelControls();
if(simple()&&step>1){step=0;wins=0;}
level.value="auto";newRound();
})();