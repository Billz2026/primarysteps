/* Primary Steps — Free Drawing Studio v1. No network connection or autoplay. */
(() => {
 "use strict";
 const root=document.documentElement;
 const canvas=document.getElementById("ds-canvas");
 const ctx=canvas?.getContext("2d");
 const status=document.getElementById("ds-status");
 const sizeInput=document.getElementById("ds-size");
 const sizeReadout=document.getElementById("ds-size-value");
 const undoBtn=document.getElementById("ds-undo");
 const brushBtn=document.getElementById("ds-brush");
 const eraserBtn=document.getElementById("ds-eraser");
 const expandBtn=document.getElementById("ds-expand");
 const saveBtn=document.getElementById("ds-save");
 const clearBtn=document.getElementById("ds-clear");
 const palette=document.getElementById("ds-palette");
 const pencilOnly=document.getElementById("ds-pencil-only");
 const confirmDialog=document.getElementById("ds-confirm");
 const confirmClear=document.getElementById("ds-confirm-clear");
 const confirmCancel=document.getElementById("ds-confirm-cancel");
 const DRAFT_KEY="ps_drawing_studio_draft_v1";
 const DB_NAME="PrimaryStepsArtStudio", DB_STORE="drafts", DB_KEY="free-drawing";
 const W=1600,H=1000;
 const COLORS=[
  ["Midnight","#253A4B","#FFFFFF"],["Red","#E76E70","#FFFFFF"],
  ["Orange","#F3A45F","#223B4D"],["Yellow","#F6D567","#223B4D"],
  ["Green","#67B68B","#223B4D"],["Turquoise","#56B6B0","#223B4D"],
  ["Blue","#62A8E2","#FFFFFF"],["Purple","#A18AD8","#FFFFFF"],
  ["Pink","#E99AB9","#223B4D"],["Brown","#A5785C","#FFFFFF"],
  ["Grey","#9CAEB3","#223B4D"],["White","#FFFFFF","#253A4B"]
 ];
 if(!ctx){if(status)status.textContent="This device cannot open the drawing canvas.";return}
 canvas.width=W;canvas.height=H;
 const actions=[];
 let currentTool="brush",colour="#62A8E2",brushSize=16,pointerId=null,active=null;
 let changedSinceLoad=false,saveTask=0,dbConnection=null,dbAllowed=!!window.indexedDB;
 const say=(message)=>{if(status)status.textContent=message};
 function updateControls(){
  brushBtn.setAttribute("aria-pressed",String(currentTool==="brush"));
  eraserBtn.setAttribute("aria-pressed",String(currentTool==="eraser"));
  brushBtn.classList.toggle("ds-button--active",currentTool==="brush");
  eraserBtn.classList.toggle("ds-button--active",currentTool==="eraser");
  undoBtn.disabled=actions.length===0;
  for(const button of palette.querySelectorAll(".ds-swatch")){
   button.setAttribute("aria-pressed",String(button.dataset.colour===colour));
  }
  sizeReadout.textContent=brushSize+" px";
 }
 function paintStroke(stroke){
  const pts=stroke.points;if(!pts||!pts.length)return;
  ctx.save();ctx.lineJoin="round";ctx.lineCap="round";
  ctx.strokeStyle=stroke.tool==="eraser"?"#FFFFFF":stroke.colour;
  ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=stroke.size;
  if(pts.length===1){ctx.beginPath();ctx.arc(pts[0].x,pts[0].y,stroke.size/2,0,Math.PI*2);ctx.fill();}
  else{
   ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
   for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i].x,pts[i].y);
   ctx.stroke();
  }
  ctx.restore();
 }
 function render(){
  ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.globalCompositeOperation="source-over";ctx.globalAlpha=1;
  ctx.fillStyle="#FFFFFF";ctx.fillRect(0,0,W,H);ctx.restore();
  for(const action of actions){
   if(action.type==="clear"){ctx.save();ctx.fillStyle="#FFF";ctx.fillRect(0,0,W,H);ctx.restore()}
   else if(action.type==="stroke")paintStroke(action);
  }
  updateControls();
 }
 function point(ev){
  const rect=canvas.getBoundingClientRect();
  if(!rect.width||!rect.height)return {x:0,y:0};
  return {x:Math.max(0,Math.min(W,(ev.clientX-rect.left)*W/rect.width)),
    y:Math.max(0,Math.min(H,(ev.clientY-rect.top)*H/rect.height))};
 }
 function begin(ev){
  if(pointerId!==null||(ev.pointerType==="mouse"&&ev.button!==0))return;
  if(pencilOnly.checked&&ev.pointerType!=="pen"){say("Pencil-only mode is on. Use an Apple Pencil or turn it off in More Tools.");return}
  ev.preventDefault();
  pointerId=ev.pointerId;
  try{canvas.setPointerCapture(pointerId)}catch(_){}
  const p=point(ev);
  active={type:"stroke",tool:currentTool,colour,size:currentTool==="eraser"?Math.max(30,brushSize*3):brushSize,points:[p]};
  actions.push(active);
  paintStroke(active);
  changedSinceLoad=true;updateControls();
 }
 function move(ev){
  if(ev.pointerId!==pointerId||!active)return;
  ev.preventDefault();
  const events=typeof ev.getCoalescedEvents==="function" ? ev.getCoalescedEvents() : [ev];
  for(const sample of events.length?events:[ev]){
   const p=point(sample);
   const old=active.points[active.points.length-1];
   if(Math.hypot(p.x-old.x,p.y-old.y)<.75)continue;
   active.points.push(p);
   ctx.save();ctx.lineCap="round";ctx.lineJoin="round";
   ctx.strokeStyle=active.tool==="eraser"?"#FFFFFF":active.colour;ctx.lineWidth=active.size;
   ctx.beginPath();ctx.moveTo(old.x,old.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore();
  }
 }
 function finish(ev){
  if(ev.pointerId!==pointerId)return;
  ev.preventDefault?.();
  pointerId=null;active=null;
  say("Saving your drawing…");
  saveSoon();
 }
 canvas.addEventListener("pointerdown",begin);
 canvas.addEventListener("pointermove",move);
 canvas.addEventListener("pointerup",finish);
 canvas.addEventListener("pointercancel",finish);
 canvas.addEventListener("lostpointercapture",finish);
 function setTool(tool){currentTool=tool;updateControls()}
 brushBtn.addEventListener("click",()=>setTool("brush"));
 eraserBtn.addEventListener("click",()=>setTool("eraser"));
 undoBtn.addEventListener("click",()=>{
  if(!actions.length)return;
  actions.pop();render();changedSinceLoad=true;
  say("Last action undone.");saveSoon();
 });
 sizeInput.addEventListener("input",()=>{
  brushSize=Math.max(4,Math.min(48,Number(sizeInput.value)||16));updateControls();
 });
 for(const [name,hex,check] of COLORS){
  const b=document.createElement("button");b.type="button";b.className="ds-swatch";
  b.dataset.colour=hex;b.style.backgroundColor=hex;
  b.style.setProperty("--ds-check",check);
  b.setAttribute("aria-label",name+" colour");
  b.title=name;
  b.addEventListener("click",()=>{
   colour=hex;setTool("brush");updateControls();say(name+" selected.");
  });
  palette.appendChild(b);
 }
 clearBtn.addEventListener("click",()=>{
  if(!actions.length){say("The canvas is already clear.");return}
  if(typeof confirmDialog.showModal==="function")confirmDialog.showModal();
  else if(window.confirm("Clear your drawing? You can undo this afterwards."))clearDrawing();
 });
 function clearDrawing(){
  actions.push({type:"clear"});render();changedSinceLoad=true;saveSoon();
  say("Canvas cleared. Use Undo to bring your picture back.");
 }
 confirmCancel.addEventListener("click",()=>confirmDialog.close());
 confirmClear.addEventListener("click",()=>{
  confirmDialog.close();clearDrawing();
 });
 confirmDialog.addEventListener("click",ev=>{if(ev.target===confirmDialog)confirmDialog.close()});
 function toggleImmersive(force){
  const on=typeof force==="boolean"?force:!root.classList.contains("ds-immersive");
  root.classList.toggle("ds-immersive",on);
  expandBtn.setAttribute("aria-pressed",String(on));
  expandBtn.textContent=on?"↙ Exit canvas view":"⛶ Expand canvas";
 }
 expandBtn.addEventListener("click",()=>toggleImmersive());
 document.addEventListener("keydown",ev=>{
  if(ev.key==="Escape"&&root.classList.contains("ds-immersive")){toggleImmersive(false);return}
  if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
  const key=ev.key.toLowerCase();
  if((ev.ctrlKey||ev.metaKey)&&key==="z"){ev.preventDefault();undoBtn.click()}
  else if(!ev.ctrlKey&&!ev.metaKey&&!ev.altKey){
   if(key==="b")brushBtn.click();
   if(key==="e")eraserBtn.click();
  }
 });
 function openDatabase(){
  return new Promise((resolve,reject)=>{
   if(!dbAllowed){reject(new Error("IndexedDB unavailable"));return}
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>{
    const db=request.result;if(!db.objectStoreNames.contains(DB_STORE))db.createObjectStore(DB_STORE);
   };
   request.onsuccess=()=>{dbConnection=request.result;resolve(dbConnection)};
   request.onerror=()=>reject(request.error||new Error("Unable to open storage"));
  });
 }
 function dbAction(mode,value){
  return new Promise((resolve,reject)=>{
   if(!dbConnection){reject(new Error("Storage unavailable"));return}
   const transaction=dbConnection.transaction(DB_STORE,mode);
   const request=mode==="readonly"?
     transaction.objectStore(DB_STORE).get(DB_KEY):
     transaction.objectStore(DB_STORE).put(value,DB_KEY);
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error||new Error("Storage failure"));
  });
 }
 function validRecord(data){
  return data&&data.version===1&&Array.isArray(data.actions)&&data.actions.length<=5000;
 }
 function serialize(){return {version:1,actions,colour,brushSize,updated:Date.now()}}
 function saveSoon(){
  clearTimeout(saveTask);
  saveTask=setTimeout(saveDraft,550);
 }
 async function saveDraft(){
  clearTimeout(saveTask);
  const saved=serialize();
  try{
   if(dbConnection){await dbAction("readwrite",saved);say("Drawing saved on this device.");return}
   localStorage.setItem(DRAFT_KEY,JSON.stringify(saved));
   say("Drawing saved on this device.");
  }catch(error){
   // A smaller vector draft can sometimes be stored when browser storage is constrained.
   try{localStorage.setItem(DRAFT_KEY,JSON.stringify(saved));say("Drawing saved on this device.")}
   catch(_){say("Automatic saving is unavailable. Tap Save Picture to keep your artwork.")}
  }
 }
 async function restoreDraft(){
  let previous=null;
  try{
   if(dbConnection)previous=await dbAction("readonly");
   if(!previous)previous=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null");
  }catch(_){}
  if(!validRecord(previous)||changedSinceLoad)return;
  actions.length=0;
  for(const a of previous.actions){
   if(a&&a.type==="clear")actions.push({type:"clear"});
   else if(a&&a.type==="stroke"&&Array.isArray(a.points)&&a.points.length<=20000&&
      ["brush","eraser"].includes(a.tool)&&typeof a.colour==="string"&&
      Number.isFinite(a.size)&&a.size>0&&a.size<=150){
    const points=a.points.filter(p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=0&&p.x<=W&&p.y>=0&&p.y<=H);
    actions.push({type:"stroke",tool:a.tool,colour:a.colour,size:a.size,points});
   }
  }
  if(typeof previous.colour==="string"&&COLORS.some(x=>x[1]===previous.colour))colour=previous.colour;
  if(Number.isFinite(previous.brushSize))brushSize=Math.max(4,Math.min(48,previous.brushSize));
  sizeInput.value=brushSize;
  render();if(actions.length)say("Your last drawing has been restored.");
 }
 function downloadCanvas(){
  const filename="primary-steps-my-drawing.png";
  const trigger=(href)=>{
   const a=document.createElement("a");a.href=href;a.download=filename;
   a.style.display="none";document.body.appendChild(a);a.click();a.remove();
  };
  if(typeof canvas.toBlob==="function"){
   canvas.toBlob(blob=>{
    if(!blob){say("Save failed. Please try again.");return}
    const url=URL.createObjectURL(blob);trigger(url);
    setTimeout(()=>URL.revokeObjectURL(url),10000);
    say("Picture ready to save to your device.");
   },"image/png");
  }else{
   try{trigger(canvas.toDataURL("image/png"));say("Picture ready to save to your device.")}
   catch(_){say("Save failed. Please try again.")}
  }
 }
 saveBtn.addEventListener("click",downloadCanvas);
 window.addEventListener("pagehide",()=>{if(changedSinceLoad)saveDraft()});
 document.addEventListener("visibilitychange",()=>{
  if(document.visibilityState==="hidden"&&changedSinceLoad)saveDraft();
 });
 render();
 (async()=>{
  try{await openDatabase()}
  catch(_){dbAllowed=false}
  await restoreDraft();
 })();
})();
