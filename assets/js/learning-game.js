/* Shared optional spoken instructions for Primary Steps learning games. */
(function(){
 "use strict";
 function settings(){return window.PSSettings?.load?.()||{soundEnabled:true,voiceEnabled:true,volume:.9}}
 function say(message){
  if(!("speechSynthesis" in window))return false;
  const prefs=settings();
  if(!prefs.soundEnabled||!prefs.voiceEnabled)return false;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(message);
  u.lang="en-GB";u.rate=.84;u.volume=prefs.volume??.9;
  window.speechSynthesis.speak(u);
  return true;
 }
 function init(){
  document.querySelectorAll("[data-ps-read]").forEach(button=>{
   button.addEventListener("click",()=>{
    if(!say(button.getAttribute("data-ps-read"))){
     button.setAttribute("title","Turn on voice and sound in Parent Zone.");
     button.setAttribute("aria-label","Voice instructions unavailable or disabled");
    }
   });
  });
  const mathsStage=document.getElementById("stage");
  if(document.documentElement.dataset.game==="maths"&&mathsStage){
   mathsStage.addEventListener("click",e=>{
    const b=e.target.closest("[data-key]");
    if(!b)return;
    const input=mathsStage.querySelector("#ans");
    if(!input)return;
    const k=b.getAttribute("data-key");
    let value=input.value||"";
    if(k==="back")value=value.slice(0,-1);
    else if(k==="minus")value=value.startsWith("-")?value.slice(1):"-"+value;
    else if(value.length<5)value+=k;
    input.value=value;
    input.dispatchEvent(new Event("input",{bubbles:true}));
   });
  }
 }
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
