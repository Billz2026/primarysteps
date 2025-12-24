
/* ---------- Utilities ---------- */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const store = {
  get(key, fallback){
    try{
      const v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    }catch{ return fallback; }
  },
  set(key, val){
    try{ localStorage.setItem(key, JSON.stringify(val)); }catch{}
  }
};

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function uniqueChoices(target, pool, count){
  const picks = new Set([target]);
  while(picks.size < count){
    picks.add(pool[Math.floor(Math.random()*pool.length)]);
  }
  return shuffle(Array.from(picks));
}

/* ---------- Settings ---------- */
const SETTINGS_KEY = "ps_settings_v1";
const PROG_KEY = "ps_progress_v1";

let settings = store.get(SETTINGS_KEY, {
  sound: false,
  difficulty: "medium",
  sessionMode: false,
  reduceMotion: false,
});

let progress = store.get(PROG_KEY, {
  stars: 0,
  sessions: 0,
  correct: 0,
  wrong: 0,
  played: { letters:0, numbers:0, memory:0, phonics:0, maths:0, trace:0 }
});

function applySettings(){
  $("#setSound").checked = settings.sound;
  $("#setDifficulty").value = settings.difficulty;
  $("#setSession").checked = settings.sessionMode;
  $("#setReduceMotion").checked = settings.reduceMotion;

  document.body.classList.toggle("reduceMotion", !!settings.reduceMotion);

  updateTopStars();
  updateProgressUI();
}

function saveSettings(){
  settings.sound = $("#setSound").checked;
  settings.difficulty = $("#setDifficulty").value;
  settings.sessionMode = $("#setSession").checked;
  settings.reduceMotion = $("#setReduceMotion").checked;
  store.set(SETTINGS_KEY, settings);
  applySettings();
}

/* ---------- Speech ---------- */
function speak(text, rate=0.9){
  if(!settings.sound) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate;
    window.speechSynthesis.speak(u);
  }catch{}
}

/* ---------- Navigation ---------- */
function showScreen(name){
  $$(".screen").forEach(s => s.classList.remove("active"));
  const map = {
    home: "#homeScreen",
    letters: "#lettersScreen",
    numbers: "#numbersScreen",
    memory: "#memoryScreen",
    phonics: "#phonicsScreen",
    maths: "#mathsScreen",
    handwriting: "#handwritingScreen",
    progress: "#progressScreen",
    clock: "#clockScreen",
    games: "#gamesScreen",
  };

  const el = $(map[name] || "#homeScreen");
  el.classList.add("active");
  if(name === "progress") updateProgressUI();
  // count sessions when leaving home into an activity (simple heuristic)
}

function navTo(name){
  showScreen(name);
  if(name !== "home"){
    progress.sessions += 1;
    store.set(PROG_KEY, progress);
    updateProgressUI();
  }
}

/* ---------- Stars + Progress ---------- */
function addStar(n=1){
  progress.stars += n;
  store.set(PROG_KEY, progress);
  updateTopStars();
  updateProgressUI();
}
function markCorrect(){
  progress.correct += 1;
  store.set(PROG_KEY, progress);
  updateProgressUI();
}
function markWrong(){
  progress.wrong += 1;
  store.set(PROG_KEY, progress);
  updateProgressUI();
}
function updateTopStars(){
  $("#topStars").textContent = progress.stars;
}
function updateProgressUI(){
  $("#pTotalStars").textContent = progress.stars;
  $("#pSessions").textContent = progress.sessions;
  $("#pCorrect").textContent = progress.correct;
  $("#pDifficulty").textContent = settings.difficulty[0].toUpperCase()+settings.difficulty.slice(1);

  $("#pLetters").textContent = progress.played.letters;
  $("#pNumbers").textContent = progress.played.numbers;
  $("#pMemory").textContent = progress.played.memory;
  $("#pPhonics").textContent = progress.played.phonics;
  $("#pMaths").textContent = progress.played.maths;
  $("#pTrace").textContent = progress.played.trace;

  $("#lettersStars").textContent = progress.stars;
  $("#numbersStars").textContent = progress.stars;
  $("#memoryStars").textContent = progress.stars;
  $("#phonicsStars").textContent = progress.stars;
  $("#mathsStars").textContent = progress.stars;
  if(document.getElementById("clockStars")) $("#clockStars").textContent = progress.stars;
  $("#traceStars").textContent = progress.stars;
}


/* ---------- Home cards wiring ---------- */
/* If a card links to a hash (single-page mode), we intercept and show the screen.
   If it links to a separate .html page, let the browser navigate normally. */
$$("[data-nav]").forEach(a => {
  a.addEventListener("click", (e) => {
    const href = a.getAttribute("href") || "";
    if(href.startsWith("#")){
      e.preventDefault();
      const name = a.getAttribute("data-nav");
      navTo(name);
      if(name === "letters") lettersNewRound();
      if(name === "numbers") numbersNewRound();
      if(name === "memory") memoryNewGame();
      if(name === "phonics") phonicsInit();
      if(name === "maths") mathsInit();
      if(name === "clock") clockInit();
      if(name === "games") gamesInit();
      if(name === "handwriting") traceInit();
    }
  });
});

$("#goHome").addEventListener("click", () => showScreen("home"));
("click", () => showScreen("home"));

/* ---------- Settings modal ---------- */
const backdrop = $("#settingsBackdrop");
$("#openSettings").addEventListener("click", () => backdrop.classList.add("show"));
$("#closeSettings").addEventListener("click", () => backdrop.classList.remove("show"));
backdrop.addEventListener("click", (e) => { if(e.target === backdrop) backdrop.classList.remove("show"); });
$("#saveSettings").addEventListener("click", () => { saveSettings(); backdrop.classList.remove("show"); });

/* ---------- Letters Game ---------- */
const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
let lettersTarget = "A";

function lettersOptionCount(){
  if(settings.difficulty === "easy") return 2;
  if(settings.difficulty === "hard") return 5;
  return 3;
}

function lettersNewRound(){
  progress.played.letters += 1;
  store.set(PROG_KEY, progress);

  const idx = Math.floor(Math.random()*ALPH.length);
  lettersTarget = ALPH[idx];
  $("#lettersTarget").textContent = lettersTarget;
  $("#lettersFeedback").textContent = "";

  const opts = uniqueChoices(lettersTarget, ALPH, lettersOptionCount());
  const wrap = $("#lettersOptions");
  wrap.innerHTML = "";
  opts.forEach(ch => {
    const b = document.createElement("button");
    b.className = "optBtn";
    b.type = "button";
    b.textContent = ch;
    b.addEventListener("click", () => {
      if(ch === lettersTarget){
        $("#lettersFeedback").textContent = "✅ Great job!";
        $("#lettersFeedback").className = "feedback good";
        addStar(1); markCorrect();
        speak(lettersTarget, 0.85);
      }else{
        $("#lettersFeedback").textContent = "❌ Try again";
        $("#lettersFeedback").className = "feedback bad";
        markWrong();
        speak("Try again", 0.9);
      }
    });
    wrap.appendChild(b);
  });
}

$("#lettersNext").addEventListener("click", lettersNewRound);
$("#lettersHear").addEventListener("click", () => speak(lettersTarget, 0.85));

/* ---------- Numbers Game ---------- */
let numbersTarget = 3;

