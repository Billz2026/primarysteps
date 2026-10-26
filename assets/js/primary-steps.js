/* Primary Steps shared navigation, sound preference and gentle home */
(function(){
 "use strict";
 var root=document.documentElement;root.classList.add("ps-unified");
 var file=location.pathname.split("/").pop()||"index.html",home=file==="index.html";
 function section(){var p=file.replace(".html","");return p.indexOf("game-")===0?"games":p.split("-")[0]}
 function soundOn(){return window.PSSettings?window.PSSettings.load().soundEnabled:true}
 function showSound(b){if(!b)return;var on=soundOn();b.setAttribute("aria-pressed",String(on));b.setAttribute("aria-label",on?"Sound on. Tap to mute":"Sound off. Tap to enable");var i=b.querySelector("[data-sound-icon]"),t=b.querySelector("[data-sound-text]");if(i)i.textContent=on?"🔊":"🔇";if(t)t.textContent=on?"Sound on":"Sound off"}
 function toggleSound(){if(window.PSSettings)window.PSSettings.set({soundEnabled:!soundOn()});document.querySelectorAll("[data-ps-sound]").forEach(showSound);if(!soundOn()&&window.speechSynthesis)window.speechSynthesis.cancel()}
 function header(){
  var back=section()==="settings"||section()==="progress"?"index.html":section()+".html";if(back===file)back="index.html";
  var h=document.createElement("header");h.className="ps-shell";
  h.innerHTML='<div class="ps-shell__inner"><a class="ps-brand" href="index.html" aria-label="Primary Steps home"><img class="ps-brand__new-icon" src="assets/primary-steps-mark.svg" width="94" height="85" alt=""><span class="ps-brand__lockup"><span class="ps-brand__name"><span>Primary</span><strong>Steps</strong></span><span class="ps-brand__tagline">Learn <b>•</b> Play <b>•</b> Grow</span></span></a><nav class="ps-shell__actions" aria-label="Page navigation"><a class="ps-shell__button ps-shell__back" href="'+back+'">← Back</a><button type="button" class="ps-shell__button ps-shell__sound" data-ps-sound><span data-sound-icon aria-hidden="true">🔊</span><span data-sound-text>Sound on</span></button><a class="ps-shell__button ps-shell__parent" href="settings.html" aria-label="Parent Zone">Parents ⚙</a></nav></div>';
  document.body.insertBefore(h,document.body.firstChild);root.classList.add("ps-enhanced");
 }
 function dock(){
  var n=document.createElement("nav");n.className="ps-dock";n.setAttribute("aria-label","Main navigation");
  [["index.html","🏠","Home"],["index.html#activities","🧩","Activities"],["progress.html","⭐","My Stars"]].forEach(function(x,i){
   var a=document.createElement("a");a.href=x[0];if((home&&i===0)||(file==="progress.html"&&i===2))a.setAttribute("aria-current","page");
   var s=document.createElement("span");s.className="ps-dock__icon";s.setAttribute("aria-hidden","true");s.textContent=x[1];
   var t=document.createElement("span");t.textContent=x[2];a.append(s,t);n.appendChild(a);
  });document.body.appendChild(n);
 }
 function remember(){
  if(file.indexOf("-")<0)return;
  try{var name=(document.title||"Activity").split("•")[0].split("–")[0].trim();if(name)localStorage.setItem("ps_last_activity",JSON.stringify({href:file,title:name.slice(0,48)}))}catch(e){}
 }
 function homeSetup(){
  var b=document.getElementById("ps-more-toggle"),m=document.getElementById("ps-more");
  var featured=document.getElementById("ps-favourites"),extra=document.getElementById("ps-extra-activities");
  if(b&&m&&featured&&extra){
   var all=Array.from(document.querySelectorAll("[data-activity]"));
   var byName={};all.forEach(function(a){byName[a.dataset.activity]=a});
   var defaults=["letters","numbers","drawing","games"];
   var s=window.PSSettings?window.PSSettings.load():{simplePlay:true};
   var picks=[],candidate=Array.isArray(s.homeFavourites)?s.homeFavourites:defaults;
   candidate.concat(defaults).forEach(function(name){if(byName[name]&&picks.indexOf(name)<0&&picks.length<4)picks.push(name)});
   var simple=s.simplePlay!==false;
   if(simple){
    picks.forEach(function(name){featured.appendChild(byName[name])});
    all.forEach(function(a){if(picks.indexOf(a.dataset.activity)<0)extra.appendChild(a)});
    b.hidden=false;
   }else{
    all.forEach(function(a){featured.appendChild(a)});
    m.hidden=true;b.hidden=true;
   }
   function setOpen(open){
    m.hidden=!open;b.setAttribute("aria-expanded",String(open));
    var label=b.querySelector(".ps-more-btn__label");
    var arrow=b.querySelector(".ps-more-btn__chevron");
    if(label)label.textContent=open?"Show fewer activities":"See all 12 activities";
    if(arrow)arrow.textContent=open?"↑":"↓";
   }
   setOpen(false);
   b.addEventListener("click",function(){var open=m.hidden;setOpen(open);if(open)m.scrollIntoView({block:"start",behavior:"auto"})});
  }
  var listen=document.getElementById("ps-listen");
  if(listen)listen.addEventListener("click",function(){
   if(!window.speechSynthesis){listen.textContent="Audio unavailable";return;}
   if(!soundOn()&&window.PSSettings)window.PSSettings.set({soundEnabled:true});
   document.querySelectorAll("[data-ps-sound]").forEach(showSound);window.speechSynthesis.cancel();
   var u=new SpeechSynthesisUtterance("Hello! Pick a picture to start learning.");
   u.lang="en-GB";u.rate=.85;u.volume=window.PSSettings?window.PSSettings.load().volume:.9;window.speechSynthesis.speak(u);
  });
  try{var last=JSON.parse(localStorage.getItem("ps_last_activity")||"null");if(last&&/^[a-z0-9-]+[.]html$/.test(last.href)&&last.title){var a=document.getElementById("ps-continue");a.href=last.href;document.getElementById("ps-continue-title").textContent="Continue "+last.title;a.hidden=false}}catch(e){}
 }
 function enhanceCards(){
  if(file==="progress.html"||file==="settings.html")return;
  document.querySelectorAll(".panel .card").forEach(function(c){var links=c.querySelectorAll('a[href$=".html"]');if(links.length!==1)return;c.classList.add("ps-tappable");c.addEventListener("click",function(e){if(e.target.closest("a,button,input,select"))return;location.href=links[0].href})});
 }

 function addSpokenHelp(){
  if(home || file==="settings.html" || file==="progress.html")return;
  if(!root.classList.contains("ps-game")&&!root.classList.contains("ps-v4"))return;
  // Activities that already expose a spoken help button don't need a duplicate.
  if(document.querySelector('#listen[data-ps-read],#sayBtn,[data-ps-listen]'))return;
  var hints={
   "letters-find.html":"Find the same letter. Tap the one that matches.",
   "letters-sounds.html":"Tap Play. Listen carefully, then choose a letter.",
   "numbers-trace.html":"Choose a number. Trace it with your finger. Tap Done when ready.",
   "phonics-play.html":"Listen to the sound. Tap the matching letter. You can listen again.",
   "maths-play.html":"Look at the numbers. Enter an answer and tap Check.",
   "spelling-play.html":"Look at the word. Try spelling it. Tap Check when ready.",
   "spelling-missing-word.html":"Read the sentence. Tap the word that fits.",
   "spelling-build-sentence.html":"Put the words in order. Build a sentence.",
   "memory-play.html":"Turn over two pictures. Find the matching pair.",
   "puzzles-play.html":"Look at the pictures. Tap or move each piece to solve the puzzle.",
   "drawing-play.html":"Pick a colour. Use your finger to draw a picture.",
   "clock-play.html":"Look at the clock. Choose the time.",
   "handwriting-play.html":"Follow the letters with your finger to practise writing.",
   "game-coins.html":"Look at the coins. Count them or put them in order.",
   "game-connect4.html":"Tap a column. Try to make four in a row.",
   "game-shapesort.html":"Tap a shape, then tap where it belongs.",
   "game-sudoku.html":"Tap a square. Choose a number.",
   "games-play.html":"Choose a game, then tap the pictures to play."
  };
  var hint=hints[file];if(!hint)return;
  if(file==="phonics-play.html" && new URLSearchParams(location.search).get("activity")==="blendbuilder")
    hint="Choose a starting sound, a middle sound, and an ending sound. Tap Check.";
  if(file==="memory-play.html" && new URLSearchParams(location.search).get("activity")==="sequence")
    hint="Watch the pattern. Then tap the same order.";
  var host=document.querySelector(".hero")||document.querySelector("main .card");
  if(!host)return;
  var btn=document.createElement("button");
  btn.type="button";btn.className="ps-spoken-help";btn.textContent="🔊 Listen";
  btn.setAttribute("aria-label","Listen to the instructions");
  var feedback=document.createElement("span");
  feedback.className="ps-spoken-help__note";feedback.setAttribute("role","status");
  btn.addEventListener("click",function(){
   var s=window.PSSettings?.load?.();
   if(!s?.soundEnabled || !s?.voiceEnabled){
    feedback.textContent="Voice is off in Parent Zone.";return;
   }
   if(!window.speechSynthesis || !window.SpeechSynthesisUtterance){
    feedback.textContent="Speech is not available on this device.";return;
   }
   feedback.textContent="";
   window.speechSynthesis.cancel();
   var utterance=new SpeechSynthesisUtterance(hint);
   utterance.lang="en-GB";utterance.rate=.82;utterance.volume=s.volume??.9;
   window.speechSynthesis.speak(utterance);
  });
  var wrapper=document.createElement("div");
  wrapper.className="ps-spoken-help__wrap";wrapper.append(btn,feedback);
  if(host.classList.contains("hero"))host.appendChild(wrapper);
  else {
   var title=host.querySelector("h1");
   if(title)title.insertAdjacentElement("afterend",wrapper);
   else host.insertBefore(wrapper,host.firstChild);
  }
 }

 function init(){if(!home)header();dock();remember();enhanceCards();addSpokenHelp();if(home)homeSetup();document.querySelectorAll("[data-ps-sound]").forEach(function(b){showSound(b);b.addEventListener("click",toggleSound)})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
