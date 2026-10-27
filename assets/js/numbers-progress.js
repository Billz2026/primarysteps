/* Numbers-only bridge for Primary Steps My Stars.
   Existing activity progress remains stored under its original keys. */
(function(){
"use strict";
const KEY="ps_progress_v2";
function localDay(){
 const d=new Date();
 return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
}
function record(earnedStar){
 try{
  let data=JSON.parse(localStorage.getItem(KEY)||"null");
  if(!data||data.v!==2){
   data={v:2,activities:{},streak:0,lastPractice:"",
    weekly:{key:"",count:0},badges:{},migrated:false};
  }
  if(!data.activities||typeof data.activities!=="object")data.activities={};
  const numbers=data.activities.numbers&&typeof data.activities.numbers==="object"
   ?data.activities.numbers:{stars:0,attempts:0,best:0,lastPlayed:""};
  numbers.attempts=Math.max(0,Number(numbers.attempts)||0)+1;
  if(earnedStar)numbers.stars=Math.min(3,Math.max(0,Number(numbers.stars)||0)+1);
  numbers.lastPlayed=localDay();
  data.activities.numbers=numbers;
  localStorage.setItem(KEY,JSON.stringify(data));
  return true;
 }catch(_){return false}
}
window.PSNumbersProgress={record};
})();