function numbersMax(){
  if(settings.difficulty === "easy") return 5;
  if(settings.difficulty === "hard") return 20;
  return 10;
}

function numbersChoicesCount(){
  if(settings.difficulty === "easy") return 2;
  if(settings.difficulty === "hard") return 4;
  return 3;
}

function numbersNewRound(){
  progress.played.numbers += 1;
  store.set(PROG_KEY, progress);

  const max = numbersMax();
  numbersTarget = 1 + Math.floor(Math.random()*max);

  const obj = "⭐";
  $("#numbersObjects").textContent = obj.repeat(numbersTarget).split("").join(" ");
  $("#numbersFeedback").textContent = "";

  const pool = Array.from({length:max}, (_,i)=>i+1);
  const opts = uniqueChoices(numbersTarget, pool, numbersChoicesCount());
  const wrap = $("#numbersOptions");
  wrap.innerHTML = "";
  opts.forEach(n => {
    const b = document.createElement("button");
    b.className = "optBtn mini";
    b.type = "button";
    b.textContent = n;
    b.addEventListener("click", () => {
      if(n === numbersTarget){
        $("#numbersFeedback").textContent = "✅ Correct!";
        $("#numbersFeedback").className = "feedback good";
        addStar(1); markCorrect();
        speak(String(numbersTarget), 0.9);
      }else{
        $("#numbersFeedback").textContent = "❌ Try again";
        $("#numbersFeedback").className = "feedback bad";
        markWrong();
        speak("Try again", 0.9);
      }
    });
    wrap.appendChild(b);
  });
}

$("#numbersNext").addEventListener("click", numbersNewRound);
$("#numbersHear").addEventListener("click", () => speak("How many?", 0.9));

/* ---------- Memory Match ---------- */
const MEM_EMOJIS = ["🍎","🍌","🍇","🍓","⭐","🌙","🚗","🐶","🐱","⚽","🎈","🧩","🎵","🌈","🦋","🧸"];
let memoryFirst = null;
let memoryLock = false;
let memoryMatches = 0;
let memoryState = []; // {id, val, matched, shown}

function memorySize(){
  // total cards = pairs*2
  if(settings.difficulty === "easy") return 8;   // 4 pairs
  if(settings.difficulty === "hard") return 16;  // 8 pairs
  return 12;                                     // 6 pairs
}

function memoryNewGame(){
  progress.played.memory += 1;
  store.set(PROG_KEY, progress);

  memoryFirst = null;
  memoryLock = false;
  memoryMatches = 0;
  $("#memoryMatches").textContent = "0";
  $("#memoryFeedback").textContent = "";

  const total = memorySize();
  const pairs = total/2;
  const picks = shuffle(MEM_EMOJIS).slice(0, pairs);
  const deck = shuffle([...picks, ...picks]).map((val, idx) => ({
    id: idx,
    val,
    matched: false,
    shown: false
  }));
  memoryState = deck;

  const grid = $("#memoryGrid");
  grid.innerHTML = "";
  // adjust columns
  grid.style.gridTemplateColumns = total === 8 ? "repeat(4, minmax(0,1fr))" :
                                  total === 12 ? "repeat(4, minmax(0,1fr))" :
                                  "repeat(4, minmax(0,1fr))";

  deck.forEach(card => {
    const btn = document.createElement("button");
    btn.className = "memCard";
    btn.type = "button";
    btn.dataset.id = String(card.id);
    btn.textContent = "❓";
    btn.addEventListener("click", () => memoryFlip(card.id));
    grid.appendChild(btn);
  });
}

function memoryRender(){
  memoryState.forEach(c => {
    const btn = document.querySelector(`.memCard[data-id="${c.id}"]`);
    if(!btn) return;
    if(c.matched || c.shown){
      btn.textContent = c.val;
      btn.style.borderColor = c.matched ? "rgba(34,197,94,0.6)" : "var(--line)";
      btn.style.opacity = c.matched ? "0.85" : "1";
    }else{
      btn.textContent = "❓";
      btn.style.borderColor = "var(--line)";
      btn.style.opacity = "1";
    }
  });
  $("#memoryMatches").textContent = String(memoryMatches);
}

function memoryFlip(id){
  if(memoryLock) return;
  const c = memoryState.find(x => x.id === id);
  if(!c || c.matched || c.shown) return;

  c.shown = true;
  memoryRender();

  if(memoryFirst === null){
    memoryFirst = id;
    return;
  }

  const first = memoryState.find(x => x.id === memoryFirst);
  if(!first){ memoryFirst = null; return; }

  memoryLock = true;
  if(first.val === c.val){
    first.matched = true;
    c.matched = true;
    first.shown = false;
    c.shown = false;
    memoryFirst = null;
    memoryLock = false;
    memoryMatches += 1;
    $("#memoryFeedback").textContent = "✅ Match!";
    $("#memoryFeedback").className = "feedback good";
    addStar(1); markCorrect();
    speak("Good job", 0.9);
    memoryRender();
  }else{
    $("#memoryFeedback").textContent = "❌ Not a match";
    $("#memoryFeedback").className = "feedback bad";
    markWrong();
    speak("Try again", 0.9);
    setTimeout(() => {
      first.shown = false;
      c.shown = false;
      memoryFirst = null;
      memoryLock = false;
      memoryRender();
    }, settings.reduceMotion ? 250 : 650);
  }
}

$("#memoryNew").addEventListener("click", memoryNewGame);

/* ---------- Phonics (Blend Builder) ---------- */
let phonicsBuild = [];
const PHONICS_SOUNDS = [
  "s","a","t","p","i","n",
  "m","d","g","o","c","k",
  "e","u","r","h","b","f",
  "l","j","w","v","y","z"
];

const EASY_WORDS = [["c","a","t"],["s","u","n"],["m","a","p"],["d","o","g"],["p","i","n"]];
const MED_WORDS  = [["c","a","t"],["s","u","n"],["m","a","p"],["d","o","g"],["r","u","n"],["h","a","t"],["b","u","s"],["f","o","x"]];
const HARD_WORDS = [["s","t","a","r"],["b","l","a","c","k"],["r","a","i","n"],["s","n","a","p"],["c","l","a","p"],["g","r","i","n"]]; // simple blends

function phonicsWordList(){
  if(settings.difficulty === "easy") return EASY_WORDS;
  if(settings.difficulty === "hard") return HARD_WORDS;
  return MED_WORDS;
}

function phonicsInit(){
  progress.played.phonics += 1;
  store.set(PROG_KEY, progress);

  phonicsBuild = [];
  $("#phonicsFeedback").textContent = "";
  renderPhonicsBuild();
  renderPhonicsSounds();
  $("#phonicsWord").textContent = "—";
}

function renderPhonicsSounds(){
  const wrap = $("#phonicsSounds");
  wrap.innerHTML = "";
  // show fewer sounds on easy
  let sounds = PHONICS_SOUNDS;
  if(settings.difficulty === "easy") sounds = PHONICS_SOUNDS.slice(0, 12);
  if(settings.difficulty === "hard") sounds = PHONICS_SOUNDS;

  sounds.forEach(s => {
    const b = document.createElement("button");
    b.className = "soundBtn";
    b.type = "button";
    b.textContent = s;
    b.addEventListener("click", () => {
      phonicsBuild.push(s);
      renderPhonicsBuild();
      speak(s, 0.85);
    });
    wrap.appendChild(b);
  });
}

