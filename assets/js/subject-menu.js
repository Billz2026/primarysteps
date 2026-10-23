/* Spoken subject prompts: opt-in, never autoplay */
(function(){
"use strict";
function speak(){
 const b=document.querySelector("[data-ps-listen]");if(!b)return;
 const subject=b.getAttribute("data-ps-listen")||"";
 if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){
  b.textContent="Audio unavailable";return;
 }
 const prefs=window.PSSettings?.load?.();
 if(prefs && (!prefs.soundEnabled||!prefs.voiceEnabled)){
  b.textContent="Sound is off";
  b.setAttribute("title","Turn on voice and sound in Parent Zone");return;
 }
 window.speechSynthesis.cancel();
 const u=new SpeechSynthesisUtterance("Let's learn "+subject+". Pick a picture to begin.");
 u.lang="en-GB";u.rate=.85;u.volume=prefs?.volume??.9;
 window.speechSynthesis.speak(u);
}
function init(){
 const b=document.querySelector("[data-ps-listen]");
 if(b)b.addEventListener("click",speak);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();