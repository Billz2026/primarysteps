/* Shared helpers */
const $ = (sel, root=document)=>root.querySelector(sel);
const $$ = (sel, root=document)=>Array.from(root.querySelectorAll(sel));

function clamp(n, a, b){ return Math.min(b, Math.max(a,n)); }

function speak(text, enabled=true){
  if(!enabled) return;
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.95;
    u.pitch = 1.0;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }catch(e){ /* ignore */ }
}

function beep(type="ok", enabled=true){
  if(!enabled) return;
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = type==="ok" ? 660 : 220;
    g.gain.value = 0.06;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.12);
  }catch(e){ /* ignore */ }
}

function getStars(){
  return Number(localStorage.getItem("ngs_stars")||"0");
}
function setStars(n){
  localStorage.setItem("ngs_stars", String(n));
  $$(".starsCount").forEach(el=>el.textContent = String(n));
}
function addStars(n){
  setStars(getStars()+n);
}

/* Topbar / global */
document.addEventListener("DOMContentLoaded", ()=>{
  setStars(getStars());
  $$(".goHome").forEach(btn=>btn.addEventListener("click", ()=>location.href="index.html"));
  const sToggle = $("#soundToggle");
  if(sToggle){
    const saved = localStorage.getItem("ngs_sound") ?? "on";
    sToggle.checked = saved === "on";
    sToggle.addEventListener("change", ()=>{
      localStorage.setItem("ngs_sound", sToggle.checked ? "on" : "off");
    });
  }
});

function soundOn(){
  return (localStorage.getItem("ngs_sound") ?? "on") === "on";
}

/* Letters game */
function initLetters(){
  const big = $("#letterBig");
  const choices = $("#letterChoices");
  const msg = $("#letterMsg");
  const lvl = $("#letterLevel");
  const lower = $("#letterLower");
  const nextBtn = $("#letterNext");
  const speakBtn = $("#letterSpeak");

  if(!big || !choices) return;

  function alphabet(level){
    if(level==="easy") return "ABCDEFGH";
    if(level==="medium") return "ABCDEFGHIJKLMN";
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  }

  function makeQuestion(){
    msg.textContent = "";
    const pool = alphabet(lvl.value);
    const target = pool[Math.floor(Math.random()*pool.length)];
    const show = lower.checked ? target.toLowerCase() : target;
    big.textContent = show;

    // build 4 options including target
    const opts = new Set([target]);
    while(opts.size < 4){
      opts.add(pool[Math.floor(Math.random()*pool.length)]);
    }
    const arr = Array.from(opts).sort(()=>Math.random()-0.5);

    choices.innerHTML = "";
    arr.forEach(ch=>{
      const b = document.createElement("button");
      b.className = "choice";
      b.type = "button";
      b.textContent = lower.checked ? ch.toLowerCase() : ch;
      b.addEventListener("click", ()=>{
        if(ch === target){
          msg.innerHTML = "<strong>Nice!</strong> That was correct.";
          beep("ok", soundOn());
          addStars(1);
          setTimeout(makeQuestion, 650);
        }else{
          msg.innerHTML = "<strong>Try again — you're close.</strong>";
          beep("bad", soundOn());
        }
      });
      choices.appendChild(b);
    });

    $("#letterTarget").textContent = target;
  }

  [lvl, lower].forEach(el=>el.addEventListener("change", makeQuestion));
  nextBtn?.addEventListener("click", makeQuestion);
  speakBtn?.addEventListener("click", ()=>{
    const t = $("#letterTarget")?.textContent || "";
    if(t) speak(t, soundOn());
  });

  makeQuestion();
}