function renderPhonicsBuild(){
  const box = $("#phonicsBuild");
  box.innerHTML = "";
  if(phonicsBuild.length === 0){
    const span = document.createElement("span");
    span.className = "hint";
    span.textContent = "Tap sounds to build a word…";
    box.appendChild(span);
    return;
  }
  phonicsBuild.forEach((s, idx) => {
    const t = document.createElement("span");
    t.className = "tile";
    t.textContent = s;
    t.title = "Click to remove";
    t.style.cursor = "pointer";
    t.addEventListener("click", () => {
      phonicsBuild.splice(idx,1);
      renderPhonicsBuild();
    });
    box.appendChild(t);
  });
}

$("#phonicsClear").addEventListener("click", () => {
  phonicsBuild = [];
  $("#phonicsFeedback").textContent = "";
  $("#phonicsWord").textContent = "—";
  renderPhonicsBuild();
});

$("#phonicsBlend").addEventListener("click", () => {
  if(phonicsBuild.length === 0){
    $("#phonicsFeedback").textContent = "Tap some sounds first.";
    $("#phonicsFeedback").className = "feedback warn";
    speak("Tap some sounds first", 0.9);
    return;
  }
  const word = phonicsBuild.join("");
  $("#phonicsWord").textContent = word.toUpperCase();
  speak(word, 0.85);

  // simple validation: if built word matches list for current difficulty, reward
  const valid = phonicsWordList().some(arr => arr.join("") === word);
  if(valid){
    $("#phonicsFeedback").textContent = "✅ Nice blending!";
    $("#phonicsFeedback").className = "feedback good";
    addStar(1); markCorrect();
  }else{
    $("#phonicsFeedback").textContent = "Good try — build one of the simple words above.";
    $("#phonicsFeedback").className = "feedback warn";
  }
});

/* ---------- Maths ---------- */
let mathMode = "add";
let mathAnswer = null;
let mathQuestionText = "";
let timeState = { hour: 3, minute: 0 };

function mathsInit(){
  progress.played.maths += 1;
  store.set(PROG_KEY, progress);
  setMathMode(mathMode);
  nextMath();
}

function setMathMode(mode){
  mathMode = mode;
  $("#mathModeLabel").textContent = mode === "add" ? "Add" :
                                   mode === "sub" ? "Subtract" :
                                   mode === "div" ? "Divide" : (mode === "mul" ? "Multiply" : "Mixed");
  $$("#mathTabs .tab").forEach(t => t.classList.toggle("active", t.dataset.mode === mode));
  $("#mathsFeedback").textContent = "";
  buildMathUI();
  nextMath();
}

function mathRange(){
  if(settings.difficulty === "easy") return {max:10, divMax:5, timeStep: 60};      // o'clock only
  if(settings.difficulty === "hard") return {max:50, divMax:10, timeStep: 5};      // 5-min
  return {max:20, divMax:10, timeStep: 15};                                        // quarters
}

function buildMathUI(){
  const area = $("#mathModeArea");
  area.innerHTML = "";

  const q = document.createElement("div");
  q.className = "questionBig";
  q.innerHTML = `<div class="qText" id="mathQuestion">—</div>`;

  const opts = document.createElement("div");
  opts.className = "options";
  opts.id = "mathOptions";

  area.appendChild(q);
  area.appendChild(opts);

  // attach tab listeners (once)
  $$("#mathTabs .tab").forEach(btn => {
    btn.onclick = () => setMathMode(btn.dataset.mode);
  });
}

function drawClockTo(canvasId, hour, minute){
  const c = document.getElementById(canvasId);
  if(!c) return;
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;
  const cx = w/2, cy = h/2;
  const r = Math.min(cx,cy) - 10;

  ctx.clearRect(0,0,w,h);

  // face
  ctx.beginPath();
  ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#e2e8f0";
  ctx.stroke();

  // ticks
  for(let i=0;i<60;i++){
    const ang = (Math.PI*2)*(i/60) - Math.PI/2;
    const inner = r - (i%5===0 ? 16 : 9);
    const outer = r - 2;
    ctx.beginPath();
    ctx.moveTo(cx + inner*Math.cos(ang), cy + inner*Math.sin(ang));
    ctx.lineTo(cx + outer*Math.cos(ang), cy + outer*Math.sin(ang));
    ctx.strokeStyle = (i%5===0) ? "#94a3b8" : "#cbd5e1";
    ctx.lineWidth = (i%5===0) ? 3 : 2;
    ctx.stroke();
  }

  // numbers 12,3,6,9
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const positions = [["12",0],["3",90],["6",180],["9",270]];
  positions.forEach(([txt,deg])=>{
    const ang = (Math.PI/180)*deg - Math.PI/2;
    const rr = r - 36;
    ctx.fillText(txt, cx + rr*Math.cos(ang), cy + rr*Math.sin(ang));
  });

  // hands
  const minAng = (Math.PI*2)*(minute/60) - Math.PI/2;
  const hourVal = (hour%12) + minute/60;
  const hourAng = (Math.PI*2)*(hourVal/12) - Math.PI/2;

  // hour
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.lineTo(cx + (r*0.52)*Math.cos(hourAng), cy + (r*0.52)*Math.sin(hourAng));
  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.stroke();

  // minute
  ctx.beginPath();
  ctx.moveTo(cx,cy);
  ctx.lineTo(cx + (r*0.74)*Math.cos(minAng), cy + (r*0.74)*Math.sin(minAng));
  ctx.strokeStyle = "#2f80ed";
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.stroke();

  // center dot
  ctx.beginPath();
  ctx.arc(cx,cy,6,0,Math.PI*2);
  ctx.fillStyle = "#0f172a";
  ctx.fill();
}

function formatTime(h, m){
  const hh = ((h%12)===0 ? 12 : (h%12));
  const mm = String(m).padStart(2,"0");
  return `${hh}:${mm}`;
}

function nextMath(){
  $("#mathsFeedback").textContent = "";
  const range = mathRange();

  if(mathMode === "mix"){
    const modes = ["add","sub","mul","div"];
    mathMode = modes[Math.floor(Math.random()*modes.length)];
    $("#mathModeLabel").textContent = "Mixed";
  }

  const max = range.max;
  let a = 1 + Math.floor(Math.random()*max);
  let b = 1 + Math.floor(Math.random()*max);

  if(mathMode === "add"){
    mathAnswer = a + b;
    mathQuestionText = `${a} + ${b} = ?`;
  }else if(mathMode === "sub"){
    // ensure non-negative for easy/medium
    if(settings.difficulty !== "hard" && b > a){ [a,b] = [b,a]; }
    mathAnswer = a - b;
    mathQuestionText = `${a} − ${b} = ?`;
  }else if(mathMode === "mul"){
    mathAnswer = a * b;
    mathQuestionText = `${a} × ${b} = ?`;
  }else if(mathMode === "div"){
    // create clean division: (d * q) ÷ d = q
    const dMax = range.divMax;
    const d = 2 + Math.floor(Math.random()*(dMax-1));
    const q = 1 + Math.floor(Math.random()*dMax);
    const n = d*q;
    mathAnswer = q;
    mathQuestionText = `${n} ÷ ${d} = ?`;
  }

  $("#mathQuestion").textContent = mathQuestionText;

  // option count
  const optCount = settings.difficulty === "easy" ? 2 : (settings.difficulty === "hard" ? 4 : 3);
  const pool = [];
  for(let i=Math.max(0, mathAnswer-10); i<=mathAnswer+10; i++) pool.push(i);
  const opts = uniqueChoices(mathAnswer, pool, optCount).map(x => Math.max(0, x));

  const wrap = $("#mathOptions");
  wrap.innerHTML = "";
  opts.forEach(n => {
    const b = document.createElement("button");
    b.className = "optBtn mini";
    b.type = "button";
    b.textContent = n;
    b.addEventListener("click", () => {
      if(n === mathAnswer){
        $("#mathsFeedback").textContent = "✅ Correct!";
        $("#mathsFeedback").className = "feedback good";
        addStar(1); markCorrect();
        speak("Correct", 0.9);
      }else{
        $("#mathsFeedback").textContent = "❌ Try again";
        $("#mathsFeedback").className = "feedback bad";
        markWrong();
        speak("Try again", 0.9);
      }
    });
    wrap.appendChild(b);
  });
}

