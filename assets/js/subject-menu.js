/* Primary Steps — simple, predictable picture menus (v2) */
(function(){
 "use strict";
 var choices=[],subject="";
 var preferred={
  letters:["Trace Letters","Find Letters","Letter Sounds"],
  numbers:["Count","Trace Numbers"],
  phonics:["Match Sounds","Blend Words"],
  maths:["Add","Subtract","Number Bonds","Multiply","Divide"],
  drawing:["Draw","Colour"],
  games:["Sort Shapes","Coin Bank","Connect Four","Sudoku"],
  spelling:["Spell Words","Missing Words","Make Sentences"],
  memory:["Match Pairs","Remember","Find Differences"],
  puzzles:["Jigsaw","Patterns","Odd One Out","Order Numbers","Logic"],
  clock:["Read the Clock","Set the Time"]
 };
 function label(card){return (card.querySelector(".ps-choice__name")||card).textContent.trim();}
 function isSimple(){return window.PSSettings?.load?.().simplePlay!==false;}
 function initMenu(){
  var grid=document.querySelector(".ps-choice-grid");
  if(!grid)return;
  var root=document.documentElement;
  subject=root.getAttribute("data-subject")||"";
  choices=Array.from(grid.querySelectorAll(":scope > .ps-choice"));
  if(!choices.length)return;
  var order=preferred[subject]||[];
  choices.sort(function(a,b){
   var x=order.indexOf(label(a)),y=order.indexOf(label(b));
   return (x<0?99:x)-(y<0?99:y);
  });
  choices.forEach(function(card){grid.appendChild(card)});
  var first=choices[0];
  first.classList.add("ps-choice--start");
  var badge=document.createElement("span");
  badge.className="ps-choice__start-badge";
  badge.innerHTML='<span aria-hidden="true">▶</span> Start here';
  first.insertBefore(badge,first.firstChild);
  first.setAttribute("aria-label","Start here: "+label(first));
  var sectionTitle=document.getElementById("choose-title");
  if(sectionTitle)sectionTitle.textContent="Pick a picture to play";
  var copy=document.querySelector(".ps-subject-hero p");
  if(copy)copy.textContent="Tap a picture to begin.";

  if(isSimple() && choices.length>2){
   grid.id=grid.id||"ps-activity-choices";
   var btn=document.createElement("button");
   btn.type="button";
   btn.className="ps-choice-more";
   btn.setAttribute("aria-controls",grid.id);
   btn.setAttribute("aria-expanded","false");
   var count=choices.length-2;
   function showAll(open){
    root.classList.toggle("ps-show-all",open);
    btn.setAttribute("aria-expanded",String(open));
    btn.textContent=open?"↑ Show fewer activities":"＋ See "+count+" more "+(count===1?"activity":"activities");
   }
   showAll(false);
   grid.insertAdjacentElement("afterend",btn);
   btn.addEventListener("click",function(){showAll(!root.classList.contains("ps-show-all"))});
   root.classList.add("ps-subject-enhanced");
  }
  var welcome=document.querySelector("[data-ps-listen]");
  if(welcome)welcome.addEventListener("click",speak);
 }
 function speak(){
  var b=document.querySelector("[data-ps-listen]");
  if(!b)return;
  if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){
   b.textContent="Audio unavailable";return;
  }
  var prefs=window.PSSettings?.load?.();
  if(prefs&&(!prefs.soundEnabled||!prefs.voiceEnabled)){
   b.textContent="Sound is off";b.setAttribute("title","Turn on voice and sound in Parent Zone");return;
  }
  var names=choices.slice(0,isSimple()&&!document.documentElement.classList.contains("ps-show-all")?2:choices.length).map(label);
  var line="Let's learn "+(b.getAttribute("data-ps-listen")||subject)+". Tap a picture to play. "+names.join(". ")+".";
  window.speechSynthesis.cancel();
  var utterance=new SpeechSynthesisUtterance(line);
  utterance.lang="en-GB";utterance.rate=.81;utterance.volume=prefs?.volume??.9;
  window.speechSynthesis.speak(utterance);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",initMenu);
 else initMenu();
})();