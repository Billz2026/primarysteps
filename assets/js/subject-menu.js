/* Primary Steps: calm, predictable picture menus (v2) */
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
 function label(card){var e=card.querySelector(".ps-choice__name");return (e||card).textContent.trim();}
 function simple(){return window.PSSettings?.load?.().simplePlay!==false;}
 function init(){
  var grid=document.querySelector(".ps-choice-grid");if(!grid)return;
  var root=document.documentElement;subject=root.getAttribute("data-subject")||"";
  choices=Array.from(grid.querySelectorAll(".ps-choice"));if(!choices.length)return;
  var order=preferred[subject]||[];
  choices.sort(function(a,b){
    var x=order.indexOf(label(a)),y=order.indexOf(label(b));
    return (x<0?99:x)-(y<0?99:y);
  });
  choices.forEach(function(card){grid.appendChild(card)});
  var first=choices[0];first.classList.add("ps-choice--start");
  var badge=document.createElement("span");badge.className="ps-choice__start-badge";
  badge.textContent="▶ Start here";first.insertBefore(badge,first.firstChild);
  first.setAttribute("aria-label","Start here: "+label(first));
  var title=document.getElementById("choose-title");if(title)title.textContent="Pick a picture to play";
  var copy=document.querySelector(".ps-subject-hero p");if(copy)copy.textContent="Tap a picture to begin.";
  if(simple()&&choices.length>2){
   grid.id=grid.id||"ps-activity-choices";
   var btn=document.createElement("button");btn.type="button";btn.className="ps-choice-more";
   btn.setAttribute("aria-controls",grid.id);
   var count=choices.length-2;
   function showAll(open){
    root.classList.toggle("ps-show-all",open);
    btn.setAttribute("aria-expanded",String(open));
    btn.textContent=open?"↑ Show fewer activities":"＋ See "+count+" more "+(count===1?"activity":"activities");
   }
   showAll(false);grid.insertAdjacentElement("afterend",btn);
   btn.addEventListener("click",function(){showAll(!root.classList.contains("ps-show-all"))});
   root.classList.add("ps-subject-enhanced");
  }
  var welcome=document.querySelector("[data-ps-listen]");
  if(welcome)welcome.addEventListener("click",speak);
 }
 function speak(){
  var b=document.querySelector("[data-ps-listen]");if(!b)return;
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){b.textContent="Audio unavailable";return;}
  var prefs=window.PSSettings?.load?.();
  if(prefs&&(!prefs.soundEnabled||!prefs.voiceEnabled)){b.textContent="Sound is off";b.title="Turn on voice and sound in Parent Zone";return;}
  var visible=simple()&&!document.documentElement.classList.contains("ps-show-all")?choices.slice(0,2):choices;
  var names=visible.map(label);
  var sentence="Let's learn "+(b.getAttribute("data-ps-listen")||subject)+". Tap a picture to play. "+names.join(". ")+".";
  window.speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(sentence);u.lang="en-GB";u.rate=.81;u.volume=prefs?.volume??.9;
  window.speechSynthesis.speak(u);
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();