/* Primary Steps Colouring Studio v1 — ten interactive vector colouring pictures. */
(() => {
 "use strict";
 const ROOT=document.documentElement, SVG_NS="http://www.w3.org/2000/svg";
 const pictures=Array.isArray(window.PSColouringPictures)?window.PSColouringPictures:[];
 const byId=new Map(pictures.map(p=>[p.id,p]));
 const categories=[
  ["all","All pictures","🎨"],["animals","Animals","🐱"],["vehicles","Vehicles","🚗"],
  ["nature","Nature","🌈"],["home","Home","🏠"],["fantasy","Fantasy","🚀"],
  ["celebrations","Celebrations","🎂"]
 ];
 const COLORS=[
  ["Red","#ED7E78","#FFF"],["Orange","#F2AA65","#273F4D"],
  ["Yellow","#F8D36D","#273F4D"],["Green","#77BB8F","#273F4D"],
  ["Turquoise","#5ABDB4","#273F4D"],["Sky blue","#72AFE3","#273F4D"],
  ["Blue","#487CD3","#FFF"],["Purple","#A58AD9","#FFF"],
  ["Pink","#EAA0C6","#273F4D"],["Brown","#B98767","#FFF"],
  ["Black","#293E4C","#FFF"],["White","#FFFFFF","#293E4C"]
 ];
 const $=id=>document.getElementById(id);
 const ui={
  gallery:$("cs-gallery-screen"),editor:$("cs-editor-screen"),tabs:$("cs-categories"),
  cards:$("cs-gallery-grid"),count:$("cs-count"),pictureName:$("cs-picture-name"),
  svg:$("cs-canvas"),paper:$("cs-paper"),swatches:$("cs-swatches"),
  custom:$("cs-custom-colour"),status:$("cs-status"),instruction:$("cs-instruction"),
  modeFill:$("cs-fill-mode"),modeBrush:$("cs-brush-mode"),modeErase:$("cs-erase-mode"),
  undo:$("cs-undo"),back:$("cs-back"),expand:$("cs-expand"),
  save:$("cs-save"),clear:$("cs-clear"),sizeGroup:$("cs-size-controls"),
  sizeTitle:$("cs-size-title"),dialog:$("cs-clear-dialog"),
  keep:$("cs-keep"),reset:$("cs-reset")
 };
 if(!pictures.length){ui.cards.textContent="Pictures are temporarily unavailable.";return}
 let category="all",current=null,colour=COLORS[0][1],mode="fill";
 let widths={brush:25,eraser:55},activeStroke=null,activePointer=null,activePath=null;
 let drawings={},dirty=false,saveTimer=0,db=null,loading=true,lastPicture="";
 const STORE_KEY="ps_colouring_studio_v1",DB_NAME="PrimaryStepsColouring",DB_STORE="records",DB_ITEM="gallery";
 const setStatus=text=>{ui.status.textContent=text||""};
 const hex=value=>/^#[0-9a-f]{6}$/i.test(String(value||""));
 const svgEl=(name,attributes={})=>{
  const el=document.createElementNS(SVG_NS,name);
  for(const [key,value] of Object.entries(attributes))el.setAttribute(key,String(value));
  return el;
 };
 const statesFor=id=>drawings[id]||(drawings[id]=[]);
 function activeActions(){return current?statesFor(current.id):[]}
 function markDirty(){dirty=true;clearTimeout(saveTimer);saveTimer=setTimeout(persist,450)}
 function serialize(){
  return {version:1,colour,category,lastPicture,pictures:drawings,savedAt:Date.now()};
 }
 function openDb(){
  return new Promise((resolve,reject)=>{
   if(!window.indexedDB){reject(new Error("IndexedDB unavailable"));return}
   const request=indexedDB.open(DB_NAME,1);
   request.onupgradeneeded=()=>{
    if(!request.result.objectStoreNames.contains(DB_STORE))request.result.createObjectStore(DB_STORE);
   };
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
  });
 }
 function dbTransaction(mode,value){
  return new Promise((resolve,reject)=>{
   if(!db){reject(new Error("Storage unavailable"));return}
   const tx=db.transaction(DB_STORE,mode);
   const req=mode==="readonly"?tx.objectStore(DB_STORE).get(DB_ITEM):
    tx.objectStore(DB_STORE).put(value,DB_ITEM);
   req.onsuccess=()=>resolve(req.result);
   req.onerror=()=>reject(req.error);
  });
 }
 async function persist(){
  clearTimeout(saveTimer);
  if(!dirty)return;
  try{
   if(db)await dbTransaction("readwrite",serialize());
   else localStorage.setItem(STORE_KEY,JSON.stringify(serialize()));
   dirty=false;if(current)setStatus("Your picture is saved on this device.");
  }catch(_){
   try{localStorage.setItem(STORE_KEY,JSON.stringify(serialize()));dirty=false;
    if(current)setStatus("Your picture is saved on this device.");
   }catch(_){if(current)setStatus("Automatic saving is unavailable. Please use Save Picture.");}
  }
 }
 function safeAction(action){
  if(!action||typeof action!=="object")return null;
  if(action.type==="reset")return {type:"reset"};
  if(action.type==="fill"&&/^[a-z0-9-]{1,45}$/i.test(String(action.part))&&hex(action.colour))
   return {type:"fill",part:action.part,colour:action.colour};
  if(action.type==="stroke"&&["brush","eraser"].includes(action.tool)&&Array.isArray(action.points)&&
    action.points.length>0&&action.points.length<=4000&&hex(action.colour)&&
    Number.isFinite(action.size)&&action.size>=3&&action.size<=120){
   const pts=action.points.filter(pt=>pt&&Number.isFinite(pt.x)&&Number.isFinite(pt.y)&&
    pt.x>=0&&pt.x<=800&&pt.y>=0&&pt.y<=520).map(pt=>({x:pt.x,y:pt.y}));
   if(pts.length)return {type:"stroke",tool:action.tool,colour:action.colour,size:action.size,points:pts};
  }
  return null;
 }
 function restoreData(data){
  if(!data||data.version!==1||!data.pictures||typeof data.pictures!=="object")return;
  for(const p of pictures){
   const found=data.pictures[p.id];
   if(!Array.isArray(found))continue;
   drawings[p.id]=found.slice(-500).map(safeAction).filter(Boolean);
  }
  if(hex(data.colour))colour=data.colour.toUpperCase();
  if(categories.some(a=>a[0]===data.category))category=data.category;
  if(byId.has(data.lastPicture))lastPicture=data.lastPicture;
 }
 async function loadDrafts(){
  let data=null;
  try{db=await openDb();data=await dbTransaction("readonly")}catch(_){}
  if(!data){try{data=JSON.parse(localStorage.getItem(STORE_KEY)||"null")}catch(_){}}
  if(!dirty)restoreData(data);
  loading=false;drawTabs();drawGallery();updatePalette();
 }
 function previewSvg(picture){
  return '<svg xmlns="'+SVG_NS+'" viewBox="0 0 800 520" aria-hidden="true">'+
   '<rect width="800" height="520" fill="#FFFFFF"/>'+
   '<g fill="#FFFFFF" stroke="#273D4B" stroke-width="7" stroke-linejoin="round" stroke-linecap="round">'+
   picture.art+'</g></svg>';
 }
 function drawTabs(){
  ui.tabs.replaceChildren();
  for(const [id,name,emoji] of categories){
   const btn=document.createElement("button");
   btn.type="button";btn.className="cs-category";btn.textContent=emoji+" "+name;
   btn.setAttribute("aria-pressed",String(category===id));
   btn.addEventListener("click",()=>{
    category=id;markDirty();drawTabs();drawGallery();
   });
   ui.tabs.appendChild(btn);
  }
 }
 function drawGallery(){
  ui.cards.replaceChildren();
  const visible=pictures.filter(p=>category==="all"||p.category===category);
  ui.count.textContent=visible.length+" "+(visible.length===1?"picture":"pictures");
  for(const p of visible){
   const button=document.createElement("button");
   button.type="button";button.className="cs-picture-card";
   button.setAttribute("aria-label","Colour "+p.name);
   const thumb=document.createElement("div");thumb.className="cs-thumb";thumb.innerHTML=previewSvg(p);
   const info=document.createElement("span");info.className="cs-picture-info";
   const text=document.createElement("span");text.className="cs-picture-name";
   const hasProgress=(drawings[p.id]||[]).length>0;
   text.textContent=p.name+(hasProgress?" · Continue":"");
   const arrow=document.createElement("span");arrow.className="cs-picture-arrow";arrow.textContent="→";
   arrow.setAttribute("aria-hidden","true");
   info.append(text,arrow);button.append(thumb,info);
   button.addEventListener("click",()=>openPicture(p));
   ui.cards.appendChild(button);
  }
 }
 function updatePalette(){
  for(const btn of ui.swatches.querySelectorAll(".cs-swatch")){
   btn.setAttribute("aria-pressed",String(btn.dataset.colour?.toUpperCase()===colour.toUpperCase()));
  }
  ui.custom.value=colour;
 }
 for(const [name,hexColour,tick] of COLORS){
  const button=document.createElement("button");button.type="button";
  button.className="cs-swatch";button.dataset.colour=hexColour;
  button.style.backgroundColor=hexColour;button.style.setProperty("--cs-tick",tick);
  button.setAttribute("aria-label",name+" colour");button.title=name;
  button.addEventListener("click",()=>selectColour(hexColour,name));
  ui.swatches.appendChild(button);
 }
 function selectColour(newColour,name){
  if(!hex(newColour))return;
  colour=newColour.toUpperCase();updatePalette();
  setStatus((name||"New colour")+" selected.");markDirty();
 }
 ui.custom.addEventListener("input",()=>selectColour(ui.custom.value,"Custom colour"));
 const areaByPart=part=>{
  if(part==="background")return ui.svg.querySelector('rect[data-part="background"]');
  const areas=ui.svg.querySelectorAll("#cs-area-layer [data-part]");
  return [...areas].find(el=>el.getAttribute("data-part")===part);
 };
 function buildSvg(p){
  ui.svg.replaceChildren();
  const bg=svgEl("rect",{x:0,y:0,width:800,height:520,fill:"#FFFFFF","data-part":"background"});
  const areas=svgEl("g",{id:"cs-area-layer",fill:"#FFFFFF",stroke:"#273D4B","stroke-width":7,"stroke-linejoin":"round","stroke-linecap":"round"});
  areas.innerHTML=p.art;
  const defs=svgEl("defs",{id:"cs-defs"});
  const ink=svgEl("g",{id:"cs-ink-layer","pointer-events":"none"});
  const outline=svgEl("g",{id:"cs-outline-layer",fill:"none",stroke:"#273D4B","stroke-width":7,
   "stroke-linejoin":"round","stroke-linecap":"round","pointer-events":"none"});
  outline.innerHTML=p.art;
  for(const el of outline.querySelectorAll("[data-part]")){
   el.removeAttribute("data-part");el.setAttribute("fill","none");
  }
  ui.svg.append(bg,areas,defs,ink,outline);
  for(const el of ui.svg.querySelectorAll("#cs-area-layer [data-part],rect[data-part=background]")){
   const part=el.dataset.part||el.getAttribute("data-part");
   el.setAttribute("role","button");el.setAttribute("tabindex","0");
   el.setAttribute("aria-label","Colour "+part.replaceAll("-"," "));
  }
  ui.svg.setAttribute("aria-label",p.name+" colouring picture");
 }
 const dFor=pts=>{
  if(!pts||!pts.length)return"";
  let d="M "+pts[0].x.toFixed(2)+" "+pts[0].y.toFixed(2);
  if(pts.length===1)d+=" l 0.01 0.01";
  else for(let i=1;i<pts.length;i++)d+=" L "+pts[i].x.toFixed(2)+" "+pts[i].y.toFixed(2);
  return d;
 };
 let segment=0,maskCounter=0;
 function appendStroke(action){
  const ink=$("cs-ink-layer");
  if(!ink)return null;
  const path=svgEl("path",{"d":dFor(action.points),fill:"none","stroke-linejoin":"round",
   "stroke-linecap":"round","stroke-width":action.size});
  if(action.tool==="brush"){
   path.setAttribute("stroke",action.colour);
   if(!segment){segment=svgEl("g");ink.appendChild(segment)}
   segment.appendChild(path);
  }else{
   const defs=$("cs-defs"),maskId="cs-erase-mask-"+(++maskCounter);
   const mask=svgEl("mask",{id:maskId,"maskUnits":"userSpaceOnUse",x:0,y:0,width:800,height:520});
   mask.append(svgEl("rect",{x:0,y:0,width:800,height:520,fill:"white"}));
   path.setAttribute("stroke","black");mask.appendChild(path);defs.appendChild(mask);
   const previous=svgEl("g",{mask:"url(#"+maskId+")"});
   while(ink.firstChild)previous.appendChild(ink.firstChild);
   ink.appendChild(previous);
   segment=svgEl("g");ink.appendChild(segment);
  }
  return path;
 }
 function replay(){
  const bg=ui.svg.querySelector('rect[data-part="background"]');
  if(bg)bg.setAttribute("fill","#FFFFFF");
  for(const el of ui.svg.querySelectorAll("#cs-area-layer [data-part]"))el.setAttribute("fill","#FFFFFF");
  $("cs-defs").replaceChildren();$("cs-ink-layer").replaceChildren();
  segment=null;maskCounter=0;
  for(const a of activeActions()){
   if(a.type==="reset"){
    if(bg)bg.setAttribute("fill","#FFFFFF");
    for(const el of ui.svg.querySelectorAll("#cs-area-layer [data-part]"))el.setAttribute("fill","#FFFFFF");
    $("cs-defs").replaceChildren();$("cs-ink-layer").replaceChildren();
    segment=null;maskCounter=0;
   }else if(a.type==="fill"){
    const el=areaByPart(a.part);if(el)el.setAttribute("fill",a.colour);
   }else if(a.type==="stroke")appendStroke(a);
  }
  ui.undo.disabled=activeActions().length===0;
 }
 function updateMode(){
  for(const [id,button] of [["fill",ui.modeFill],["brush",ui.modeBrush],["eraser",ui.modeErase]]){
   const chosen=mode===id;
   button.setAttribute("aria-pressed",String(chosen));
   button.classList.toggle("cs-mode--active",chosen);
  }
  ui.sizeGroup.hidden=mode==="fill";
  $("cs-size-title").textContent=mode==="eraser"?"Eraser size":"Brush size";
  for(const btn of ui.sizeGroup.querySelectorAll("[data-size]")){
   btn.setAttribute("aria-pressed",String(Number(btn.dataset.size)===widths[mode]));
  }
  ui.instruction.textContent=mode==="fill"?"Choose a colour, then tap an area.":
   mode==="brush"?"Use your finger or Apple Pencil to paint.":"Rub over brush marks to erase them.";
 }
 function setMode(newMode){
  mode=newMode;updateMode();
  setStatus(newMode==="fill"?"Tap any outlined area to colour it.":"");
 }
 ui.modeFill.addEventListener("click",()=>setMode("fill"));
 ui.modeBrush.addEventListener("click",()=>setMode("brush"));
 ui.modeErase.addEventListener("click",()=>setMode("eraser"));
 for(const btn of ui.sizeGroup.querySelectorAll("[data-size]")){
  btn.addEventListener("click",()=>{
   if(mode==="fill")return;
   widths[mode]=Number(btn.dataset.size);updateMode();
  });
 }
 function openPicture(p){
  if(!p)return;
  activeStroke=null;activePointer=null;current=p;lastPicture=p.id;
  ui.gallery.hidden=true;ui.editor.hidden=false;
  ui.pictureName.textContent=p.name;
  buildSvg(p);mode="fill";updateMode();replay();
  setStatus(activeActions().length?"Welcome back! Your colours are here.":"Choose a colour and start!");
  markDirty();
  window.scrollTo?.({top:0,behavior:"instant"});
 }
 ui.back.addEventListener("click",()=>{
  if(activePointer!==null)finishStroke({pointerId:activePointer});
  current=null;ui.editor.hidden=true;ui.gallery.hidden=false;
  ROOT.classList.remove("cs-immersive");ui.expand.setAttribute("aria-pressed","false");
  ui.expand.textContent="⛶ Big canvas";
  drawGallery();markDirty();
  window.scrollTo?.({top:0,behavior:"instant"});
 });
 function tapFill(el){
  if(!current)return;
  const part=el.getAttribute("data-part");
  if(!part)return;
  const currentFill=(el.getAttribute("fill")||"#FFFFFF").toUpperCase();
  if(currentFill===colour.toUpperCase()){setStatus("That area already has this colour.");return}
  const action={type:"fill",part,colour};
  activeActions().push(action);el.setAttribute("fill",colour);
  ui.undo.disabled=false;markDirty();
  setStatus("Lovely colour! Choose another area.");
 }
 ui.svg.addEventListener("click",event=>{
  if(mode!=="fill")return;
  const el=event.target.closest?.("[data-part]");
  if(el&&(el===ui.svg.querySelector('rect[data-part="background"]')||el.closest("#cs-area-layer")))tapFill(el);
 });
 ui.svg.addEventListener("keydown",event=>{
  if(mode!=="fill"||!["Enter"," "].includes(event.key))return;
  const el=event.target.closest?.("[data-part]");
  if(el){event.preventDefault();tapFill(el)}
 });
 function getPosition(event){
  const rect=ui.svg.getBoundingClientRect();
  return {x:Math.max(0,Math.min(800,(event.clientX-rect.left)*800/rect.width)),
   y:Math.max(0,Math.min(520,(event.clientY-rect.top)*520/rect.height))};
 }
 function startStroke(event){
  if(mode==="fill"||activePointer!==null)return;
  if(event.pointerType==="mouse"&&event.button!==0)return;
  event.preventDefault();
  activePointer=event.pointerId;
  try{ui.svg.setPointerCapture(activePointer)}catch(_){}
  activeStroke={type:"stroke",tool:mode,colour,size:widths[mode],points:[getPosition(event)]};
  activeActions().push(activeStroke);
  activePath=appendStroke(activeStroke);
  ui.undo.disabled=false;
 }
 function moveStroke(event){
  if(activePointer!==event.pointerId||!activeStroke)return;
  event.preventDefault();
  const samples=typeof event.getCoalescedEvents==="function"?event.getCoalescedEvents():[event];
  for(const sample of samples.length?samples:[event]){
   const pos=getPosition(sample),last=activeStroke.points[activeStroke.points.length-1];
   if(Math.hypot(pos.x-last.x,pos.y-last.y)<.85)continue;
   if(activeStroke.points.length>=4000)break;
   activeStroke.points.push(pos);
  }
  if(activePath)activePath.setAttribute("d",dFor(activeStroke.points));
 }
 function finishStroke(event){
  if(activePointer!==event.pointerId)return;
  event.preventDefault?.();
  activePointer=null;activeStroke=null;activePath=null;
  markDirty();setStatus("Your picture is being saved…");
 }
 ui.svg.addEventListener("pointerdown",startStroke);
 ui.svg.addEventListener("pointermove",moveStroke);
 ui.svg.addEventListener("pointerup",finishStroke);
 ui.svg.addEventListener("pointercancel",finishStroke);
 ui.svg.addEventListener("lostpointercapture",finishStroke);
 ui.undo.addEventListener("click",()=>{
  if(!current||!activeActions().length)return;
  activeActions().pop();replay();markDirty();setStatus("Last change undone.");
 });
 ui.clear.addEventListener("click",()=>{
  if(!current||!activeActions().length){setStatus("Your picture is already blank.");return}
  if(typeof ui.dialog.showModal==="function")ui.dialog.showModal();
  else if(window.confirm("Start this picture again? You can Undo afterwards."))clearPicture();
 });
 function clearPicture(){
  activeActions().push({type:"reset"});replay();markDirty();
  setStatus("Picture cleared. Tap Undo if you want the colours back.");
 }
 ui.keep.addEventListener("click",()=>ui.dialog.close());
 ui.reset.addEventListener("click",()=>{ui.dialog.close();clearPicture()});
 ui.dialog.addEventListener("click",e=>{if(e.target===ui.dialog)ui.dialog.close()});
 ui.expand.addEventListener("click",()=>{
  const isOpen=ROOT.classList.toggle("cs-immersive");
  ui.expand.textContent=isOpen?"↙ Exit big canvas":"⛶ Big canvas";
  ui.expand.setAttribute("aria-pressed",String(isOpen));
 });
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&ROOT.classList.contains("cs-immersive")){
   ROOT.classList.remove("cs-immersive");ui.expand.textContent="⛶ Big canvas";
   ui.expand.setAttribute("aria-pressed","false");return;
  }
  if(["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName))return;
  if(current&&(event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="z"){
   event.preventDefault();ui.undo.click();
  }
 });
 async function exportPng(){
  if(!current)return;
  const clone=ui.svg.cloneNode(true);
  clone.setAttribute("width","800");clone.setAttribute("height","520");
  const serializer=new XMLSerializer();
  const xml=serializer.serializeToString(clone);
  const blob=new Blob([xml],{type:"image/svg+xml;charset=utf-8"});
  const url=URL.createObjectURL(blob);
  try{
   const image=new Image();
   await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject;image.src=url});
   const out=document.createElement("canvas");
   out.width=1600;out.height=1040;
   const context=out.getContext("2d");
   context.fillStyle="#FFFFFF";context.fillRect(0,0,out.width,out.height);
   context.drawImage(image,0,0,out.width,out.height);
   const png=await new Promise(resolve=>out.toBlob(resolve,"image/png"));
   if(!png)throw new Error("PNG unavailable");
   const imageUrl=URL.createObjectURL(png);
   const anchor=document.createElement("a");
   anchor.href=imageUrl;anchor.download="primary-steps-"+current.id+"-colouring.png";
   document.body.appendChild(anchor);anchor.click();anchor.remove();
   setTimeout(()=>URL.revokeObjectURL(imageUrl),12000);
   setStatus("Picture ready to save to your device.");
  }catch(_){setStatus("Save couldn't finish on this device. Please try again.")}
  finally{URL.revokeObjectURL(url)}
 }
 ui.save.addEventListener("click",exportPng);
 window.addEventListener("pagehide",()=>{if(dirty)persist()});
 document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden"&&dirty)persist()});
 drawTabs();drawGallery();updatePalette();updateMode();loadDrafts();
})();
