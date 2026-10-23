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
  h.innerHTML='<div class="ps-shell__inner"><a class="ps-brand" href="index.html"><img class="ps-brand__icon" src="assets/primary-steps-icon-512.png" alt=""><span class="ps-brand__name">Primary Steps</span></a><nav class="ps-shell__actions" aria-label="Page navigation"><a class="ps-shell__button ps-shell__back" href="'+back+'">← Back</a><button type="button" class="ps-shell__button ps-shell__sound" data-ps-sound><span data-sound-icon aria-hidden="true">🔊</span><span data-sound-text>Sound on</span></button><a class="ps-shell__button ps-shell__parent" href="settings.html" aria-label="Parent Zone">Parent Zone</a></nav></div>';
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
  if(b&&m)b.addEventListener("click",function(){m.hidden=!m.hidden;b.setAttribute("aria-expanded",String(!m.hidden));b.textContent=m.hidden?"Explore more activities ↓":"Show fewer activities ↑"});
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
 function init(){if(!home)header();dock();remember();enhanceCards();if(home)homeSetup();document.querySelectorAll("[data-ps-sound]").forEach(function(b){showSound(b);b.addEventListener("click",toggleSound)})}
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();