/* Numbers game */
function initNumbers(){
  const big = $("#numBig");
  const choices = $("#numChoices");
  const msg = $("#numMsg");
  const lvl = $("#numLevel");
  const nextBtn = $("#numNext");

  if(!big || !choices) return;

  function range(level){
    if(level==="easy") return [0,10];
    if(level==="medium") return [0,20];
    return [0,100];
  }

  function makeQuestion(){
    msg.textContent = "";
    const [a,b] = range(lvl.value);
    const target = Math.floor(Math.random()*(b-a+1))+a;
    big.textContent = String(target);

    const opts = new Set([target]);
    while(opts.size<4){
      const v = Math.floor(Math.random()*(b-a+1))+a;
      opts.add(v);
    }
    const arr = Array.from(opts).sort(()=>Math.random()-0.5);

    choices.innerHTML = "";
    arr.forEach(v=>{
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.type = "button";
      btn.textContent = String(v);
      btn.addEventListener("click", ()=>{
        if(v===target){
          msg.innerHTML = "<strong>Correct!</strong> +1 star.";
          beep("ok", soundOn());
          addStars(1);
          setTimeout(makeQuestion, 650);
        }else{
          msg.innerHTML = "<strong>Try again — you're close.</strong>";
          beep("bad", soundOn());
        }
      });
      choices.appendChild(btn);
    });
  }

  lvl?.addEventListener("change", makeQuestion);
  nextBtn?.addEventListener("click", makeQuestion);

  makeQuestion();
}

/* Memory match */
function initMemory(){
  const board = $("#mmBoard");
  const msg = $("#mmMsg");
  const sizeSel = $("#mmSize");
  const resetBtn = $("#mmReset");

  if(!board) return;

  let first = null;
  let lock = false;
  let matched = 0;
  let totalPairs = 0;

  function makeDeck(size){
    const pairs = size==="4x4" ? 8 : 6; // 16 cards or 12 cards
    totalPairs = pairs;
    const symbols = ["🐶","🐱","🦊","🐼","🐸","🐵","🦁","🐷","🐰","🐯","🐨","🦄"];
    const chosen = symbols.slice(0, pairs);
    const deck = [...chosen, ...chosen].sort(()=>Math.random()-0.5);
    return deck;
  }

  function render(){
    matched = 0;
    first = null;
    lock = false;
    msg.textContent = "Flip two cards to find a match.";
    const deck = makeDeck(sizeSel.value);

    board.innerHTML = "";
    const cols = sizeSel.value==="4x4" ? 4 : 4;
    board.style.display = "grid";
    board.style.gridTemplateColumns = `repeat(${cols}, minmax(0, 1fr))`;
    board.style.gap = "10px";

    deck.forEach((sym, i)=>{
      const card = document.createElement("button");
      card.className = "choice";
      card.type = "button";
      card.dataset.sym = sym;
      card.dataset.open = "0";
      card.textContent = "❓";
      card.style.height = "74px";
      card.style.fontSize = "22px";
      card.addEventListener("click", ()=>{
        if(lock) return;
        if(card.dataset.open==="1") return;
        card.dataset.open="1";
        card.textContent = sym;
        beep("ok", soundOn());

        if(!first){
          first = card;
          return;
        }

        // second
        if(first.dataset.sym === card.dataset.sym){
          matched += 1;
          msg.innerHTML = "<strong>Match!</strong>";
          addStars(1);
          first = null;
          if(matched === totalPairs){
            msg.innerHTML = "<strong>You cleared the board!</strong> Great memory.";
            addStars(3);
          }
        }else{
          lock = true;
          msg.innerHTML = "<strong>Not a match.</strong> Try again.";
          beep("bad", soundOn());
          setTimeout(()=>{
            first.dataset.open="0";
            first.textContent="❓";
            card.dataset.open="0";
            card.textContent="❓";
            first=null;
            lock=false;
          }, 650);
        }
      });
      board.appendChild(card);
    });
  }

  sizeSel?.addEventListener("change", render);
  resetBtn?.addEventListener("click", render);

  render();
}

/* Phonics */
function initPhonics(){
  const list = $("#phonicsList");
  const input = $("#phonicsInput");
  const btn = $("#phonicsSpeak");

  if(!list) return;

  const words = [
    {w:"cat", s:"c-a-t"},
    {w:"ship", s:"sh-i-p"},
    {w:"train", s:"tr-ai-n"},
    {w:"phone", s:"ph-o-ne"},
    {w:"night", s:"n-igh-t"},
    {w:"chair", s:"ch-air"},
  ];

  function render(filter=""){
    list.innerHTML="";
    words
      .filter(x=>x.w.includes(filter.toLowerCase()))
      .forEach(x=>{
        const row = document.createElement("div");
        row.className="section";
        row.style.padding="12px 14px";
        row.innerHTML = `
          <div class="row" style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
            <div>
              <div style="font-weight:900;font-size:18px;letter-spacing:.2px">${x.w}</div>
              <div class="small">Sound it out: ${x.s}</div>
            </div>
            <button class="btn secondary" type="button">🔊 Say</button>
          </div>
        `;
        row.querySelector("button").addEventListener("click", ()=> speak(x.w, soundOn()));
        list.appendChild(row);
      });
  }

  input?.addEventListener("input", ()=>render(input.value.trim()));
  btn?.addEventListener("click", ()=>{
    const t = input.value.trim();
    if(t) speak(t, soundOn());
  });

  render();
}

