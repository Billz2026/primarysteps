/* Primary Steps – Global Settings (v1)
   Save in: assets/js/ps-settings.js
   Used by: settings.html + any page that plays audio or needs theme.
*/
(function () {
  const KEY = "ps_settings_v1";

  const DEFAULTS = {
    theme: "system",          // "dark" | "light" | "system"
    soundEnabled: true,
    volume: 0.9,              // 0.0 - 1.0
    voiceEnabled: true,
    autoplayWelcome: true,
    reduceMotion: false,
    largeUI: false,
  };

  function clamp01(n) {
    n = Number(n);
    if (Number.isNaN(n)) return 1;
    return Math.max(0, Math.min(1, n));
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function save(next) {
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  function resolvedTheme(theme) {
    if (theme === "dark" || theme === "light") return theme;
    // system
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches)
      ? "dark"
      : "light";
  }

  function applyTheme(s) {
    const t = resolvedTheme(s.theme);
    document.documentElement.setAttribute("data-theme", t);
    document.documentElement.style.colorScheme = t;
  }

  function applyPrefs(s) {
    document.documentElement.toggleAttribute("data-reduce-motion", !!s.reduceMotion);
    document.documentElement.toggleAttribute("data-large-ui", !!s.largeUI);
  }

  // Public API
  window.PSSettings = {
    KEY,
    DEFAULTS,
    load,
    save,
    applyAll() {
      const s = load();
      applyTheme(s);
      applyPrefs(s);
      return s;
    },
    set(partial) {
      const s = { ...load(), ...partial };
      s.volume = clamp01(s.volume);
      save(s);
      applyTheme(s);
      applyPrefs(s);
      return s;
    },
    reset() {
      localStorage.removeItem(KEY);
      const s = { ...DEFAULTS };
      save(s);
      applyTheme(s);
      applyPrefs(s);
      return s;
    },
    // Audio helper – returns null if blocked by settings
    makeAudio(src, { isVoice = false } = {}) {
      const s = load();
      if (!s.soundEnabled) return null;
      if (isVoice && !s.voiceEnabled) return null;

      const a = new Audio(src);
      a.volume = clamp01(s.volume ?? 1);
      return a;
    },
    canAutoplayWelcome() {
      const s = load();
      return !!(s.soundEnabled && s.voiceEnabled && s.autoplayWelcome);
    },
    // Clear "played once" flags so welcomes can replay
    clearWelcomeFlags() {
      [
        "ps_welcome_played",
        "ps_letters_welcome_played",
        "ps_numbers_welcome_played",
      ].forEach(k => localStorage.removeItem(k));
    }
  };

  // Apply ASAP to avoid theme flash
  window.PSSettings.applyAll();

  // Keep in sync when user chooses System theme
  if (window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener?.("change", () => {
      const s = load();
      if (s.theme === "system") applyTheme(s);
    });
  }
})();