/* Shape Sort: tap-first, fully keyboard accessible sorting game. */
(() => {
  'use strict';
  const shapeTypes = ['circle', 'square', 'triangle'];
  const displayName = {circle:'Circle', square:'Square', triangle:'Triangle'};
  const icons = {
    circle: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><circle cx="32" cy="32" r="23" fill="#69C6C9" stroke="#308E9A" stroke-width="4"/></svg>',
    square: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><rect x="10" y="10" width="44" height="44" rx="8" fill="#B7A5E9" stroke="#8B79C9" stroke-width="4"/></svg>',
    triangle: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><path d="M32 8 L57 54 H7 Z" fill="#F4C66B" stroke="#CC9C43" stroke-width="4" stroke-linejoin="round"/></svg>'
  };
  const totals = {easy:6, medium:9, hard:12};
  const el = (id) => document.getElementById(id);
  const tray = el('ps-shape-tray');
  const status = el('ps-shape-feedback');
  const count = el('ps-shape-count');
  const progress = el('ps-shape-progress');
  const progressFill = el('ps-shape-progress-fill');
  const restart = el('ps-shape-restart');
  const homes = Array.from(document.querySelectorAll('[data-home]'));
  const levelButtons = Array.from(document.querySelectorAll('[data-level]'));
  const voiceButton = el('ps-shape-hear');
  const voiceStatus = el('ps-shape-voice-status');
  if (!tray || !status || !count || !progress || !progressFill || !restart || homes.length !== 3) return;

  let level = window.PSSettings?.load?.().simplePlay === false ? 'medium' : 'easy';
  let remaining = [];
  let selectedId = null;
  let sorted = 0;
  let homeCounts = {circle:0, square:0, triangle:0};

  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  function say(message, tone) {
    status.textContent = message;
    status.dataset.tone = tone || 'neutral';
  }

  function updateProgress() {
    const total = totals[level];
    count.textContent = sorted + ' of ' + total + ' sorted';
    progress.setAttribute('aria-valuemax', String(total));
    progress.setAttribute('aria-valuenow', String(sorted));
    progress.setAttribute('aria-valuetext', sorted + ' of ' + total + ' shapes sorted');
    progressFill.style.width = (sorted / total * 100) + '%';
    shapeTypes.forEach((type) => {
      const badge = document.querySelector('[data-count="' + type + '"]');
      if (badge) badge.textContent = String(homeCounts[type]);
    });
  }

  function updateSelection() {
    tray.querySelectorAll('[data-shape-id]').forEach((button) => {
      const selected = button.dataset.shapeId === selectedId;
      button.setAttribute('aria-pressed', String(selected));
    });
  }

  function chooseShape(id) {
    const picked = remaining.find((shape) => shape.id === id);
    if (!picked) return;
    if (selectedId === id) {
      selectedId = null;
      updateSelection();
      say('Shape unselected. Pick a shape to try again.');
      return;
    }
    selectedId = id;
    updateSelection();
    say(displayName[picked.type] + ' selected. Tap the ' + displayName[picked.type].toLowerCase() + ' home.');
  }

  function putInHome(home) {
    if (!remaining.length) {
      say('You finished the round! Tap Play again to start another.', 'success');
      return;
    }
    if (selectedId === null) {
      say('First, pick a shape from step 1.', 'neutral');
      return;
    }
    const picked = remaining.find((shape) => shape.id === selectedId);
    if (!picked) return;
    if (picked.type !== home) {
      say('Not quite. Look for the ' + picked.type + ' home.', 'retry');
      return;
    }
    remaining = remaining.filter((shape) => shape.id !== selectedId);
    const removed = tray.querySelector('[data-shape-id="' + selectedId + '"]');
    if (removed) removed.remove();
    sorted++;
    homeCounts[home]++;
    selectedId = null;
    updateSelection();
    updateProgress();
    if (!remaining.length) {
      say('Amazing! You sorted all ' + sorted + ' shapes! Well done! 🎉', 'success');
      restart.textContent = '↻ Play again';
    } else {
      say('Yes! That ' + picked.type + ' is home. ' + sorted + ' of ' + totals[level] + ' sorted.', 'success');
    }
  }

  function startRound() {
    const total = totals[level];
    const types = shuffle(Array.from({length:total}, (_, index) => shapeTypes[index % shapeTypes.length]));
    remaining = types.map((type, index) => ({id:'shape-' + index, type}));
    selectedId = null;
    sorted = 0;
    homeCounts = {circle:0, square:0, triangle:0};
    tray.replaceChildren();
    remaining.forEach((shape) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'ps-shape-piece';
      button.dataset.shapeId = shape.id;
      button.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-label', 'Select ' + shape.type);
      button.innerHTML = icons[shape.type] + '<span>' + displayName[shape.type] + '</span>';
      button.addEventListener('click', (event) => {
        chooseShape(shape.id);
        // Keyboard activation jumps to the matching destinations, avoiding extra Tab presses.
        if (event.detail === 0 && selectedId === shape.id) homes[0].focus();
      });
      tray.appendChild(button);
    });
    levelButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.level === level)));
    restart.textContent = '↻ New round';
    updateProgress();
    say('Ready! Pick a shape to start.');
  }

  homes.forEach((button) => button.addEventListener('click', (event) => {
    const previousCount = remaining.length;
    putInHome(button.dataset.home);
    // Keep keyboard-only play efficient without moving focus for touch users.
    if (event.detail === 0 && remaining.length < previousCount) {
      if (remaining.length) tray.querySelector('[data-shape-id]')?.focus();
      else restart.focus();
    }
  }));
  levelButtons.forEach((button) => button.addEventListener('click', () => {
    if (!Object.prototype.hasOwnProperty.call(totals, button.dataset.level)) return;
    level = button.dataset.level;
    startRound();
  }));
  restart.addEventListener('click', startRound);
  if (voiceButton) voiceButton.addEventListener('click', () => {
    if (window.PSVoice?.speak) {
      window.PSVoice.speak('Welcome to Shape Sort. First, tap a shape. Then tap the home with the matching picture and name. Take your time.', voiceStatus);
    } else if (voiceStatus) {
      voiceStatus.textContent = 'Spoken instructions are unavailable on this device.';
    }
  });

  startRound();
})();