$("#mathsNext").addEventListener("click", nextMath);
$("#mathsHear").addEventListener("click", () => speak(mathQuestionText || "Maths", 0.9));

/* ---------- Clock (Analogue Time) ---------- */
let clockLevel = "oclock";
let clockAnswer = null;
let clockText = "What time is it?";

function clockInit(){
  $("#clockStars").textContent = progress.stars;
  $("#clockFeedback").textContent = "";
  setClockLevel(bestClockLevelForDifficulty());
  clockNext();
}

function bestClockLevelForDifficulty(){
  if(settings.difficulty === "easy") return "oclock";
  if(settings.difficulty === "hard") return "five";
  return "quarter";
}

function levelToLabel(lvl){
  return lvl === "oclock" ? "O’clock" :
         lvl === "half" ? "Half past" :
         lvl === "quarter" ? "Quarter past/to" : "5‑minute";
}

function allowedMinutesForLevel(lvl){
  if(lvl === "oclock") return [0];
  if(lvl === "half") return [0,30];
  if(lvl === "quarter") return [0,15,30,45];
  // five
  const mins = [];
  for(let m=0;m<60;m+=5) mins.push(m);
  return mins;
}

function formatTime(h, m){
  const hh = ((h%12)===0 ? 12 : (h%12));
  const mm = String(m).padStart(2,"0");
  return `${hh}:${mm}`;
}

function clockNext(){
  progress.played.maths += 1; // keep time practice counted under maths bucket for now
  store.set(PROG_KEY, progress);

  $("#clockStars").textContent = progress.stars;
  $("#clockFeedback").textContent = "";

  const minutes = allowedMinutesForLevel(clockLevel);
  const minute = minutes[Math.floor(Math.random()*minutes.length)];
  const hour = 1 + Math.floor(Math.random()*12);

  drawClockTo("clockCanvas2", hour, minute);
  const correct = formatTime(hour, minute);
  clockAnswer = correct;
  clockText = "What time is it?";

  $("#clockLevelLabel").textContent = levelToLabel(clockLevel);
  $("#clockQuestion").textContent = "What time is it?";
  $("#clockHint").textContent = `Choose the correct time (${levelToLabel(clockLevel)}).`;

  const opts = new Set([correct]);
  while(opts.size < 3){
    const h2 = 1 + Math.floor(Math.random()*12);
    const m2 = minutes[Math.floor(Math.random()*minutes.length)];
    opts.add(formatTime(h2, m2));
  }
  const arr = shuffle(Array.from(opts));
  const wrap = $("#clockOptions");
  wrap.innerHTML = "";
  arr.forEach(t => {
    const b = document.createElement("button");
    b.className = "optBtn mini";
    b.type = "button";
    b.textContent = t;
    b.addEventListener("click", () => {
      if(t === clockAnswer){
        $("#clockFeedback").textContent = "✅ Correct time!";
        $("#clockFeedback").className = "feedback good";
        addStar(1); markCorrect();
        speak("Correct", 0.9);
      } else {
        $("#clockFeedback").textContent = "❌ Try again";
        $("#clockFeedback").className = "feedback bad";
        markWrong();
        speak("Try again", 0.9);
      }
    });
    wrap.appendChild(b);
  });
}

function setClockLevel(level){
  clockLevel = level;
  $$("#clockTabs .tab").forEach(t => t.classList.toggle("active", t.dataset.level === level));
  $("#clockLevelLabel").textContent = levelToLabel(level);
}

$("#clockNext").addEventListener("click", clockNext);
$("#clockHear").addEventListener("click", () => speak(clockText, 0.9));
$$("#clockTabs .tab").forEach(btn => {
  btn.addEventListener("click", () => {
    setClockLevel(btn.dataset.level);
    clockNext();
  });
});

/* ---------- Handwriting (Tracing) ---------- */
const traceCanvas = $("#traceCanvas");
const tctx = traceCanvas.getContext("2d", { willReadFrequently: false });

let traceTarget = "A";
const TRACE_TARGETS = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","cat","sun","map","dog","hat","run"];

let penSize = 6;
let toolMode = "pen"; // pen | eraser
let isPointerDown = false;
let lastPoint = null;
let undoStack = []; // ImageData snapshots

function setPenSize(size){
  penSize = size;
  $$("#penSizeSeg button").forEach(b => b.classList.toggle("active", Number(b.dataset.size) === size));
}
function setToolMode(mode){
  toolMode = mode;
  $$("#toolSeg button").forEach(b => b.classList.toggle("active", b.dataset.tool === mode));
}

function pushUndo(){
  try{
    const img = tctx.getImageData(0,0,traceCanvas.width, traceCanvas.height);
    undoStack.push(img);
    if(undoStack.length > 15) undoStack.shift();
  }catch{}
}
function undo(){
  const img = undoStack.pop();
  if(!img) return;
  tctx.putImageData(img, 0, 0);
}

function resizeTraceForDevice(){
  const rect = traceCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  traceCanvas.width = Math.floor(rect.width * dpr);
  traceCanvas.height = Math.floor(rect.height * dpr);
  tctx.setTransform(dpr,0,0,dpr,0,0);
  drawTraceGuide();
}

function guideSvgForTarget(target){
  const upper = target.toUpperCase();
  const isWord = upper.length > 1;
  const fontSize = isWord ? 120 : 190;

  const baseline = `
    <line x1="60" y1="235" x2="840" y2="235"
      stroke="#cbd5e1" stroke-width="5" stroke-dasharray="12 10" stroke-linecap="round" opacity="0.65" />
  `;

  const textOutline = `
    <text x="450" y="175" text-anchor="middle"
      font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif"
      font-size="${fontSize}" font-weight="900"
      fill="none" stroke="#0f172a" stroke-width="14"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="12 12" opacity="0.85">${upper}</text>
    <text x="450" y="175" text-anchor="middle"
      font-family="Arial Rounded MT Bold, Arial, Helvetica, sans-serif"
      font-size="${fontSize}" font-weight="900"
      fill="none" stroke="#2f80ed" stroke-width="8"
      stroke-linecap="round" stroke-linejoin="round"
      stroke-dasharray="12 12" opacity="0.28">${upper}</text>
  `;

  const startDot = isWord
    ? `<circle cx="260" cy="175" r="10" fill="#22c55e" opacity="0.55" />`
    : `<circle cx="320" cy="210" r="10" fill="#22c55e" opacity="0.55" />`;

  return `
    <defs>
      <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feColorMatrix in="blur" type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.35 0" result="glow"/>
        <feMerge>
          <feMergeNode in="glow"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <g filter="url(#softGlow)">
      ${baseline}
      ${textOutline}
      ${startDot}
    </g>
  `;
}

