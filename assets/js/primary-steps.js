/* Primary Steps shared navigation, sound preference and gentle home */
(function(){
 "use strict";
 var root=document.documentElement;root.classList.add("ps-unified");
 var file=location.pathname.split("/").pop()||"index.html",home=file==="index.html";
 // One opt-in speech path for questions and feedback. No voice starts automatically.
 window.PSVoice={
  speak:function(text,status){
   var prefs=window.PSSettings?.load?.();
   if(prefs&&(!prefs.soundEnabled||!prefs.voiceEnabled)){
    if(status)status.textContent="Voice is off in Parent Zone.";
    return false;
   }
   if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
    if(status)status.textContent="Speech is not available on this device.";
    return false;
   }
   var phrase=String(text||"").replace(/\s+/g," ").trim();
   if(!phrase){if(status)status.textContent="No question to read yet.";return false}
   if(status&&!/(?:^|\s)(?:msg|feedback|status)(?:\s|$)/.test(status.className||""))status.textContent="";
   try{
    window.speechSynthesis.cancel();
    var utterance=new SpeechSynthesisUtterance(phrase);
    utterance.lang="en-GB";utterance.rate=.81;utterance.pitch=1;utterance.volume=prefs?.volume??.9;
    window.speechSynthesis.speak(utterance);return true;
   }catch(e){if(status)status.textContent="Speech could not play.";return false}
  },
  attach:function(target,getText,label){
   var anchor=typeof target==="string"?document.querySelector(target):target;
   if(!anchor||!getText)return null;
   var group=document.createElement("div");group.className="ps-question-audio";
   var button=document.createElement("button");button.type="button";
   button.className="ps-question-audio__button";button.textContent="🔊 "+(label||"Hear question");
   button.setAttribute("aria-label",label||"Hear this question again");
   var note=document.createElement("span");note.className="ps-question-audio__note";note.setAttribute("role","status");
   button.addEventListener("click",function(){window.PSVoice.speak(getText(),note)});
   group.append(button,note);
   anchor.insertAdjacentElement("afterend",group);return button;
  }
 };

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
  var guidance={
   "clock-play.html":"Look at the clock. Tap the correct time. For Set the Time, move the hands and tap Check.",
   "drawing-play.html":"Pick a colour. Draw with your finger or mouse. You can tap Undo.",
   "game-coins.html":"Count the coins. Tap the answer. Try the easy level first.",
   "game-connect4.html":"Choose a column to drop a piece. Try to make four in a row.",
   "game-shapesort.html":"Tap a shape. Then tap the matching box. You can take your time.",
   "game-sudoku.html":"Tap an empty square. Choose a number. Each row and column needs different numbers.",
   "games-play.html":"Tap a game to start. Follow the pictures to play.",
   "handwriting.html":"Trace the word with your finger. Tap Next for a new word.",
   "handwriting-play.html":"Follow the letters on the board with your finger. Tap Done when you finish.",
   "letters-find.html":"Find the same letter. Tap the letter that matches.",
   "letters-sounds.html":"Tap Play to hear a letter sound. Listen and choose the matching letter.",
   "letters-trace.html":"Follow the dotted letter with your finger. Tap Next for another letter.",
   "maths-play.html":"Look at the numbers. Type your answer. Tap Check.",
   "memory-play.html":"Turn over two pictures. Try to find a matching pair.",
   "numbers-count.html":"Count the pictures. Tap the number you counted.",
   "numbers-trace.html":"Follow the number with your finger. Tap Done when you're ready.",
   "phonics-play.html":"Listen to the sound. Choose the matching letter.",
   "puzzles-play.html":"Look at the puzzle. Tap or move the pieces to finish it.",
   "spelling-build-sentence.html":"Tap the words in order to make a sentence. Tap Check.",
   "spelling-missing-word.html":"Read the sentence. Tap the word that fits in the gap.",
   "spelling-play.html":"Look at the word. Type it in the box. Tap Check."
  };
  var hint=guidance[file];
  if(!hint)return;
  if(file==="phonics-play.html"&&new URLSearchParams(location.search).get("activity")==="blendbuilder")
   hint="Choose the first sound, the middle sound and the last sound. Tap Check.";
  if(file==="memory-play.html"&&new URLSearchParams(location.search).get("activity")==="sequence")
   hint="Watch the pattern. Then tap the pictures in the same order.";
  if(file==="clock-play.html"&&new URLSearchParams(location.search).get("activity")==="set")
   hint="Look at the time shown. Tap Hour plus to move the hand. Tap Check when it matches.";
  if(file==="drawing-play.html"&&new URLSearchParams(location.search).get("activity")==="colouring")
   hint="Choose a picture and a colour. Use your finger to colour the picture.";
  root.classList.add("ps-play-page");
  root.setAttribute("data-ps-play-page",file.replace(".html",""));
  document.querySelectorAll("#msg,#message,#feedback,#feedbackEl").forEach(function(el){
   if(!el.hasAttribute("aria-live"))el.setAttribute("aria-live","polite");
  });
  if(document.querySelector(".ps-spoken-help"))return;
  var host=document.querySelector("main .hero .hwrap, main .hero, body > section.hero .hwrap, body > section.hero, main .card, body > .hero .hwrap");
  if(!host)return;
  var wrapper=document.createElement("div");wrapper.className="ps-spoken-help__wrap ps-play-instructions";
  var summary=document.createElement("span");summary.className="ps-play-instructions__text";
  summary.textContent=hint;
  var btn=document.createElement("button");btn.type="button";btn.className="ps-spoken-help";btn.textContent="🔊 Hear instructions";
  btn.setAttribute("aria-label","Hear how to play this activity");
  var status=document.createElement("span");status.className="ps-spoken-help__note";status.setAttribute("role","status");
  btn.addEventListener("click",function(){
   var prefs=window.PSSettings?.load?.();
   if(prefs&&(!prefs.soundEnabled||!prefs.voiceEnabled)){status.textContent="Turn on voice in Parent Zone.";return;}
   if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){status.textContent="Spoken instructions are unavailable on this device.";return;}
   status.textContent="";
   window.speechSynthesis.cancel();
   var u=new SpeechSynthesisUtterance(hint);u.lang="en-GB";u.rate=.82;u.volume=prefs?.volume??.9;
   window.speechSynthesis.speak(u);
  });
  wrapper.append(summary,btn,status);
  if(host.classList.contains("card")){
   var heading=host.querySelector("h1");if(heading)heading.insertAdjacentElement("afterend",wrapper);else host.insertBefore(wrapper,host.firstChild);
  }else host.appendChild(wrapper);
 }
 function tidyBeginnerPanels(){
  if(file!=="numbers-trace.html"||window.PSSettings?.load?.().simplePlay===false)return;
  var say=document.getElementById("sayBtn");
  var row=document.querySelector(".grid > .card .head .row");
  if(say&&row){say.classList.add("ps-number-speak");row.insertBefore(say,row.firstChild);}
 }
 function addQuestionReplay(){
  var voice=window.PSVoice,anchor=null,getText=null,label="Hear question";
  function q(sel){return document.querySelector(sel)}
  if(file==="letters-find.html"){
   anchor=q(".targetBox .stat")||q("#targetLabel");
   getText=function(){return "Find the letter "+(q("#targetLabel")?.textContent||"")+". Tap the letter that matches.";};
   label="Hear the letter to find";
  }else if(file==="maths-play.html"){
   anchor=q("#stage");
   getText=function(){
    var x=q("#stage .bigQ")?.textContent;
    if(x){
     var bonds=x.match(/^\s*(\d+)\s*\+\s*\?\s*=\s*(\d+)\s*$/);
     if(bonds)return "What number can we add to "+bonds[1]+" to make "+bonds[2]+"?";
     var phrase=x.replace(/\s*=\s*\?\s*$/,"").replace(/[×x]/g," times ")
      .replace(/[÷]/g," divided by ").replace(/[−-]/g," minus ").replace(/[+]/g," plus ");
     return "What is "+phrase.trim()+"?";
    }
    return q("#pageLead")?.textContent||"Look at the question and choose an answer.";
   };
  }else if(file==="spelling-play.html"){
   anchor=q("#word");
   getText=function(){return "Listen to the word. "+(q("#word")?.textContent||"").replace(/\s+/g," ")+". Type the word and tap Check.";};
   label="Hear the word";
  }else if(file==="spelling-missing-word.html"){
   anchor=q("#sentence");
   getText=function(){return "Listen to the sentence. "+(q("#sentence")?.textContent||"").replace(/[?]/g," blank ")+". Choose the missing word.";};
   label="Hear the sentence";
  }else if(file==="clock-play.html"){
   anchor=q("#target");
   getText=function(){
    var isSet=new URLSearchParams(location.search).get("activity")==="set";
    return isSet?"Make the clock show "+(q("#target")?.textContent||"the time shown")+". Move the hands and tap Check.":"Look at the clock hands. Choose the time you see.";
   };
  }else if(file==="spelling-build-sentence.html"){
   anchor=q("#tiles");
   getText=function(){return "Tap the word tiles to make a sentence. Tap Check when you finish.";};
   label="Hear the task";
  }
  if(anchor&&getText)voice.attach(anchor,getText,label);
 }
 function init(){if(!home)header();dock();remember();enhanceCards();tidyBeginnerPanels();addSpokenHelp();addQuestionReplay();if(home)homeSetup();document.querySelectorAll("[data-ps-sound]").forEach(function(b){showSound(b);b.addEventListener("click",toggleSound)})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
