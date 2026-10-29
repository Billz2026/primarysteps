/* Primary Steps — Letter Sounds: paced initial-sound listening practice */
(function(){
"use strict";
const EXAMPLES={
 A:{word:"apple",picture:"🍎"},B:{word:"ball",picture:"⚽"},
 C:{word:"cat",picture:"🐈"},D:{word:"dog",picture:"🐶"},
 E:{word:"egg",picture:"🥚"},F:{word:"fish",picture:"🐟"},
 G:{word:"goat",picture:"🐐"},H:{word:"hat",picture:"🎩"},
 I:{word:"insect",picture:"🐜"},J:{word:"juice",picture:"🧃"},
 K:{word:"kite",picture:"🪁"},L:{word:"lion",picture:"🦁"},
 M:{word:"moon",picture:"🌙"},N:{word:"nest",picture:"🪺"},
 O:{word:"octopus",picture:"🐙"},P:{word:"pig",picture:"🐷"},
 R:{word:"rain",picture:"🌧️"},S:{word:"sun",picture:"☀️"},
 T:{word:"tiger",picture:"🐯"},U:{word:"umbrella",picture:"☂️"},
 V:{word:"van",picture:"🚐"},W:{word:"web",picture:"🕸️"},
 Y:{word:"yo-yo",picture:"🪀"},Z:{word:"zebra",picture:"🦓"}
};
// Six new letters per step, then a mix of earlier sounds for extra practice.
// 'qu' and ending 'x' need their own explicit teaching rather than a misleading initial-sound clue.
const STEPS=[
 {title:"First sounds",newLetters:"SATPIN",review:"",choices:3},
 {title:"More sounds",newLetters:"MDCGOK",review:"SATPIN",choices:4},
 {title:"Growing sounds",newLetters:"EURHBF",review:"SATPINMDCGOK",choices:4},
 {title:"Sound explorer",newLetters:"LJVWYZ",review:"SATPINMDCGOKEURHBF",choices:6}
];
const GOAL=6,KEY="ps_letter_sounds_progress_v1";
const id=x=>document.getElementById(x);
const play=id("pl-play"),choices=id("pl-choices"),question=id("pl-sound-question");
const feedback=id("pl-feedback"),next=id("pl-next"),voiceNote=id("pl-voice-note");
const picture=id("pl-picture"),pictureButton=id("pl-show-picture");
const task=id("pl-task"),level=id("pl-sound-level"),reset=id("pl-sound-reset");
const stepLabel=id("pl-sound-step"),counter=id("pl-sound-count");
const track=id("pl-sound-progress-track"),fill=id("pl-sound-progress-fill");
const stars=Array.from(document.querySelectorAll("#pl-sound-stars span"));
const initialStep=window.PSSettings?.load?.().simplePlay===false?1:0;
function savedProgress(){
 try{
  const data=JSON.parse(localStorage.getItem(KEY)||"null");
  if(data&&Number.isInteger(data.step)&&data.step>=0&&data.step<STEPS.length&&
     Number.isInteger(data.wins)&&data.wins>=0&&data.wins<=GOAL){
   return{step:data.step,wins:data.wins,last:typeof data.last==="string"&&EXAMPLES[data.last]?data.last:""};
  }
 }catch(_){}
 return{step:initialStep,wins:0,last:""};
}
let stored=savedProgress(),step=stored.step,wins=stored.wins;
let current=stored.last,solved=false,queue=[],errors=0;
function save(){
 if(level.value!=="auto")return;
 stored={step,wins,last:current};
 try{localStorage.setItem(KEY,JSON.stringify(stored))}catch(_){}
}
function shuffle(list){
 const out=list.slice();
 for(let i=out.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}
function bank(){
 const s=STEPS[step];
 return [...new Set((s.newLetters+s.review).split(""))].filter(x=>EXAMPLES[x]);
}
function nextLetter(){
 if(queue.length===0){
  const s=STEPS[step];
  // Start with the six new sounds. Later revisit previously learned sounds.
  const newOnes=shuffle(s.newLetters.split("").filter(x=>x!==current));
  const oldOnes=shuffle(s.review.split("").filter(x=>x!==current));
  queue=newOnes.concat(oldOnes);
  if(!queue.length)queue=shuffle(bank());
 }
 return queue.shift();
}
function showProgress(){
 stepLabel.textContent="Step "+(step+1)+" of "+STEPS.length+" · "+STEPS[step].title;
 counter.textContent=wins+" of "+GOAL+" sounds matched";
 track.setAttribute("aria-valuenow",String(wins));
 fill.style.width=(wins/GOAL*100)+"%";
 stars.forEach((star,i)=>star.classList.toggle("is-earned",i<wins));
}
function message(state,text){
 feedback.dataset.state=state;feedback.textContent=text;feedback.hidden=state==="neutral";
}
function showPicture(open){
 picture.hidden=!open;
 pictureButton.setAttribute("aria-expanded",String(open));
 pictureButton.textContent=open?"Hide picture":"👁 Show picture";
 picture.replaceChildren();
 if(!open)return;
 const symbol=document.createElement("span");
 symbol.className="pl-sound-picture__emoji";
 symbol.setAttribute("role","img");symbol.setAttribute("aria-label","Picture: "+EXAMPLES[current].word);
 symbol.textContent=EXAMPLES[current].picture;
 const caption=document.createElement("span");
 caption.className="pl-sound-picture__caption";
 caption.textContent=solved?EXAMPLES[current].word:"Picture clue";
 picture.appendChild(symbol);picture.appendChild(caption);
}
function speakClue(){
 if(!window.PSVoice){
  voiceNote.textContent="Voice is unavailable. Use Show picture for a visual clue.";return;
 }
 const example=EXAMPLES[current].word;
 const didSpeak=window.PSVoice.speak(
  "Listen carefully. "+example+". "+example+". What sound do you hear at the beginning? Choose the letter.",
  voiceNote
 );
 if(didSpeak===false&&!voiceNote.textContent)voiceNote.textContent="Audio is off. Use Show picture for a clue.";
}
function newRound(){
 if(level.value==="auto"&&wins>=GOAL&&step<STEPS.length-1){
  step++;wins=0;queue=[];
 }
 current=nextLetter();solved=false;errors=0;
 task.textContent="Listen to the word";
 question.textContent="Which letter starts the word?";
 voiceNote.textContent="Tap the speaker to listen, or show a picture.";
 play.setAttribute("aria-label","Listen to a word. Play or replay the sound clue.");
 showPicture(false);
 choices.replaceChildren();
 const options=shuffle([current,...shuffle(bank().filter(l=>l!==current)).slice(0,STEPS[step].choices-1)]);
 options.forEach(letter=>{
  const button=document.createElement("button");
  button.type="button";button.className="pl-choice";button.textContent=letter.toLowerCase();
  button.setAttribute("aria-label","Letter "+letter.toLowerCase());
  button.addEventListener("click",function(){
   if(solved||button.disabled)return;
   if(letter===current){
    solved=true;button.classList.add("is-correct");
    choices.querySelectorAll("button").forEach(b=>b.disabled=true);
    wins=Math.min(GOAL,wins+1);showProgress();save();
    if(!picture.hidden)showPicture(true); // Now show the known word after success.
    const example=EXAMPLES[current].word;
    if(wins===GOAL&&level.value==="auto"&&step<STEPS.length-1){
     message("correct","⭐ Well done! "+example+" starts with "+current.toLowerCase()+". You completed this step! Tap Next.");
    }else{
     message("correct","⭐ Well done! "+example+" starts with "+current.toLowerCase()+".");
    }
   }else{
    errors++;button.classList.add("is-incorrect");button.disabled=true;
    message("try",errors>=2?"Try listening again, or choose Show picture.":"Have another listen and try a different letter.");
   }
  });
  choices.appendChild(button);
 });
 showProgress();save();message("neutral","");
}
play.addEventListener("click",speakClue);
pictureButton.addEventListener("click",()=>showPicture(picture.hidden));
next.addEventListener("click",newRound);
level.addEventListener("change",()=>{
 if(level.value==="auto"){
  const resumed=savedProgress();step=resumed.step;wins=resumed.wins;current=resumed.last;
 }else{step=Number(level.value);wins=0;}
 queue=[];newRound();
});
reset.addEventListener("click",()=>{
 try{localStorage.removeItem(KEY)}catch(_){}
 stored={step:initialStep,wins:0,last:""};
 step=initialStep;wins=0;current="";queue=[];level.value="auto";
 newRound();
});
newRound();
})();