function drawTraceGuide(){
  tctx.clearRect(0,0,traceCanvas.width, traceCanvas.height);

  const svg = document.getElementById("traceGuideSvg");
  if(svg) svg.innerHTML = guideSvgForTarget(traceTarget);

  $("#traceTarget").textContent = traceTarget;
  $("#traceFeedback").textContent = "";
  $("#traceFeedback").className = "feedback";
  undoStack = [];
  pushUndo();
}

function traceInit(){
  progress.played.trace += 1;
  store.set(PROG_KEY, progress);

  traceTarget = TRACE_TARGETS[Math.floor(Math.random()*TRACE_TARGETS.length)];
  setTimeout(resizeTraceForDevice, 70);
}

function getPointFromEvent(e){
  const rect = traceCanvas.getBoundingClientRect();
  return { x: (e.clientX - rect.left), y: (e.clientY - rect.top) };
}

function beginStroke(e){
  if(e.pointerType === "mouse" && e.button !== 0) return;
  isPointerDown = true;
  lastPoint = getPointFromEvent(e);
  traceCanvas.setPointerCapture?.(e.pointerId);
  pushUndo();
  e.preventDefault();
}
function drawStroke(e){
  if(!isPointerDown) return;
  const p = getPointFromEvent(e);

  tctx.save();
  tctx.lineCap = "round";
  tctx.lineJoin = "round";

  if(toolMode === "eraser"){
    tctx.globalCompositeOperation = "destination-out";
    tctx.strokeStyle = "rgba(0,0,0,1)";
    tctx.lineWidth = penSize * 2.2;
  } else {
    tctx.globalCompositeOperation = "source-over";
    tctx.strokeStyle = "#2f80ed";
    tctx.shadowColor = "rgba(47,128,237,0.35)";
    tctx.shadowBlur = 10;
    tctx.lineWidth = penSize;
  }

  tctx.beginPath();
  tctx.moveTo(lastPoint.x, lastPoint.y);
  tctx.lineTo(p.x, p.y);
  tctx.stroke();
  tctx.restore();

  lastPoint = p;
  e.preventDefault();
}
function endStroke(e){
  if(!isPointerDown) return;
  isPointerDown = false;
  lastPoint = null;
  try{ traceCanvas.releasePointerCapture?.(e.pointerId); }catch{}
  e.preventDefault();
}

traceCanvas.addEventListener("pointerdown", beginStroke);
traceCanvas.addEventListener("pointermove", drawStroke);
traceCanvas.addEventListener("pointerup", endStroke);
traceCanvas.addEventListener("pointercancel", endStroke);
traceCanvas.addEventListener("contextmenu", (e) => e.preventDefault());

$("#traceUndo").addEventListener("click", undo);
$("#traceClear").addEventListener("click", drawTraceGuide);
$("#traceNext").addEventListener("click", () => {
  traceTarget = TRACE_TARGETS[Math.floor(Math.random()*TRACE_TARGETS.length)];
  drawTraceGuide();
});
$("#traceHear").addEventListener("click", () => speak(traceTarget, 0.85));
$("#traceDone").addEventListener("click", () => {
  $("#traceFeedback").textContent = "✅ Well done!";
  $("#traceFeedback").className = "feedback good";
  addStar(1); markCorrect();
  speak("Well done", 0.9);
});

$$("#penSizeSeg button").forEach(b => b.addEventListener("click", () => setPenSize(Number(b.dataset.size))));
$$("#toolSeg button").forEach(b => b.addEventListener("click", () => setToolMode(b.dataset.tool)));

setPenSize(6);
setToolMode("pen");

/* ---------- Progress reset ---------- */
$("#resetProgress").addEventListener("click", () => {
  if(!confirm("Reset all progress on this device?")) return;
  progress = {
    stars: 0,
    sessions: 0,
    correct: 0,
    wrong: 0,
    played: { letters:0, numbers:0, memory:0, phonics:0, maths:0, trace:0 }
  };
  store.set(PROG_KEY, progress);
  updateTopStars();
  updateProgressUI();
  speak("Progress reset", 0.95);
});

/* ---------- Session Mode (gentle) ---------- */
function runSession(){
  // optional guided session: letters -> numbers -> phonics -> maths -> memory
  // We'll keep it simple: auto advance only when user presses Next in each section.
  // If enabled, we show a small hint.
  // (This avoids timers, which can stress some kids.)
  // You can expand this later.
}

/* ---------- Games ---------- */
let currentGame = "connect4";

/* Money (UK) */
let moneyMode = "easy"; // easy | medium | hard
let moneyTarget = 0;    // pence
let moneyTotal = 0;     // pence
let moneyStack = [];    // list of pence added (for undo)

const UK_MONEY = [
  {p:1,   label:"1p",   cls:"coin-1p",  type:"coin", size:"small"},
  {p:2,   label:"2p",   cls:"coin-2p",  type:"coin", size:"small"},
  {p:5,   label:"5p",   cls:"coin-5p",  type:"coin", size:"small"},
  {p:10,  label:"10p",  cls:"coin-10p", type:"coin"},
  {p:20,  label:"20p",  cls:"coin-20p", type:"coin"},
  {p:50,  label:"50p",  cls:"coin-50p", type:"coin"},
  {p:100, label:"£1",   cls:"coin-100p",type:"coin"},
  {p:200, label:"£2",   cls:"coin-200p",type:"coin"},
  {p:500, label:"£5",   cls:"note-500", type:"note"},
  {p:1000,label:"£10",  cls:"note-1000",type:"note"},
];

function moneyAllowed(){
  if(moneyMode === "easy"){
    // keep it simple + recognisable
    return UK_MONEY.filter(x => [1,2,5,10,20,50,100].includes(x.p));
  }
  if(moneyMode === "medium"){
    return UK_MONEY.filter(x => [1,2,5,10,20,50,100,200].includes(x.p));
  }
  // hard includes notes
  return UK_MONEY.filter(x => [1,2,5,10,20,50,100,200,500,1000].includes(x.p));
}

function formatGBP(pence){
  const pounds = Math.floor(pence / 100);
  const pennies = pence % 100;
  return `£${pounds}.${String(pennies).padStart(2,"0")}`;
}

function moneyNewTarget(){
  moneyTotal = 0;
  moneyStack = [];
  // Target ranges by mode
  if(moneyMode === "easy"){
    // 5p to £1.00 in 5p steps (with a few penny targets too)
    const opts = [];
    for(let p=5; p<=100; p+=5) opts.push(p);
    opts.push(1,2,3,4,6,7,8,9,11,12); // sprinkle small pennies
    moneyTarget = opts[Math.floor(Math.random()*opts.length)];
  } else if(moneyMode === "medium"){
    // 20p to £5.00 in 5p steps
    const opts = [];
    for(let p=20; p<=500; p+=5) opts.push(p);
    moneyTarget = opts[Math.floor(Math.random()*opts.length)];
  } else {
    // £1.00 to £20.00 in 10p steps
    const opts = [];
    for(let p=100; p<=2000; p+=10) opts.push(p);
    moneyTarget = opts[Math.floor(Math.random()*opts.length)];
  }
}

