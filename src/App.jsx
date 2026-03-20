import React, { useState, useEffect, useRef } from "react";
// ═══════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════
const C = {
  bg:       "#050508",
  surface:  "#0a0a12",
  panel:    "#0f0f1a",
  pink:     "#ff2d78",
  cyan:     "#00fff5",
  yellow:   "#ffe600",
  purple:   "#b000ff",
  green:    "#00ff41",
  orange:   "#ff6b00",
  white:    "#ffffff",
  dim:      "#8888aa",
  darker:   "#333355",
  // Minecraft palette
  mcGrass:  "#5d9e2f",
  mcDirt:   "#8b6340",
  mcStone:  "#8a8a8a",
  mcWood:   "#b5813a",
  mcSky:    "#78b4f0",
  mcGold:   "#f0c030",
  mcDiamond:"#4ee3e3",
  mcBed:    "#c04040",
};

// ═══════════════════════════════════════════════════════════
// GLOBAL CSS
// ═══════════════════════════════════════════════════════════
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: ${C.bg};
    color: ${C.white};
    font-family: 'Press Start 2P', monospace;
    cursor: crosshair;
    overflow-x: hidden;
  }

  /* CRT Scanline overlay */
  body::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.08) 2px,
      rgba(0,0,0,0.08) 4px
    );
    pointer-events: none;
    z-index: 9999;
  }

  /* CRT flicker */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
    z-index: 9998;
  }

  ::selection { background: ${C.pink}55; color: ${C.white}; }

  a { color: inherit; text-decoration: none; }
  button { cursor: crosshair; font-family: 'Press Start 2P', monospace; }
  input, textarea, select { font-family: 'Press Start 2P', monospace; }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.pink}; image-rendering: pixelated; }

  /* ── ACCESSIBILITY ── */

  /* Skip navigation link */
  .skip-nav {
    position: absolute;
    top: -100px;
    left: 16px;
    background: ${C.cyan};
    color: ${C.bg};
    padding: 10px 16px;
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    z-index: 9999;
    text-decoration: none;
    border: 3px solid ${C.bg};
  }
  .skip-nav:focus { top: 8px; }

  /* Keyboard focus ring — visible for all interactive elements */
  *:focus-visible {
    outline: 3px solid ${C.cyan} !important;
    outline-offset: 3px !important;
    box-shadow: 0 0 0 6px ${C.cyan}44 !important;
  }

  /* Minimum readable body text size — override 6px/7px decorative labels to 11px for screen readers */
  .a11y-label {
    font-size: 11px !important;
    min-height: 44px;
  }

  /* Touch target minimum 44x44px for interactive elements */
  button, a, [role="checkbox"], [role="button"] {
    min-height: 24px;
  }

  /* Reduced motion — disable all animations for users who prefer it */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    /* Specifically kill the scanline flicker which can trigger photosensitive epilepsy */
    body::after, body::before { display: none !important; }
  }

  /* High contrast mode support */
  @media (forced-colors: active) {
    .pixel-border-pink, .pixel-border-cyan, .pixel-border-yellow {
      border: 3px solid ButtonText;
    }
  }

  /* Animations */
  @keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
  @keyframes scanline    { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes neonPulse   { 0%,100%{text-shadow: 0 0 7px currentColor, 0 0 20px currentColor} 50%{text-shadow: 0 0 3px currentColor} }
  @keyframes float       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes spin        { to{transform:rotate(360deg)} }
  @keyframes starTwinkle { 0%,100%{opacity:0.3} 50%{opacity:1} }
  @keyframes slideIn     { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pixelIn     { from{opacity:0;transform:scale(0.8)} to{opacity:1;transform:scale(1)} }
  @keyframes marquee     { from{transform:translateX(100%)} to{transform:translateX(-100%)} }
  @keyframes rgbShift    { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
  @keyframes mcBob       { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  .blink { animation: blink 1s step-end infinite; }
  .neon-pulse { animation: neonPulse 2s ease-in-out infinite; }
  .float { animation: float 3s ease-in-out infinite; }
  .pixel-in { animation: pixelIn 0.3s steps(4) forwards; }
  .slide-in { animation: slideIn 0.4s steps(6) forwards; }

  /* Neon text helpers */
  .neon-pink  { color: ${C.pink};   text-shadow: 0 0 7px ${C.pink},  0 0 20px ${C.pink},  0 0 40px ${C.pink}; }
  .neon-cyan  { color: ${C.cyan};   text-shadow: 0 0 7px ${C.cyan},  0 0 20px ${C.cyan},  0 0 40px ${C.cyan}; }
  .neon-yellow{ color: ${C.yellow}; text-shadow: 0 0 7px ${C.yellow},0 0 20px ${C.yellow},0 0 40px ${C.yellow}; }
  .neon-green { color: ${C.green};  text-shadow: 0 0 7px ${C.green}, 0 0 20px ${C.green}, 0 0 40px ${C.green}; }
  .neon-purple{ color: ${C.purple}; text-shadow: 0 0 7px ${C.purple},0 0 20px ${C.purple},0 0 40px ${C.purple}; }

  /* Pixel borders */
  .pixel-border-pink {
    border: 3px solid ${C.pink};
    box-shadow: 0 0 0 3px ${C.bg}, 0 0 0 6px ${C.pink}, inset 0 0 0 3px ${C.bg};
  }
  .pixel-border-cyan {
    border: 3px solid ${C.cyan};
    box-shadow: 0 0 0 3px ${C.bg}, 0 0 0 6px ${C.cyan}, inset 0 0 0 3px ${C.bg};
  }
  .pixel-border-yellow {
    border: 3px solid ${C.yellow};
    box-shadow: 0 0 0 3px ${C.bg}, 0 0 0 6px ${C.yellow}, inset 0 0 0 3px ${C.bg};
  }

  /* Minecraft pixel border */
  .mc-border {
    border: 4px solid #000;
    box-shadow: inset -2px -2px 0 rgba(0,0,0,0.5), inset 2px 2px 0 rgba(255,255,255,0.3);
    image-rendering: pixelated;
  }

  /* Buttons */
  .btn-arcade {
    display: inline-block;
    padding: 12px 24px;
    font-family: 'Press Start 2P', monospace;
    font-size: 10px;
    letter-spacing: 1px;
    text-transform: uppercase;
    border: none;
    cursor: crosshair;
    transition: all 0.1s steps(2);
    image-rendering: pixelated;
  }
  .btn-arcade:active { transform: translate(2px, 2px); }

  .btn-pink {
    background: ${C.pink};
    color: ${C.white};
    box-shadow: 4px 4px 0 #8b0000, 0 0 20px ${C.pink}88;
  }
  .btn-pink:hover { background: #ff5599; box-shadow: 6px 6px 0 #8b0000, 0 0 30px ${C.pink}; }

  .btn-cyan {
    background: ${C.cyan};
    color: ${C.bg};
    box-shadow: 4px 4px 0 #006666, 0 0 20px ${C.cyan}88;
  }
  .btn-cyan:hover { box-shadow: 6px 6px 0 #006666, 0 0 30px ${C.cyan}; }

  .btn-yellow {
    background: ${C.yellow};
    color: ${C.bg};
    box-shadow: 4px 4px 0 #886600, 0 0 20px ${C.yellow}88;
  }
  .btn-yellow:hover { box-shadow: 6px 6px 0 #886600, 0 0 30px ${C.yellow}; }

  .btn-green {
    background: ${C.green};
    color: ${C.bg};
    box-shadow: 4px 4px 0 #006600, 0 0 20px ${C.green}88;
  }
  .btn-green:hover { box-shadow: 6px 6px 0 #006600, 0 0 30px ${C.green}; }

  /* Minecraft button */
  .btn-mc {
    background: #7a7a7a;
    color: white;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    border: none;
    padding: 10px 20px;
    cursor: crosshair;
    box-shadow: inset -2px -4px 0 rgba(0,0,0,0.4), inset 2px 2px 0 rgba(255,255,255,0.3);
    text-shadow: 2px 2px 0 #333;
    transition: all 0.05s;
  }
  .btn-mc:hover { background: #8a8a8a; filter: brightness(1.1); }
  .btn-mc:active { box-shadow: inset 2px 4px 0 rgba(0,0,0,0.4); transform: translate(1px,1px); }

  /* Marquee ticker */
  .ticker-wrap {
    overflow: hidden;
    border-top: 2px solid ${C.pink};
    border-bottom: 2px solid ${C.pink};
    background: ${C.surface};
    padding: 8px 0;
  }
  .ticker-content {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 30s linear infinite;
    font-size: 9px;
    color: ${C.pink};
    letter-spacing: 2px;
  }

  /* Stars background */
  .stars { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }

  /* Checkbox pixel style */
  .pixel-check { width: 20px; height: 20px; background: ${C.bg}; border: 3px solid ${C.cyan}; cursor: crosshair; display: flex; align-items: center; justify-content: center; flex-shrink: 0; image-rendering: pixelated; }
  .pixel-check.checked { background: ${C.cyan}; }

  /* MC block hover */
  .mc-block:hover { filter: brightness(1.2); transform: scale(1.05); transition: all 0.1s steps(2); }

  /* Input arcade style */
  .arcade-input {
    background: ${C.bg};
    border: 3px solid ${C.cyan};
    color: ${C.cyan};
    padding: 10px 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 9px;
    width: 100%;
    outline: none;
    box-shadow: 0 0 10px ${C.cyan}44, inset 0 0 10px ${C.bg};
    caret-color: ${C.cyan};
  }
  .arcade-input:focus { box-shadow: 0 0 20px ${C.cyan}88, inset 0 0 10px ${C.bg}; }
  .arcade-input::placeholder { color: ${C.dim}; }

  /* Select arcade */
  .arcade-select {
    background: ${C.bg};
    border: 3px solid ${C.cyan};
    color: ${C.cyan};
    padding: 10px 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 8px;
    width: 100%;
    outline: none;
    cursor: crosshair;
    appearance: none;
  }

  /* Health bar */
  .health-bar-outer { height: 20px; background: #111; border: 3px solid #555; image-rendering: pixelated; }
  .health-bar-inner { height: 100%; transition: width 1s steps(10); }

  /* Retainer scroll area */
  .retainer-scroll {
    height: 420px;
    overflow-y: scroll;
    background: #000814;
    border: 3px solid ${C.yellow};
    padding: 20px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.8;
    color: #ccdd99;
    scrollbar-width: thin;
    scrollbar-color: ${C.yellow} #000;
    box-shadow: 0 0 20px ${C.yellow}44, inset 0 0 20px rgba(0,0,0,0.8);
    white-space: pre-wrap;
  }
`;

// ═══════════════════════════════════════════════════════════
// STAR FIELD
// ═══════════════════════════════════════════════════════════
function Stars() {
  const stars = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 4,
    dur: Math.random() * 3 + 2,
  }));
  return (
    <div className="stars">
      {stars.map(s => (
        <div key={s.id} style={{
          position: "absolute", left: `${s.x}%`, top: `${s.y}%`,
          width: s.size, height: s.size, background: "#ffffff",
          borderRadius: "50%",
          animation: `starTwinkle ${s.dur}s ${s.delay}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TICKER TAPE
// ═══════════════════════════════════════════════════════════
function Ticker() {
  const msg = "★ WESLEY R. WILLIAMS ESQ ★ CA BAR NO. 269157 ★ REAL ESTATE ★ GAMING LAW ★ DIGITAL ASSETS ★ GAMECOMPLIANCE™ ★ FREE ANALYSIS ★ INSERT COIN TO BEGIN ★ CRYPTO SINCE 2017 ★ GAMING PAYMENTS VETERAN ★ LEVEL UP YOUR LEGAL GAME ★ ";
  return (
    <div className="ticker-wrap">
      <div className="ticker-content">{msg.repeat(3)}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PIXEL SPRITE (CSS-based)
// ═══════════════════════════════════════════════════════════
function PixelSprite({ type = "coin", size = 16 }) {
  const sprites = {
    coin: [ "0110","1001","1001","0110" ],
    star: [ "01110","11111","01110","01010","10001" ],
    heart: [ "0110110","1111111","1111111","0111110","0011100","0001000" ],
  };
  const grid = sprites[type] || sprites.coin;
  const colors = { coin: C.yellow, star: C.cyan, heart: C.pink };
  const color = colors[type] || C.yellow;
  const labels = { coin: "coin icon", star: "star icon", heart: "heart icon" };
  return (
    <div
      role="img"
      aria-label={labels[type] || "decorative icon"}
      style={{ display: "inline-grid", gridTemplateColumns: `repeat(${grid[0].length}, ${size}px)`, gap: 0, imageRendering: "pixelated" }}>
      {grid.map((row, r) => row.split("").map((px, c) => (
        <div key={`${r}-${c}`} style={{
          width: size, height: size,
          background: px === "1" ? color : "transparent",
          boxShadow: px === "1" ? `0 0 4px ${color}` : "none",
        }} />
      )))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MINECRAFT BLOCK
// ═══════════════════════════════════════════════════════════
function McBlock({ color, size = 48, label, icon }) {
  const darken = c => c + "99";
  return (
    <div className="mc-block" style={{
      width: size, height: size, position: "relative",
      imageRendering: "pixelated", flexShrink: 0,
      background: color,
      borderTop: `${size*0.08}px solid ${color}ee`,
      borderLeft: `${size*0.08}px solid ${color}dd`,
      borderBottom: `${size*0.08}px solid ${color}44`,
      borderRight: `${size*0.08}px solid ${color}44`,
      boxShadow: `${size*0.06}px ${size*0.06}px 0 rgba(0,0,0,0.5)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.4,
    }}>
      {icon}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// NAV
// ═══════════════════════════════════════════════════════════
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", f);
    return () => window.removeEventListener("scroll", f);
  }, []);

  const links = [
    { id: "home",     label: "HOME",       color: C.cyan   },
    { id: "about",    label: "PLAYER",     color: C.yellow },
    { id: "practice", label: "LEVELS",     color: C.pink   },
    { id: "tool",     label: "MINIGAME",   color: C.green  },
    { id: "pricing",  label: "SUBSCRIBE",  color: C.mcGold },
    { id: "retainer", label: "CONTRACT",   color: C.purple },
    { id: "contact",  label: "HI-SCORE",   color: C.orange },
  ];
  const go = id => { setPage(id); window.scrollTo(0, 0); };

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(5,5,8,0.97)" : "transparent",
      borderBottom: scrolled ? `3px solid ${C.pink}` : "3px solid transparent",
      boxShadow: scrolled ? `0 0 20px ${C.pink}44` : "none",
      transition: "all 0.2s steps(4)",
      padding: "0 32px",
    }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex",
        alignItems: "center", justifyContent: "space-between", height: "64px" }}>

        {/* Logo */}
        <button onClick={() => go("home")} style={{ background: "none", border: "none",
          display: "flex", alignItems: "center", gap: "12px" }}>
          <PixelSprite type="star" size={10} />
          <div>
            <div style={{ fontSize: "9px", color: C.cyan, letterSpacing: "1px",
              textShadow: `0 0 10px ${C.cyan}` }}>W.R. WILLIAMS ESQ</div>
            <div style={{ fontSize: "6px", color: C.pink, letterSpacing: "2px",
              marginTop: "3px", textShadow: `0 0 8px ${C.pink}` }}>ATTORNEY AT LAW</div>
          </div>
        </button>

        {/* Links */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {links.map(l => (
            <button key={l.id} onClick={() => go(l.id)} style={{
              background: page === l.id ? l.color : "transparent",
              color: page === l.id ? C.bg : l.color,
              border: `2px solid ${l.color}`,
              padding: "6px 10px", fontSize: "7px", letterSpacing: "1px",
              boxShadow: page === l.id ? `0 0 15px ${l.color}` : `0 0 6px ${l.color}44`,
              transition: "all 0.1s steps(2)",
              textShadow: page === l.id ? "none" : `0 0 8px ${l.color}`,
            }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════
// HOME PAGE
// ═══════════════════════════════════════════════════════════
function HomePage({ setPage }) {
  const [coins, setCoins] = useState(0);
  const [showInsert, setShowInsert] = useState(true);

  useEffect(() => {
    const iv = setInterval(() => setShowInsert(v => !v), 700);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "100px 32px 60px", position: "relative" }}>

      {/* Grid bg */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${C.pink}11 1px, transparent 1px), linear-gradient(90deg, ${C.pink}11 1px, transparent 1px)`,
        backgroundSize: "32px 32px", pointerEvents: "none",
      }} />

      {/* Corner decorations */}
      {["topleft","topright","bottomleft","bottomright"].map((pos, i) => (
        <div key={pos} style={{
          position: "absolute",
          top: i < 2 ? "80px" : "auto", bottom: i >= 2 ? "20px" : "auto",
          left: i % 2 === 0 ? "20px" : "auto", right: i % 2 === 1 ? "20px" : "auto",
          width: "60px", height: "60px",
          borderTop: i < 2 ? `3px solid ${C.pink}` : "none",
          borderBottom: i >= 2 ? `3px solid ${C.pink}` : "none",
          borderLeft: i % 2 === 0 ? `3px solid ${C.pink}` : "none",
          borderRight: i % 2 === 1 ? `3px solid ${C.pink}` : "none",
          boxShadow: `0 0 10px ${C.pink}44`,
        }} />
      ))}

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Top label */}
        <div className="neon-cyan" style={{ fontSize: "9px", letterSpacing: "4px",
          marginBottom: "24px", animation: "neonPulse 2s ease-in-out infinite" }}>
          ★ ARCADE EDITION ★ VERSION 1.0 ★
        </div>

        {/* Main title */}
        <h1 style={{ marginBottom: "8px" }}>
          <div className="neon-pink" style={{ fontSize: "clamp(18px, 4vw, 36px)",
            letterSpacing: "4px", lineHeight: "1.3",
            animation: "neonPulse 1.5s ease-in-out infinite" }}>
            WESLEY R.
          </div>
          <div className="neon-cyan" style={{ fontSize: "clamp(18px, 4vw, 36px)",
            letterSpacing: "4px", lineHeight: "1.3" }}>
            WILLIAMS ESQ.
          </div>
        </h1>

        <div style={{ height: "4px", background: `linear-gradient(90deg, transparent, ${C.pink}, ${C.cyan}, transparent)`,
          margin: "16px auto", maxWidth: "400px", boxShadow: `0 0 10px ${C.pink}` }} />

        {/* Subtitle */}
        <div style={{ fontSize: "9px", color: C.yellow, letterSpacing: "2px",
          marginBottom: "8px", textShadow: `0 0 10px ${C.yellow}` }}>
          ATTORNEY · COUNSELOR · TECHNOLOGIST
        </div>
        <div style={{ fontSize: "8px", color: C.dim, letterSpacing: "1px", marginBottom: "48px" }}>
          CA BAR NO. 269157 · REAL ESTATE · GAMING · CRYPTO
        </div>

        {/* Pixel art decorative row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "20px",
          marginBottom: "48px", alignItems: "center" }}>
          <PixelSprite type="coin" size={12} />
          <span style={{ fontSize: "7px", color: C.dim }}>LEVEL 30+</span>
          <PixelSprite type="heart" size={12} />
          <span style={{ fontSize: "7px", color: C.dim }}>30 YRS EXP</span>
          <PixelSprite type="star" size={12} />
          <span style={{ fontSize: "7px", color: C.dim }}>CRYPTO 2017</span>
        </div>

        {/* INSERT COIN */}
        <div style={{
          fontSize: "12px", color: C.yellow, letterSpacing: "3px",
          marginBottom: "40px", height: "24px",
          opacity: showInsert ? 1 : 0,
          textShadow: `0 0 20px ${C.yellow}`,
        }}>
          ► INSERT COIN TO BEGIN ◄
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-arcade btn-pink" onClick={() => setPage("contact")}>
            BOOK CONSULT
          </button>
          <button className="btn-arcade btn-cyan" onClick={() => setPage("tool")}>
            FREE MINIGAME →
          </button>
        </div>

        {/* Score display */}
        <div style={{ marginTop: "60px", display: "flex", gap: "32px",
          justifyContent: "center", flexWrap: "wrap" }}>
          {[
            { label: "EXP PTS", val: "30+YRS", color: C.yellow },
            { label: "CLIENTS", val: "1000+",  color: C.cyan   },
            { label: "LEVEL",   val: "MAX",    color: C.pink   },
            { label: "STREAK",  val: "ACTIVE", color: C.green  },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center",
              border: `2px solid ${s.color}44`, padding: "12px 20px",
              background: `${s.color}0a`, boxShadow: `0 0 10px ${s.color}22` }}>
              <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "1px",
                marginBottom: "8px" }}>{s.label}</div>
              <div style={{ fontSize: "11px", color: s.color,
                textShadow: `0 0 10px ${s.color}` }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// ABOUT PAGE — CHARACTER SELECT SCREEN
// ═══════════════════════════════════════════════════════════
function AboutPage({ setPage }) {
  const [selected, setSelected] = useState(0);
  const chars = [
    { name: "REAL ESTATE\nMASTER",   color: C.mcGrass, icon: "🏛️", stat: "DEF: ████████░░" },
    { name: "GAME LAW\nWIZARD",      color: C.cyan,    icon: "🎮", stat: "ATK: █████████░" },
    { name: "CRYPTO\nSAGE",          color: C.purple,  icon: "⛓️", stat: "MGC: ██████████" },
  ];

  const stats = [
    { label: "REAL ESTATE XP",  val: 99, color: C.mcGrass },
    { label: "GAMING LAW XP",   val: 95, color: C.cyan    },
    { label: "CRYPTO/WEB3 XP",  val: 90, color: C.purple  },
    { label: "FINTECH XP",      val: 88, color: C.yellow  },
    { label: "PRIVACY LAW XP",  val: 82, color: C.pink    },
    { label: "COURTROOM EXP",   val: 75, color: C.orange  },
  ];

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 32px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "8px", color: C.yellow, letterSpacing: "4px",
          marginBottom: "16px", textShadow: `0 0 10px ${C.yellow}` }}>
          ── CHARACTER SELECT ──
        </div>
        <h1 className="neon-cyan" style={{ fontSize: "clamp(16px, 3vw, 28px)",
          letterSpacing: "3px", marginBottom: "16px" }}>
          PLAYER PROFILE
        </h1>
        <div style={{ fontSize: "9px", color: C.pink, letterSpacing: "2px",
          textShadow: `0 0 10px ${C.pink}` }}>
          WESLEY R. WILLIAMS, ESQ.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "32px" }}>

        {/* Character cards */}
        <div>
          <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
            marginBottom: "16px", textAlign: "center" }}>SELECT CLASS</div>
          {chars.map((c, i) => (
            <div key={i} onClick={() => setSelected(i)}
              style={{
                border: `3px solid ${i === selected ? c.color : C.darker}`,
                padding: "16px", marginBottom: "12px", cursor: "crosshair",
                background: i === selected ? `${c.color}11` : C.surface,
                boxShadow: i === selected ? `0 0 20px ${c.color}44` : "none",
                transition: "all 0.1s steps(2)",
              }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div style={{ fontSize: "28px" }}>{c.icon}</div>
                <div>
                  <div style={{ fontSize: "7px", color: i === selected ? c.color : C.dim,
                    letterSpacing: "1px", lineHeight: "1.6",
                    textShadow: i === selected ? `0 0 8px ${c.color}` : "none" }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: "6px", color: C.dim, marginTop: "6px",
                    fontFamily: "'Courier New', monospace" }}>{c.stat}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bio panel */}
        <div style={{ border: `3px solid ${C.cyan}`, background: C.surface, padding: "28px",
          boxShadow: `0 0 20px ${C.cyan}22` }}>
          <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "3px",
            marginBottom: "20px", textShadow: `0 0 8px ${C.cyan}` }}>
            ── BIO / LORE ──
          </div>

          {[
            `Wesley R. Williams is a California-licensed attorney and real estate broker with 30+ years navigating the most complex intersections in law. He entered the crypto space in early 2017 — before most attorneys had heard the word "blockchain" — and has been continuously active through every market cycle and regulatory shift since.`,
            `After years of mastering title insurance and real estate transactions, Wes leveled up by joining a major global video game payments and commerce platform, one of the world's leading video game payment platforms, where he operated as a one-man legal department for four years. Commercial contracts, M&A, international regulatory compliance, blockchain integrations — all in the final boss dungeon of gaming fintech.`,
            `He co-hosted the CryptoLaw Podcast and speaks at industry conferences including the Utah Land Title Association and American Escrow Association. His GameCompliance™ engine represents the convergence of all three verticals — built by someone who actually lives at the intersection.`,
          ].map((p, i) => (
            <p key={i} style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
              lineHeight: "1.8", color: i === 0 ? "#ccddff" : "#8899bb",
              marginBottom: "16px" }}>{p}</p>
          ))}

          {/* Stats */}
          <div style={{ marginTop: "24px", borderTop: `2px solid ${C.darker}`, paddingTop: "20px" }}>
            <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "2px",
              marginBottom: "16px" }}>── SKILL TREE ──</div>
            {stats.map(s => (
              <div key={s.label} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "7px", marginBottom: "4px" }}>
                  <span style={{ color: C.dim }}>{s.label}</span>
                  <span style={{ color: s.color }}>{s.val}/100</span>
                </div>
                <div className="health-bar-outer">
                  <div className="health-bar-inner" style={{
                    width: `${s.val}%`, background: s.color,
                    boxShadow: `0 0 6px ${s.color}`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
            <button className="btn-arcade btn-pink" onClick={() => setPage("contact")}
              style={{ fontSize: "8px", padding: "10px 16px" }}>
              SELECT PLAYER
            </button>
            <button className="btn-arcade btn-cyan" onClick={() => setPage("tool")}
              style={{ fontSize: "8px", padding: "10px 16px" }}>
              FREE MINIGAME
            </button>
          </div>
        </div>
      </div>

      {/* Credentials ticker */}
      <div style={{ marginTop: "40px", border: `2px solid ${C.yellow}44`,
        background: C.surface, padding: "16px" }}>
        <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "2px",
          marginBottom: "12px" }}>── ACHIEVEMENTS UNLOCKED ──</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {[
            "CA BAR NO. 269157","CA REAL ESTATE BROKER","GAMING PAYMENTS IN-HOUSE COUNSEL",
            "CRYPTOLAW PODCAST CO-HOST","ULTA CONFERENCE SPEAKER","AEA SPEAKER","CRYPTO SINCE 2017",
          ].map(a => (
            <div key={a} style={{
              fontSize: "7px", padding: "6px 10px", background: `${C.yellow}11`,
              border: `2px solid ${C.yellow}44`, color: C.yellow,
              letterSpacing: "1px", display: "flex", alignItems: "center", gap: "6px",
            }}>
              <PixelSprite type="coin" size={8} />
              {a}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRACTICE AREAS — LEVEL SELECT
// ═══════════════════════════════════════════════════════════
function PracticePage({ setPage }) {
  const [activeLevel, setActiveLevel] = useState(null);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "8px", color: C.pink, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.pink}` }}>
          ── LEVEL SELECT ──
        </div>
        <h1 className="neon-yellow" style={{ fontSize: "clamp(14px, 3vw, 24px)", letterSpacing: "3px" }}>
          CHOOSE YOUR LEVEL
        </h1>
      </div>

      {/* LEVEL 1 — REAL ESTATE (MINECRAFT STYLE) */}
      <div style={{ marginBottom: "40px", border: `4px solid ${C.mcGrass}`,
        background: "#0a1a0a", boxShadow: `0 0 30px ${C.mcGrass}44`,
        overflow: "hidden" }}>

        {/* Minecraft sky header */}
        <div style={{
          background: `linear-gradient(180deg, ${C.mcSky} 0%, #a8d8f0 100%)`,
          padding: "16px 24px", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: `4px solid #000`,
        }}>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: "10px",
            color: "#1a1a2e", textShadow: "2px 2px 0 rgba(255,255,255,0.5)",
            letterSpacing: "2px" }}>
            LEVEL 1 — REAL ESTATE WORLD
          </div>
          <div style={{ fontSize: "8px", color: "#1a1a2e", fontFamily: "'Press Start 2P'" }}>
            ★★★★★
          </div>
        </div>

        {/* Minecraft ground bar */}
        <div style={{ display: "flex", height: "48px" }}>
          {Array.from({ length: 24 }, (_, i) => (
            <div key={i} style={{
              flex: 1, height: "100%",
              background: i % 3 === 0 ? C.mcGrass : i % 3 === 1 ? C.mcDirt : "#4a8a1f",
              borderRight: "1px solid rgba(0,0,0,0.3)",
              borderTop: "2px solid rgba(255,255,255,0.2)",
            }} />
          ))}
        </div>

        <div style={{ padding: "32px 28px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>

            {/* Left: description */}
            <div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "20px" }}>
                <McBlock color={C.mcGrass} size={48} icon="🏛️" />
                <McBlock color={C.mcDirt}  size={40} icon="📜" />
                <McBlock color={C.mcStone} size={32} icon="⚖️" />
              </div>
              <h3 style={{ fontSize: "11px", color: C.mcGrass, letterSpacing: "2px",
                marginBottom: "16px", textShadow: `0 0 10px ${C.mcGrass}` }}>
                REAL ESTATE &amp;<br />TITLE INSURANCE
              </h3>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
                color: "#99bb77", lineHeight: "1.8", marginBottom: "16px" }}>
                Thirty years of XP in title insurance and real estate. From residential closings to complex commercial deals, RESPA compliance, escrow law, and the emerging intersection of blockchain-based settlement with traditional property law.
              </p>
              <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
                color: "#778866", lineHeight: "1.8" }}>
                Wes advises title companies, escrow agents, and developers navigating California's regulatory environment — including stablecoin payment rails and tokenized real property.
              </p>
            </div>

            {/* Right: Minecraft inventory */}
            <div>
              <div style={{ fontSize: "8px", color: C.mcGold, letterSpacing: "2px",
                marginBottom: "16px", textShadow: `0 0 6px ${C.mcGold}` }}>
                ── INVENTORY / PRACTICE ITEMS ──
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                {[
                  { icon: "📋", label: "TITLE INS",  color: C.mcGold    },
                  { icon: "🏠", label: "ESCROW",     color: C.mcDirt    },
                  { icon: "📜", label: "RESPA",      color: C.mcStone   },
                  { icon: "🔑", label: "CLOSINGS",   color: C.mcWood    },
                  { icon: "⛓️", label: "BLOCKCHAIN", color: C.mcDiamond },
                  { icon: "💰", label: "STABLECOIN", color: C.mcGold    },
                  { icon: "🏗️", label: "DEV LAW",   color: C.mcGrass   },
                  { icon: "🗺️", label: "LAND USE",  color: C.mcDirt    },
                ].map((item, i) => (
                  <div key={i} className="mc-block" style={{
                    background: "#2a2a2a",
                    border: "3px solid #555",
                    boxShadow: "inset -2px -2px 0 rgba(0,0,0,0.6), inset 2px 2px 0 rgba(255,255,255,0.1)",
                    padding: "8px 4px", textAlign: "center", cursor: "crosshair",
                  }}>
                    <div style={{ fontSize: "20px", marginBottom: "4px" }}>{item.icon}</div>
                    <div style={{ fontSize: "6px", color: item.color,
                      textShadow: `0 0 4px ${item.color}`, lineHeight: "1.2" }}>{item.label}</div>
                  </div>
                ))}
              </div>

              {/* MC health bar */}
              <div style={{ marginTop: "20px" }}>
                <div style={{ fontSize: "7px", color: C.dim, marginBottom: "6px", letterSpacing: "1px" }}>
                  EXPERIENCE LEVEL: 30+
                </div>
                <div style={{ height: "16px", background: "#111", border: "3px solid #555",
                  boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.5)" }}>
                  <div style={{ height: "100%", width: "99%",
                    background: `linear-gradient(90deg, ${C.mcGold}, #88cc00)`,
                    boxShadow: `0 0 8px ${C.mcGold}` }} />
                </div>
              </div>

              <button className="btn-mc" onClick={() => setPage("contact")}
                style={{ marginTop: "16px", width: "100%", padding: "12px" }}>
                ▶ OPEN NEW WORLD (BOOK CONSULT)
              </button>
            </div>
          </div>
        </div>

        {/* Minecraft dirt footer */}
        <div style={{ display: "flex", height: "24px", borderTop: "4px solid #000" }}>
          {Array.from({ length: 48 }, (_, i) => (
            <div key={i} style={{
              flex: 1,
              background: i % 2 === 0 ? C.mcDirt : "#7a5530",
              borderRight: "1px solid rgba(0,0,0,0.3)",
            }} />
          ))}
        </div>
      </div>

      {/* LEVEL 2 — GAMING LAW (ARCADE STYLE) */}
      <div style={{ marginBottom: "40px", border: `4px solid ${C.cyan}`,
        background: C.surface, boxShadow: `0 0 30px ${C.cyan}33` }}>

        <div style={{ background: `linear-gradient(135deg, #001a33 0%, #003366 100%)`,
          padding: "16px 24px", borderBottom: `4px solid ${C.cyan}`,
          display: "flex", justifyContent: "space-between" }}>
          <div className="neon-cyan" style={{ fontSize: "10px", letterSpacing: "2px" }}>
            LEVEL 2 — GAME LAW ARENA
          </div>
          <div style={{ fontSize: "8px", color: C.cyan }}>BOSS LEVEL</div>
        </div>

        {/* Arcade scanline strip */}
        <div style={{ height: "8px", background: `repeating-linear-gradient(90deg, ${C.cyan} 0px, ${C.cyan} 4px, transparent 4px, transparent 8px)`, opacity: 0.3 }} />

        <div style={{ padding: "32px 28px", display: "grid",
          gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {["🎮","👾","🕹️"].map((ico, i) => (
                <div key={i} style={{
                  width: "52px", height: "52px",
                  background: `${C.cyan}11`,
                  border: `3px solid ${C.cyan}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", boxShadow: `0 0 10px ${C.cyan}44`,
                  animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
                }}>{ico}</div>
              ))}
            </div>
            <h3 className="neon-cyan" style={{ fontSize: "11px", letterSpacing: "2px",
              marginBottom: "16px", lineHeight: "1.5" }}>
              VIDEO GAME &amp;<br />COMMERCE LAW
            </h3>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
              color: "#88ccdd", lineHeight: "1.8", marginBottom: "12px" }}>
              Four years as in-house counsel at a major global video game payments and commerce platform — one of the world's leading video game payment platforms. Full-stack gaming law: virtual currency, loot boxes, developer agreements, COPPA/GDPR, and GameCompliance™.
            </p>
          </div>
          <div>
            <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "2px", marginBottom: "16px" }}>
              ── UNLOCKED ABILITIES ──
            </div>
            {[
              { ability: "VIRTUAL CURRENCY REGULATION", power: 98, color: C.cyan    },
              { ability: "LOOT BOX / GAMBLING LAW",     power: 95, color: C.pink    },
              { ability: "COPPA · GDPR · CCPA",         power: 92, color: C.yellow  },
              { ability: "DEVELOPER AGREEMENTS",         power: 96, color: C.green   },
              { ability: "NFT / BLOCKCHAIN ITEMS",       power: 90, color: C.purple  },
              { ability: "GAMECOMPLIANCE™ ENGINE",        power: 99, color: C.orange  },
            ].map(a => (
              <div key={a.ability} style={{ marginBottom: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  fontSize: "6px", marginBottom: "3px" }}>
                  <span style={{ color: C.dim }}>{a.ability}</span>
                  <span style={{ color: a.color }}>{a.power}</span>
                </div>
                <div style={{ height: "10px", background: "#111", border: `2px solid ${a.color}44` }}>
                  <div style={{ height: "100%", width: `${a.power}%`,
                    background: a.color, boxShadow: `0 0 4px ${a.color}` }} />
                </div>
              </div>
            ))}
            <button className="btn-arcade btn-cyan" onClick={() => setPage("tool")}
              style={{ fontSize: "8px", padding: "10px 20px", marginTop: "12px" }}>
              PLAY GAMECOMPLIANCE™ FREE
            </button>
          </div>
        </div>
      </div>

      {/* LEVEL 3 — DIGITAL ASSETS (CYBER/NEON) */}
      <div style={{ border: `4px solid ${C.purple}`,
        background: "#0a0014", boxShadow: `0 0 30px ${C.purple}44` }}>

        <div style={{ background: `linear-gradient(135deg, #150026 0%, #200040 100%)`,
          padding: "16px 24px", borderBottom: `4px solid ${C.purple}`,
          display: "flex", justifyContent: "space-between" }}>
          <div className="neon-purple" style={{ fontSize: "10px", letterSpacing: "2px" }}>
            LEVEL 3 — CRYPTO DIMENSION
          </div>
          <div style={{ fontSize: "8px", color: C.purple }}>SECRET LEVEL</div>
        </div>

        <div style={{ padding: "32px 28px", display: "grid",
          gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
          <div>
            <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
              {["⛓️","💎","🔮"].map((ico, i) => (
                <div key={i} style={{
                  width: "52px", height: "52px",
                  background: `${C.purple}11`,
                  border: `3px solid ${C.purple}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "22px", boxShadow: `0 0 15px ${C.purple}66`,
                  animation: `neonPulse ${1.5 + i * 0.3}s ease-in-out infinite`,
                }}>{ico}</div>
              ))}
            </div>
            <h3 className="neon-purple" style={{ fontSize: "11px", letterSpacing: "2px",
              marginBottom: "16px", lineHeight: "1.5" }}>
              FINTECH &amp;<br />DIGITAL ASSETS
            </h3>
            <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
              color: "#bb88dd", lineHeight: "1.8" }}>
              In the crypto space since 2017. Co-hosted the CryptoLaw Podcast. Tracks GENIUS Act, CLARITY Act, and state-level digital asset legislation in real time. Stablecoins, token classification, FinCEN MSB, DeFi compliance, NFT legal structures.
            </p>
          </div>
          <div>
            <div style={{ fontSize: "7px", color: C.purple, letterSpacing: "2px", marginBottom: "16px" }}>
              ── CRYPTO SPELLBOOK ──
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                "STABLECOINS","TOKEN CLASS.","FINCEN·MSB","NFT LAW",
                "DEFI COMPLY","GENIUS ACT","CLARITY ACT","BLOCKCHAIN",
              ].map(spell => (
                <div key={spell} style={{
                  padding: "8px", border: `2px solid ${C.purple}44`,
                  background: `${C.purple}0a`, textAlign: "center",
                  fontSize: "6px", color: C.purple,
                  textShadow: `0 0 6px ${C.purple}`,
                  letterSpacing: "1px",
                }}>
                  {spell}
                </div>
              ))}
            </div>
            <button className="btn-arcade" onClick={() => setPage("contact")}
              style={{ fontSize: "8px", padding: "10px 20px", marginTop: "16px", width: "100%",
                background: C.purple, color: C.white,
                boxShadow: `4px 4px 0 #440066, 0 0 20px ${C.purple}88` }}>
              SUMMON ATTORNEY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GAMECOMPLIANCE TOOL — ARCADE HUD STYLE
// ═══════════════════════════════════════════════════════════
const MECHANICS = [
  "Virtual currency (purchased with real money)",
  "Loot boxes / gacha mechanics",
  "Battle pass / seasonal subscription",
  "Peer-to-peer item trading",
  "NFT / blockchain items",
  "Social features (chat, profiles)",
  "Cross-border multiplayer",
  "User-generated content (UGC)",
  "Advertising / ad monetization",
  "Real-money tournament prizes",
];
const MONETIZATION = [
  "In-app purchases (IAP)","Subscription / battle pass",
  "Premium (one-time purchase)","Advertising",
  "NFT / digital asset sales","Free-to-play with cosmetics",
];
const PLATFORMS = [
  "iOS App Store","Google Play","Steam (PC/Mac)",
  "PlayStation Network","Xbox / Microsoft Store",
  "Nintendo eShop","Web browser","Epic Games Store",
];
const MARKETS = [
  "United States","European Union","United Kingdom",
  "Belgium / Netherlands","China","Canada","Australia","Japan","Global / Worldwide",
];
const AUDIENCES = [
  "General audiences (13+)","Children (under 13) — COPPA territory",
  "Teen (13–17)","Adults only (18+)","Mixed / all ages",
];
const SYSTEM_PROMPT = `You are GameCompliance, an AI-powered legal compliance engine built by Wesley R. Williams, Esq., a California-licensed attorney (Bar No. 269157) specializing in gaming law, fintech regulation, virtual currency, and data privacy.

Analyze the specific mechanics and features described and identify legal/regulatory compliance issues with risk levels and remediation pathways.

Respond ONLY with valid JSON. No preamble, no markdown fences, no text outside the JSON.

Return exactly:
{
  "gameSummary": "2-sentence summary of the game profile analyzed",
  "overallRisk": "HIGH | MEDIUM | LOW",
  "issues": [
    {
      "id": "unique_id",
      "title": "Issue title",
      "severity": "HIGH | MEDIUM | LOW",
      "domain": "Legal domain",
      "mechanic": "Which feature triggers this",
      "explanation": "Plain-language explanation of the legal issue and why it applies (2-3 sentences)",
      "remediation": "Concrete steps to address this (2-3 sentences)"
    }
  ],
  "documentsNeeded": [
    { "name": "Document name", "reason": "Why this document is required" }
  ],
  "priorityAction": "The single most urgent thing the developer should do right now"
}

Be specific. Cite real laws: COPPA, GDPR, CCPA/CPRA, FTC Negative Option Rule, Belgian Gaming Act, FinCEN MSB rules, CARD Act, ESRB/PEGI requirements. Flag real enforcement risk.`;

const LOADING_MSGS = [
  "INITIALIZING COMPLIANCE ENGINE...",
  "MAPPING MECHANICS TO LEGAL FRAMEWORKS...",
  "CROSS-REFERENCING COPPA · GDPR · CCPA...",
  "SCANNING VIRTUAL CURRENCY EXPOSURE...",
  "EVALUATING LOOT BOX LAW...",
  "GENERATING DOCUMENT REQUIREMENTS...",
  "FINALIZING RISK CLASSIFICATIONS...",
];

function buildPrompt(form) {
  return `Analyze this game: MECHANICS: ${form.mechanics.join(", ")||"None"} | MONETIZATION: ${form.monetization.join(", ")||"None"} | AUDIENCE: ${form.audience} | PLATFORMS: ${form.platforms.join(", ")||"None"} | MARKETS: ${form.markets.join(", ")||"None"} | EXTRA: ${form.description||"None"}`;
}

function ArcadeCheckItem({ label, checked, onClick, color = C.cyan }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", gap: "10px",
      padding: "8px 12px", cursor: "crosshair", marginBottom: "4px",
      background: checked ? `${color}11` : C.surface,
      border: `2px solid ${checked ? color : C.darker}`,
      boxShadow: checked ? `0 0 8px ${color}44` : "none",
      transition: "all 0.05s steps(2)",
    }}>
      <div className={`pixel-check ${checked ? "checked" : ""}`}
        style={{ borderColor: checked ? color : C.darker,
          background: checked ? color : C.bg,
          boxShadow: checked ? `0 0 6px ${color}` : "none" }}>
        {checked && <span style={{ color: C.bg, fontSize: "10px", fontWeight: "900",
          fontFamily: "monospace" }}>X</span>}
      </div>
      <span style={{ fontSize: "7px", color: checked ? color : C.dim,
        letterSpacing: "0.5px", lineHeight: "1.5",
        textShadow: checked ? `0 0 6px ${color}` : "none" }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// GAMECOMPLIANCE USAGE LIMITS
// FREE_LIMIT: number of free analyses per device
// SUBSCRIBER_CODE: the access code you email to paying clients
//   ⚠️  CHANGE THIS TO A PRIVATE CODE BEFORE GOING LIVE
//   e.g. "GC-WRW-2025" — email it to subscribers after retainer execution
// ─────────────────────────────────────────────────────────
const FREE_LIMIT = 2;
const SUBSCRIBER_CODE = "GC-WRW-2025"; // ← CHANGE THIS
const STORAGE_KEY_USAGE  = "gc_usage_count";
const STORAGE_KEY_ACCESS = "gc_subscriber";

function GameCompliancePage({ setPage }) {
  const [gateScreen, setGateScreen] = useState(true);
  const [gateForm, setGateForm] = useState({ name: "", email: "", studio: "", toolConsent: false, marketingConsent: false, ageConfirm: false });
  const [gateError, setGateError] = useState("");
  const [toolScreen, setToolScreen] = useState("welcome");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ mechanics: [], monetization: [], audience: "", platforms: [], markets: [], description: "" });
  const [results, setResults] = useState(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MSGS[0]);
  const [error, setError] = useState(null);
  const [blinkOn, setBlinkOn] = useState(true);

  // Usage tracking — stored in localStorage so it persists across sessions
  const [usageCount, setUsageCount] = useState(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY_USAGE) || "0", 10); } catch { return 0; }
  });
  const [isSubscriber, setIsSubscriber] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY_ACCESS) === "true"; } catch { return false; }
  });
  const [accessCodeInput, setAccessCodeInput] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");

  const atLimit = !isSubscriber && usageCount >= FREE_LIMIT;

  const incrementUsage = () => {
    const next = usageCount + 1;
    setUsageCount(next);
    try { localStorage.setItem(STORAGE_KEY_USAGE, String(next)); } catch {}
  };

  const redeemAccessCode = () => {
    if (accessCodeInput.trim().toUpperCase() === SUBSCRIBER_CODE.toUpperCase()) {
      setIsSubscriber(true);
      try { localStorage.setItem(STORAGE_KEY_ACCESS, "true"); } catch {}
      setAccessCodeError("");
    } else {
      setAccessCodeError("INVALID CODE · CHECK YOUR EMAIL FROM WESLEY R. WILLIAMS ESQ.");
    }
  };

  useEffect(() => {
    const iv = setInterval(() => setBlinkOn(v => !v), 600);
    return () => clearInterval(iv);
  }, []);

  const toggle = (field, val) => setForm(f => ({
    ...f, [field]: f[field].includes(val) ? f[field].filter(x => x !== val) : [...f[field], val],
  }));

  const submitGate = () => {
    if (!gateForm.name.trim()) return setGateError("ERROR: NAME REQUIRED");
    if (!gateForm.email.includes("@")) return setGateError("ERROR: VALID EMAIL REQUIRED");
    if (!gateForm.ageConfirm) return setGateError("ERROR: MUST CONFIRM AGE 18+ TO CONTINUE");
    if (!gateForm.toolConsent) return setGateError("ERROR: MUST AGREE TO TERMS OF USE & PRIVACY POLICY");
    setGateError(""); setGateScreen(false);
  };

  const runAnalysis = async () => {
    setToolScreen("loading"); setError(null);
    let idx = 0;
    const iv = setInterval(() => { idx = Math.min(idx + 1, LOADING_MSGS.length - 1); setLoadingMsg(LOADING_MSGS[idx]); }, 1800);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-5", max_tokens: 8000,
          system: SYSTEM_PROMPT, messages: [{ role: "user", content: buildPrompt(form) }] }),
      });
      clearInterval(iv);
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(`API ERROR: ${d?.error?.message || res.status}`); setToolScreen("intake"); return; }
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      try { setResults(JSON.parse(text.replace(/```json\n?|```/g, "").trim())); incrementUsage(); setToolScreen("acknowledge"); }
      catch { setError(`PARSE ERROR: ${text.slice(0, 120)}`); setToolScreen("intake"); }
    } catch (e) { clearInterval(iv); setError(`NETWORK ERROR: ${e.message}`); setToolScreen("intake"); }
  };

  const high = results?.issues?.filter(i => i.severity === "HIGH").length || 0;
  const med  = results?.issues?.filter(i => i.severity === "MEDIUM").length || 0;
  const low  = results?.issues?.filter(i => i.severity === "LOW").length || 0;

  const steps = [
    { label: "STAGE 1: MECHANICS", content: (
      <div>
        <div className="neon-cyan" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "20px" }}>
          SELECT ALL GAME MECHANICS:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0" }}>
          {MECHANICS.map(m => <ArcadeCheckItem key={m} label={m} checked={form.mechanics.includes(m)} onClick={() => toggle("mechanics", m)} />)}
        </div>
      </div>
    )},
    { label: "STAGE 2: MONEY + PLATFORMS", content: (
      <div>
        <div className="neon-yellow" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "12px" }}>MONETIZATION:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: "20px" }}>
          {MONETIZATION.map(m => <ArcadeCheckItem key={m} label={m} checked={form.monetization.includes(m)} onClick={() => toggle("monetization", m)} color={C.yellow} />)}
        </div>
        <div className="neon-yellow" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "12px" }}>PLATFORMS:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {PLATFORMS.map(p => <ArcadeCheckItem key={p} label={p} checked={form.platforms.includes(p)} onClick={() => toggle("platforms", p)} color={C.yellow} />)}
        </div>
      </div>
    )},
    { label: "STAGE 3: AUDIENCE + MARKETS", content: (
      <div>
        <div className="neon-pink" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "12px" }}>TARGET PLAYER:</div>
        <select className="arcade-select" style={{ borderColor: C.pink, color: C.pink, marginBottom: "20px" }}
          value={form.audience} onChange={e => setForm(f => ({ ...f, audience: e.target.value }))}>
          <option value="">SELECT AUDIENCE...</option>
          {AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <div className="neon-pink" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "12px" }}>GEOGRAPHIC MARKETS:</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {MARKETS.map(m => <ArcadeCheckItem key={m} label={m} checked={form.markets.includes(m)} onClick={() => toggle("markets", m)} color={C.pink} />)}
        </div>
      </div>
    )},
    { label: "STAGE 4: FINAL BOSS NOTES", content: (
      <div>
        <div className="neon-green" style={{ fontSize: "8px", letterSpacing: "2px", marginBottom: "12px" }}>ADDITIONAL INTEL (OPTIONAL):</div>
        <textarea className="arcade-input" style={{ minHeight: "100px", resize: "vertical", color: C.green, borderColor: C.green }}
          placeholder="DESCRIBE YOUR GAME, SPECIAL MECHANICS, OR CONCERNS..."
          value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        <div style={{ marginTop: "16px", border: `2px solid ${C.green}44`, padding: "12px",
          background: `${C.green}08` }}>
          <div style={{ fontSize: "7px", color: C.green, marginBottom: "8px" }}>── MISSION SUMMARY ──</div>
          <div style={{ fontSize: "7px", color: C.dim, lineHeight: "2" }}>
            MECHANICS: {form.mechanics.length} SELECTED &nbsp;|&nbsp;
            MARKETS: {form.markets.length} &nbsp;|&nbsp;
            PLATFORMS: {form.platforms.length}
          </div>
        </div>
      </div>
    )},
  ];

  const sev_color = s => s === "HIGH" ? C.pink : s === "MEDIUM" ? C.yellow : C.cyan;

  // GATE SCREEN
  if (gateScreen) return (
    <div style={{ maxWidth: "640px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="neon-green" style={{ fontSize: "8px", letterSpacing: "3px", marginBottom: "12px" }}>
          ── INSERT COIN TO ACCESS ──
        </div>
        <h1 className="neon-cyan" style={{ fontSize: "clamp(14px, 3vw, 22px)", letterSpacing: "3px",
          marginBottom: "12px", lineHeight: "1.5" }}>
          GAMECOMPLIANCE™<br />FREE ACCESS
        </h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px" }}>
          ENTER YOUR PLAYER DATA TO CONTINUE
        </div>
      </div>

      <div style={{ border: `4px solid ${C.green}`, background: C.surface,
        padding: "32px", boxShadow: `0 0 30px ${C.green}33` }}>

        {[
          { label: "PLAYER NAME", field: "name", type: "text", ph: "JANE SMITH" },
          { label: "EMAIL ADDRESS", field: "email", type: "email", ph: "JANE@STUDIO.COM" },
          { label: "STUDIO/COMPANY (OPT)", field: "studio", type: "text", ph: "PIXEL FORGE STUDIOS" },
        ].map(({ label, field, type, ph }) => (
          <div key={field} style={{ marginBottom: "16px" }}>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
              marginBottom: "8px" }}>{label}:</div>
            <input type={type} placeholder={ph} className="arcade-input"
              value={gateForm[field]} onChange={e => setGateForm(g => ({ ...g, [field]: e.target.value }))} />
          </div>
        ))}

        {/* ── AGE CONFIRMATION (required) ── */}
        <div onClick={() => setGateForm(g => ({ ...g, ageConfirm: !g.ageConfirm }))}
          role="checkbox" aria-checked={gateForm.ageConfirm}
          tabIndex={0}
          onKeyDown={e => e.key === " " && setGateForm(g => ({ ...g, ageConfirm: !g.ageConfirm }))}
          style={{ display: "flex", gap: "14px", alignItems: "flex-start",
            cursor: "crosshair", padding: "14px",
            border: `2px solid ${gateForm.ageConfirm ? C.cyan : C.darker}`,
            background: gateForm.ageConfirm ? `${C.cyan}0a` : C.surface,
            marginTop: "8px", marginBottom: "10px",
            boxShadow: gateForm.ageConfirm ? `0 0 10px ${C.cyan}44` : "none" }}>
          <div style={{ width: "20px", height: "20px", border: `3px solid ${gateForm.ageConfirm ? C.cyan : C.darker}`,
            background: gateForm.ageConfirm ? C.cyan : C.bg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {gateForm.ageConfirm && <span style={{ color: C.bg, fontSize: "12px", fontFamily: "monospace", fontWeight: "900" }}>X</span>}
          </div>
          <div style={{ fontSize: "11px", color: gateForm.ageConfirm ? C.cyan : C.dim, lineHeight: "1.7", fontFamily: "'Courier New', monospace" }}>
            <strong>I confirm I am 18 years of age or older.</strong> This site is intended for adults only. (Required)
          </div>
        </div>

        {/* ── TOOL ACCESS CONSENT — required, lawful basis: contract performance ── */}
        <div onClick={() => setGateForm(g => ({ ...g, toolConsent: !g.toolConsent }))}
          role="checkbox" aria-checked={gateForm.toolConsent}
          tabIndex={0}
          onKeyDown={e => e.key === " " && setGateForm(g => ({ ...g, toolConsent: !g.toolConsent }))}
          style={{ display: "flex", gap: "14px", alignItems: "flex-start",
            cursor: "crosshair", padding: "14px",
            border: `2px solid ${gateForm.toolConsent ? C.green : C.darker}`,
            background: gateForm.toolConsent ? `${C.green}0a` : C.surface,
            marginBottom: "10px",
            boxShadow: gateForm.toolConsent ? `0 0 10px ${C.green}44` : "none" }}>
          <div style={{ width: "20px", height: "20px", border: `3px solid ${gateForm.toolConsent ? C.green : C.darker}`,
            background: gateForm.toolConsent ? C.green : C.bg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {gateForm.toolConsent && <span style={{ color: C.bg, fontSize: "12px", fontFamily: "monospace", fontWeight: "900" }}>X</span>}
          </div>
          <div style={{ fontSize: "11px", color: gateForm.toolConsent ? C.green : C.dim, lineHeight: "1.7", fontFamily: "'Courier New', monospace" }}>
            <strong>I agree to the <span style={{ color: C.green, textDecoration: "underline" }}>Terms of Use</span> and acknowledge the <span style={{ color: C.green, textDecoration: "underline" }}>Privacy Policy</span>.</strong>{" "}
            I understand my name and email will be collected to provide access to this tool, stored securely, and never sold. (Required)
          </div>
        </div>

        {/* ── MARKETING CONSENT — optional, separate per GDPR ── */}
        <div onClick={() => setGateForm(g => ({ ...g, marketingConsent: !g.marketingConsent }))}
          role="checkbox" aria-checked={gateForm.marketingConsent}
          tabIndex={0}
          onKeyDown={e => e.key === " " && setGateForm(g => ({ ...g, marketingConsent: !g.marketingConsent }))}
          style={{ display: "flex", gap: "14px", alignItems: "flex-start",
            cursor: "crosshair", padding: "14px",
            border: `2px solid ${gateForm.marketingConsent ? C.cyan : C.darker}`,
            background: gateForm.marketingConsent ? `${C.cyan}0a` : C.surface,
            marginBottom: "16px",
            boxShadow: gateForm.marketingConsent ? `0 0 10px ${C.cyan}44` : "none" }}>
          <div style={{ width: "20px", height: "20px", border: `3px solid ${gateForm.marketingConsent ? C.cyan : C.darker}`,
            background: gateForm.marketingConsent ? C.cyan : C.bg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            {gateForm.marketingConsent && <span style={{ color: C.bg, fontSize: "12px", fontFamily: "monospace", fontWeight: "900" }}>X</span>}
          </div>
          <div style={{ fontSize: "11px", color: gateForm.marketingConsent ? C.cyan : C.dim, lineHeight: "1.7", fontFamily: "'Courier New', monospace" }}>
            <strong style={{ color: gateForm.marketingConsent ? C.cyan : "#888" }}>(Optional)</strong> I'd like to receive legal updates, compliance alerts, and newsletters from Wesley R. Williams, Esq. I can unsubscribe at any time. This is separate from tool access.
          </div>
        </div>

        {gateError && <div style={{ fontSize: "8px", color: C.pink,
          textShadow: `0 0 8px ${C.pink}`, marginBottom: "12px",
          padding: "8px", border: `2px solid ${C.pink}` }}>{gateError}</div>}

        <button className="btn-arcade btn-green" onClick={submitGate}
          style={{ width: "100%", padding: "14px", fontSize: "9px" }}>
          ► ACCESS FREE TOOL ◄
        </button>
        <div style={{ fontSize: "11px", color: "#555", textAlign: "center",
          marginTop: "12px", lineHeight: "2", fontFamily: "'Courier New', monospace" }}>
          No payment required · Data never sold · Your privacy is protected.<br/>
          See our <button onClick={() => {}} style={{ background:"none", border:"none", color: C.cyan,
            fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"crosshair",
            textDecoration:"underline" }}>Privacy Policy</button> and <button
            onClick={() => {}} style={{ background:"none", border:"none", color: C.cyan,
            fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"crosshair",
            textDecoration:"underline" }}>Terms of Use</button>.
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 32px 80px" }}>

      {/* HUD Header — shows usage counter */}
      <div style={{ border: `3px solid ${C.green}`, background: "#000814",
        padding: "12px 20px", marginBottom: "24px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        boxShadow: `0 0 20px ${C.green}44` }}>
        <div className="neon-green" style={{ fontSize: "9px", letterSpacing: "2px" }}>
          GAMECOMPLIANCE™ ENGINE v1.0
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {isSubscriber ? (
            <div style={{ fontSize: "7px", color: C.mcGold, letterSpacing: "1px",
              textShadow: `0 0 8px ${C.mcGold}` }}>
              ★ SUBSCRIBER · UNLIMITED ACCESS
            </div>
          ) : (
            <div style={{ fontSize: "7px", letterSpacing: "1px" }}>
              <span style={{ color: C.dim }}>FREE ANALYSES: </span>
              {Array.from({ length: FREE_LIMIT }).map((_, i) => (
                <span key={i} style={{
                  display: "inline-block", width: "12px", height: "12px",
                  background: i < usageCount ? C.darker : C.green,
                  border: `2px solid ${i < usageCount ? "#333" : C.green}`,
                  marginLeft: "4px",
                  boxShadow: i < usageCount ? "none" : `0 0 6px ${C.green}`,
                }} />
              ))}
              <span style={{ color: C.dim, marginLeft: "8px" }}>
                {Math.max(0, FREE_LIMIT - usageCount)} REMAINING
              </span>
            </div>
          )}
          <div style={{ fontSize: "7px", color: C.dim }}>
            W.R. WILLIAMS ESQ · CA BAR 269157
          </div>
        </div>
      </div>

      {/* ── PAYWALL SCREEN — shown when free limit hit ── */}
      {atLimit && toolScreen !== "results" && (
        <div style={{ textAlign: "center" }}>

          {/* Pixelated game over banner */}
          <div style={{
            border: `4px solid ${C.pink}`,
            background: `linear-gradient(135deg, #1a0008 0%, #0a0005 100%)`,
            padding: "40px 32px", marginBottom: "28px",
            boxShadow: `0 0 40px ${C.pink}55`,
          }}>
            <div style={{ fontSize: "32px", marginBottom: "16px",
              animation: "float 2s ease-in-out infinite" }}>🪙</div>
            <div className="neon-pink" style={{ fontSize: "clamp(14px, 3vw, 22px)",
              letterSpacing: "3px", marginBottom: "8px",
              animation: "neonPulse 1.5s ease-in-out infinite" }}>
              FREE CREDITS USED
            </div>
            <div style={{ fontSize: "8px", color: C.dim, letterSpacing: "2px",
              marginBottom: "24px" }}>
              YOU'VE USED BOTH FREE ANALYSES
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
              color: "#bb8899", lineHeight: "1.8", maxWidth: "500px",
              margin: "0 auto 28px" }}>
              Subscribe to the General Counsel plan for unlimited GameCompliance™ analyses,
              plus contract review, monthly strategy calls, and full legal coverage
              at <strong style={{ color: C.mcGold }}>$2,500/month</strong>.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center",
              flexWrap: "wrap", marginBottom: "32px" }}>
              <button className="btn-arcade btn-pink" onClick={() => setPage("pricing")}
                style={{ fontSize: "9px", padding: "14px 28px" }}>
                ► SUBSCRIBE · $2,500/MO ◄
              </button>
              <button className="btn-arcade" onClick={() => setPage("contact")}
                style={{ fontSize: "9px", padding: "14px 24px",
                  background: "transparent", color: C.cyan,
                  border: `3px solid ${C.cyan}`,
                  boxShadow: `0 0 10px ${C.cyan}44` }}>
                BOOK FREE CONSULT
              </button>
            </div>

            {/* What subscribers get */}
            <div style={{ border: `2px solid ${C.mcGold}33`, background: `${C.mcGold}08`,
              padding: "20px", maxWidth: "480px", margin: "0 auto", textAlign: "left" }}>
              <div style={{ fontSize: "7px", color: C.mcGold, letterSpacing: "2px",
                marginBottom: "14px", textAlign: "center",
                textShadow: `0 0 8px ${C.mcGold}` }}>── SUBSCRIBER UNLOCKS ──</div>
              {[
                "Unlimited GameCompliance™ analyses",
                "Up to 3 contract reviews per month",
                "Monthly 45-min strategy call",
                "Unlimited email/messaging access",
                "Regulatory alerts when laws change",
                "Scope: gaming · real estate · fintech",
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: "10px",
                  fontSize: "11px", color: "#997755", fontFamily: "'Courier New', monospace",
                  padding: "5px 0",
                  borderBottom: i < 5 ? `1px solid ${C.mcGold}11` : "none" }}>
                  <span style={{ color: C.mcGold }}>★</span> {item}
                </div>
              ))}
            </div>
          </div>

          {/* Access code redemption */}
          <div style={{ border: `3px solid ${C.cyan}44`, background: C.surface,
            padding: "28px", maxWidth: "480px", margin: "0 auto" }}>
            <div style={{ fontSize: "8px", color: C.cyan, letterSpacing: "2px",
              marginBottom: "8px", textShadow: `0 0 8px ${C.cyan}` }}>
              ── ALREADY A SUBSCRIBER? ──
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
              color: C.dim, lineHeight: "1.7", marginBottom: "20px" }}>
              Enter the access code emailed to you by Wesley R. Williams, Esq.
              after your retainer was executed.
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="ENTER ACCESS CODE..."
                className="arcade-input"
                style={{ borderColor: C.cyan, color: C.cyan, flex: 1,
                  textTransform: "uppercase", letterSpacing: "2px" }}
                value={accessCodeInput}
                onChange={e => setAccessCodeInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && redeemAccessCode()}
              />
              <button className="btn-arcade btn-cyan" onClick={redeemAccessCode}
                style={{ fontSize: "8px", padding: "10px 16px", whiteSpace: "nowrap" }}>
                REDEEM
              </button>
            </div>
            {accessCodeError && (
              <div style={{ fontSize: "8px", color: C.pink, marginTop: "10px",
                padding: "8px", border: `2px solid ${C.pink}`,
                textShadow: `0 0 6px ${C.pink}` }}>{accessCodeError}</div>
            )}
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
              color: "#444455", marginTop: "12px", lineHeight: "1.8" }}>
              Don't have a code? Subscribe above and your code will be
              emailed within one business day of retainer execution.
            </div>
          </div>
        </div>
      )}

      {/* ── TOOL SCREENS — only shown when not at limit (or already on results) ── */}
      {(!atLimit || toolScreen === "results") && (
      <div>

      {/* Welcome */}
      {toolScreen === "welcome" && (
        <div style={{ textAlign: "center" }}>
          <div className="neon-green" style={{ fontSize: "clamp(14px, 2.5vw, 22px)",
            letterSpacing: "3px", marginBottom: "20px", lineHeight: "1.5",
            animation: "neonPulse 2s ease-in-out infinite" }}>
            KNOW YOUR LEGAL<br />EXPOSURE BEFORE YOU SHIP
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
            gap: "12px", marginBottom: "40px", maxWidth: "700px", margin: "0 auto 40px" }}>
            {[
              { icon: "⚖️", title: "ISSUE SPOTTING",   color: C.cyan   },
              { icon: "📋", title: "DOC CHECKLIST",    color: C.yellow },
              { icon: "🎯", title: "RISK LEVELS",      color: C.pink   },
            ].map(f => (
              <div key={f.title} style={{ border: `3px solid ${f.color}44`,
                background: `${f.color}08`, padding: "20px 12px", textAlign: "center",
                boxShadow: `0 0 10px ${f.color}22` }}>
                <div style={{ fontSize: "24px", marginBottom: "10px" }}>{f.icon}</div>
                <div style={{ fontSize: "7px", color: f.color, letterSpacing: "1px",
                  textShadow: `0 0 6px ${f.color}` }}>{f.title}</div>
              </div>
            ))}
          </div>
          <button className="btn-arcade btn-green" onClick={() => setToolScreen("intake")}
            style={{ fontSize: "10px", padding: "14px 32px", marginBottom: "32px" }}>
            ► PRESS START ◄
          </button>
          <div style={{ border: `2px solid ${C.darker}`, padding: "12px",
            fontSize: "7px", color: "#555", lineHeight: "2", background: C.surface }}>
            ⚠ GAMECOMPLIANCE™ PROVIDES LEGAL ISSUE-SPOTTING ONLY · NOT LEGAL ADVICE ·
            DOES NOT CREATE ATTORNEY-CLIENT RELATIONSHIP ·
            CONSULT LICENSED COUNSEL · W.R. WILLIAMS ESQ CA BAR 269157
          </div>
        </div>
      )}

      {/* Intake */}
      {toolScreen === "intake" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between",
            fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "8px" }}>
            <span>{steps[step].label}</span>
            <span>{step + 1} / {steps.length}</span>
          </div>
          <div style={{ height: "16px", background: "#111", border: `3px solid ${C.green}44`,
            marginBottom: "28px", overflow: "hidden" }}>
            <div style={{ height: "100%",
              width: `${((step + 1) / steps.length) * 100}%`,
              background: C.green, boxShadow: `0 0 10px ${C.green}`,
              transition: "width 0.3s steps(10)" }} />
          </div>

          <div style={{ border: `3px solid ${C.green}`, background: C.surface,
            padding: "28px", boxShadow: `0 0 20px ${C.green}22` }}>
            {steps[step].content}
            {error && <div style={{ fontSize: "8px", color: C.pink, padding: "10px",
              border: `2px solid ${C.pink}`, marginTop: "12px" }}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "28px" }}>
              <button className="btn-arcade" onClick={() => step === 0 ? setToolScreen("welcome") : setStep(s => s - 1)}
                style={{ background: "transparent", color: C.dim, border: `3px solid ${C.darker}`,
                  padding: "10px 20px", fontSize: "8px" }}>
                ◄ BACK
              </button>
              {step < steps.length - 1
                ? <button className="btn-arcade btn-cyan" onClick={() => setStep(s => s + 1)}
                    style={{ fontSize: "8px", padding: "10px 24px" }}>NEXT STAGE ►</button>
                : <button className="btn-arcade btn-green" onClick={runAnalysis}
                    style={{ fontSize: "8px", padding: "10px 24px" }}>RUN ANALYSIS ►</button>
              }
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {toolScreen === "loading" && (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: "40px", marginBottom: "20px",
            animation: "float 1s ease-in-out infinite" }}>⚖️</div>
          <div className="neon-green" style={{ fontSize: "11px", letterSpacing: "2px",
            marginBottom: "20px" }}>ANALYZING GAME DATA...</div>
          <div style={{ fontSize: "8px", color: C.green, letterSpacing: "1px",
            marginBottom: "32px", animation: "neonPulse 1s infinite" }}>{loadingMsg}</div>
          <div style={{ fontSize: "6px", color: C.dim, letterSpacing: "2px", lineHeight: "2.5" }}>
            COPPA · GDPR · CCPA · FTC RULES · STATE GAMING LAW · FINCEN · OFAC
          </div>
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "8px" }}>
            {[0,1,2,3,4].map(i => (
              <div key={i} style={{ width: "12px", height: "12px", background: C.green,
                animation: `blink ${0.8}s ${i * 0.15}s step-end infinite`,
                boxShadow: `0 0 6px ${C.green}` }} />
            ))}
          </div>
        </div>
      )}

      {/* Acknowledge */}
      {toolScreen === "acknowledge" && (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "32px", marginBottom: "16px",
              animation: "float 2s ease-in-out infinite" }}>⚠️</div>
            <div className="neon-yellow" style={{ fontSize: "10px", letterSpacing: "3px",
              marginBottom: "8px" }}>BEFORE YOU PROCEED</div>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px" }}>
              YOUR ANALYSIS IS READY · PLEASE READ AND CONFIRM
            </div>
          </div>

          <div style={{ border: `4px solid ${C.yellow}`, background: "#0e0a00",
            padding: "32px", boxShadow: `0 0 30px ${C.yellow}44`,
            marginBottom: "24px" }}>

            <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "3px",
              marginBottom: "20px", textShadow: `0 0 8px ${C.yellow}` }}>
              ── IMPORTANT DISCLOSURE ──
            </div>

            {[
              { icon: "⚖️", text: "This compliance analysis is LEGAL ISSUE-SPOTTING only. It is not legal advice and does not constitute the practice of law." },
              { icon: "🚫", text: "No attorney-client relationship is created by using GameCompliance™. Only a signed retainer agreement creates that relationship." },
              { icon: "📋", text: "This report identifies potential legal issues based on the information you provided. It may not identify every issue, and does not account for jurisdiction-specific nuances." },
              { icon: "👨‍⚖️", text: "You must consult a licensed attorney before acting on any information in this report. Wesley R. Williams, Esq. (CA Bar No. 269157) is available for consultation." },
              { icon: "📸", text: "If you share or screenshot any portion of this report, the disclaimer travels with it: THIS IS NOT LEGAL ADVICE." },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: i < 4 ? `1px solid ${C.darker}` : "none",
              }}>
                <div style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</div>
                <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
                  color: "#ccbb77", lineHeight: "1.7" }}>{item.text}</div>
              </div>
            ))}
          </div>

          {/* Checkbox confirmation */}
          <div style={{ border: `3px solid ${C.yellow}44`, background: C.surface,
            padding: "20px", marginBottom: "20px" }}>
            <ArcadeCheckItem
              label="I UNDERSTAND THAT THIS REPORT IS LEGAL ISSUE-SPOTTING ONLY — NOT LEGAL ADVICE — AND I WILL CONSULT A LICENSED ATTORNEY BEFORE ACTING ON ANY INFORMATION CONTAINED HEREIN."
              checked={!!results?._ack}
              onClick={() => setResults(r => ({ ...r, _ack: !r._ack }))}
              color={C.yellow}
            />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={() => { setToolScreen("welcome"); setStep(0); setResults(null); }}
              style={{ background: "transparent", color: C.dim,
                border: `2px solid ${C.darker}`, padding: "12px 20px",
                fontSize: "7px", letterSpacing: "1px", cursor: "crosshair",
                fontFamily: "'Press Start 2P'" }}>
              ◄ CANCEL
            </button>
            <button
              className={results?._ack ? "btn-arcade btn-yellow" : "btn-arcade"}
              disabled={!results?._ack}
              onClick={() => results?._ack && setToolScreen("results")}
              style={{
                flex: 1, fontSize: "9px", padding: "14px",
                background: results?._ack ? C.yellow : C.darker,
                color: results?._ack ? C.bg : "#555566",
                boxShadow: results?._ack ? `4px 4px 0 #886600, 0 0 20px ${C.yellow}88` : "none",
                cursor: results?._ack ? "crosshair" : "not-allowed",
                border: "none", letterSpacing: "1px",
              }}>
              {results?._ack ? "► I CONFIRM — VIEW MY REPORT ◄" : "CHECK THE BOX ABOVE TO CONTINUE"}
            </button>
          </div>

          <div style={{ fontSize: "6px", color: "#333344", textAlign: "center",
            marginTop: "12px", lineHeight: "2.2", letterSpacing: "0.5px" }}>
            YOUR ACKNOWLEDGMENT IS TIMESTAMPED: {new Date().toISOString()} ·
            W.R. WILLIAMS ESQ · CA BAR 269157 · ATTORNEY ADVERTISING
          </div>
        </div>
      )}

      {/* Results */}
      {toolScreen === "results" && results && (
        <div>

          {/* ── DISCLAIMER BANNER ── */}
          <div style={{
            border: `3px solid ${C.yellow}`,
            background: "#0e0900",
            padding: "12px 16px",
            marginBottom: "24px",
            boxShadow: `0 0 15px ${C.yellow}44`,
            display: "flex", gap: "12px", alignItems: "flex-start",
          }}>
            <div style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</div>
            <div>
              <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "2px",
                marginBottom: "4px", textShadow: `0 0 6px ${C.yellow}` }}>
                NOT LEGAL ADVICE
              </div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
                color: "#887733", lineHeight: "1.6" }}>
                This report identifies potential legal issues for informational purposes only.
                It does not constitute legal advice, create an attorney-client relationship,
                or substitute for consultation with a licensed attorney.
                Consult <strong style={{ color: "#ccaa44" }}>Wesley R. Williams, Esq. (CA Bar No. 269157)</strong> before acting on any item below.
              </div>
            </div>
          </div>

          {/* Results header */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <div style={{ fontSize: "8px", color: C.dim, letterSpacing: "3px", marginBottom: "12px" }}>
              ── ANALYSIS COMPLETE ──
            </div>
            <div style={{ fontSize: "clamp(14px, 3vw, 20px)", letterSpacing: "3px",
              color: results.overallRisk === "HIGH" ? C.pink : results.overallRisk === "MEDIUM" ? C.yellow : C.green,
              textShadow: `0 0 20px currentColor`, marginBottom: "8px" }}>
              OVERALL RISK: {results.overallRisk}
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
              color: "#8899aa", fontStyle: "italic" }}>{results.gameSummary}</div>
          </div>

          {/* Score boxes */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "28px" }}>
            {[[high, "HIGH RISK", C.pink],[med, "MED RISK", C.yellow],[low, "LOW RISK", C.cyan]].map(([n, l, c]) => (
              <div key={l} style={{ border: `3px solid ${c}`, background: `${c}0a`,
                padding: "16px", textAlign: "center", boxShadow: `0 0 15px ${c}44` }}>
                <div style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: "700", color: c,
                  textShadow: `0 0 15px ${c}`, letterSpacing: "-2px" }}>{n}</div>
                <div style={{ fontSize: "6px", color: C.dim, letterSpacing: "2px", marginTop: "6px" }}>{l}</div>
              </div>
            ))}
          </div>

          {/* Priority */}
          <div style={{ border: `3px solid ${C.yellow}`, background: `${C.yellow}0a`,
            padding: "16px 20px", marginBottom: "28px",
            boxShadow: `0 0 15px ${C.yellow}44` }}>
            <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "2px",
              marginBottom: "8px", textShadow: `0 0 8px ${C.yellow}` }}>⚡ PRIORITY MISSION:</div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
              color: "#ddcc88", lineHeight: "1.7" }}>{results.priorityAction}</div>
          </div>

          {/* Issues */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "3px", marginBottom: "16px" }}>
              ── IDENTIFIED ISSUES ({results.issues?.length}) ──
            </div>
            {results.issues?.map(issue => {
              const col = sev_color(issue.severity);
              return (
                <div key={issue.id} style={{ border: `3px solid ${col}`, background: `${col}06`,
                  padding: "16px 20px", marginBottom: "12px",
                  boxShadow: `0 0 10px ${col}33`, borderLeft: `8px solid ${col}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                      <span style={{ fontSize: "7px", padding: "3px 8px", background: col,
                        color: C.bg, letterSpacing: "1px" }}>{issue.severity}</span>
                      <span style={{ fontSize: "6px", color: C.dim, letterSpacing: "1px",
                        alignSelf: "center" }}>{issue.domain}</span>
                    </div>
                    <span style={{
                      fontSize: "6px", padding: "2px 8px", letterSpacing: "1px",
                      border: `1px solid ${C.yellow}66`, color: C.yellow,
                      background: `${C.yellow}0a`, whiteSpace: "nowrap",
                      fontFamily: "'Press Start 2P'",
                    }}>⚠ NOT LEGAL ADVICE</span>
                  </div>
                  <div style={{ fontSize: "9px", color: col, letterSpacing: "1px",
                    marginBottom: "6px", textShadow: `0 0 6px ${col}` }}>{issue.title}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "7px",
                    color: C.dim, marginBottom: "8px" }}>TRIGGERED BY: {issue.mechanic}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
                    color: "#8899bb", lineHeight: "1.7", marginBottom: "10px" }}>{issue.explanation}</div>
                  <div style={{ fontSize: "6px", color: C.green, letterSpacing: "2px",
                    marginBottom: "6px" }}>► REMEDIATION:</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
                    color: "#88cc88", lineHeight: "1.7", paddingLeft: "10px",
                    borderLeft: `3px solid ${C.green}` }}>{issue.remediation}</div>
                </div>
              );
            })}
          </div>

          {/* Documents */}
          <div style={{ border: `3px solid ${C.yellow}44`, background: C.surface,
            padding: "24px", marginBottom: "28px" }}>
            <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "3px",
              marginBottom: "16px" }}>── REQUIRED DOCUMENTS ──</div>
            {results.documentsNeeded?.map((doc, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start",
                padding: "10px 0", borderBottom: i < results.documentsNeeded.length - 1
                  ? `2px solid ${C.darker}` : "none" }}>
                <div style={{ fontSize: "18px", flexShrink: 0 }}>📄</div>
                <div>
                  <div style={{ fontSize: "8px", color: C.yellow, letterSpacing: "1px",
                    marginBottom: "4px", textShadow: `0 0 6px ${C.yellow}` }}>{doc.name}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
                    color: "#778866", lineHeight: "1.6" }}>{doc.reason}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ border: `4px solid ${C.pink}`, background: `${C.pink}0a`,
            padding: "28px", textAlign: "center",
            boxShadow: `0 0 30px ${C.pink}44`, marginBottom: "24px" }}>
            <div className="neon-pink" style={{ fontSize: "9px", letterSpacing: "2px",
              marginBottom: "12px", animation: "neonPulse 2s infinite" }}>
              ── NEXT LEVEL: RETAIN COUNSEL ──
            </div>
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
              color: "#bb8899", lineHeight: "1.8", maxWidth: "480px",
              margin: "0 auto 20px", fontStyle: "italic" }}>
              Wesley R. Williams, Esq. offers a free 30-minute consultation for developers who use GameCompliance™. Bring your report.
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button className="btn-arcade btn-pink" onClick={() => setPage("contact")}
                style={{ fontSize: "9px" }}>BOOK FREE CONSULT</button>
              <button className="btn-arcade btn-yellow" onClick={() => setPage("retainer")}
                style={{ fontSize: "9px" }}>SIGN RETAINER →</button>
            </div>
          </div>

          <button onClick={() => { setToolScreen("welcome"); setStep(0); setResults(null); }}
            style={{ background: "transparent", color: C.dim, border: `2px solid ${C.darker}`,
              padding: "10px 20px", fontSize: "7px", letterSpacing: "1px", cursor: "crosshair",
              fontFamily: "'Press Start 2P'" }}>
            ◄ NEW GAME
          </button>
        </div>
      )}
      </div>)} {/* end !atLimit tool screens wrapper */}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// RETAINER AGREEMENT PAGE
// ═══════════════════════════════════════════════════════════
function RetainerPage({ setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [juryWaived, setJuryWaived] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signForm, setSignForm] = useState({ name: "", email: "", studio: "", matter: "", date: new Date().toLocaleDateString() });
  const [signError, setSignError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [execTimestamp] = useState(new Date());
  const scrollRef = useRef();

  const handleScroll = () => {
    const el = scrollRef.current;
    if (el && el.scrollTop + el.clientHeight >= el.scrollHeight - 20) setScrolled(true);
  };

  const handleSign = () => {
    if (!signForm.name.trim()) return setSignError("ERROR: FULL NAME REQUIRED");
    if (!signForm.email.includes("@")) return setSignError("ERROR: VALID EMAIL REQUIRED");
    if (!signForm.matter.trim()) return setSignError("ERROR: MATTER DESCRIPTION REQUIRED");
    if (!agreed) return setSignError("ERROR: MUST AGREE TO FULL TERMS (CHECKBOX 1)");
    if (!juryWaived) return setSignError("ERROR: MUST SEPARATELY ACKNOWLEDGE JURY TRIAL WAIVER (CHECKBOX 2)");
    setSignError("");
    setConfirmed(true);
  };

  const handleDownloadPDF = () => {
    const ts = execTimestamp.toISOString();
    const dateStr = execTimestamp.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = execTimestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Retainer Agreement — ${signForm.name} — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; background: #fff; padding: 0; }
  .page { max-width: 750px; margin: 0 auto; padding: 60px 60px 80px; }
  h1 { font-size: 16pt; text-align: center; letter-spacing: 2px; margin-bottom: 6px; }
  h2 { font-size: 13pt; font-weight: bold; margin-top: 22px; margin-bottom: 8px; border-bottom: 1px solid #999; padding-bottom: 4px; }
  h3 { font-size: 11pt; font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
  p { margin-bottom: 10px; line-height: 1.7; }
  .center { text-align: center; }
  .header-block { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
  .header-block .atty { font-size: 13pt; font-weight: bold; margin-bottom: 4px; }
  .header-block .sub { font-size: 10pt; color: #333; line-height: 1.8; }
  .sig-block { margin-top: 32px; border: 2px solid #000; padding: 24px; background: #f9f9f9; }
  .sig-block .sig-title { font-size: 13pt; font-weight: bold; text-align: center; margin-bottom: 16px; letter-spacing: 1px; }
  .sig-row { display: flex; gap: 40px; margin-top: 12px; }
  .sig-field { flex: 1; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px; }
  .sig-label { font-size: 9pt; color: #555; margin-top: 2px; }
  .sig-value { font-size: 11pt; font-weight: bold; }
  .checkbox-record { margin: 8px 0; font-size: 10pt; line-height: 1.5; }
  .checkbox-record::before { content: "☑  "; font-size: 12pt; }
  .timestamp-box { margin-top: 20px; border: 1px solid #999; padding: 12px; background: #f0f0f0; font-size: 9pt; font-family: 'Courier New', monospace; line-height: 1.8; }
  .disclaimer { margin-top: 20px; font-size: 9pt; color: #555; font-style: italic; line-height: 1.6; border-top: 1px solid #ccc; padding-top: 12px; }
  .section-body { font-size: 11pt; line-height: 1.7; margin-bottom: 8px; }
  .warning { font-weight: bold; }
  .allcaps { font-size: 10pt; line-height: 1.6; }
  @media print {
    body { padding: 0; }
    .page { padding: 40px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="no-print" style="background:#1a3a5c;color:white;padding:14px 20px;margin-bottom:24px;font-family:Arial,sans-serif;font-size:12px;display:flex;justify-content:space-between;align-items:center;">
    <span>⬇ Save this page as PDF using your browser's Print function (Ctrl+P / Cmd+P) → "Save as PDF"</span>
    <button onclick="window.print()" style="background:#00fff5;color:#050508;border:none;padding:8px 18px;font-weight:bold;cursor:pointer;font-size:12px;">PRINT / SAVE PDF</button>
  </div>

  <div class="header-block">
    <div class="atty">ATTORNEY-CLIENT RETAINER AGREEMENT</div>
    <div class="sub">
      Wesley R. Williams, Esq. &nbsp;|&nbsp; California State Bar No. 269157<br/>
      weswilliamsesq@gmail.com &nbsp;|&nbsp; 619.305.6485 &nbsp;|&nbsp; San Diego, California<br/>
      <strong>ATTORNEY ADVERTISING</strong>
    </div>
  </div>

  <p>This Agreement is made between the Client identified below ("Client") and Wesley R. Williams, Esq. ("Attorney"). In consideration of the mutual promises herein, the parties agree as follows:</p>

  <h2>1. SCOPE OF REPRESENTATION</h2>
  <p class="section-body">Attorney agrees to represent Client in connection with the specific matter described by Client at the time of engagement ("the Matter"), within the following practice areas: gaming law and video game commerce, real estate and title insurance, fintech, and digital assets. This Agreement covers only the Matter or Subscription scope expressly identified. Any additional matters outside the defined scope require a separate written agreement or amendment.</p>
  <p class="section-body">Attorney's services may include, as applicable and agreed: legal research and analysis; drafting, reviewing, and negotiating contracts and agreements; regulatory compliance advice; and correspondence and communications on Client's behalf. Attorney will keep Client informed of the progress of the Matter and will respond within a reasonable time to Client's inquiries.</p>
  <p class="section-body">This Agreement will not become binding on either party, and Attorney will not begin providing legal services, until Client has executed this Agreement electronically and payment, if applicable, has been processed.</p>
  <p class="section-body warning">EXCLUSION — NO LITIGATION SERVICES: Attorney does not provide litigation services, court appearances, or representation in administrative, regulatory, arbitration, or judicial proceedings of any kind. This Agreement expressly excludes all litigation, government enforcement defense, and any matter requiring court or tribunal appearance. Clients requiring litigation services must retain separate litigation counsel.</p>

  <h2>2. FEES, BILLING, AND TRUST ACCOUNT DISCLOSURE</h2>
  <h3>A. Fee Structure.</h3>
  <p class="section-body">Attorney's fees are charged on a flat fee or monthly subscription basis as agreed at engagement. No hourly billing applies unless separately agreed in writing for overage services.</p>
  <h3>B. No Client Trust Account — Important Disclosure.</h3>
  <p class="section-body allcaps">CLIENT IS ADVISED THAT ATTORNEY DOES NOT MAINTAIN A CLIENT TRUST ACCOUNT (IOLTA ACCOUNT). Attorney does not hold client funds in trust. All fees are earned upon receipt or as services are rendered per the agreed fee structure. For Subscription clients, invoices are generated and delivered automatically by Stripe, Inc. on Attorney's behalf prior to each monthly charge. For non-subscription matters, Attorney will submit invoices to Client for all fees and expenses as described in this Agreement.</p>
  <h3>C. Invoicing and Payment.</h3>
  <p class="section-body">For Subscription clients, Stripe, Inc. automatically generates and emails a PDF invoice to Client before each monthly charge and a receipt upon successful payment. For non-subscription flat fee or overage matters, Attorney will issue invoices due within thirty (30) days. Unpaid fees bear interest at twelve percent (12%) per annum after thirty (30) days.</p>
  <h3>D. Rate Changes.</h3>
  <p class="section-body">Attorney shall give Client thirty (30) days written notice of any change to the fee schedule.</p>

  <h2>3. EXPENSES</h2>
  <p class="section-body">All reasonable expenses incurred by Attorney in handling Client's matter shall be paid by Client as incurred, including filing fees, postage, travel, and other case expenses. Mileage is charged at the IRS standard mileage rate.</p>

  <h2>4. NEGOTIATION AUTHORITY</h2>
  <p class="section-body">Attorney is authorized to enter into negotiations on behalf of Client as Attorney deems appropriate within the scope of this Agreement. No binding settlement, resolution, or agreement that affects Client's legal rights or financial obligations shall be entered into without Client's prior written approval.</p>

  <h2>5. SUBSCRIPTION TERMS AND AUTOMATIC RENEWAL</h2>
  <p class="section-body">If Client has enrolled in the General Counsel Subscription at $2,500 per month, the monthly fee covers: (a) unlimited email and messaging access, responses within one business day; (b) one monthly strategy call of up to 45 minutes; (c) up to three standard commercial contract reviews per month; and (d) full access to the GameCompliance™ platform.</p>
  <p class="section-body allcaps">THE SUBSCRIPTION WILL AUTOMATICALLY RENEW EACH MONTH AT $2,500 UNLESS CANCELLED. To cancel, Client must provide written notice to Attorney at weswilliamsesq@gmail.com at least thirty (30) days before the next billing date. No partial refunds are issued for mid-period cancellations.</p>
  <p class="section-body allcaps">By executing this Agreement and enrolling in the Subscription, Client expressly authorizes Stripe, Inc. to charge Client's payment method on file the amount of $2,500.00 on a recurring monthly basis until the Subscription is cancelled in accordance with the cancellation terms above.</p>
  <p class="section-body">Overage services are available at $350/hr under a separate written engagement agreement. All litigation remains excluded regardless of fee arrangement.</p>

  <h2>6. ELECTRONIC SIGNATURE AND COMMUNICATIONS</h2>
  <p class="section-body">The parties agree that this Agreement may be executed electronically. An electronic signature constitutes a valid and binding signature under the California Uniform Electronic Transactions Act (Cal. Civ. Code §§ 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.). Client's affirmative click-through assent constitutes Client's electronic signature and is legally equivalent to a handwritten signature.</p>

  <h2>7. CONFIDENTIALITY AND ATTORNEY-CLIENT PRIVILEGE</h2>
  <p class="section-body">Attorney will maintain the confidentiality of all information Client discloses in the course of representation, subject to the exceptions in California Rules of Professional Conduct Rule 1.6 and applicable law.</p>

  <h2>8. CONFLICTS OF INTEREST</h2>
  <p class="section-body">Attorney has conducted a conflicts check based on information available at the time of engagement. If a conflict of interest arises during the representation, Attorney will promptly notify Client.</p>

  <h2>9. CLIENT RESPONSIBILITIES</h2>
  <p class="section-body">Client agrees to: (a) provide Attorney with timely, accurate, and complete information; (b) cooperate fully with Attorney; (c) keep Attorney advised of current contact information; (d) notify Attorney of any changes in business affiliation; (e) pay invoices in accordance with this Agreement; and (f) make decisions on matters requiring Client's authorization.</p>

  <h2>10. ASSOCIATION OF OTHER ATTORNEYS</h2>
  <p class="section-body">Attorney may, with Client's consent, associate other attorneys to assist in representation. Any referral fee arrangements will be disclosed to Client in writing and comply with California Rules of Professional Conduct Rule 7.2(b).</p>

  <h2>11. DISCHARGE AND WITHDRAWAL</h2>
  <p class="section-body">Client may discharge Attorney at any time with written notice. Attorney may withdraw from representation for good cause including non-payment of fees, client misconduct, or any other basis permitted under the California Rules of Professional Conduct, upon reasonable notice to Client.</p>

  <h2>12. DISPUTE RESOLUTION AND JURY TRIAL WAIVER</h2>
  <p class="section-body">Any dispute regarding Attorney's fees shall be subject to mandatory fee arbitration under the California State Bar's fee arbitration program (Bus. & Prof. Code §§ 6200-6206) before filing a civil action. All other disputes shall be resolved by judicial reference or other civil proceeding in San Diego County, California.</p>
  <p class="section-body allcaps warning">JURY TRIAL WAIVER: By executing this Agreement, Client confirms that Client has read and understands the dispute resolution provisions and voluntarily agrees to resolution by judicial reference or other court proceeding. IN DOING SO, CLIENT AND ATTORNEY VOLUNTARILY WAIVE IMPORTANT CONSTITUTIONAL RIGHTS TO TRIAL BY JURY. Client is advised that Client has the right to have an independent attorney review this provision prior to signing.</p>

  <h2>13. PREVAILING PARTY ATTORNEY FEES</h2>
  <p class="section-body">In any dispute arising from this Agreement, the prevailing party shall be entitled to recover reasonable attorney's fees and costs from the non-prevailing party.</p>

  <h2>14. TAX DISCLOSURE</h2>
  <p class="section-body allcaps">ATTORNEY FEES MAY BE DEDUCTIBLE AS A BUSINESS EXPENSE UNDER APPLICABLE TAX LAW. CLIENT SHOULD CONSULT A QUALIFIED TAX PROFESSIONAL REGARDING THE DEDUCTIBILITY OF LEGAL FEES IN CLIENT'S SPECIFIC CIRCUMSTANCES. ATTORNEY MAKES NO REPRESENTATION REGARDING THE TAX TREATMENT OF ANY FEES PAID UNDER THIS AGREEMENT.</p>

  <h2>15. GAMECOMPLIANCE™ DISCLAIMER</h2>
  <p class="section-body">If Client was referred through the GameCompliance™ platform, Client acknowledges that: (a) use of the GameCompliance™ tool did not create an attorney-client relationship; (b) the analysis generated by GameCompliance™ constituted legal issue-spotting only and did not constitute legal advice; and (c) this Retainer Agreement, once executed, establishes the attorney-client relationship.</p>

  <h2>16. GOVERNING LAW / SEVERABILITY</h2>
  <p class="section-body">This Agreement shall be construed under and governed by the laws of the State of California. If any provision is found invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>

  <h2>17. PARTIES BOUND / ENTIRE AGREEMENT</h2>
  <p class="section-body">This Agreement shall be binding upon and inure to the benefit of the parties and their respective heirs, executors, administrators, legal representatives, successors, and assigns where permitted. This Agreement constitutes the sole and entire agreement between the parties and may be modified only by a written instrument signed by both parties.</p>

  <h2>18. EFFECTIVE DATE</h2>
  <p class="section-body">This Agreement is effective as of the date of electronic execution by Client. Attorney's services rendered prior to formal execution are covered by this Agreement, and Client acknowledges that the reasonable value of any such services is owed regardless of whether this Agreement is formally executed.</p>

  <!-- SIGNATURE BLOCK -->
  <div class="sig-block">
    <div class="sig-title">EXECUTION RECORD — ELECTRONIC SIGNATURE</div>

    <div class="sig-row">
      <div style="flex:1">
        <div class="sig-label">CLIENT FULL NAME</div>
        <div class="sig-value">${signForm.name}</div>
      </div>
      <div style="flex:1">
        <div class="sig-label">CLIENT EMAIL</div>
        <div class="sig-value">${signForm.email}</div>
      </div>
    </div>

    <div class="sig-row" style="margin-top:12px">
      <div style="flex:1">
        <div class="sig-label">STUDIO / COMPANY</div>
        <div class="sig-value">${signForm.studio || "N/A"}</div>
      </div>
      <div style="flex:1">
        <div class="sig-label">MATTER / SUBSCRIPTION TYPE</div>
        <div class="sig-value">${signForm.matter}</div>
      </div>
    </div>

    <div style="margin-top:20px">
      <div class="sig-label" style="margin-bottom:8px">ACKNOWLEDGMENTS CONFIRMED BY CLIENT:</div>
      <div class="checkbox-record">I have read, understood, and agree to all terms and conditions of this Attorney-Client Retainer Agreement.</div>
      <div class="checkbox-record">I separately and specifically acknowledge the Jury Trial Waiver in Section 12 and voluntarily waive my constitutional right to a jury trial.</div>
    </div>

    <div class="timestamp-box">
      EXECUTION DATE: ${dateStr}<br/>
      EXECUTION TIME: ${timeStr}<br/>
      EXECUTION TIMESTAMP (ISO 8601 / UTC): ${ts}<br/>
      SIGNATURE METHOD: Electronic Click-Through (UETA Cal. Civ. Code §§ 1633.1 et seq. / eSign Act 15 U.S.C. § 7001)<br/>
      ATTORNEY: Wesley R. Williams, Esq. — CA Bar No. 269157
    </div>

    <div style="margin-top:24px;display:flex;justify-content:space-between;gap:40px">
      <div style="flex:1;border-top:1px solid #000;padding-top:8px">
        <div style="font-size:14pt;font-weight:bold">/s/ ${signForm.name}</div>
        <div style="font-size:9pt;color:#555">CLIENT — Electronic Signature</div>
        <div style="font-size:9pt;color:#555">${dateStr}</div>
      </div>
      <div style="flex:1;border-top:1px solid #000;padding-top:8px">
        <div style="font-size:14pt;font-weight:bold">/s/ Wesley R. Williams</div>
        <div style="font-size:9pt;color:#555">ATTORNEY — Wesley R. Williams, Esq.</div>
        <div style="font-size:9pt;color:#555">CA Bar No. 269157 — Countersignature pending</div>
      </div>
    </div>
  </div>

  <div class="disclaimer">
    This document constitutes a legally binding attorney-client retainer agreement executed electronically pursuant to the California Uniform Electronic Transactions Act and the federal Electronic Signatures in Global and National Commerce Act. Retain this document for your records. Wesley R. Williams, Esq. is licensed to practice law in the State of California only. This website constitutes attorney advertising. Prior results do not guarantee a similar outcome.
  </div>

</div>
</body>
</html>`);
    printWindow.document.close();
    printWindow.focus();
  };

  if (confirmed) return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "120px 32px 80px", textAlign: "center" }}>
      <div style={{ border: `4px solid ${C.green}`, background: C.surface, padding: "48px",
        boxShadow: `0 0 40px ${C.green}66` }}>
        <div style={{ fontSize: "48px", marginBottom: "20px",
          animation: "float 2s ease-in-out infinite" }}>✅</div>
        <div className="neon-green" style={{ fontSize: "12px", letterSpacing: "3px",
          marginBottom: "16px" }}>RETAINER EXECUTED</div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
          color: "#88cc88", lineHeight: "2", marginBottom: "24px" }}>
          Congratulations, {signForm.name}.<br />
          Your retainer agreement has been executed electronically.<br /><br />
          Wesley R. Williams, Esq. will be in touch within one business day.
        </div>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "28px" }}>
          EXECUTION TIMESTAMP: {execTimestamp.toISOString()}<br />
          CA BAR NO. 269157 · ELECTRONIC SIGNATURE VALID UNDER UETA
        </div>

        {/* PDF Download CTA */}
        <div style={{ border: `3px solid ${C.yellow}`, background: `${C.yellow}0a`,
          padding: "20px", marginBottom: "24px", boxShadow: `0 0 20px ${C.yellow}33` }}>
          <div style={{ fontSize: "8px", color: C.yellow, letterSpacing: "2px",
            marginBottom: "10px", textShadow: `0 0 8px ${C.yellow}` }}>
            ── SAVE YOUR COPY ──
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
            color: "#aaaa66", lineHeight: "1.8", marginBottom: "16px" }}>
            Download a PDF copy of your signed retainer agreement for your records.
            When the document opens, press <strong style={{ color: C.yellow }}>Ctrl+P</strong> (Windows)
            or <strong style={{ color: C.yellow }}>Cmd+P</strong> (Mac) and select
            <strong style={{ color: C.yellow }}> "Save as PDF"</strong>.
          </div>
          <button className="btn-arcade btn-yellow" onClick={handleDownloadPDF}
            style={{ fontSize: "9px", padding: "12px 28px" }}>
            ⬇ DOWNLOAD SIGNED RETAINER PDF
          </button>
        </div>

        <button className="btn-arcade btn-cyan" onClick={() => setPage("contact")}
          style={{ fontSize: "8px" }}>CONTACT ATTORNEY</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.yellow}` }}>
          ── LEGAL CONTRACT ──
        </div>
        <h1 className="neon-yellow" style={{ fontSize: "clamp(12px, 2.5vw, 20px)",
          letterSpacing: "3px", marginBottom: "8px" }}>
          ATTORNEY RETAINER AGREEMENT
        </h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px" }}>
          WESLEY R. WILLIAMS, ESQ. · CA BAR NO. 269157
        </div>
      </div>

      {/* Scroll to read notice */}
      {!scrolled && (
        <div style={{ border: `2px solid ${C.yellow}44`, background: `${C.yellow}08`,
          padding: "12px", marginBottom: "16px", fontSize: "7px",
          color: C.yellow, textAlign: "center", letterSpacing: "1px",
          animation: "neonPulse 2s infinite" }}>
          ▼ SCROLL TO READ FULL AGREEMENT BEFORE SIGNING ▼
        </div>
      )}

      {/* Agreement text */}
      <div ref={scrollRef} className="retainer-scroll" onScroll={handleScroll}>
        <div style={{ lineHeight: "2" }}>

<strong style={{ color: C.yellow, display: "block", marginBottom: "16px", fontSize: "13px" }}>
ATTORNEY-CLIENT RETAINER AGREEMENT
</strong>
<strong style={{ color: "#aabbcc" }}>Wesley R. Williams, Esq.</strong>{"\n"}
California State Bar No. 269157{"\n"}
weswilliamsesq@gmail.com | 619.305.6485{"\n"}
San Diego, California{"\n\n"}

This Agreement is made between the Client identified below ("Client") and Wesley R. Williams, Esq. ("Attorney"). In consideration of the mutual promises herein, the parties agree as follows:{"\n\n"}

<strong style={{ color: C.yellow }}>1. SCOPE OF REPRESENTATION</strong>{"\n\n"}
Attorney agrees to represent Client in connection with the specific matter described by Client at the time of engagement ("the Matter"), within the following practice areas: gaming law and video game commerce, real estate and title insurance, fintech, and digital assets. This Agreement covers only the Matter or Subscription scope expressly identified. Any additional matters outside the defined scope require a separate written agreement or amendment.{"\n\n"}

Attorney's services may include, as applicable and agreed: legal research and analysis; drafting, reviewing, and negotiating contracts and agreements; regulatory compliance advice; and correspondence and communications on Client's behalf. Attorney will keep Client informed of the progress of the Matter and will respond within a reasonable time to Client's inquiries.{"\n\n"}

This Agreement will not become binding on either party, and Attorney will not begin providing legal services, until Client has executed this Agreement electronically and payment, if applicable, has been processed.{"\n\n"}

<strong style={{ color: C.pink, fontSize: "12px" }}>EXCLUSION — NO LITIGATION SERVICES:</strong>{" "}
<strong style={{ color: "#ffaaaa" }}>Attorney does not provide litigation services, court appearances, or representation in administrative, regulatory, arbitration, or judicial proceedings of any kind. This Agreement expressly excludes all litigation, government enforcement defense, and any matter requiring court or tribunal appearance. Clients requiring litigation services must retain separate litigation counsel. Nothing in this Agreement shall be construed to create an obligation on the part of Attorney to appear in any court or proceeding.</strong>{"\n\n"}

<strong style={{ color: C.yellow }}>2. FEES, BILLING, AND TRUST ACCOUNT DISCLOSURE</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>A. Fee Structure.</strong>{" "}Attorney's fees are charged on a flat fee or monthly subscription basis as agreed at engagement. No hourly billing applies unless separately agreed in writing for overage services. Attorney will provide Client with the applicable fee structure in writing at or before commencement of representation.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>B. No Client Trust Account — Important Disclosure.</strong>{" "}
<strong style={{ color: "#ffdd88" }}>CLIENT IS ADVISED THAT ATTORNEY DOES NOT MAINTAIN A CLIENT TRUST ACCOUNT (IOLTA ACCOUNT). Attorney does not hold client funds in trust. All fees are earned upon receipt or as services are rendered per the agreed fee structure. For Subscription clients, invoices are generated and delivered automatically by Stripe, Inc. on Attorney's behalf prior to each monthly charge. For non-subscription matters, Attorney will submit invoices to Client for all fees and expenses as described in this Agreement.</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>C. Invoicing and Payment.</strong>{" "}For Subscription clients, Stripe, Inc. automatically generates and emails a PDF invoice to Client before each monthly charge and a receipt upon successful payment. No manual invoice submission is required for recurring Subscription fees. For non-subscription flat fee or overage matters, Attorney will issue invoices which are due within thirty (30) days of the invoice date. Unpaid fees and expenses not paid within thirty (30) days of the statement date shall bear interest at the rate of twelve percent (12%) per annum until paid.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>D. Rate Changes.</strong>{" "}Attorney shall give Client thirty (30) days written notice of any change to the fee schedule. If Client does not agree to the new rate schedule, Client may terminate this Agreement and Attorney may withdraw from representation.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>E. No Guarantees.</strong>{" "}No promises or guarantees as to the outcome of any matter have been made to Client by Attorney. No other representations have been made to Client except those set out in this Agreement.{"\n\n"}

<strong style={{ color: C.yellow }}>3. EXPENSES</strong>{"\n\n"}
All reasonable expenses incurred by Attorney in handling Client's matter shall be paid by Client as incurred. Expenses include but are not limited to: filing fees, postage, overnight fees, state regulatory filing fees, copy costs, certified copies, transcripts, records, travel, parking, and any other case expenses. Online research fees are charged at service provider standard fee. Filing fees are charged at service provider standard fee. Mileage is charged at the IRS standard mileage rate. Each billing will reflect the legal services rendered and expenses, if any, incurred during the billing period.{"\n\n"}

<strong style={{ color: C.yellow }}>4. NEGOTIATION AUTHORITY</strong>{"\n\n"}
<strong style={{ color: "#aabbcc" }}>A. Authority to Negotiate.</strong>{" "}Attorney is authorized to enter into negotiations on behalf of Client in connection with the Matter as Attorney deems appropriate, including contract negotiations, regulatory inquiries, and commercial disputes within the scope of this Agreement. Client grants to Attorney authority to handle negotiations and discussions regarding Client's legal matter to the same extent as Client could do so in person, subject to the limitation in Section 4(B) below.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>B. No Settlement Without Approval.</strong>{" "}Notwithstanding the foregoing, <strong style={{ color: "#ffdd88" }}>no binding settlement, resolution, or agreement that affects Client's legal rights or financial obligations shall be entered into without Client's prior written approval.</strong> Attorney will present all material settlement or resolution proposals to Client before any commitment is made.{"\n\n"}

<strong style={{ color: C.yellow }}>5. SUBSCRIPTION TERMS AND AUTOMATIC RENEWAL</strong>{"\n\n"}
If Client has enrolled in the General Counsel Subscription at $2,500 per month ("Subscription"), the following terms apply:{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Scope of Subscription.</strong>{" "}The monthly Subscription fee covers the following services within the defined practice areas: (a) unlimited email and messaging access for legal questions, with responses within one business day; (b) one monthly strategy call of up to 45 minutes; (c) up to three standard commercial contract reviews per month; and (d) full access to the GameCompliance™ compliance platform and regulatory alert service. Subscription services are subject to the litigation exclusion in Section 1 above.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Automatic Renewal Disclosure — Required by California Business & Professions Code §17601 et seq.</strong>{"\n"}
<strong style={{ color: "#ffdd88" }}>THE SUBSCRIPTION WILL AUTOMATICALLY RENEW EACH MONTH AT $2,500 UNLESS CANCELLED. Your subscription will be charged to the payment method on file on the same calendar date each month. To cancel, Client must provide written notice to Attorney at weswilliamsesq@gmail.com at least thirty (30) days before the next billing date. Cancellation takes effect at the end of the then-current billing period. No partial refunds are issued for mid-period cancellations.</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Overage Services.</strong>{" "}Work outside the Subscription scope — including matters exceeding three contract reviews per month, complex transactions, M&A, and government enforcement matters not requiring court appearance — is available at $350/hr, billed separately under a written engagement agreement. All litigation remains excluded regardless of fee arrangement.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Modification of Subscription Terms.</strong>{" "}Attorney reserves the right to modify Subscription pricing or scope upon sixty (60) days written notice. Client may cancel without penalty during the notice period.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Payment Processing and Recurring Charge Authorization.</strong>{" "}Subscription payments are processed by Stripe, Inc. Attorney does not store Client's payment card information. <strong style={{ color: "#ffdd88" }}>By executing this Agreement and enrolling in the Subscription, Client expressly authorizes Stripe, Inc. to charge Client's payment method on file the amount of $2,500.00 on a recurring monthly basis, on the same calendar date each month, until the Subscription is cancelled in accordance with the cancellation terms above. This authorization remains in effect until Client provides written cancellation notice as specified herein.</strong> Failed payments result in a 7-day grace period before Subscription suspension.{"\n\n"}

<strong style={{ color: C.yellow }}>6. ELECTRONIC SIGNATURE AND COMMUNICATIONS</strong>{"\n\n"}
The parties agree that this Agreement may be executed electronically. An electronic signature constitutes a valid and binding signature under the California Uniform Electronic Transactions Act (Cal. Civ. Code §§ 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.). Client's affirmative click-through assent constitutes Client's electronic signature and is legally equivalent to a handwritten signature. The parties consent to communicate by electronic mail, which satisfies any writing requirements under the California Rules of Professional Conduct.{"\n\n"}

<strong style={{ color: C.yellow }}>7. CONFIDENTIALITY AND ATTORNEY-CLIENT PRIVILEGE</strong>{"\n\n"}
Attorney will maintain the confidentiality of all information Client discloses in the course of representation, subject to the exceptions in California Rules of Professional Conduct Rule 1.6 and applicable law. All communications between Client and Attorney made for the purpose of seeking or providing legal advice are protected by the attorney-client privilege.{"\n\n"}

<strong style={{ color: C.yellow }}>8. CONFLICTS OF INTEREST</strong>{"\n\n"}
Attorney has conducted a conflicts check based on information available at the time of engagement. If a conflict of interest arises during the representation, Attorney will promptly notify Client and address the conflict in accordance with the California Rules of Professional Conduct.{"\n\n"}

<strong style={{ color: C.yellow }}>9. CLIENT RESPONSIBILITIES AND COOPERATION</strong>{"\n\n"}
Client agrees to: (a) provide Attorney with timely, accurate, and complete information necessary to the representation; (b) cooperate fully with Attorney; (c) keep Attorney advised of Client's current address, phone number, and contact information at all times; (d) notify Attorney of any changes in business affiliation during the period Attorney's services are required; (e) pay invoices in accordance with this Agreement; and (f) make decisions on matters requiring Client's authorization. Client shall comply with all reasonable requests of Attorney in connection with the preparation and presentation of Client's legal matter.{"\n\n"}

Attorney may withdraw from the case and cease to represent Client for any reason permitted by the California Rules of Professional Conduct, including without limitation: Client's failure to timely pay fees and expenses in accordance with this Agreement, Client's failure to cooperate or communicate with Attorney, or any fact or circumstance that would render Attorney's representation unlawful or unethical.{"\n\n"}

<strong style={{ color: C.yellow }}>10. ASSOCIATION OF OTHER ATTORNEYS OR SERVICES</strong>{"\n\n"}
Attorney may, at Attorney's sole discretion, employ any other person or service that Attorney believes is necessary to assist in this representation. Should it become advisable to refer this matter or any part thereof, or to associate or consult with another attorney or law firm of established competence, Attorney will provide Client with information regarding any division of fee arrangement, including: (a) the identity of all lawyers or law firms who will participate; (b) the basis upon which fees will be divided; and (c) the share of the fee each lawyer or law firm will receive. Attorney will request Client's written consent to any such arrangement before it is made.{"\n\n"}

<strong style={{ color: C.yellow }}>11. DISCHARGE AND WITHDRAWAL</strong>{"\n\n"}
Client may discharge Attorney at any time with written notice. Attorney may withdraw with Client's consent, or for good cause, which includes Client's breach of this Agreement, refusal to cooperate or communicate with Attorney, or any fact or circumstance that would render Attorney's representation unlawful or unethical. Upon termination, Attorney will deliver Client's file and property in Attorney's possession, unless subject to lien for unpaid fees, whether or not Client has completed payment for all services rendered.{"\n\n"}

<strong style={{ color: C.yellow }}>12. DISPUTE RESOLUTION AND FEE ARBITRATION</strong>{"\n\n"}
Client has the right to request mandatory fee arbitration through the State Bar of California Fee Arbitration Program before filing a lawsuit, pursuant to California Business and Professions Code §§ 6200–6206. Client may exercise this right by notifying Attorney in writing within thirty (30) days of receiving a final billing statement.{"\n\n"}

If, after receiving notice of this right to arbitrate, Client elects not to proceed under the State Bar fee arbitration procedures by not filing a request for fee arbitration within thirty (30) days, any dispute over fees, charges, costs, expenses, or any other dispute between Client and Attorney will be resolved via judicial reference without jury. Any matter within the jurisdiction of the probate, small claims, or bankruptcy court shall be excluded from the requirement of judicial reference. The sole and exclusive venue for fee arbitration and any legal dispute shall be San Diego County, California, and/or the Southern District of California (if Federal Court).{"\n\n"}

<strong style={{ color: "#ffdd88" }}>JURY TRIAL WAIVER: By executing this Agreement, Client confirms that Client has read and understands the dispute resolution provisions above and voluntarily agrees to resolution by judicial reference or other court proceeding as warranted in the event Client does not elect State Bar fee arbitration procedures. In doing so, Client and Attorney voluntarily waive important constitutional rights to trial by jury. Client is advised that Client has the right to have an independent attorney review this dispute resolution provision and this entire Agreement prior to signing.</strong>{"\n\n"}

<strong style={{ color: C.yellow }}>13. PREVAILING PARTY ATTORNEY FEES</strong>{"\n\n"}
In the event either party brings an action to enforce any provision of this Agreement, the prevailing party shall be entitled to recover reasonable attorney fees and costs incurred in such action.{"\n\n"}

<strong style={{ color: C.yellow }}>14. TAX DISCLOSURE AND ACKNOWLEDGMENT</strong>{"\n\n"}
<strong style={{ color: "#ffdd88" }}>CLIENT IS ADVISED TO OBTAIN INDEPENDENT AND COMPETENT TAX ADVICE REGARDING THESE LEGAL MATTERS SINCE LEGAL TRANSACTIONS CAN GIVE RISE TO TAX CONSEQUENCES. ATTORNEY HAS NOT AGREED TO RENDER ANY TAX ADVICE AND IS NOT RESPONSIBLE FOR ANY ADVICE REGARDING TAX MATTERS OR PREPARATION OF TAX RETURNS OR OTHER FILINGS, INCLUDING BUT NOT LIMITED TO STATE AND FEDERAL INCOME AND INHERITANCE TAX RETURNS. CLIENT SHOULD OBTAIN PROFESSIONAL HELP REGARDING THE VALUATION AND LOCATION OF ALL ASSETS WHICH MAY BE THE SUBJECT OF A LEGAL MATTER.</strong>{"\n\n"}

<strong style={{ color: C.yellow }}>15. DISCLAIMER — GAMECOMPLIANCE™</strong>{"\n\n"}
If Client was referred through the GameCompliance™ platform, Client acknowledges that: (a) use of the GameCompliance™ tool did not create an attorney-client relationship; (b) the analysis generated by GameCompliance™ constituted legal issue-spotting only and did not constitute legal advice; and (c) this Retainer Agreement, once executed, establishes the attorney-client relationship for the specific Matter or Subscription identified herein.{"\n\n"}

<strong style={{ color: C.yellow }}>16. CALIFORNIA LAW — GOVERNING LAW AND CONSTRUCTION</strong>{"\n\n"}
This Agreement shall be construed under the laws of California. All obligations of the parties created hereunder are performable in San Diego County, California. If any provision of this Agreement is held invalid, illegal, or unenforceable for any reason, such invalidity shall not affect any other provision, and this Agreement shall be construed as if such provision had never been contained herein.{"\n\n"}

<strong style={{ color: C.yellow }}>17. PARTIES BOUND — ENTIRE AGREEMENT</strong>{"\n\n"}
This Agreement shall be binding upon and inure to the benefit of the parties and their respective heirs, executors, administrators, legal representatives, successors, and assigns where permitted. This Agreement constitutes the sole and entire agreement between the parties, supersedes all prior understandings or written or oral agreements concerning the subject matter hereof, and may be modified only by a written instrument signed by both parties.{"\n\n"}

<strong style={{ color: C.yellow }}>18. EFFECTIVE DATE</strong>{"\n\n"}
This Agreement will govern all legal services beginning on the date that Attorney began performing work for Client. The date of electronic execution is used for reference only. <strong style={{ color: "#ffdd88" }}>Client will be required to pay Attorney the reasonable value of services performed by Attorney, even if this Agreement never formally takes effect.</strong> Attorney will not begin providing legal services, however, until Client has executed this Agreement electronically and any required payment has been processed.{"\n\n"}

<em style={{ color: "#778866", fontSize: "11px" }}>
This Agreement is governed by the California Rules of Professional Conduct and applicable provisions of the California Business and Professions Code, including Business and Professions Code §§ 6200–6206 (fee arbitration) and §§ 17601 et seq. (automatic renewal). Wesley R. Williams, Esq. · CA Bar No. 269157 · Attorney Advertising.
</em>

        </div>
      </div>

      {/* Must scroll notice */}
      {!scrolled && (
        <div style={{ fontSize: "7px", color: C.dim, textAlign: "center",
          padding: "8px", letterSpacing: "1px", marginTop: "4px" }}>
          SCROLL TO BOTTOM OF AGREEMENT TO ENABLE SIGNATURE
        </div>
      )}

      {/* Signature form — only after scrolling */}
      {scrolled && (
        <div style={{ border: `3px solid ${C.yellow}`, background: C.surface,
          padding: "28px", marginTop: "20px", boxShadow: `0 0 20px ${C.yellow}33` }}>

          <div className="neon-yellow" style={{ fontSize: "8px", letterSpacing: "3px",
            marginBottom: "20px" }}>── EXECUTE AGREEMENT ──</div>

          {[
            { label: "FULL LEGAL NAME *", field: "name", type: "text", ph: "JANE SMITH" },
            { label: "EMAIL ADDRESS *", field: "email", type: "email", ph: "JANE@STUDIO.COM" },
            { label: "COMPANY / STUDIO", field: "studio", type: "text", ph: "PIXEL FORGE STUDIOS LLC" },
          ].map(({ label, field, type, ph }) => (
            <div key={field} style={{ marginBottom: "14px" }}>
              <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
                marginBottom: "6px" }}>{label}:</div>
              <input type={type} placeholder={ph} className="arcade-input"
                style={{ borderColor: C.yellow, color: C.yellow }}
                value={signForm[field]} onChange={e => setSignForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}

          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
              marginBottom: "6px" }}>MATTER DESCRIPTION *:</div>
            <textarea className="arcade-input" style={{ minHeight: "80px", resize: "vertical",
              borderColor: C.yellow, color: C.yellow }}
              placeholder="BRIEFLY DESCRIBE THE LEGAL MATTER YOU ARE RETAINING ATTORNEY FOR..."
              value={signForm.matter} onChange={e => setSignForm(f => ({ ...f, matter: e.target.value }))} />
          </div>

          <div onClick={() => setAgreed(v => !v)} style={{
            display: "flex", gap: "14px", alignItems: "flex-start",
            cursor: "crosshair", padding: "16px",
            border: `2px solid ${agreed ? C.yellow : C.darker}`,
            background: agreed ? `${C.yellow}0a` : C.surface,
            marginBottom: "12px",
            boxShadow: agreed ? `0 0 10px ${C.yellow}44` : "none" }}>
            <div style={{ width: "20px", height: "20px", border: `3px solid ${agreed ? C.yellow : C.darker}`,
              background: agreed ? C.yellow : C.bg, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: agreed ? `0 0 8px ${C.yellow}` : "none" }}>
              {agreed && <span style={{ color: C.bg, fontFamily: "monospace", fontWeight: "900", fontSize: "12px" }}>X</span>}
            </div>
            <div>
              <div style={{ fontSize: "6px", color: C.dim, letterSpacing: "2px",
                marginBottom: "4px" }}>CHECKBOX 1 OF 2 — GENERAL AGREEMENT</div>
              <div style={{ fontSize: "7px", color: agreed ? C.yellow : C.dim, lineHeight: "2.2" }}>
                I HAVE READ AND UNDERSTAND THE ENTIRE RETAINER AGREEMENT ABOVE.
                I AGREE TO BE BOUND BY ITS TERMS AND ACKNOWLEDGE THAT MY ELECTRONIC
                SIGNATURE BELOW IS LEGALLY BINDING UNDER THE CALIFORNIA UETA AND
                FEDERAL ESIGN ACT.
              </div>
            </div>
          </div>

          {/* ── JURY WAIVER — SEPARATE ACKNOWLEDGMENT ── */}
          <div style={{
            border: `3px solid ${juryWaived ? C.pink : C.darker}`,
            background: juryWaived ? `${C.pink}0a` : "#0e0008",
            padding: "4px", marginBottom: "16px",
            boxShadow: juryWaived ? `0 0 15px ${C.pink}44` : "none",
          }}>
            {/* Warning header */}
            <div style={{
              background: juryWaived ? `${C.pink}22` : "#1a0010",
              borderBottom: `2px solid ${juryWaived ? C.pink : C.darker}`,
              padding: "10px 14px",
              display: "flex", gap: "10px", alignItems: "center",
            }}>
              <span style={{ fontSize: "16px" }}>⚠️</span>
              <div>
                <div style={{ fontSize: "7px", color: juryWaived ? C.pink : "#884466",
                  letterSpacing: "2px", textShadow: juryWaived ? `0 0 8px ${C.pink}` : "none" }}>
                  CHECKBOX 2 OF 2 — JURY TRIAL WAIVER
                </div>
                <div style={{ fontSize: "6px", color: "#664455", letterSpacing: "1px", marginTop: "3px" }}>
                  THIS IS A SEPARATE REQUIRED ACKNOWLEDGMENT · SECTION 12 OF AGREEMENT
                </div>
              </div>
            </div>

            {/* Waiver quote from agreement */}
            <div style={{
              padding: "12px 14px",
              borderBottom: `2px solid ${juryWaived ? C.pink : C.darker}`,
              fontFamily: "'Courier New', monospace", fontSize: "11px",
              color: "#aa7788", lineHeight: "1.8",
              background: "rgba(0,0,0,0.3)",
            }}>
              <em>
                "By executing this Agreement, Client confirms that Client has read and understands
                the dispute resolution provisions and voluntarily agrees to resolution by judicial
                reference or other court proceeding in the event Client does not elect State Bar
                fee arbitration procedures. <strong style={{ color: "#ffaacc" }}>In doing so, Client and Attorney voluntarily
                waive important constitutional rights to trial by jury.</strong> Client is advised
                that Client has the right to have an independent attorney review this provision
                and this entire Agreement prior to signing."
              </em>
              <div style={{ marginTop: "8px", fontSize: "10px", color: "#664455" }}>
                — Section 12, Attorney-Client Retainer Agreement · Wesley R. Williams, Esq.
              </div>
            </div>

            {/* The checkbox itself */}
            <div onClick={() => setJuryWaived(v => !v)} style={{
              display: "flex", gap: "14px", alignItems: "flex-start",
              cursor: "crosshair", padding: "14px",
            }}>
              <div style={{
                width: "24px", height: "24px", flexShrink: 0, marginTop: "2px",
                border: `3px solid ${juryWaived ? C.pink : "#664455"}`,
                background: juryWaived ? C.pink : C.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: juryWaived ? `0 0 10px ${C.pink}` : "none",
              }}>
                {juryWaived && <span style={{ color: C.bg, fontFamily: "monospace",
                  fontWeight: "900", fontSize: "14px" }}>X</span>}
              </div>
              <div style={{ fontSize: "7px", color: juryWaived ? C.pink : "#886677",
                lineHeight: "2.2", textShadow: juryWaived ? `0 0 6px ${C.pink}` : "none" }}>
                I SEPARATELY AND SPECIFICALLY ACKNOWLEDGE THAT I HAVE READ AND
                UNDERSTOOD THE JURY TRIAL WAIVER IN SECTION 12 OF THIS AGREEMENT.
                I VOLUNTARILY WAIVE MY CONSTITUTIONAL RIGHT TO A JURY TRIAL AND
                AGREE TO THE DISPUTE RESOLUTION PROCEDURES DESCRIBED THEREIN.
                I UNDERSTAND I MAY HAVE AN INDEPENDENT ATTORNEY REVIEW THIS
                PROVISION BEFORE SIGNING.
              </div>
            </div>
          </div>

          <div style={{ fontSize: "7px", color: C.dim, marginBottom: "16px",
            padding: "10px", border: `1px solid ${C.darker}`, lineHeight: "2" }}>
            SIGNATURE DATE: {signForm.date} &nbsp;|&nbsp;
            IP ADDRESS: [RECORDED ON SUBMISSION] &nbsp;|&nbsp;
            TIMESTAMP: [UTC RECORDED]
          </div>

          {signError && (
            <div style={{ fontSize: "8px", color: C.pink, padding: "10px",
              border: `2px solid ${C.pink}`, marginBottom: "12px",
              textShadow: `0 0 6px ${C.pink}` }}>{signError}</div>
          )}

          <button className="btn-arcade btn-yellow" onClick={handleSign}
            style={{
              width: "100%", padding: "14px", fontSize: "9px",
              opacity: agreed && juryWaived ? 1 : 0.5,
            }}>
            ► CLICK TO SIGN &amp; EXECUTE RETAINER ◄
          </button>
          {(!agreed || !juryWaived) && (
            <div style={{ fontSize: "6px", color: "#664444", textAlign: "center",
              marginTop: "8px", letterSpacing: "1px" }}>
              {!agreed && !juryWaived
                ? "BOTH CHECKBOXES REQUIRED BEFORE SIGNING"
                : !agreed
                  ? "CHECKBOX 1 REQUIRED — GENERAL AGREEMENT"
                  : "CHECKBOX 2 REQUIRED — JURY TRIAL WAIVER"}
            </div>
          )}

          <div style={{ fontSize: "6px", color: "#555", textAlign: "center",
            marginTop: "12px", lineHeight: "2" }}>
            ELECTRONIC SIGNATURE VALID UNDER CAL. CIV. CODE § 1633.1 et seq. (UETA) AND 15 U.S.C. § 7001 (ESIGN ACT)
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CONTACT — HIGH SCORE ENTRY
// ═══════════════════════════════════════════════════════════
function ContactPage() {
  const [sent, setSent] = useState(false);
  const [cf, setCf] = useState({ name: "", email: "", company: "", matter: "", message: "" });

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "8px", color: C.orange, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.orange}` }}>
          ── HIGH SCORE ENTRY ──
        </div>
        <h1 className="neon-yellow" style={{ fontSize: "clamp(14px, 3vw, 24px)",
          letterSpacing: "3px", marginBottom: "8px" }}>
          ENTER YOUR INITIALS
        </h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px" }}>
          CONTACT ATTORNEY · BOOK CONSULTATION
        </div>
      </div>

      {/* Leaderboard decoration */}
      <div style={{ border: `3px solid ${C.orange}44`, background: C.surface,
        padding: "16px 24px", marginBottom: "28px" }}>
        <div style={{ fontSize: "7px", color: C.orange, letterSpacing: "2px",
          marginBottom: "12px" }}>── TOP SCORES ──</div>
        {[
          { rank: "1ST", name: "GAMING CO.", score: "99,999", area: "GAMECOMPLIANCE" },
          { rank: "2ND", name: "TITLE CO. ", score: "88,888", area: "REAL ESTATE"    },
          { rank: "3RD", name: "CRYPTO DAO", score: "77,777", area: "DIGITAL ASSETS" },
        ].map(s => (
          <div key={s.rank} style={{ display: "flex", justifyContent: "space-between",
            fontSize: "7px", color: C.dim, padding: "6px 0",
            borderBottom: `1px solid ${C.darker}`, letterSpacing: "1px" }}>
            <span style={{ color: C.yellow }}>{s.rank}</span>
            <span>{s.name}</span>
            <span style={{ color: C.orange }}>{s.score}</span>
            <span>{s.area}</span>
          </div>
        ))}
        <div style={{ fontSize: "7px", color: C.pink, letterSpacing: "1px",
          marginTop: "8px", animation: "blink 1s step-end infinite" }}>
          ► YOUR SCORE: ??? — ENTER YOUR NAME BELOW
        </div>
      </div>

      {sent ? (
        <div style={{ border: `4px solid ${C.green}`, background: C.surface,
          padding: "40px", textAlign: "center", boxShadow: `0 0 30px ${C.green}66` }}>
          <div style={{ fontSize: "32px", marginBottom: "16px" }}>🏆</div>
          <div className="neon-green" style={{ fontSize: "10px", letterSpacing: "3px",
            marginBottom: "12px" }}>SCORE RECORDED!</div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
            color: "#88cc88", lineHeight: "2" }}>
            Message received. Attorney will respond within one business day.<br />
            <span style={{ color: C.yellow }}>weswilliamsesq@gmail.com · 619.305.6485</span>
          </div>
        </div>
      ) : (
        <div style={{ border: `3px solid ${C.orange}`, background: C.surface,
          padding: "32px", boxShadow: `0 0 20px ${C.orange}33` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { label: "YOUR NAME",    field: "name",    type: "text",  ph: "JANE SMITH"       },
              { label: "EMAIL",        field: "email",   type: "email", ph: "JANE@STUDIO.COM"  },
              { label: "COMPANY/STUDIO",field:"company", type: "text",  ph: "PIXEL FORGE LLC"  },
            ].map(({ label, field, type, ph }) => (
              <div key={field}>
                <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
                  marginBottom: "6px" }}>{label}:</div>
                <input type={type} placeholder={ph} className="arcade-input"
                  style={{ borderColor: C.orange, color: C.orange }}
                  value={cf[field]} onChange={e => setCf(c => ({ ...c, [field]: e.target.value }))} />
              </div>
            ))}

            <div>
              <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
                marginBottom: "6px" }}>PRACTICE AREA:</div>
              <select className="arcade-select" style={{ borderColor: C.orange, color: C.orange }}
                value={cf.matter} onChange={e => setCf(c => ({ ...c, matter: e.target.value }))}>
                <option value="">SELECT LEVEL...</option>
                <option>Real Estate & Title Insurance</option>
                <option>Video Game & Commerce Law</option>
                <option>Fintech & Digital Assets</option>
                <option>GameCompliance™ — Follow-up</option>
                <option>Retainer Agreement</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
                marginBottom: "6px" }}>YOUR MESSAGE:</div>
              <textarea className="arcade-input" style={{ minHeight: "100px", resize: "vertical",
                borderColor: C.orange, color: C.orange }}
                placeholder="DESCRIBE YOUR LEGAL MATTER..."
                value={cf.message} onChange={e => setCf(c => ({ ...c, message: e.target.value }))} />
            </div>

            <button className="btn-arcade" onClick={() => setSent(true)}
              style={{ background: C.orange, color: C.bg,
                boxShadow: `4px 4px 0 #663300, 0 0 20px ${C.orange}88`,
                padding: "14px", fontSize: "9px", letterSpacing: "1px", width: "100%" }}>
              ► SEND MESSAGE ◄
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "8px" }}>
              <div style={{ border: `2px solid ${C.orange}33`, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", marginBottom: "6px" }}>✉️</div>
                <div style={{ fontSize: "6px", color: C.dim, marginBottom: "4px" }}>EMAIL</div>
                <div style={{ fontSize: "7px", color: C.orange }}>weswilliamsesq@gmail.com</div>
              </div>
              <div style={{ border: `2px solid ${C.orange}33`, padding: "12px", textAlign: "center" }}>
                <div style={{ fontSize: "18px", marginBottom: "6px" }}>📞</div>
                <div style={{ fontSize: "6px", color: C.dim, marginBottom: "4px" }}>PHONE</div>
                <div style={{ fontSize: "7px", color: C.orange }}>619.305.6485</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════
function Footer({ setPage }) {
  const go = id => { setPage(id); window.scrollTo(0, 0); };
  return (
    <footer style={{ borderTop: `3px solid ${C.pink}`, background: C.surface,
      boxShadow: `0 0 20px ${C.pink}22` }}>
      <Ticker />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 32px",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "32px" }}>
        <div>
          <div className="neon-cyan" style={{ fontSize: "9px", letterSpacing: "2px",
            marginBottom: "8px" }}>W.R. WILLIAMS ESQ.</div>
          <div style={{ fontSize: "11px", color: C.dim, lineHeight: "2.2", letterSpacing: "0.5px",
            fontFamily: "'Courier New', monospace" }}>
            Wesley R. Williams, Esq.<br/>
            CA State Bar No. 269157<br/>
            {/* ⚠️ REPLACE WITH YOUR P.O. BOX OR OFFICE ADDRESS — required for CAN-SPAM */}
            weswilliamsesq@gmail.com<br/>
            619.305.6485
          </div>
        </div>
        {[
          { label: "NAVIGATION", links: [["HOME","home"],["PLAYER","about"],["LEVELS","practice"],["HI-SCORE","contact"]] },
          { label: "SERVICES",   links: [["REAL ESTATE","practice"],["GAMING LAW","practice"],["DIGITAL ASSETS","practice"],["GAMECOMPLIANCE™","tool"],["SUBSCRIBE","pricing"]] },
          { label: "LEGAL",      links: [["RETAINER","retainer"],["FREE CONSULT","contact"],["PRIVACY POLICY","privacy"],["TERMS OF USE","terms"]] },
        ].map(({ label, links }) => (
          <div key={label}>
            <div style={{ fontSize: "7px", color: C.pink, letterSpacing: "2px",
              marginBottom: "12px", textShadow: `0 0 6px ${C.pink}` }}>{label}</div>
            {links.map(([text, pg]) => (
              <button key={text} onClick={() => go(pg)} style={{
                display: "block", background: "none", border: "none",
                color: C.dim, fontSize: "11px", marginBottom: "8px",
                padding: 0, cursor: "crosshair", letterSpacing: "0.5px", textAlign: "left",
                fontFamily: "'Courier New', monospace",
                transition: "color 0.1s",
              }}
              onMouseEnter={e => { e.target.style.color = C.cyan; }}
              onMouseLeave={e => { e.target.style.color = C.dim; }}>
                ► {text}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ borderTop: `2px solid ${C.darker}`, padding: "16px 32px",
        display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ fontSize: "11px", color: "#444466", letterSpacing: "0.5px",
          fontFamily: "'Courier New', monospace" }}>
          © {new Date().getFullYear()} Wesley R. Williams, Esq. · All Rights Reserved · Attorney Advertising
        </div>
        <div style={{ fontSize: "11px", color: "#444466", fontFamily: "'Courier New', monospace",
          display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <button onClick={() => { setPage("privacy"); window.scrollTo(0,0); }}
            style={{ background:"none", border:"none", color:"#555577",
              fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"crosshair",
              textDecoration:"underline", padding:0 }}>Privacy Policy</button>
          <button onClick={() => { setPage("terms"); window.scrollTo(0,0); }}
            style={{ background:"none", border:"none", color:"#555577",
              fontFamily:"'Courier New', monospace", fontSize:"11px", cursor:"crosshair",
              textDecoration:"underline", padding:0 }}>Terms of Use</button>
          <span>GameCompliance™ does not constitute legal advice</span>
        </div>
      </div>
    </footer>
  );
}

// ═══════════════════════════════════════════════════════════
// PRICING PAGE — SUBSCRIPTION ARCADE SHOP
// ═══════════════════════════════════════════════════════════

// ⚠️  SETUP INSTRUCTION FOR YOUR FREELANCER:
// 1. Log into stripe.com → Products → Add Product
// 2. Name: "General Counsel Subscription" · Price: $2,500/month recurring
// 3. Click "Payment Link" → Copy the URL
// 4. Replace the STRIPE_PAYMENT_LINK value below with your real link
const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/5kQ4gz46xfGx5iQbvtb3q00";

function PricingPage({ setPage }) {
  const [hover, setHover] = useState(false);

  const included = [
    { icon: "📧", label: "UNLIMITED EMAIL & MESSAGING",     desc: "Legal questions answered within 1 business day" },
    { icon: "📞", label: "MONTHLY STRATEGY CALL (45 MIN)", desc: "One scheduled call per month to discuss your legal landscape" },
    { icon: "📋", label: "CONTRACT REVIEW (3/MONTH)",       desc: "Standard commercial agreements reviewed and redlined" },
    { icon: "🎮", label: "GAMECOMPLIANCE™ FULL ACCESS",     desc: "Unlimited compliance analyses + priority regulatory alerts" },
    { icon: "⚡", label: "REGULATORY ALERTS",               desc: "Notified when laws change that affect your business" },
    { icon: "⚖️", label: "SCOPE: GAMING · RE · FINTECH",   desc: "Matters within gaming law, real estate, and digital assets" },
  ];

  const notIncluded = [
    "Litigation or court appearances",
    "Government enforcement defense",
    "More than 3 contract reviews/month*",
    "M&A or complex transactions*",
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "120px 32px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "48px" }}>
        <div style={{ fontSize: "8px", color: C.mcGold, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.mcGold}` }}>
          ── ARCADE SHOP ──
        </div>
        <h1 style={{ fontSize: "clamp(14px, 3vw, 26px)", letterSpacing: "3px",
          marginBottom: "12px", color: C.mcGold,
          textShadow: `0 0 20px ${C.mcGold}, 0 0 40px ${C.mcGold}` }}>
          GENERAL COUNSEL<br />SUBSCRIPTION
        </h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px" }}>
          ONE PRICE · EVERYTHING INCLUDED · CANCEL ANYTIME
        </div>
      </div>

      {/* Main price card */}
      <div style={{
        border: `4px solid ${C.mcGold}`,
        background: `linear-gradient(135deg, #1a1400 0%, #0f0a00 100%)`,
        boxShadow: `0 0 40px ${C.mcGold}55, inset 0 0 40px rgba(0,0,0,0.5)`,
        marginBottom: "32px", overflow: "hidden",
      }}>

        {/* Gold shimmer header */}
        <div style={{
          background: `linear-gradient(90deg, #8b6200, ${C.mcGold}, #f5d060, ${C.mcGold}, #8b6200)`,
          padding: "20px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: `4px solid #000`,
        }}>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: "10px",
            color: "#1a0e00", textShadow: "1px 1px 0 rgba(255,255,255,0.4)",
            letterSpacing: "2px" }}>
            ★ PREMIUM TIER · GENERAL COUNSEL ★
          </div>
          <div style={{ fontSize: "8px", color: "#1a0e00",
            fontFamily: "'Press Start 2P'" }}>BEST VALUE</div>
        </div>

        <div style={{ padding: "40px 36px" }}>

          {/* Price display */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <div style={{ display: "flex", alignItems: "flex-start",
              justifyContent: "center", gap: "4px", marginBottom: "8px" }}>
              <span style={{ fontSize: "16px", color: C.mcGold, marginTop: "12px",
                textShadow: `0 0 10px ${C.mcGold}` }}>$</span>
              <span style={{ fontSize: "clamp(48px, 8vw, 72px)", fontWeight: "700",
                color: C.mcGold, letterSpacing: "-4px", lineHeight: 1,
                textShadow: `0 0 30px ${C.mcGold}, 0 0 60px ${C.mcGold}44` }}>2,500</span>
            </div>
            <div style={{ fontSize: "8px", color: C.dim, letterSpacing: "3px" }}>
              PER MONTH · BILLED MONTHLY
            </div>
            <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${C.mcGold}, transparent)`,
              margin: "20px auto", maxWidth: "200px" }} />
            <div style={{ fontSize: "7px", color: "#887744", letterSpacing: "1px", lineHeight: "2" }}>
              NO SETUP FEE · NO ANNUAL COMMITMENT · CANCEL WITH 30 DAYS NOTICE
            </div>
          </div>

          {/* What's included */}
          <div style={{ marginBottom: "32px" }}>
            <div style={{ fontSize: "7px", color: C.mcGold, letterSpacing: "3px",
              marginBottom: "20px", textShadow: `0 0 8px ${C.mcGold}` }}>
              ── WHAT'S IN THE BOX ──
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {included.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: "12px", alignItems: "flex-start",
                  padding: "14px", background: `${C.mcGold}08`,
                  border: `2px solid ${C.mcGold}33`,
                }}>
                  <div style={{ fontSize: "20px", flexShrink: 0 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: "7px", color: C.mcGold, letterSpacing: "1px",
                      marginBottom: "6px", textShadow: `0 0 6px ${C.mcGold}` }}>
                      {item.label}
                    </div>
                    <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
                      color: "#887744", lineHeight: "1.6" }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Not included */}
          <div style={{ marginBottom: "36px", padding: "16px 20px",
            border: `2px solid ${C.darker}`, background: `rgba(0,0,0,0.3)` }}>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
              marginBottom: "12px" }}>NOT INCLUDED (AVAILABLE AT $350/HR OVERAGE):</div>
            {notIncluded.map((n, i) => (
              <div key={i} style={{ fontSize: "7px", color: "#555577",
                padding: "5px 0", letterSpacing: "0.5px",
                borderBottom: i < notIncluded.length - 1 ? `1px solid ${C.darker}` : "none",
                display: "flex", gap: "10px" }}>
                <span style={{ color: C.pink }}>✕</span> {n}
              </div>
            ))}
            <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px",
              color: "#444466", marginTop: "10px", fontStyle: "italic" }}>
              * Overage work billed at $350/hr by separate written agreement.
            </div>
          </div>

          {/* CTA Button */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px",
              marginBottom: "16px", animation: "neonPulse 2s infinite",
              color: C.mcGold }}>
              ► SECURE CHECKOUT VIA STRIPE ◄
            </div>
            <a
              href={STRIPE_PAYMENT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHover(true)}
              onMouseLeave={() => setHover(false)}
              style={{
                display: "inline-block",
                background: hover ? "#f5d060" : C.mcGold,
                color: "#1a0e00",
                padding: "18px 48px",
                fontSize: "11px",
                fontFamily: "'Press Start 2P', monospace",
                letterSpacing: "2px",
                textDecoration: "none",
                boxShadow: hover
                  ? `6px 6px 0 #5a3d00, 0 0 40px ${C.mcGold}`
                  : `4px 4px 0 #5a3d00, 0 0 20px ${C.mcGold}88`,
                transition: "all 0.1s steps(2)",
                transform: hover ? "translate(-1px, -1px)" : "none",
                cursor: "crosshair",
              }}>
              ► SUBSCRIBE NOW — $2,500/MO ◄
            </a>
            <div style={{ fontSize: "6px", color: C.dim, marginTop: "16px",
              letterSpacing: "1px", lineHeight: "2.5" }}>
              POWERED BY STRIPE · 256-BIT ENCRYPTION · ALL MAJOR CARDS ACCEPTED<br />
              VISA · MASTERCARD · AMEX · DISCOVER · ACH BANK TRANSFER
            </div>
          </div>
        </div>
      </div>

      {/* Post-payment instructions */}
      <div style={{ border: `3px solid ${C.cyan}44`, background: C.surface,
        padding: "24px 28px", marginBottom: "28px" }}>
        <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "3px",
          marginBottom: "16px" }}>── AFTER YOU SUBSCRIBE ──</div>
        {[
          { step: "01", label: "PAYMENT CONFIRMED",   desc: "Stripe sends you a receipt instantly. Your subscription is active." },
          { step: "02", label: "SIGN YOUR RETAINER",  desc: "Click CONTRACT in the nav to sign your attorney-client retainer agreement electronically.", action: () => setPage("retainer") },
          { step: "03", label: "BOOK YOUR FIRST CALL",desc: "Email weswilliamsesq@gmail.com to schedule your onboarding strategy call." },
          { step: "04", label: "YOU'RE COVERED",      desc: "Send legal questions anytime. Responses within 1 business day." },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: "16px", alignItems: "flex-start",
            padding: "12px 0", borderBottom: i < 3 ? `1px solid ${C.darker}` : "none" }}>
            <div style={{ width: "32px", height: "32px", border: `2px solid ${C.cyan}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "8px", color: C.cyan, flexShrink: 0,
              textShadow: `0 0 8px ${C.cyan}` }}>{s.step}</div>
            <div>
              <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "1px",
                marginBottom: "6px" }}>{s.label}</div>
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
                color: C.dim, lineHeight: "1.6" }}>
                {s.desc}
                {s.action && (
                  <button onClick={s.action} style={{ background: "none", border: "none",
                    color: C.cyan, fontFamily: "'Courier New', monospace", fontSize: "11px",
                    cursor: "crosshair", textDecoration: "underline", marginLeft: "4px" }}>
                    → Go there now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legal disclaimer */}
      <div style={{ border: `2px solid ${C.darker}`, padding: "16px",
        fontSize: "6px", color: "#444455", lineHeight: "2.2",
        background: C.surface, letterSpacing: "0.5px" }}>
        ⚠ SUBSCRIPTION TERMS: This subscription constitutes a general retainer for legal services
        within the defined scope. It does not guarantee any specific outcome. Subscription renews
        automatically each month until cancelled with 30 days written notice per the Retainer
        Agreement. Overage services billed at $350/hr. California Rules of Professional Conduct
        apply. Wesley R. Williams, Esq. · CA Bar No. 269157 · Attorney Advertising.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// COOKIE CONSENT BANNER
// ═══════════════════════════════════════════════════════════
function CookieBanner({ onAccept, onDecline, setPage }) {
  return (
    <div role="dialog" aria-label="Cookie consent" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 9990,
      background: "#0a0a14", borderTop: `3px solid ${C.cyan}`,
      boxShadow: `0 0 30px ${C.cyan}44`,
      padding: "20px 32px",
      display: "flex", flexWrap: "wrap", gap: "16px",
      alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div style={{ fontSize: "8px", color: C.cyan, letterSpacing: "2px",
          marginBottom: "8px", textShadow: `0 0 8px ${C.cyan}` }}>
          🍪 COOKIE NOTICE
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
          color: "#8899bb", lineHeight: "1.7" }}>
          This site may use cookies and similar technologies for essential functionality.
          No tracking or advertising cookies are used. See our{" "}
          <button onClick={() => { onDecline(); setPage("privacy"); window.scrollTo(0,0); }}
            style={{ background:"none", border:"none", color: C.cyan,
              fontFamily:"'Courier New', monospace", fontSize:"12px",
              cursor:"crosshair", textDecoration:"underline", padding:0 }}>
            Privacy Policy
          </button>{" "}for details.
        </div>
      </div>
      <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
        <button className="btn-arcade" onClick={onDecline}
          style={{ background: "transparent", color: C.dim,
            border: `2px solid ${C.darker}`, padding: "10px 18px",
            fontSize: "8px", letterSpacing: "1px" }}>
          ESSENTIAL ONLY
        </button>
        <button className="btn-arcade btn-cyan" onClick={onAccept}
          style={{ fontSize: "8px", padding: "10px 18px" }}>
          ACCEPT &amp; CONTINUE
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PRIVACY POLICY PAGE
// ═══════════════════════════════════════════════════════════
function PrivacyPage({ setPage }) {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ fontSize: "8px", color: C.cyan, letterSpacing: "2px",
        marginBottom: "12px", textShadow: `0 0 6px ${C.cyan}`,
        borderBottom: `2px solid ${C.cyan}22`, paddingBottom: "8px" }}>{title}</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
        color: "#8899bb", lineHeight: "2" }}>{children}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 8px ${C.cyan}` }}>── LEGAL DOCUMENTS ──</div>
        <h1 className="neon-cyan" style={{ fontSize: "clamp(14px, 2.5vw, 22px)",
          letterSpacing: "3px", marginBottom: "8px" }}>PRIVACY POLICY</h1>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: C.dim }}>
          Wesley R. Williams, Esq. · weswilliamsesq.com<br/>
          Effective Date: {new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})} · Last Updated: {new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>

      <div style={{ border: `3px solid ${C.cyan}22`, background: C.surface, padding: "36px" }}>

        <Section title="1. WHO WE ARE">
          This Privacy Policy applies to the website operated by Wesley R. Williams, Esq., a California-licensed attorney (CA State Bar No. 269157), including the GameCompliance™ tool accessible at this domain ("Site"). Contact: weswilliamsesq@gmail.com · 619.305.6485.
          {"\n\n"}This Policy applies to California Online Privacy Protection Act (CalOPPA), the California Consumer Privacy Act / California Privacy Rights Act (CCPA/CPRA), and the EU General Data Protection Regulation (GDPR). If you are an EU resident, additional rights apply as described in Section 9.
        </Section>

        <Section title="2. INFORMATION WE COLLECT">
          <strong style={{ color: "#aabbcc" }}>Information you provide directly:</strong>
          {"\n"}• Name and email address (collected at tool signup gate){"\n"}
          • Studio or company name (optional, collected at gate){"\n"}
          • Game mechanic and feature information (entered into GameCompliance™ tool){"\n"}
          • Contact form submissions (name, email, company, message){"\n"}
          • Retainer agreement execution data (name, email, matter description, timestamp){"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Information collected automatically:</strong>
          {"\n"}• Standard server logs (IP address, browser type, pages visited, timestamps) — collected by our hosting provider (Vercel){"\n"}
          • Payment transaction data is processed and stored by Stripe, Inc. We do not store your payment card information.{"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Information we do NOT collect:</strong>
          {"\n"}• We do not use advertising cookies or third-party tracking pixels.{"\n"}
          • We do not collect sensitive personal information such as Social Security numbers, financial account numbers, or government IDs.{"\n"}
          • We do not knowingly collect information from persons under 18 years of age.
        </Section>

        <Section title="3. HOW WE USE YOUR INFORMATION">
          We use the information we collect for the following purposes:{"\n\n"}
          • <strong style={{ color: "#aabbcc" }}>To provide the GameCompliance™ tool:</strong> Your game data is transmitted to Anthropic, Inc.'s API to generate your compliance analysis. This is the primary purpose for which tool data is collected. Game analysis data is not stored on our servers beyond the session.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>To communicate with you:</strong> We use your email to send your analysis results and, if you opted in, legal updates and compliance alerts from Wesley R. Williams, Esq.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>To process payments:</strong> Subscription and retainer payments are processed through Stripe, Inc.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>To comply with legal obligations:</strong> Including our obligations under the California Rules of Professional Conduct regarding client records.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>To improve the Site:</strong> Aggregate, anonymized usage data may be used to improve the tool.
        </Section>

        <Section title="4. HOW WE SHARE YOUR INFORMATION">
          We do not sell your personal information. We share data only as follows:{"\n\n"}
          • <strong style={{ color: "#aabbcc" }}>Anthropic, Inc.:</strong> Game data you enter into GameCompliance™ is processed by Anthropic's Claude API. Anthropic's privacy policy governs their handling of this data. We use Anthropic's API under a data processing arrangement.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Stripe, Inc.:</strong> Payment information is processed by Stripe. Stripe's privacy policy governs their handling of payment data.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Vercel, Inc.:</strong> Our hosting provider. Standard server logs are retained by Vercel per their privacy policy.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Legal compliance:</strong> We may disclose information if required by law, court order, or to protect our legal rights.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Attorney-client matters:</strong> Information shared in the context of an attorney-client relationship is governed by the attorney-client privilege and Rules of Professional Conduct, not this Privacy Policy.
        </Section>

        <Section title="5. DATA RETENTION">
          • Contact form submissions: retained for up to 3 years for business records.{"\n"}
          • Retainer agreement execution records: retained for the duration of the attorney-client relationship plus 5 years, as required by California Rules of Professional Conduct Rule 1.15.{"\n"}
          • Email list data: retained until you unsubscribe or request deletion.{"\n"}
          • GameCompliance™ session data: not retained on our servers after your session ends. Anthropic's data retention policies govern any data they process.{"\n"}
          • Server logs: retained by Vercel per their standard policies (typically 30 days).
        </Section>

        <Section title="6. YOUR CALIFORNIA RIGHTS (CCPA / CPRA / CalOPPA)">
          If you are a California resident, you have the following rights:{"\n\n"}
          • <strong style={{ color: "#aabbcc" }}>Right to Know:</strong> You may request disclosure of the categories and specific pieces of personal information we have collected about you.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Right to Delete:</strong> You may request deletion of personal information we have collected, subject to certain exceptions.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Right to Correct:</strong> You may request correction of inaccurate personal information.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Right to Opt-Out of Sale/Sharing:</strong> We do not sell or share personal information for cross-context behavioral advertising.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising your privacy rights.{"\n"}
          • <strong style={{ color: "#aabbcc" }}>Do Not Track:</strong> Our Site honors Do Not Track signals from browsers by not deploying behavioral tracking technologies.{"\n\n"}
          To exercise these rights, email weswilliamsesq@gmail.com with subject line "Privacy Rights Request." We will respond within 45 days.
        </Section>

        <Section title="7. UNSUBSCRIBE / OPT-OUT">
          If you opted in to marketing communications, you may unsubscribe at any time by:{"\n"}
          • Clicking the unsubscribe link in any email we send, or{"\n"}
          • Emailing weswilliamsesq@gmail.com with subject "Unsubscribe."{"\n\n"}
          Unsubscribing from marketing emails does not delete your account or affect your access to the GameCompliance™ tool. Transactional emails (receipts, retainer confirmations) are not affected by marketing unsubscribe requests.
        </Section>

        <Section title="8. COOKIES AND TRACKING">
          This Site may use essential cookies required for basic functionality (such as session management). We do not use advertising cookies, social media tracking pixels, or third-party analytics cookies that track you across websites.{"\n\n"}
          You may set your browser to refuse cookies. Doing so may affect certain Site functionality. For EU residents, we obtain your consent before setting any non-essential cookies.
        </Section>

        <Section title="9. EU / UK RESIDENTS — GDPR RIGHTS">
          If you are located in the European Economic Area or United Kingdom, the following additional provisions apply:{"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Lawful Basis for Processing:</strong>{"\n"}
          • Tool access and service delivery: contract performance (Article 6(1)(b) GDPR){"\n"}
          • Marketing communications: consent (Article 6(1)(a) GDPR) — optional, separately obtained{"\n"}
          • Legal compliance: legal obligation (Article 6(1)(c) GDPR){"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Your GDPR Rights:</strong> Right of access, rectification, erasure ("right to be forgotten"), restriction of processing, data portability, and objection to processing. To exercise these rights, email weswilliamsesq@gmail.com.{"\n\n"}
          <strong style={{ color: "#aabbcc" }}>International Transfers:</strong> Your data may be transferred to and processed in the United States. Such transfers are made pursuant to Standard Contractual Clauses or other lawful transfer mechanisms with our service providers (Anthropic, Stripe, Vercel).{"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Right to Complain:</strong> You have the right to lodge a complaint with your local supervisory authority.{"\n\n"}
          <strong style={{ color: "#aabbcc" }}>Data Controller:</strong> Wesley R. Williams, Esq. · weswilliamsesq@gmail.com
        </Section>

        <Section title="10. SECURITY">
          We implement reasonable technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Payment processing is handled by Stripe, which is PCI-DSS compliant. However, no internet transmission is 100% secure, and we cannot guarantee absolute security.{"\n\n"}
          In the event of a data breach involving your personal information, we will notify affected individuals as required by California Civil Code § 1798.82 and applicable law.
        </Section>

        <Section title="11. CHILDREN'S PRIVACY">
          This Site is intended for users 18 years of age and older. We do not knowingly collect personal information from children under 13. If you believe we have inadvertently collected information from a minor, please contact us immediately at weswilliamsesq@gmail.com and we will delete it promptly.
        </Section>

        <Section title="12. CHANGES TO THIS POLICY">
          We may update this Privacy Policy from time to time. We will post the updated policy on this page with a revised effective date. Material changes will be communicated to users on our email list. Your continued use of the Site after any update constitutes acceptance of the revised Policy.
        </Section>

        <Section title="13. CONTACT">
          For any privacy-related questions, requests, or concerns:{"\n\n"}
          Wesley R. Williams, Esq.{"\n"}
          weswilliamsesq@gmail.com{"\n"}
          619.305.6485{"\n\n"}
          Response time: within 45 days for privacy rights requests; within 5 business days for general inquiries.
        </Section>

      </div>
      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button className="btn-arcade btn-cyan" onClick={() => setPage("home")}
          style={{ fontSize: "8px", padding: "10px 20px" }}>← BACK HOME</button>
        <button className="btn-arcade" onClick={() => setPage("terms")}
          style={{ fontSize: "8px", padding: "10px 20px", background: "transparent",
            color: C.dim, border: `2px solid ${C.darker}` }}>TERMS OF USE →</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TERMS OF USE PAGE
// ═══════════════════════════════════════════════════════════
function TermsPage({ setPage }) {
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: "28px" }}>
      <div style={{ fontSize: "8px", color: C.yellow, letterSpacing: "2px",
        marginBottom: "12px", textShadow: `0 0 6px ${C.yellow}`,
        borderBottom: `2px solid ${C.yellow}22`, paddingBottom: "8px" }}>{title}</div>
      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "13px",
        color: "#8899bb", lineHeight: "2" }}>{children}</div>
    </div>
  );
  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 8px ${C.yellow}` }}>── LEGAL DOCUMENTS ──</div>
        <h1 className="neon-yellow" style={{ fontSize: "clamp(14px, 2.5vw, 22px)",
          letterSpacing: "3px", marginBottom: "8px" }}>TERMS OF USE</h1>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px", color: C.dim }}>
          Wesley R. Williams, Esq. · weswilliamsesq.com<br/>
          Effective Date: {new Date().toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'})}
        </div>
      </div>

      <div style={{ border: `3px solid ${C.yellow}22`, background: C.surface, padding: "36px" }}>

        <Section title="1. ACCEPTANCE OF TERMS">
          By accessing or using this website and the GameCompliance™ tool (collectively, the "Site"), you agree to be bound by these Terms of Use. If you do not agree, do not use the Site. These Terms constitute a legally binding agreement between you and Wesley R. Williams, Esq. ("Attorney," "we," "us").{"\n\n"}
          You must be at least 18 years of age to use this Site. By using the Site you represent and warrant that you are 18 or older.
        </Section>

        <Section title="2. GAMECOMPLIANCE™ — LEGAL DISCLAIMER">
          <strong style={{ color: "#ffdd88" }}>IMPORTANT — PLEASE READ CAREFULLY:</strong>{"\n\n"}
          The GameCompliance™ tool provides automated legal issue-spotting for informational purposes only. <strong style={{ color: "#ffaaaa" }}>IT DOES NOT CONSTITUTE LEGAL ADVICE.</strong> Use of the GameCompliance™ tool does not create an attorney-client relationship between you and Wesley R. Williams, Esq. or any other attorney.{"\n\n"}
          The analysis generated by GameCompliance™:{"\n"}
          • Is based solely on information you provide and may not identify all applicable legal issues{"\n"}
          • Does not account for all jurisdiction-specific nuances or recent regulatory changes{"\n"}
          • Is not a substitute for consultation with a licensed attorney{"\n"}
          • Should not be acted upon without independent legal counsel{"\n\n"}
          Wesley R. Williams, Esq. makes no representations or warranties regarding the completeness, accuracy, or applicability of any GameCompliance™ analysis to your specific situation. You assume all risk from reliance on the tool's output.{"\n\n"}
          Wesley R. Williams is licensed to practice law in California only. GameCompliance™ does not constitute the practice of law in any jurisdiction.
        </Section>

        <Section title="3. INTELLECTUAL PROPERTY">
          The Site and all content, including the GameCompliance™ tool, its architecture, legal knowledge framework, system prompts, design, text, graphics, and software (collectively, "Content") are owned by Wesley R. Williams, Esq. and are protected by U.S. copyright law, trademark law, and other applicable intellectual property laws.{"\n\n"}
          You are granted a limited, non-exclusive, non-transferable license to access and use the Site for your personal or business legal compliance research. You may not:{"\n"}
          • Copy, reproduce, modify, or create derivative works from the Content{"\n"}
          • Reverse-engineer, decompile, or attempt to extract the source code or system prompts of GameCompliance™{"\n"}
          • Resell, sublicense, or commercially exploit the Site or any Content{"\n"}
          • Remove any copyright, trademark, or proprietary notices{"\n\n"}
          "GameCompliance™" is a trademark of Wesley R. Williams, Esq. Unauthorized use is prohibited.
        </Section>

        <Section title="4. ACCEPTABLE USE">
          You agree to use the Site only for lawful purposes and in accordance with these Terms. You agree not to:{"\n"}
          • Use the Site to provide legal services to third parties without authorization{"\n"}
          • Submit false, misleading, or fraudulent information into the tool{"\n"}
          • Attempt to gain unauthorized access to any portion of the Site{"\n"}
          • Use automated scripts, bots, or scrapers to access the Site{"\n"}
          • Interfere with or disrupt the integrity or performance of the Site{"\n"}
          • Use the Site in any way that violates applicable law or regulation
        </Section>

        <Section title="5. ATTORNEY-CLIENT RELATIONSHIP">
          No attorney-client relationship is formed by:{"\n"}
          • Visiting or using this Site{"\n"}
          • Using the GameCompliance™ tool{"\n"}
          • Submitting a contact form{"\n"}
          • Subscribing to the mailing list{"\n\n"}
          An attorney-client relationship with Wesley R. Williams, Esq. is formed only upon execution of a written Retainer Agreement signed by both parties and, where applicable, receipt of the required retainer fee.{"\n\n"}
          Do not send confidential information through the contact form or GameCompliance™ tool, as these communications are not protected by the attorney-client privilege until a formal engagement has been established.
        </Section>

        <Section title="6. SUBSCRIPTION SERVICES">
          Subscription services offered through this Site are governed by the Attorney-Client Retainer Agreement, which incorporates these Terms. In the event of a conflict between these Terms and the Retainer Agreement, the Retainer Agreement controls.{"\n\n"}
          Payments are processed by Stripe, Inc. You agree to Stripe's Terms of Service and Privacy Policy. We reserve the right to modify subscription pricing with 60 days written notice.
        </Section>

        <Section title="7. LIMITATION OF LIABILITY">
          TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, WESLEY R. WILLIAMS, ESQ. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF OR INABILITY TO USE THE SITE OR GAMECOMPLIANCE™ TOOL, INCLUDING BUT NOT LIMITED TO LOST PROFITS, LOSS OF DATA, OR BUSINESS INTERRUPTION, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.{"\n\n"}
          OUR TOTAL LIABILITY TO YOU FOR ANY CLAIM ARISING FROM THESE TERMS OR YOUR USE OF THE SITE SHALL NOT EXCEED THE AMOUNT YOU PAID US IN THE TWELVE MONTHS PRECEDING THE CLAIM, OR $100, WHICHEVER IS GREATER.{"\n\n"}
          Some jurisdictions do not allow limitations on implied warranties or exclusion of certain damages, so some of the above may not apply to you.
        </Section>

        <Section title="8. DISCLAIMER OF WARRANTIES">
          THE SITE AND GAMECOMPLIANCE™ TOOL ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
        </Section>

        <Section title="9. THIRD-PARTY SERVICES">
          The Site uses third-party services including Anthropic, Inc. (AI API), Stripe, Inc. (payment processing), and Vercel, Inc. (hosting). These services are governed by their own terms of service and privacy policies. We are not responsible for the practices of these third parties.
        </Section>

        <Section title="10. ACCESSIBILITY">
          We are committed to making this Site accessible to users with disabilities in accordance with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA and California's Unruh Civil Rights Act. If you experience accessibility barriers, please contact us at weswilliamsesq@gmail.com and we will work to provide an accommodation. Users who require an accessible format of any legal document may request one by email.
        </Section>

        <Section title="11. GOVERNING LAW AND DISPUTE RESOLUTION">
          These Terms are governed by the laws of the State of California, without regard to its conflict-of-law provisions. Any dispute arising from these Terms (other than disputes governed by the Retainer Agreement) shall be brought exclusively in the state or federal courts located in San Diego County, California, and you consent to personal jurisdiction therein.{"\n\n"}
          These Terms do not constitute an attorney-client retainer or fee agreement and are not subject to the California State Bar fee arbitration program.
        </Section>

        <Section title="12. CHANGES TO TERMS">
          We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Site after changes constitutes acceptance of the revised Terms. We encourage you to review these Terms periodically.
        </Section>

        <Section title="13. CONTACT">
          Questions about these Terms:{"\n\n"}
          Wesley R. Williams, Esq.{"\n"}
          weswilliamsesq@gmail.com · 619.305.6485{"\n\n"}
          <em style={{ color: "#556644" }}>Wesley R. Williams is licensed to practice law in the State of California only. This website constitutes attorney advertising under California Rules of Professional Conduct Rule 7.1. Prior results do not guarantee a similar outcome.</em>
        </Section>

      </div>
      <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
        <button className="btn-arcade btn-yellow" onClick={() => setPage("home")}
          style={{ fontSize: "8px", padding: "10px 20px" }}>← BACK HOME</button>
        <button className="btn-arcade" onClick={() => setPage("privacy")}
          style={{ fontSize: "8px", padding: "10px 20px", background: "transparent",
            color: C.dim, border: `2px solid ${C.darker}` }}>← PRIVACY POLICY</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [page, setPage] = useState("home");
  const [cookieConsent, setCookieConsent] = useState(null); // null=not yet decided
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  const pages = {
    home:     <HomePage      setPage={setPage} />,
    about:    <AboutPage     setPage={setPage} />,
    practice: <PracticePage  setPage={setPage} />,
    tool:     <GameCompliancePage setPage={setPage} />,
    pricing:  <PricingPage   setPage={setPage} />,
    retainer: <RetainerPage  setPage={setPage} />,
    contact:  <ContactPage />,
    privacy:  <PrivacyPage   setPage={setPage} />,
    terms:    <TermsPage     setPage={setPage} />,
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      {/* Skip navigation — first focusable element on page for keyboard/screen reader users */}
      <a href="#main-content" className="skip-nav">Skip to main content</a>
      <Stars />
      <Nav page={page} setPage={setPage} />
      <main id="main-content" style={{ position: "relative", zIndex: 1 }} tabIndex={-1}>
        {pages[page] || pages.home}
      </main>
      <Footer setPage={setPage} />
      {/* Cookie consent banner — shown until user makes a choice */}
      {cookieConsent === null && (
        <CookieBanner
          onAccept={() => setCookieConsent(true)}
          onDecline={() => setCookieConsent(false)}
          setPage={setPage}
        />
      )}
    </>
  );
}