/* Maths */
function initMaths(){
  const op = $("#mathOp");
  const lvl = $("#mathLevel");
  const q = $("#mathQ");
  const a = $("#mathA");
  const check = $("#mathCheck");
  const next = $("#mathNext");
  const msg = $("#mathMsg");

  if(!q || !a) return;

  let current = {x:0,y:0,op:"+"};

  function randInt(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }

  function newQ(){
    msg.textContent = "";
    const L = lvl.value;
    const max = L==="easy"?10 : (L==="medium"?20:100);
    current.op = op.value;
    current.x = randInt(0,max);
    current.y = randInt(0,max);

    if(current.op === "÷"){
      // make divisible
      current.y = randInt(1, L==="easy"?10:(L==="medium"?12:20));
      const r = randInt(0, L==="easy"?10:(L==="medium"?12:20));
      current.x = current.y * r;
    }
    q.textContent = `${current.x} ${current.op} ${current.y} = ?`;
    a.value = "";
    a.focus();
  }

  function answer(){
    let correct;
    if(current.op === "+") correct = current.x + current.y;
    if(current.op === "−") correct = current.x - current.y;
    if(current.op === "×") correct = current.x * current.y;
    if(current.op === "÷") correct = current.x / current.y;

    const got = Number(a.value);
    if(Number.isFinite(got) && got === correct){
      msg.innerHTML = "<strong>Correct!</strong> +1 star.";
      beep("ok", soundOn());
      addStars(1);
      setTimeout(newQ, 650);
    }else{
      msg.innerHTML = `<strong>Not quite.</strong> Hint: try again.`;
      beep("bad", soundOn());
    }
  }

  [op,lvl].forEach(el=>el?.addEventListener("change", newQ));
  check?.addEventListener("click", answer);
  next?.addEventListener("click", newQ);
  a.addEventListener("keydown",(e)=>{ if(e.key==="Enter") answer(); });

  newQ();

  // Clock
  const c = $("#clock");
  const setBtn = $("#clockNew");
  const timeLabel = $("#clockTime");
  const clockMsg = $("#clockMsg");
  if(c && c.getContext){
    const ctx = c.getContext("2d");
    function drawClock(h,m){
      const w = c.width, hgt=c.height;
      ctx.clearRect(0,0,w,hgt);
      const cx=w/2, cy=hgt/2;
      const r=Math.min(cx,cy)-12;

      // face
      ctx.beginPath();
      ctx.arc(cx,cy,r,0,Math.PI*2);
      ctx.strokeStyle="rgba(255,255,255,.25)";
      ctx.lineWidth=4;
      ctx.stroke();

      // marks
      for(let i=0;i<60;i++){
        const ang=(i/60)*Math.PI*2 - Math.PI/2;
        const len = i%5===0 ? 10 : 5;
        const x1=cx+Math.cos(ang)*(r-len);
        const y1=cy+Math.sin(ang)*(r-len);
        const x2=cx+Math.cos(ang)*r;
        const y2=cy+Math.sin(ang)*r;
        ctx.beginPath();
        ctx.moveTo(x1,y1); ctx.lineTo(x2,y2);
        ctx.strokeStyle= i%5===0 ? "rgba(215,179,91,.55)" : "rgba(255,255,255,.18)";
        ctx.lineWidth= i%5===0 ? 3 : 1.5;
        ctx.stroke();
      }

      // hands
      const hourAng = ((h%12)/12)*Math.PI*2 + (m/60)*(Math.PI*2/12) - Math.PI/2;
      const minAng = (m/60)*Math.PI*2 - Math.PI/2;

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(hourAng)*(r*0.52), cy+Math.sin(hourAng)*(r*0.52));
      ctx.strokeStyle="rgba(215,179,91,.85)";
      ctx.lineWidth=6;
      ctx.lineCap="round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx,cy);
      ctx.lineTo(cx+Math.cos(minAng)*(r*0.76), cy+Math.sin(minAng)*(r*0.76));
      ctx.strokeStyle="rgba(255,255,255,.7)";
      ctx.lineWidth=4;
      ctx.lineCap="round";
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx,cy,6,0,Math.PI*2);
      ctx.fillStyle="rgba(215,179,91,.75)";
      ctx.fill();
    }

    let targetH=3, targetM=0;

    function newTime(){
      targetH = Math.floor(Math.random()*12);
      targetM = [0,15,30,45][Math.floor(Math.random()*4)];
      drawClock(targetH, targetM);
      timeLabel.textContent = "What time is it?";
      clockMsg.textContent = "";
      $("#clockInput").value="";
    }

    $("#clockCheck")?.addEventListener("click", ()=>{
      const t = $("#clockInput").value.trim();
      const want = `${String(targetH===0?12:targetH).padStart(2,"0")}:${String(targetM).padStart(2,"0")}`;
      if(t === want){
        clockMsg.innerHTML = "<strong>Correct!</strong> +2 stars.";
        beep("ok", soundOn());
        addStars(2);
        setTimeout(newTime, 650);
      }else{
        clockMsg.innerHTML = `<strong>Try again.</strong> Format: HH:MM (e.g. ${want})`;
        beep("bad", soundOn());
      }
    });

    setBtn?.addEventListener("click", newTime);
    newTime();
  }
}