function moneyAdd(pence){
  moneyStack.push(pence);
  moneyTotal += pence;
}

function moneyUndo(){
  const last = moneyStack.pop();
  if(last == null) return;
  moneyTotal -= last;
  if(moneyTotal < 0) moneyTotal = 0;
}

function moneyClear(){
  moneyStack = [];
  moneyTotal = 0;
}

function moneyCheck(){
  if(moneyTotal === moneyTarget){
    // reward 1 star for learning game
    addStar(1); markCorrect();
    speak("Well done", 0.9);
    return {ok:true};
  }
  if(moneyTotal > moneyTarget){
    markWrong();
    speak("Too much", 0.95);
    return {over:true};
  }
  markWrong();
  speak("Add a bit more", 0.95);
  return {under:true};
}


function showClink(container, text){
  if(settings.reduceMotion) return;
  const r = container.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "clink";
  el.textContent = text || "Clink!";
  el.style.left = (r.left + r.width*0.5 + window.scrollX) + "px";
  el.style.top  = (r.top + r.height*0.35 + window.scrollY) + "px";
  document.body.appendChild(el);
  setTimeout(()=> el.remove(), 560);
}


/* Connect 4 */
const C4_COLS = 7, C4_ROWS = 6;
let c4Board = []; // [row][col] = 0 empty, 1 red, 2 yellow
let c4Turn = 1;
let c4Over = false;

function c4Reset(){
  c4Board = Array.from({length:C4_ROWS}, () => Array(C4_COLS).fill(0));
  c4Turn = 1;
  c4Over = false;
}

function c4Drop(col){
  if(c4Over) return;
  for(let r=C4_ROWS-1; r>=0; r--){
    if(c4Board[r][col] === 0){
      c4Board[r][col] = c4Turn;
      if(c4CheckWin(r,col,c4Turn)){
        c4Over = true;
        return {win:c4Turn};
      }
      if(c4Board.every(row => row.every(v => v!==0))){
        c4Over = true;
        return {draw:true};
      }
      c4Turn = (c4Turn===1)?2:1;
      return {ok:true};
    }
  }
  return {full:true};
}

function c4CheckWin(r,c,player){
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for(const [dr,dc] of dirs){
    let count = 1;
    count += c4CountDir(r,c,dr,dc,player);
    count += c4CountDir(r,c,-dr,-dc,player);
    if(count >= 4) return true;
  }
  return false;
}
function c4CountDir(r,c,dr,dc,player){
  let cnt = 0;
  let rr = r+dr, cc = c+dc;
  while(rr>=0 && rr<C4_ROWS && cc>=0 && cc<C4_COLS && c4Board[rr][cc]===player){
    cnt++; rr+=dr; cc+=dc;
  }
  return cnt;
}

/* Mini Tetris (simple) */
let tetris = {
  cols: 10, rows: 18, cell: 18,
  grid: [],
  piece: null,
  x: 3, y: 0,
  dropMs: 650,
  last: 0,
  running: false,
  score: 0
};

const TETRIS_SHAPES = [
  [[1,1,1,1]],                 // I
  [[1,1],[1,1]],               // O
  [[0,1,0],[1,1,1]],           // T
  [[1,0,0],[1,1,1]],           // J
  [[0,0,1],[1,1,1]],           // L
  [[0,1,1],[1,1,0]],           // S
  [[1,1,0],[0,1,1]],           // Z
];

function tetrisReset(){
  tetris.grid = Array.from({length:tetris.rows}, ()=>Array(tetris.cols).fill(0));
  tetris.score = 0;
  tetris.running = false;
  tetrisSpawn();
}

function tetrisSpawn(){
  tetris.piece = shuffle(TETRIS_SHAPES)[0].map(row=>row.slice());
  tetris.x = Math.floor((tetris.cols - tetris.piece[0].length)/2);
  tetris.y = 0;
  if(tetrisCollides(tetris.x,tetris.y,tetris.piece)){
    tetris.running = false;
  }
}

function tetrisRotate(mat){
  const h = mat.length, w = mat[0].length;
  const out = Array.from({length:w}, ()=>Array(h).fill(0));
  for(let r=0;r<h;r++){
    for(let c=0;c<w;c++){
      out[c][h-1-r] = mat[r][c];
    }
  }
  return out;
}

function tetrisCollides(nx, ny, piece){
  for(let r=0;r<piece.length;r++){
    for(let c=0;c<piece[0].length;c++){
      if(!piece[r][c]) continue;
      const x = nx + c, y = ny + r;
      if(x<0 || x>=tetris.cols || y>=tetris.rows) return true;
      if(y>=0 && tetris.grid[y][x]) return true;
    }
  }
  return false;
}

function tetrisMerge(){
  for(let r=0;r<tetris.piece.length;r++){
    for(let c=0;c<tetris.piece[0].length;c++){
      if(tetris.piece[r][c]){
        const y = tetris.y + r;
        const x = tetris.x + c;
        if(y>=0 && y<tetris.rows && x>=0 && x<tetris.cols){
          tetris.grid[y][x] = 1;
        }
      }
    }
  }
}

function tetrisClearLines(){
  let cleared = 0;
  for(let r=tetris.rows-1; r>=0; r--){
    if(tetris.grid[r].every(v=>v===1)){
      tetris.grid.splice(r,1);
      tetris.grid.unshift(Array(tetris.cols).fill(0));
      cleared++;
      r++;
    }
  }
  if(cleared){
    tetris.score += cleared * 10;
  }
}

function tetrisStep(){
  if(!tetris.running) return;
  if(!tetrisCollides(tetris.x, tetris.y+1, tetris.piece)){
    tetris.y += 1;
  }else{
    tetrisMerge();
    tetrisClearLines();
    tetrisSpawn();
  }
}

function tetrisDraw(){
  const c = document.getElementById("tetrisCanvas");
  if(!c) return;
  const ctx = c.getContext("2d");
  const w = c.width, h = c.height;
  ctx.clearRect(0,0,w,h);

  const cs = tetris.cell;
  // background grid subtle
  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.strokeStyle = "#94a3b8";
  for(let x=0; x<=tetris.cols; x++){
    ctx.beginPath(); ctx.moveTo(x*cs,0); ctx.lineTo(x*cs,tetris.rows*cs); ctx.stroke();
  }
  for(let y=0; y<=tetris.rows; y++){
    ctx.beginPath(); ctx.moveTo(0,y*cs); ctx.lineTo(tetris.cols*cs,y*cs); ctx.stroke();
  }
  ctx.restore();

  // settled blocks
  for(let r=0;r<tetris.rows;r++){
    for(let c2=0;c2<tetris.cols;c2++){
      if(tetris.grid[r][c2]) drawBlock(ctx, c2, r);
    }
  }
  // active piece
  if(tetris.piece){
    for(let r=0;r<tetris.piece.length;r++){
      for(let c2=0;c2<tetris.piece[0].length;c2++){
        if(tetris.piece[r][c2]) drawBlock(ctx, tetris.x+c2, tetris.y+r);
      }
    }
  }
}

function drawBlock(ctx, x, y){
  const cs = tetris.cell;
  const px = x*cs, py = y*cs;
  ctx.save();
  // 3D block look
  const grad = ctx.createLinearGradient(px, py, px+cs, py+cs);
  grad.addColorStop(0, "rgba(255,255,255,0.55)");
  grad.addColorStop(0.35, "rgba(47,128,237,0.95)");
  grad.addColorStop(1, "rgba(15,23,42,0.95)");
  ctx.fillStyle = grad;
  ctx.fillRect(px+1, py+1, cs-2, cs-2);
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.strokeRect(px+1, py+1, cs-2, cs-2);
  ctx.restore();
}

function tetrisLoop(ts){
  if(!tetris.running) return;
  if(ts - tetris.last > tetris.dropMs){
    tetris.last = ts;
    tetrisStep();
    updateTetrisUI();
  }
  tetrisDraw();
  requestAnimationFrame(tetrisLoop);
}

function tetrisStart(){
  if(tetris.running) return;
  tetris.running = true;
  tetris.last = performance.now();
  requestAnimationFrame(tetrisLoop);
}
function tetrisPause(){
  tetris.running = false;
}

function updateTetrisUI(){
  const el = document.getElementById("tetrisScore");
  if(el) el.textContent = String(tetris.score);
}

/* Render Games UI */
function renderGames(){
  const area = document.getElementById("gameArea");
  if(!area) return;

  if(currentGame === "connect4"){
    area.innerHTML = `
      <div class="gameShell">
        <div class="gameHeaderBar">
          <div class="pill">Turn: <strong>${c4Turn===1 ? "Red" : "Yellow"}</strong></div>
          <div class="row">
            <button class="btn ghost" id="c4Reset">New Game</button>
          </div>
        </div>

        <div class="gameBoard">
          <div class="c4Grid" id="c4Grid"></div>
        </div>
        <div id="c4Msg" class="feedback" aria-live="polite"></div>
      </div>
    `;

    const grid = document.getElementById("c4Grid");
    for(let r=0;r<C4_ROWS;r++){
      for(let c=0;c<C4_COLS;c++){
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "c4Cell";
        const v = c4Board[r][c];
        if(v===1) btn.classList.add("red");
        if(v===2) btn.classList.add("yellow");
        btn.addEventListener("click", () => {
          const res = c4Drop(c);
          renderGames();
          const msg = document.getElementById("c4Msg");
          if(res?.win){
            msg.textContent = res.win===1 ? "✅ Red wins!" : "✅ Yellow wins!";
            msg.className = "feedback good";
            speak("Well done", 0.9);
          }else if(res?.draw){
            msg.textContent = "🤝 Draw";
            msg.className = "feedback warn";
          }else if(res?.full){
            msg.textContent = "That column is full.";
            msg.className = "feedback warn";
          }
        });
        grid.appendChild(btn);
      }
    }

    document.getElementById("c4Reset").addEventListener("click", () => {
      c4Reset(); renderGames();
      const msg = document.getElementById("c4Msg");
      msg.textContent = "";
      msg.className = "feedback";
    });

    if(c4Over){
      const msg = document.getElementById("c4Msg");
      if(!msg.textContent){
        msg.textContent = "Game over.";
        msg.className = "feedback warn";
      }
    }

  } else if(currentGame === "tetris") {
    area.innerHTML = `
      <div class="gameShell">
        <div class="gameHeaderBar">
          <div class="pill">Score: <strong id="tetrisScore">${tetris.score}</strong></div>
          <div class="row">
            <button class="btn ghost" id="tStart">Start</button>
            <button class="btn ghost" id="tPause">Pause</button>
            <button class="btn ghost" id="tReset">Reset</button>
          </div>
        </div>

        <div class="tetrisWrap">
          <canvas id="tetrisCanvas" width="${tetris.cols*tetris.cell}" height="${tetris.rows*tetris.cell}"></canvas>

          <div class="tetrisControls" aria-label="Tetris controls">
            <button class="tBtn" id="tLeft">⬅️</button>
            <button class="tBtn" id="tRotate">🔄</button>
            <button class="tBtn" id="tRight">➡️</button>
            <button class="tBtn" id="tDown">⬇️</button>
            <button class="tBtn" id="tDrop">⏬</button>
            <button class="tBtn" id="tNew">✨ New Piece</button>
          </div>
        </div>
        <div class="hint">Controls: use the buttons (touch-friendly). No fast flashing. You can pause anytime.</div>
      </div>
    `;

    // wire controls
    const move = (dx,dy)=>{
      if(!tetris.running) return;
      if(!tetrisCollides(tetris.x+dx, tetris.y+dy, tetris.piece)){
        tetris.x += dx; tetris.y += dy;
      }
      tetrisDraw();
    };
    document.getElementById("tStart").onclick = ()=>tetrisStart();
    document.getElementById("tPause").onclick = ()=>tetrisPause();
    document.getElementById("tReset").onclick = ()=>{ tetrisReset(); updateTetrisUI(); tetrisDraw(); };
    document.getElementById("tLeft").onclick = ()=>move(-1,0);
    document.getElementById("tRight").onclick = ()=>move(1,0);
    document.getElementById("tDown").onclick = ()=>{ tetrisStep(); updateTetrisUI(); tetrisDraw(); };

    document.getElementById("tDrop").onclick = ()=>{
      if(!tetris.running) return;
      while(!tetrisCollides(tetris.x, tetris.y+1, tetris.piece)){
        tetris.y += 1;
      }
      tetrisStep(); updateTetrisUI(); tetrisDraw();
    };

    document.getElementById("tRotate").onclick = ()=>{
      if(!tetris.running) return;
      const rot = tetrisRotate(tetris.piece);
      if(!tetrisCollides(tetris.x, tetris.y, rot)) tetris.piece = rot;
      tetrisDraw();
    };
    document.getElementById("tNew").onclick = ()=>{
      if(!tetris.running) return;
      tetrisSpawn(); tetrisDraw();
    };

    // touch: prevent scroll on canvas
    const c = document.getElementById("tetrisCanvas");
    c.addEventListener("touchmove", (e)=>e.preventDefault(), {passive:false});
    tetrisDraw();
  } else if(currentGame === "money") {
    // Money game (UK)
    area.innerHTML = `
      <div class="moneyWrap">
        <div class="moneyTop">
          <div class="moneyTarget">
            <div>
              <div class="label">Make this amount</div>
              <div class="value" id="moneyTargetText">${formatGBP(moneyTarget)}</div>
              <div class="sub">Tap coins/notes to add them to the piggy bank.</div>
            </div>
            <div class="seg" id="moneyModeSeg" aria-label="Money difficulty">
              <button type="button" data-mode="easy">Easy</button>
              <button type="button" data-mode="medium">Medium</button>
              <button type="button" data-mode="hard">Hard</button>
            </div>
          </div>
        </div>

        <div class="moneyStage">
          <div class="pigBank">
            <div class="pigRow">
              <div class="pill">Goal: <strong>${formatGBP(moneyTarget)}</strong></div>
              <div class="totalPill">Total: <span id="moneyTotalText" style="margin-left:6px;">${formatGBP(moneyTotal)}</span></div>
            </div>

            <div class="coinDropArea" id="moneyDropArea" aria-label="Coins in piggy bank"></div>

            <div class="moneyActions">
              <button class="btn ghost" id="moneyUndoBtn">Undo</button>
              <button class="btn ghost" id="moneyClearBtn">Clear</button>
              <button class="btn" id="moneyCheckBtn">Check</button>
              <button class="btn secondary" id="moneyNewBtn">New</button>
            </div>

            <div id="moneyMsg" class="moneyMsg"></div>

            <div class="hint" style="margin-top:10px;">
              Tip: Try different combinations to reach the exact amount.
            </div>
          </div>

          <div class="coinPalette">
            <div class="row" style="justify-content:space-between;">
              <strong>Coins & notes</strong>
              <span class="hint" style="margin:0;">(UK £)</span>
            </div>
            <div class="paletteGrid" id="moneyPalette"></div>
          </div>
        </div>
      </div>
    `;

    // mode buttons state
    const modeSeg = document.getElementById("moneyModeSeg");
    if(modeSeg){
      modeSeg.querySelectorAll("button").forEach(b=>{
        b.classList.toggle("active", b.dataset.mode===moneyMode);
        b.onclick = ()=>{
          moneyMode = b.dataset.mode;
          moneyNewTarget();
          moneyClear();
          renderGames();
        };
      });
    }

    // render palette
    const pal = document.getElementById("moneyPalette");
    const drop = document.getElementById("moneyDropArea");
    // Drag & Drop support
    drop.addEventListener("dragover", (e)=>{
      e.preventDefault();
      drop.classList.add("dragOver");
    });
    drop.addEventListener("dragleave", ()=> drop.classList.remove("dragOver"));
    drop.addEventListener("drop", (e)=>{
      e.preventDefault();
      drop.classList.remove("dragOver");
      const p = Number(e.dataTransfer.getData("text/plain"));
      if(!Number.isFinite(p)) return;
      moneyAdd(p);
      renderDrop();
      msg.textContent = "";
      msg.className = "moneyMsg";
      showClink(drop, "Clink!");
    });

    const msg = document.getElementById("moneyMsg");

    function renderDrop(){
      drop.innerHTML = "";
      moneyStack.forEach((p, idx)=>{
        const item = UK_MONEY.find(x=>x.p===p);
        const tok = document.createElement("div");
        const isNote = item?.type==="note";
        tok.className = "coinToken " + (isNote ? "note " : "") + (item?.size==="small" ? "small " : "") + (item?.cls||"");
        tok.textContent = item?.label || `${p}p`;
        tok.title = "Tap to remove";
        tok.addEventListener("click", ()=>{
          // remove this coin
          tok.classList.add("removing");
          setTimeout(()=>{
            moneyTotal -= p;
            moneyStack.splice(idx, 1);
            if(moneyTotal < 0) moneyTotal = 0;
            renderDrop();
          }, settings.reduceMotion ? 0 : 210);
        });
        drop.appendChild(tok);
      });
      document.getElementById("moneyTotalText").textContent = formatGBP(moneyTotal);
    }

    moneyAllowed().forEach(item=>{
      const btn = document.createElement("button");
      btn.type = "button";
      btn.draggable = true;
      btn.className = "coinBtn";
      btn.dataset.pence = String(item.p);
      btn.addEventListener("dragstart", (e)=>{
        e.dataTransfer.setData("text/plain", String(item.p));
        tok.classList.add("dragging");
      });
      btn.addEventListener("dragend", ()=> tok.classList.remove("dragging"));

      const tok = document.createElement("div");
      const isNote = item.type==="note";
      tok.className = "coinToken " + (isNote ? "note " : "") + (item.size==="small" ? "small " : "") + item.cls;
      tok.innerHTML = isNote ? `<span>${item.label}</span>` : item.label;
      btn.appendChild(tok);
      btn.onclick = ()=>{
        moneyAdd(item.p);
        renderDrop();
        msg.textContent = "";
        msg.className = "moneyMsg";
        speak(item.label, 0.9);
        showClink(drop, "Clink!");
      };
      pal.appendChild(btn);
    });

    document.getElementById("moneyUndoBtn").onclick = ()=>{ moneyUndo(); renderDrop(); msg.textContent=""; msg.className="moneyMsg"; };
    document.getElementById("moneyClearBtn").onclick = ()=>{ moneyClear(); renderDrop(); msg.textContent=""; msg.className="moneyMsg"; };
    document.getElementById("moneyNewBtn").onclick = ()=>{ moneyNewTarget(); moneyClear(); renderGames(); };
    document.getElementById("moneyCheckBtn").onclick = ()=>{
      const res = moneyCheck();
      if(res.ok){
        msg.textContent = "✅ Perfect! You made the exact amount.";
        msg.className = "moneyMsg feedback good";
        // new target after success (gentle)
        setTimeout(()=>{ moneyNewTarget(); moneyClear(); renderGames(); }, settings.reduceMotion ? 350 : 850);
      }else if(res.over){
        msg.textContent = "⚠️ That’s too much. Try undo or remove some coins.";
        msg.className = "moneyMsg feedback warn";
      }else{
        msg.textContent = "➕ Not enough yet. Add a little more.";
        msg.className = "moneyMsg feedback warn";
      }
    };

    // initial drop render
    renderDrop();
  }

}