/* Handwriting trace */
function initHandwriting(){
  const word = $("#hwWord");
  const canvas = $("#hwCanvas");
  const clearBtn = $("#hwClear");
  const nextBtn = $("#hwNext");
  const msg = $("#hwMsg");

  if(!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext("2d");

  // Setup a higher-res canvas for crisp strokes
  function resize(){
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(280 * scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    drawGuide();
  }

  const words = ["cat","dog","ship","tree","star","moon","rain","sun","book","home"];
  let idx = 0;
  let drawing = false;

  function drawGuide(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    // baseline
    ctx.strokeStyle = "rgba(255,255,255,.12)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(18, 200);
    ctx.lineTo(canvas.width/(window.devicePixelRatio||1)-18, 200);
    ctx.stroke();

    // midline
    ctx.beginPath();
    ctx.moveTo(18, 120);
    ctx.lineTo(canvas.width/(window.devicePixelRatio||1)-18, 120);
    ctx.stroke();

    // text
    const w = word.value.trim() || words[idx];
    ctx.fillStyle = "rgba(215,179,91,.25)";
    ctx.font = "96px ui-sans-serif, system-ui";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(w, 18, 190);

    msg.textContent = "Trace the word over the gold guide.";
  }

  function setWord(v){
    word.value = v;
    drawGuide();
  }

  function pointerPos(e){
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left);
    const y = (e.clientY - rect.top);
    return {x,y};
  }

  function start(e){
    drawing = true;
    const {x,y} = pointerPos(e);
    ctx.strokeStyle = "rgba(255,255,255,.85)";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x,y);
  }
  function move(e){
    if(!drawing) return;
    const {x,y} = pointerPos(e);
    ctx.lineTo(x,y);
    ctx.stroke();
  }
  function end(){
    if(!drawing) return;
    drawing = false;
    beep("ok", soundOn());
  }

  canvas.addEventListener("pointerdown", (e)=>{ canvas.setPointerCapture(e.pointerId); start(e); });
  canvas.addEventListener("pointermove", move);
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);

  clearBtn?.addEventListener("click", ()=>{ drawGuide(); });
  nextBtn?.addEventListener("click", ()=>{
    idx = (idx+1)%words.length;
    setWord(words[idx]);
    addStars(1);
  });
  word?.addEventListener("change", drawGuide);
  window.addEventListener("resize", resize);

  // init
  setWord(words[idx]);
  resize();
}