function gamesInit(){
  // stop tetris loop if leaving later
  // initialize games state
  c4Reset();
  tetrisReset();
  currentGame = "connect4";
  // set tab state
  const tabs = document.getElementById("gameTabs");
  if(tabs){
    tabs.querySelectorAll(".tab").forEach(t=>t.classList.toggle("active", t.dataset.game==="connect4"));
  }
  renderGames();
}

// tab switching
document.addEventListener("click", (e)=>{
  const btn = e.target.closest?.("#gameTabs .tab");
  if(!btn) return;
  currentGame = btn.dataset.game;
  document.querySelectorAll("#gameTabs .tab").forEach(t=>t.classList.toggle("active", t === btn));
  if(currentGame !== "tetris") tetrisPause();
  if(currentGame === "money" && !moneyTarget){ moneyNewTarget(); moneyClear(); }
  renderGames();
});

// games home button
const gh = document.getElementById("gamesHome");
if(gh) gh.addEventListener("click", ()=>showScreen("home"));

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
applySettings();

// Route: support wrapper pages like index.html?screen=letters&embed=1
try{
  const params = new URLSearchParams(window.location.search);
  const screen = (params.get("screen") || "home").toLowerCase();
  const embed = params.get("embed") === "1";
  if(embed) document.body.classList.add("embed");

  if(embed){
    const homeBtn = document.getElementById("goHome");
    if(homeBtn){
      homeBtn.textContent = "Back";
      homeBtn.addEventListener("click", () => { window.location.href = "index.html"; });
    }
  }

  showScreen(screen);

  // seed initial state for common screens
  if(screen === "letters") lettersNewRound();
  if(screen === "numbers") numbersNewRound();
  if(screen === "memory") memoryNewGame();
  if(screen === "phonics") phonicsInit();
  if(screen === "maths") mathsInit();
  if(screen === "clock") clockInit();
  if(screen === "games") gamesInit();
  if(screen === "handwriting") traceInit();
}catch(e){
  showScreen("home");
}

// If user resizes, keep trace crisp
window.addEventListener("resize", () => {
  if($("#handwritingScreen").classList.contains("active")){
    resizeTraceForDevice();
  }
});
