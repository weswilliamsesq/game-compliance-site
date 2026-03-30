import React, { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
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
  const msg = "★ WESLEY R. WILLIAMS ESQ ★ CA BAR NO. 269157 ★ REAL ESTATE ★ GAMING LAW ★ DIGITAL ASSETS ★ GAMECOMPLIANCE™ ★ FREE ANALYSIS ★ INSERT COIN TO BEGIN ★ CRYPTO SINCE 2017 ★ LEVEL UP YOUR LEGAL GAME ★ ";
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
            `After years of mastering title insurance and real estate transactions, Wes leveled up into gaming law and fintech, operating as in-house counsel at a leading video game payment platform for four years. Commercial contracts, M&A, international regulatory compliance, blockchain integrations — all in the final boss dungeon of gaming fintech.`,
            `He co-hosted the CryptoLaw Podcast and speaks at industry conferences on real estate, gaming law, and digital assets. His GameCompliance™ engine represents the convergence of all three verticals — built by someone who actually lives at the intersection.`,
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
            "CA BAR NO. 269157","CA REAL ESTATE BROKER","IN-HOUSE COUNSEL VETERAN",
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

  const reToolkit = [
    { icon: "⚔️", label: "CLAIMS MASTERY",        text: "Navigated the claims arena from both sides — serving as In-House Claims Counsel for major underwriters and as Outside Counsel for boutique firms." },
    { icon: "🛡️", label: "DIVERSE REPRESENTATION", text: "Proven track record representing Title Insurers, Escrow Agents, Real Estate Brokers/Agents, Developers, and PropTech innovators." },
    { icon: "🗺️", label: "COMPLIANCE ARCHITECTURE",text: "Expert in RESPA/Section 8 guardrails, ALTA/NSPS 2026 Land Title Survey Standards, and navigating the shifting landscape of federal all-cash reporting requirements." },
    { icon: "⛓️", label: "DIGITAL FRONTIER",       text: "Bridging traditional property law with blockchain-based settlements and tokenized real property." },
  ];

  const gameSpellbook = [
    { icon: "🎯", label: "MONETIZATION DEFENSE",  text: "Expert guidance on loot boxes, gacha mechanics, and dark patterns, ensuring compliance with FTC transparency standards and the 2026 PEGI age-rating updates." },
    { icon: "🔒", label: "GLOBAL PRIVACY",         text: "Mastering the rules of play for COPPA, GDPR, and CCPA/CPRA, with a focus on minor-safety protocols in immersive environments." },
    { icon: "⚙️", label: "COMMERCE ENGINE",        text: "Architecting the legal framework for the proprietary GameCompliance™ engine to streamline global cross-border payments." },
    { icon: "📜", label: "ECOSYSTEM MANAGEMENT",   text: "Structuring developer and platform agreements that balance IP protection with rapid scalability." },
  ];

  const fintechSpellbook = [
    { icon: "💸", label: "MONEY MOVEMENT",         text: "Expert navigation of State Money Transmitter Licensing (MTL) and the Money Transmission Modernization Act (MTMA), currently adopted by over 30 states." },
    { icon: "🏗️", label: "PAYMENT INFRASTRUCTURE", text: "Architecting Banking-as-a-Service (BaaS) partnerships, payment orchestration, and FinCEN MSB registration." },
    { icon: "🧾", label: "CONSUMER PROTECTION",    text: "Deep mastery of Regulation E (EFTA) and Regulation Z (TILA), including emerging standards for Earned Wage Access (EWA) and BNPL." },
    { icon: "🔮", label: "DIGITAL ASSETS",         text: "Tracking the March 2026 SEC/CFTC joint five-category token taxonomy (digital commodities, collectibles, tools, stablecoins, securities) and its implications for DeFi protocols, NFT structuring, and institutional stablecoin rails — pending CLARITY Act codification." },
  ];

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

      {/* ── LEVEL 1 — REAL ESTATE WORLD (MINECRAFT) ── */}
      <div style={{ marginBottom: "40px", border: `4px solid ${C.mcGrass}`,
        background: "#0a1a0a", boxShadow: `0 0 30px ${C.mcGrass}44`, overflow: "hidden" }}>

        {/* Sky header */}
        <div style={{
          background: `linear-gradient(180deg, ${C.mcSky} 0%, #a8d8f0 100%)`,
          padding: "16px 24px", display: "flex", justifyContent: "space-between",
          alignItems: "center", borderBottom: `4px solid #000`,
        }}>
          <div style={{ fontFamily: "'Press Start 2P'", fontSize: "10px",
            color: "#1a1a2e", textShadow: "2px 2px 0 rgba(255,255,255,0.5)", letterSpacing: "2px" }}>
            LEVEL 1 — REAL ESTATE WORLD
          </div>
          <div style={{ fontSize: "8px", color: "#1a1a2e", fontFamily: "'Press Start 2P'" }}>★★★★★</div>
        </div>

        {/* Minecraft ground strip */}
        <div style={{ display: "flex", height: "40px" }}>
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
          {/* Header row */}
          <div style={{ display: "flex", gap: "14px", alignItems: "center", marginBottom: "16px" }}>
            <McBlock color={C.mcGrass} size={44} icon="🏛️" />
            <McBlock color={C.mcDirt}  size={36} icon="📜" />
            <McBlock color={C.mcStone} size={28} icon="⚖️" />
            <div style={{ marginLeft: "8px" }}>
              <h3 style={{ fontSize: "11px", color: C.mcGrass, letterSpacing: "2px",
                textShadow: `0 0 10px ${C.mcGrass}`, marginBottom: "4px" }}>
                TITLE, ESCROW &amp; PROPERTY LAW
              </h3>
              <div style={{ fontSize: "7px", color: C.mcGold, letterSpacing: "1px" }}>LEVEL 1 · 30+ YEARS XP</div>
            </div>
          </div>

          {/* Body text */}
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
            color: "#99bb77", lineHeight: "1.9", marginBottom: "24px",
            borderLeft: `3px solid ${C.mcGrass}44`, paddingLeft: "14px" }}>
            With thirty years of XP, Wes delivers elite-level counsel on the intricate mechanics of Title and Escrow Law, state licensing, and consumer regulations. He provides the regulatory "map" for high-volume residential operations and complex commercial acquisitions alike.
          </p>

          {/* Toolkit grid */}
          <div style={{ fontSize: "8px", color: C.mcGold, letterSpacing: "2px",
            marginBottom: "14px", textShadow: `0 0 6px ${C.mcGold}` }}>── THE REAL ESTATE TOOLKIT ──</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {reToolkit.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "12px", background: `${C.mcGrass}08`,
                border: `2px solid ${C.mcGrass}33` }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "6px", color: C.mcGold, letterSpacing: "1px",
                    marginBottom: "4px", textShadow: `0 0 4px ${C.mcGold}` }}>{item.label}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px",
                    color: "#778866", lineHeight: "1.6" }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          {/* XP bar + CTA */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "7px", color: C.dim, marginBottom: "5px", letterSpacing: "1px" }}>EXPERIENCE LEVEL: 30+</div>
              <div style={{ height: "14px", background: "#111", border: "3px solid #555",
                boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.5)" }}>
                <div style={{ height: "100%", width: "99%",
                  background: `linear-gradient(90deg, ${C.mcGold}, #88cc00)`,
                  boxShadow: `0 0 8px ${C.mcGold}` }} />
              </div>
            </div>
            <button className="btn-mc" onClick={() => setPage("contact")}
              style={{ padding: "12px 20px", whiteSpace: "nowrap" }}>
              ▶ OPEN NEW WORLD (BOOK CONSULT)
            </button>
          </div>
        </div>

        {/* Dirt footer */}
        <div style={{ display: "flex", height: "20px", borderTop: "4px solid #000" }}>
          {Array.from({ length: 48 }, (_, i) => (
            <div key={i} style={{
              flex: 1, background: i % 2 === 0 ? C.mcDirt : "#7a5530",
              borderRight: "1px solid rgba(0,0,0,0.3)",
            }} />
          ))}
        </div>
      </div>

      {/* ── LEVEL 2 — GAME LAW ARENA (ARCADE / BOSS LEVEL) ── */}
      <div style={{ marginBottom: "40px", border: `4px solid ${C.cyan}`,
        background: C.surface, boxShadow: `0 0 30px ${C.cyan}33` }}>

        <div style={{ background: `linear-gradient(135deg, #001a33 0%, #003366 100%)`,
          padding: "16px 24px", borderBottom: `4px solid ${C.cyan}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="neon-cyan" style={{ fontSize: "10px", letterSpacing: "2px" }}>
            LEVEL 2 — GAME LAW ARENA
          </div>
          <div style={{ fontSize: "8px", color: C.cyan, fontFamily: "'Press Start 2P'" }}>BOSS LEVEL</div>
        </div>

        {/* Scanline accent */}
        <div style={{ height: "6px", background: `repeating-linear-gradient(90deg, ${C.cyan} 0px, ${C.cyan} 4px, transparent 4px, transparent 8px)`, opacity: 0.3 }} />

        <div style={{ padding: "32px 28px" }}>
          {/* Header row */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            {["🎮","👾","🕹️"].map((ico, i) => (
              <div key={i} style={{
                width: "44px", height: "44px", background: `${C.cyan}11`,
                border: `3px solid ${C.cyan}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", boxShadow: `0 0 10px ${C.cyan}44`,
                animation: `float ${2 + i * 0.5}s ease-in-out infinite`,
              }}>{ico}</div>
            ))}
            <div style={{ marginLeft: "8px" }}>
              <h3 className="neon-cyan" style={{ fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>
                VIDEO GAME &amp; COMMERCE LAW
              </h3>
              <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "1px", opacity: 0.7 }}>LEVEL 2 · BOSS LEVEL · 4 YRS IN-HOUSE XP</div>
            </div>
          </div>

          {/* Body text */}
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
            color: "#88ccdd", lineHeight: "1.9", marginBottom: "24px",
            borderLeft: `3px solid ${C.cyan}44`, paddingLeft: "14px" }}>
            Battle-tested with four years as in-house counsel for a premier global video game payment platform. Wes provides full-stack legal support for the gaming industry — tackling virtual currency regulation, loot box mechanics, and complex developer ecosystems.
          </p>

          {/* Spellbook grid */}
          <div style={{ fontSize: "8px", color: C.cyan, letterSpacing: "2px",
            marginBottom: "14px", textShadow: `0 0 6px ${C.cyan}` }}>── THE GAMING SPELLBOOK ──</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {gameSpellbook.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "12px", background: `${C.cyan}08`, border: `2px solid ${C.cyan}33` }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "6px", color: C.cyan, letterSpacing: "1px",
                    marginBottom: "4px", textShadow: `0 0 4px ${C.cyan}` }}>{item.label}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px",
                    color: "#556677", lineHeight: "1.6" }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-arcade btn-cyan" onClick={() => setPage("tool")}
            style={{ fontSize: "8px", padding: "12px 28px" }}>
            PLAY GAMECOMPLIANCE™ FREE
          </button>
        </div>
      </div>

      {/* ── LEVEL 3 — FINTECH & PAYMENTS DIMENSION (CYBER/NEON) ── */}
      <div style={{ border: `4px solid ${C.purple}`,
        background: "#0a0014", boxShadow: `0 0 30px ${C.purple}44` }}>

        <div style={{ background: `linear-gradient(135deg, #150026 0%, #200040 100%)`,
          padding: "16px 24px", borderBottom: `4px solid ${C.purple}`,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="neon-purple" style={{ fontSize: "10px", letterSpacing: "2px" }}>
            LEVEL 3 — FINTECH &amp; PAYMENTS DIMENSION
          </div>
          <div style={{ fontSize: "8px", color: C.purple, fontFamily: "'Press Start 2P'" }}>SECRET LEVEL</div>
        </div>

        <div style={{ padding: "32px 28px" }}>
          {/* Header row */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
            {["⛓️","💎","🔮"].map((ico, i) => (
              <div key={i} style={{
                width: "44px", height: "44px", background: `${C.purple}11`,
                border: `3px solid ${C.purple}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", boxShadow: `0 0 15px ${C.purple}66`,
                animation: `neonPulse ${1.5 + i * 0.3}s ease-in-out infinite`,
              }}>{ico}</div>
            ))}
            <div style={{ marginLeft: "8px" }}>
              <h3 className="neon-purple" style={{ fontSize: "11px", letterSpacing: "2px", marginBottom: "4px" }}>
                FINTECH, PAYMENTS &amp; DIGITAL ASSETS
              </h3>
              <div style={{ fontSize: "7px", color: C.purple, letterSpacing: "1px", opacity: 0.7 }}>LEVEL 3 · SECRET LEVEL · CRYPTO SINCE 2017</div>
            </div>
          </div>

          {/* Body text */}
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
            color: "#bb88dd", lineHeight: "1.9", marginBottom: "24px",
            borderLeft: `3px solid ${C.purple}44`, paddingLeft: "14px" }}>
            Wes designs the legal architecture for the future of money. From stealth-stage startups to global payment processors, he ensures that moving value remains seamless and compliant across the "Secret Levels" of financial regulation.
          </p>

          {/* Spellbook grid */}
          <div style={{ fontSize: "8px", color: C.purple, letterSpacing: "2px",
            marginBottom: "14px", textShadow: `0 0 6px ${C.purple}` }}>── THE FINTECH SPELLBOOK ──</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "24px" }}>
            {fintechSpellbook.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start",
                padding: "12px", background: `${C.purple}08`, border: `2px solid ${C.purple}33` }}>
                <span style={{ fontSize: "16px", flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: "6px", color: C.purple, letterSpacing: "1px",
                    marginBottom: "4px", textShadow: `0 0 4px ${C.purple}` }}>{item.label}</div>
                  <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px",
                    color: "#6655aa", lineHeight: "1.6" }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>

          <button className="btn-arcade" onClick={() => setPage("contact")}
            style={{ fontSize: "8px", padding: "12px 28px",
              background: C.purple, color: C.white,
              boxShadow: `4px 4px 0 #440066, 0 0 20px ${C.purple}88` }}>
            SUMMON ATTORNEY
          </button>
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
// GAMECOMPLIANCE — FREE, UNLIMITED, NO PAYWALL
// Tool is a client acquisition funnel for indie developers.
// ─────────────────────────────────────────────────────────
const FREE_LIMIT = Infinity;
const STORAGE_KEY_USAGE  = "gc_usage_count";

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

  // Usage tracking
  const [usageCount, setUsageCount] = useState(() => {
    try { return parseInt(localStorage.getItem(STORAGE_KEY_USAGE) || "0", 10); } catch { return 0; }
  });

  const incrementUsage = () => {
    const next = usageCount + 1;
    setUsageCount(next);
    try { localStorage.setItem(STORAGE_KEY_USAGE, String(next)); } catch {}
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

    // Send lead notification to Wes using existing contact template
    emailjs.send(
      "service_jsfyq4c",
      "template_pp23qgb",
      {
        name:    "GameCompliance™ Lead: " + gateForm.name,
        email:   gateForm.email,
        title:   "🎮 NEW GAMECOMPLIANCE™ USER — " + gateForm.name,
        message: "NEW TOOL USER\n\nName: " + gateForm.name +
                 "\nEmail: " + gateForm.email +
                 "\nStudio: " + (gateForm.studio || "Not provided") +
                 "\nTime: " + new Date().toLocaleString("en-US", { timeZoneName: "short" }) +
                 "\n\nACTION: Follow up to convert to paid engagement.",
      },
      "wjbKawH6jrlAYYj1x"
    ).catch(err => console.error("EmailJS gate notification error:", err));

    setGateError(""); setGateScreen(false);
  };

  const runAnalysis = async () => {
    setToolScreen("loading"); setError(null);
    let idx = 0;
    const iv = setInterval(() => { idx = Math.min(idx + 1, LOADING_MSGS.length - 1); setLoadingMsg(LOADING_MSGS[idx]); }, 1800);
    try {
      const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (!apiKey) { clearInterval(iv); setError("API KEY NOT CONFIGURED — CHECK .env FILE"); setToolScreen("intake"); return; }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
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
          <div style={{ fontSize: "7px", color: C.green, letterSpacing: "1px",
            textShadow: `0 0 8px ${C.green}` }}>
            ★ FREE
          </div>
          <div style={{ fontSize: "7px", color: C.dim }}>
            W.R. WILLIAMS ESQ · CA BAR 269157
          </div>
        </div>
      </div>

      {/* ── TOOL SCREENS ── */}
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

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => { setToolScreen("welcome"); setStep(0); setResults(null); }}
              style={{ background: "transparent", color: C.dim, border: `2px solid ${C.darker}`,
                padding: "10px 20px", fontSize: "7px", letterSpacing: "1px", cursor: "crosshair",
                fontFamily: "'Press Start 2P'" }}>
              ◄ NEW GAME
            </button>
            <button onClick={() => {
              const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
              const timeStr = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" });
              const win = window.open("", "_blank");
              win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>GameCompliance™ Analysis Report — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Courier New', monospace; font-size: 11pt; color: #000; background: #fff; }
  .page { max-width: 750px; margin: 0 auto; padding: 50px 50px 70px; }
  .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 16pt; letter-spacing: 2px; margin-bottom: 6px; }
  .header .sub { font-size: 10pt; color: #444; line-height: 1.8; }
  .disclaimer { border: 2px solid #cc8800; background: #fffbe6; padding: 14px; margin-bottom: 20px; font-size: 10pt; line-height: 1.7; }
  .risk-banner { text-align: center; font-size: 20pt; font-weight: bold; letter-spacing: 3px; padding: 16px; margin-bottom: 20px;
    border: 3px solid #000; background: #f5f5f5; }
  .risk-HIGH { color: #cc0000; border-color: #cc0000; }
  .risk-MEDIUM { color: #cc8800; border-color: #cc8800; }
  .risk-LOW { color: #007700; border-color: #007700; }
  .summary { font-style: italic; text-align: center; color: #444; margin-bottom: 20px; font-size: 11pt; line-height: 1.7; }
  .score-row { display: flex; gap: 12px; margin-bottom: 20px; }
  .score-box { flex: 1; border: 2px solid #999; padding: 12px; text-align: center; }
  .score-box .num { font-size: 28pt; font-weight: bold; }
  .score-box .lbl { font-size: 8pt; color: #555; letter-spacing: 1px; margin-top: 4px; }
  .high-num { color: #cc0000; } .med-num { color: #cc8800; } .low-num { color: #007755; }
  .priority { border: 2px solid #cc8800; background: #fffbe6; padding: 14px; margin-bottom: 20px; }
  .priority .label { font-size: 8pt; color: #cc8800; letter-spacing: 2px; margin-bottom: 6px; font-weight: bold; }
  .section-title { font-size: 10pt; font-weight: bold; letter-spacing: 2px; margin: 20px 0 12px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
  .issue { border-left: 5px solid #999; padding: 12px 14px; margin-bottom: 12px; background: #fafafa; }
  .issue-HIGH { border-left-color: #cc0000; }
  .issue-MEDIUM { border-left-color: #cc8800; }
  .issue-LOW { border-left-color: #007755; }
  .issue-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
  .sev-tag { font-size: 8pt; font-weight: bold; padding: 2px 8px; color: white; }
  .sev-HIGH { background: #cc0000; } .sev-MEDIUM { background: #cc8800; } .sev-LOW { background: #007755; }
  .issue-title { font-size: 11pt; font-weight: bold; margin-bottom: 4px; }
  .issue-trigger { font-size: 9pt; color: #666; margin-bottom: 6px; }
  .issue-body { font-size: 10pt; line-height: 1.7; margin-bottom: 8px; }
  .remediation { font-size: 10pt; line-height: 1.7; padding-left: 12px; border-left: 2px solid #007755; color: #005533; }
  .docs { margin-top: 20px; }
  .doc-item { display: flex; gap: 10px; padding: 8px 0; border-bottom: 1px solid #eee; }
  .cta { margin-top: 24px; border: 2px solid #000; padding: 20px; text-align: center; background: #f5f5f5; }
  .footer { margin-top: 24px; font-size: 9pt; color: #666; font-style: italic; border-top: 1px solid #ccc; padding-top: 12px; line-height: 1.7; }
  .no-print { background: #1a3a5c; color: white; padding: 12px 20px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif; font-size: 12px; }
  @media print { .no-print { display: none !important; } .page { padding: 30px; } }
</style></head><body><div class="page">
<div class="no-print">
  <span>⬇ Save as PDF: Press Ctrl+P (Windows) or Cmd+P (Mac) → select "Save as PDF"</span>
  <button onclick="window.print()" style="background:#00fff5;color:#050508;border:none;padding:8px 20px;font-weight:bold;cursor:pointer;font-size:13px;">🖨 PRINT / SAVE PDF</button>
</div>
<div class="header">
  <h1>GAMECOMPLIANCE™ ANALYSIS REPORT</h1>
  <div class="sub">Wesley R. Williams, Esq. &nbsp;|&nbsp; CA State Bar No. 269157<br/>
  weswilliamsesq@gmail.com &nbsp;|&nbsp; 619.305.6485 &nbsp;|&nbsp; San Diego, California<br/>
  Report Generated: ${dateStr} at ${timeStr}<br/>
  <strong>ATTORNEY ADVERTISING — NOT LEGAL ADVICE</strong></div>
</div>
<div class="disclaimer">⚠ IMPORTANT DISCLAIMER: This report constitutes legal issue-spotting only. It does not constitute legal advice, create an attorney-client relationship, or substitute for consultation with a licensed attorney. Consult Wesley R. Williams, Esq. (CA Bar No. 269157) before acting on any item in this report.</div>
<div class="risk-banner risk-${results.overallRisk}">OVERALL RISK: ${results.overallRisk}</div>
<div class="summary">${results.gameSummary}</div>
<div class="score-row">
  <div class="score-box"><div class="num high-num">${results.issues?.filter(i=>i.severity==="HIGH").length||0}</div><div class="lbl">HIGH RISK</div></div>
  <div class="score-box"><div class="num med-num">${results.issues?.filter(i=>i.severity==="MEDIUM").length||0}</div><div class="lbl">MED RISK</div></div>
  <div class="score-box"><div class="num low-num">${results.issues?.filter(i=>i.severity==="LOW").length||0}</div><div class="lbl">LOW RISK</div></div>
</div>
<div class="priority"><div class="label">⚡ PRIORITY MISSION:</div>${results.priorityAction}</div>
<div class="section-title">IDENTIFIED ISSUES (${results.issues?.length})</div>
${results.issues?.map(issue => `
<div class="issue issue-${issue.severity}">
  <div class="issue-header"><span class="sev-tag sev-${issue.severity}">${issue.severity}</span><span style="font-size:9pt;color:#888">${issue.domain}</span></div>
  <div class="issue-title">${issue.title}</div>
  <div class="issue-trigger">Triggered by: ${issue.mechanic}</div>
  <div class="issue-body">${issue.explanation}</div>
  <div style="font-size:9pt;color:#007755;font-weight:bold;margin-bottom:4px;">► REMEDIATION:</div>
  <div class="remediation">${issue.remediation}</div>
</div>`).join("")}
${results.documentsNeeded?.length ? `
<div class="section-title">REQUIRED DOCUMENTS</div>
<div class="docs">${results.documentsNeeded.map(doc=>`<div class="doc-item"><span>📄</span><div><strong>${doc.name}</strong><br/><span style="font-size:10pt;color:#555">${doc.reason}</span></div></div>`).join("")}</div>` : ""}
<div class="cta">
  <strong>NEXT STEP: RETAIN COUNSEL</strong><br/><br/>
  Wesley R. Williams, Esq. offers a free 30-minute consultation for developers who use GameCompliance™.<br/>
  <strong>weswilliamsesq@gmail.com &nbsp;|&nbsp; 619.305.6485</strong><br/><br/>
  game-compliance.com
</div>
<div class="footer">This report was generated by GameCompliance™, an AI-powered legal issue-spotting tool created by Wesley R. Williams, Esq. (CA Bar No. 269157). This report does not constitute legal advice or create an attorney-client relationship. Wesley R. Williams is licensed to practice law in the State of California only. This constitutes attorney advertising under California Rules of Professional Conduct Rule 7.1. Prior results do not guarantee a similar outcome.</div>
</div></body></html>`);
              win.document.close(); win.focus();
            }}
            style={{ background: C.cyan, color: C.bg, border: "none",
              padding: "10px 20px", fontSize: "7px", letterSpacing: "1px", cursor: "crosshair",
              fontFamily: "'Press Start 2P'", boxShadow: `4px 4px 0 #006666` }}>
              ⬇ SAVE REPORT AS PDF
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// SUBSCRIPTION TIERS — used by PricingPage and RetainerPage
// ═══════════════════════════════════════════════════════════

// ⚠️  STRIPE SETUP — THREE PRODUCTS REQUIRED:
// TIER 1 "Starter / Issue Spotter" — $500/month recurring
//   → stripe.com → Products → Add Product → set recurring price → Payment Link → copy URL below
// TIER 2 "General Counsel" — $2,500/month recurring
//   → stripe.com → Products → Add Product → set recurring price → Payment Link → copy URL below
// TIER 3 "Enterprise / Fractional GC" — $5,000/month recurring
//   → stripe.com → Products → Add Product → set recurring price → Payment Link → copy URL below
const STRIPE_LINKS = {
  starter:    "https://buy.stripe.com/00w00j5aB9i926E2YXb3q01",
  counsel:    "https://buy.stripe.com/00wbJ17iJ9i98v2arpb3q02",
  enterprise: "https://buy.stripe.com/cNi14n32tfGxeTq2YXb3q03",
};

const TIERS = [
  {
    id: "starter",
    color: C.cyan,
    colorDark: "#006666",
    label: "STARTER",
    sublabel: "Issue Spotter",
    price: "500",
    badge: "ENTRY LEVEL",
    emoji: "🎮",
    desc: "For solo devs and early-stage studios who need legal issue-spotting and light guidance.",
    included: [
      { icon: "📧", label: "EMAIL ACCESS (2 QUERIES/MO)",     desc: "Two legal questions per month answered within 2 business days" },
      { icon: "⚡", label: "REGULATORY ALERTS",               desc: "Notified when gaming, fintech, or RE laws change" },
      { icon: "📋", label: "1 CONTRACT REVIEW/MONTH",         desc: "One standard commercial agreement reviewed and redlined" },
    ],
    notIncluded: [
      "Strategy calls",
      "More than 1 contract review/month*",
      "Litigation or court appearances",
      "M&A or complex transactions*",
    ],
    overage: "$350/hr",
    autoRenew: "500.00",
  },
  {
    id: "counsel",
    color: C.mcGold,
    colorDark: "#5a3d00",
    label: "GENERAL COUNSEL",
    sublabel: "Full-Service GC",
    price: "2,500",
    badge: "BEST VALUE",
    emoji: "⚖️",
    desc: "Comprehensive outside general counsel for growing studios and funded companies.",
    included: [
      { icon: "📧", label: "UNLIMITED EMAIL & MESSAGING",     desc: "Legal questions answered within 1 business day" },
      { icon: "📞", label: "MONTHLY STRATEGY CALL (45 MIN)", desc: "One scheduled call per month to discuss your legal landscape" },
      { icon: "📋", label: "CONTRACT REVIEW (3/MONTH)",       desc: "Standard commercial agreements reviewed and redlined" },
      { icon: "⚡", label: "REGULATORY ALERTS",               desc: "Notified when laws change that affect your business" },
      { icon: "⚖️", label: "SCOPE: GAMING · RE · FINTECH",   desc: "Matters within gaming law, real estate, and digital assets" },
    ],
    notIncluded: [
      "Litigation or court appearances",
      "Government enforcement defense",
      "More than 3 contract reviews/month*",
      "M&A or complex transactions*",
    ],
    overage: "$350/hr",
    autoRenew: "2,500.00",
  },
  {
    id: "enterprise",
    color: C.purple,
    colorDark: "#440088",
    label: "ENTERPRISE",
    sublabel: "Fractional GC",
    price: "5,000",
    badge: "WHITE GLOVE",
    emoji: "👑",
    desc: "Fractional General Counsel for funded studios, platforms, and fintech companies.",
    included: [
      { icon: "📧", label: "UNLIMITED EMAIL & MESSAGING",     desc: "Legal questions answered same business day" },
      { icon: "📞", label: "BI-WEEKLY STRATEGY CALLS (45 MIN)", desc: "Two 45-minute strategy calls per month" },
      { icon: "📋", label: "CONTRACT REVIEW (UNLIMITED)",     desc: "Unlimited standard commercial agreements reviewed and redlined" },
      { icon: "⚡", label: "PRIORITY REGULATORY ALERTS",      desc: "First-in-line notification when laws change" },
      { icon: "🤝", label: "VENDOR & PARTNER NEGOTIATION",    desc: "Active negotiation support on commercial deals within scope" },
      { icon: "📑", label: "CUSTOM TEMPLATE LIBRARY",        desc: "Bespoke contract templates drafted for your business" },
    ],
    notIncluded: [
      "Litigation or court appearances",
      "Government enforcement defense",
      "M&A transactions (available at overage)*",
    ],
    overage: "$350/hr",
    autoRenew: "5,000.00",
  },
];

// ═══════════════════════════════════════════════════════════
// RETAINER AGREEMENT PAGE
// ═══════════════════════════════════════════════════════════
function RetainerPage({ setPage }) {
  const [scrolled, setScrolled] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [juryWaived, setJuryWaived] = useState(false);
  const [signed, setSigned] = useState(false);
  const [selectedTierObj, setSelectedTierObj] = useState(null); // tier selection step
  const [signForm, setSignForm] = useState({ name: "", email: "", studio: "", matter: "", tier: "", date: new Date().toLocaleDateString() });
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

    // Send notification email to Wes
    const ts = new Date();
    const dateStr = ts.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = ts.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });

    // Build attorney PDF link — encodes all retainer data into URL params
    const params = new URLSearchParams({
      n: signForm.name,
      e: signForm.email,
      s: signForm.studio || "",
      m: signForm.matter,
      tl: tierLabel,
      tp: tierPrice,
      ts: ts.toISOString(),
    });
    const attorneyPDFLink = window.location.origin + "?retainer=" + encodeURIComponent(params.toString());

    emailjs.send(
      "service_jsfyq4c",
      "template_53eb1wl",
      {
        client_name:      signForm.name,
        client_email:     signForm.email,
        client_studio:    signForm.studio || "N/A",
        tier:             tierLabel + " — $" + tierPrice + "/mo",
        client_matter:    signForm.matter,
        exec_date:        dateStr,
        exec_time:        timeStr,
        exec_timestamp:   ts.toISOString(),
        name:             signForm.name,
        email:            signForm.email,
        attorney_pdf_link: attorneyPDFLink,
      },
      "wjbKawH6jrlAYYj1x"
    ).catch(err => console.error("EmailJS retainer notification error:", err));

    setConfirmed(true);
  };

  // Tier info helpers
  const tierLabel = selectedTierObj ? selectedTierObj.label : (signForm.tier || "General Counsel");
  const tierPrice = selectedTierObj ? selectedTierObj.price : "2,500";
  const tierAutoRenew = selectedTierObj ? selectedTierObj.autoRenew : "2,500.00";
  const tierContractReviews = selectedTierObj
    ? (selectedTierObj.id === "starter" ? "one (1)" : selectedTierObj.id === "enterprise" ? "unlimited" : "three (3)")
    : "three (3)";
  const tierCallSchedule = selectedTierObj
    ? (selectedTierObj.id === "starter" ? "no included strategy calls" : selectedTierObj.id === "enterprise" ? "two (2) strategy calls of up to 45 minutes each per month" : "one (1) strategy call of up to 45 minutes per month")
    : "one (1) strategy call of up to 45 minutes per month";
  const tierEmailAccess = selectedTierObj
    ? (selectedTierObj.id === "starter" ? "two (2) email legal queries per month, with responses within two (2) business days" : "unlimited email and messaging access for legal questions, with responses within one (1) business day")
    : "unlimited email and messaging access for legal questions, with responses within one (1) business day";

  const handleDownloadPDF = () => {
    const ts = execTimestamp.toISOString();
    const dateStr = execTimestamp.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = execTimestamp.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });
    const tl = tierLabel;
    const tp = tierPrice;
    const tar = tierAutoRenew;
    const tcr = tierContractReviews;
    const tcs = tierCallSchedule;
    const tea = tierEmailAccess;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<title>Retainer Agreement — ${signForm.name} — ${dateStr}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; color: #000; background: #fff; }
  .page { max-width: 750px; margin: 0 auto; padding: 60px 60px 80px; }
  h1 { font-size: 16pt; text-align: center; letter-spacing: 1px; margin-bottom: 6px; }
  h2 { font-size: 12pt; font-weight: bold; margin-top: 22px; margin-bottom: 8px; border-bottom: 1px solid #999; padding-bottom: 4px; text-transform: uppercase; }
  h3 { font-size: 11pt; font-weight: bold; margin-top: 14px; margin-bottom: 4px; }
  p { margin-bottom: 10px; line-height: 1.75; font-size: 11pt; }
  .header-block { text-align: center; border-bottom: 2px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
  .header-block .atty { font-size: 14pt; font-weight: bold; margin-bottom: 6px; letter-spacing: 1px; }
  .header-block .sub { font-size: 10pt; color: #333; line-height: 1.9; }
  .tier-box { border: 2px solid #000; padding: 12px 18px; margin: 16px 0; background: #f7f7f7; }
  .tier-box .tier-label { font-size: 11pt; font-weight: bold; margin-bottom: 4px; }
  .tier-box .tier-detail { font-size: 10pt; color: #333; line-height: 1.7; }
  .sig-block { margin-top: 36px; border: 2px solid #000; padding: 28px; background: #f9f9f9; page-break-inside: avoid; }
  .sig-title { font-size: 13pt; font-weight: bold; text-align: center; margin-bottom: 20px; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 12px; }
  .sig-row { display: flex; gap: 40px; margin-top: 16px; }
  .sig-label { font-size: 9pt; color: #555; margin-bottom: 2px; }
  .sig-value { font-size: 11pt; font-weight: bold; padding-bottom: 4px; border-bottom: 1px solid #000; min-height: 22px; }
  .checkbox-record { margin: 8px 0; font-size: 10pt; line-height: 1.6; padding-left: 4px; }
  .checkbox-record::before { content: "☑  "; font-size: 12pt; }
  .timestamp-box { margin-top: 20px; border: 1px solid #aaa; padding: 14px; background: #f0f0f0; font-size: 9pt; font-family: 'Courier New', monospace; line-height: 1.9; }
  .sig-line-block { flex: 1; }
  .sig-name { font-size: 15pt; font-style: italic; font-family: 'Times New Roman', serif; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; min-height: 28px; }
  .sig-name-atty { font-size: 15pt; font-style: italic; font-family: 'Times New Roman', serif; font-weight: bold; color: #1a3a5c; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
  .sig-caption { font-size: 9pt; color: #444; line-height: 1.6; }
  .disclaimer { margin-top: 24px; font-size: 9pt; color: #555; font-style: italic; line-height: 1.7; border-top: 1px solid #ccc; padding-top: 14px; }
  .warning { font-weight: bold; }
  .allcaps { font-size: 10.5pt; line-height: 1.7; text-transform: uppercase; }
  .section-body { font-size: 11pt; line-height: 1.75; margin-bottom: 10px; }
  .indent { padding-left: 24px; }
  @media print {
    .no-print { display: none !important; }
    .page { padding: 36px; }
    body { font-size: 11pt; }
  }
</style>
</head>
<body>
<div class="page">

  <div class="no-print" style="background:#1a3a5c;color:white;padding:14px 20px;margin-bottom:24px;font-family:Arial,sans-serif;font-size:12px;display:flex;justify-content:space-between;align-items:center;gap:16px;">
    <span>⬇ Both parties: save this page as PDF using your browser's Print function (Ctrl+P / Cmd+P) &rarr; "Save as PDF"</span>
    <button onclick="window.print()" style="background:#00fff5;color:#050508;border:none;padding:8px 20px;font-weight:bold;cursor:pointer;font-size:13px;white-space:nowrap;flex-shrink:0;">🖨 PRINT / SAVE PDF</button>
  </div>

  <div class="header-block">
    <div class="atty">ATTORNEY-CLIENT RETAINER AGREEMENT</div>
    <div class="sub">
      Wesley R. Williams, Esq. &nbsp;|&nbsp; California State Bar No. 269157<br/>
      weswilliamsesq@gmail.com &nbsp;|&nbsp; 619.305.6485 &nbsp;|&nbsp; San Diego, California<br/>
      <strong>ATTORNEY ADVERTISING</strong> &nbsp;|&nbsp; Wesley R. Williams is licensed to practice law in California only.
    </div>
  </div>

  <div class="tier-box">
    <div class="tier-label">SUBSCRIPTION TIER: ${tl.toUpperCase()} — $${tp}/MONTH</div>
    <div class="tier-detail">
      Engagement Type: ${signForm.matter || "Subscription"}<br/>
      Client: ${signForm.name}${signForm.studio ? " | " + signForm.studio : ""}<br/>
      Effective Date: ${dateStr}
    </div>
  </div>

  <p>This Agreement is made between the Client identified below ("Client") and Wesley R. Williams, Esq. ("Attorney"). In consideration of the mutual promises herein, the parties agree as follows:</p>

  <h2>1. Scope of Representation</h2>
  <p class="section-body">Attorney agrees to represent Client in connection with the specific matter described by Client at the time of engagement (the "Matter"), within the following practice areas: gaming law and video game commerce, real estate and title insurance, fintech, and digital assets. This Agreement covers only the Matter or Subscription scope expressly identified. Any additional matters outside the defined scope require a separate written agreement or amendment.</p>
  <p class="section-body">Attorney's services may include, as applicable and agreed: legal research and analysis; drafting, reviewing, and negotiating contracts and agreements; regulatory compliance advice; and correspondence and communications on Client's behalf. Attorney will keep Client informed of the progress of the Matter and will respond within a reasonable time to Client's inquiries.</p>
  <p class="section-body">This Agreement will not become binding on either party, and Attorney will not begin providing legal services, until Client has executed this Agreement electronically and any required payment has been processed.</p>
  <p class="section-body warning">EXCLUSION — NO LITIGATION SERVICES: Attorney does not provide litigation services, court appearances, or representation in administrative, regulatory, arbitration, or judicial proceedings of any kind. This Agreement expressly excludes all litigation, government enforcement defense, and any matter requiring court or tribunal appearance. Clients requiring litigation services must retain separate litigation counsel. Nothing in this Agreement shall be construed to create an obligation on the part of Attorney to appear in any court or proceeding.</p>

  <h2>2. Fees, Billing, and Trust Account Disclosure</h2>
  <h3>A. Fee Structure.</h3>
  <p class="section-body">Attorney's fees are charged on a flat fee or monthly subscription basis as agreed at engagement. No hourly billing applies unless separately agreed in writing for overage services. The applicable fee structure for this engagement is the <strong>${tl}</strong> Subscription at <strong>$${tp} per month</strong>, as further described in Section 5.</p>
  <h3>B. No Client Trust Account — Important Disclosure (California Rule of Professional Conduct 1.15(b)).</h3>
  <p class="section-body warning">Attorney does not maintain a client trust account (IOLTA). All fees paid under this Agreement, including monthly Subscription fees, will be deposited directly into Attorney's operating account.</p>
  <p class="section-body">CLIENT ACKNOWLEDGMENT AND CONSENT: Client understands and agrees that: (i) Client has the right to require that any flat-fee or Subscription payment be deposited into a client trust account until the fee is earned; and (ii) Client is entitled to a refund of any portion of a fee paid in advance that has not been earned in the event the representation terminates or the services for which the fee was paid are not completed. By signing this Agreement, Client expressly consents to the deposit of all fees, including the monthly Subscription fee, directly into Attorney's operating account.</p>
  <h3>C. Invoicing and Payment.</h3>
  <p class="section-body">For Subscription clients, Stripe, Inc. automatically generates and emails a PDF invoice to Client before each monthly charge and a receipt upon successful payment. No manual invoice submission is required for recurring Subscription fees. For non-subscription flat fee or overage matters, Attorney will issue invoices which are due within thirty (30) days of the invoice date. Any unpaid balance shall bear interest at the rate of ten percent (10%) per annum or the maximum rate permitted by law, whichever is less.</p>
  <h3>D. Rate Changes.</h3>
  <p class="section-body">Attorney shall give Client thirty (30) days written notice of any change to the fee schedule. If Client does not agree to the new rate schedule, Client may terminate this Agreement.</p>
  <h3>E. No Guarantees.</h3>
  <p class="section-body">No promises or guarantees as to the outcome of any matter have been made to Client by Attorney. No other representations have been made to Client except those set out in this Agreement.</p>

  <h2>3. Expenses</h2>
  <p class="section-body">All reasonable expenses incurred by Attorney in handling Client's matter shall be paid by Client as incurred. Expenses include but are not limited to: filing fees, postage, overnight fees, state regulatory filing fees, copy costs, certified copies, transcripts, records, travel, parking, and any other case expenses. Online research fees are charged at service provider standard fee. Filing fees are charged at service provider standard fee. Mileage is charged at the IRS standard mileage rate.</p>

  <h2>4. Negotiation Authority</h2>
  <p class="section-body">Attorney is authorized to enter into negotiations on behalf of Client in connection with the Matter as Attorney deems appropriate, including contract negotiations, regulatory inquiries, and commercial disputes within the scope of this Agreement. Notwithstanding the foregoing, no binding settlement, resolution, or agreement that affects Client's legal rights or financial obligations shall be entered into without Client's prior written approval. Attorney will present all material settlement or resolution proposals to Client before any commitment is made.</p>

  <h2>5. Subscription Terms and Automatic Renewal</h2>
  <p class="section-body">Client has enrolled in the <strong>${tl} Subscription</strong> at <strong>$${tp} per month</strong> (the "Subscription"). The monthly Subscription fee covers the following services within the defined practice areas: (a) ${tea}; (b) ${tcs}; (c) up to ${tcr} standard commercial contract review(s) per month; and (d) full access to the GameCompliance&trade; compliance platform and regulatory alert service. Subscription services are subject to the litigation exclusion in Section 1 above.</p>
  <p class="section-body warning allcaps">AUTOMATIC RENEWAL DISCLOSURE — REQUIRED BY CALIFORNIA BUSINESS &amp; PROFESSIONS CODE §17601 ET SEQ.: THE SUBSCRIPTION WILL AUTOMATICALLY RENEW EACH MONTH AT $${tp} UNLESS CANCELLED. Your subscription will be charged to the payment method on file on the same calendar date each month. To cancel, Client must provide written notice to Attorney at weswilliamsesq@gmail.com at least thirty (30) days before the next billing date. Cancellation takes effect at the end of the then-current billing period. No partial refunds are issued for mid-period cancellations except as required by law or as set forth below.</p>
  <p class="section-body">Overage Services. Work outside the Subscription scope — including matters exceeding the included contract review allotment per month, complex transactions, M&amp;A, and government enforcement matters not requiring court appearance — is available at $350/hr, billed separately under a written engagement agreement. All litigation remains excluded regardless of fee arrangement.</p>
  <p class="section-body">Modification of Subscription Terms. Attorney reserves the right to modify Subscription pricing or scope upon sixty (60) days written notice. Client may cancel without penalty during the notice period.</p>
  <p class="section-body warning">PAYMENT PROCESSING AND RECURRING CHARGE AUTHORIZATION: Subscription payments are processed by Stripe, Inc. Attorney does not store Client's payment card information. By executing this Agreement and enrolling in the Subscription, Client expressly authorizes Stripe, Inc. to charge Client's payment method on file the amount of $${tar} on a recurring monthly basis, on the same calendar date each month, until the Subscription is cancelled in accordance with the cancellation terms above. This authorization remains in effect until Client provides written cancellation notice as specified herein. Failed payments result in a 7-day grace period before further action, including possible suspension or withdrawal as provided in Section 9.</p>
  <p class="section-body">Earned Fee / Refund on Termination. The monthly Subscription fee is earned on a pro-rata daily basis throughout each billing month. If this Agreement terminates mid-month, Attorney will refund the unearned portion of that month's fee (calculated as the number of unused days in the month divided by the total days in the month, multiplied by the monthly fee), unless the parties agree otherwise in writing.</p>

  <h2>6. Electronic Signature and Communications</h2>
  <p class="section-body">The parties agree that this Agreement may be executed electronically. An electronic signature constitutes a valid and binding signature under the California Uniform Electronic Transactions Act (Cal. Civ. Code §§ 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.). Client's affirmative click-through assent constitutes Client's electronic signature and is legally equivalent to a handwritten signature. The parties consent to communicate by electronic mail, which satisfies any writing requirements under the California Rules of Professional Conduct.</p>

  <h2>7. Confidentiality and Attorney-Client Privilege</h2>
  <p class="section-body">Attorney will maintain the confidentiality of all information Client discloses in the course of representation, subject to the exceptions in California Rules of Professional Conduct Rule 1.6 and applicable law. All communications between Client and Attorney made for the purpose of seeking or providing legal advice are protected by the attorney-client privilege.</p>

  <h2>8. Conflicts of Interest</h2>
  <p class="section-body">Attorney has conducted a conflicts check based on information available at the time of engagement. If a conflict of interest arises during the representation, Attorney will promptly notify Client and address the conflict in accordance with the California Rules of Professional Conduct.</p>

  <h2>9. Discharge and Withdrawal</h2>
  <p class="section-body">Client's Right to Discharge. Client may discharge Attorney at any time, with or without cause, by providing written notice to Attorney.</p>
  <p class="section-body">Attorney's Right to Withdraw. Attorney may withdraw from the representation only as permitted by the California Rules of Professional Conduct (including Rule 1.16) and applicable law. Attorney may withdraw if Client breaches a material term of this Agreement, including failure to pay the monthly Subscription fee when due. Attorney will first provide Client with reasonable written notice of the breach and at least ten (10) days to cure. If the breach is not cured, Attorney may cease providing further services and withdraw from the representation.</p>
  <p class="section-body">Upon any termination, Attorney will: (a) take all reasonable steps to avoid foreseeable prejudice to Client's interests; (b) promptly return to Client all Client files and documents in Attorney's possession; (c) promptly refund any portion of fees paid in advance that have not been earned, calculated on a pro-rata daily basis; and (d) deliver a final accounting of any amounts still owed for services already performed.</p>

  <h2>10. Association of Other Attorneys or Services</h2>
  <p class="section-body">Attorney may, at Attorney's sole discretion, employ any other person or service necessary to assist in this representation. Should it become advisable to refer this matter or associate with another attorney or law firm, Attorney will provide Client with information regarding any division of fee arrangement, including the identity of all participating lawyers, the basis for fee division, and each party's share. Attorney will request Client's written consent before any such arrangement is made.</p>

  <h2>11. Dispute Resolution and Fee Arbitration</h2>
  <p class="section-body">Client has the right to request mandatory fee arbitration through the State Bar of California Fee Arbitration Program before filing a lawsuit, pursuant to California Business and Professions Code §§ 6200–6206. Client may exercise this right by notifying Attorney in writing within thirty (30) days of receiving a final billing statement. If Client elects not to proceed under the State Bar fee arbitration procedures within thirty (30) days, any dispute over fees, charges, costs, expenses, or any other dispute between Client and Attorney will be resolved via judicial reference without jury. The sole and exclusive venue for fee arbitration and any legal dispute shall be San Diego County, California, and/or the Southern District of California (if Federal Court).</p>
  <p class="section-body warning">JURY TRIAL WAIVER: BY EXECUTING THIS AGREEMENT, CLIENT CONFIRMS THAT CLIENT HAS READ AND UNDERSTANDS THE DISPUTE RESOLUTION PROVISIONS ABOVE AND VOLUNTARILY AGREES TO RESOLUTION BY JUDICIAL REFERENCE OR OTHER COURT PROCEEDING AS WARRANTED IN THE EVENT CLIENT DOES NOT ELECT STATE BAR FEE ARBITRATION PROCEDURES. IN DOING SO, CLIENT AND ATTORNEY VOLUNTARILY WAIVE IMPORTANT CONSTITUTIONAL RIGHTS TO TRIAL BY JURY. CLIENT IS ADVISED THAT CLIENT HAS THE RIGHT TO HAVE AN INDEPENDENT ATTORNEY REVIEW THIS DISPUTE RESOLUTION PROVISION AND THIS ENTIRE AGREEMENT PRIOR TO SIGNING.</p>

  <h2>12. Prevailing Party Attorney Fees</h2>
  <p class="section-body">In the event either party brings an action to enforce any provision of this Agreement, the prevailing party shall be entitled to recover reasonable attorney fees and costs incurred in such action.</p>

  <h2>13. Tax Disclosure and Acknowledgment</h2>
  <p class="section-body warning allcaps">CLIENT IS ADVISED TO OBTAIN INDEPENDENT AND COMPETENT TAX ADVICE REGARDING THESE LEGAL MATTERS SINCE LEGAL TRANSACTIONS CAN GIVE RISE TO TAX CONSEQUENCES. ATTORNEY HAS NOT AGREED TO RENDER ANY TAX ADVICE AND IS NOT RESPONSIBLE FOR ANY ADVICE REGARDING TAX MATTERS OR PREPARATION OF TAX RETURNS OR OTHER FILINGS, INCLUDING BUT NOT LIMITED TO STATE AND FEDERAL INCOME AND INHERITANCE TAX RETURNS. CLIENT SHOULD OBTAIN PROFESSIONAL HELP REGARDING THE VALUATION AND LOCATION OF ALL ASSETS WHICH MAY BE THE SUBJECT OF A LEGAL MATTER.</p>

  <h2>14. Disclaimer — GameCompliance™</h2>
  <p class="section-body">If Client was referred through the GameCompliance™ platform, Client acknowledges that: (a) use of the GameCompliance™ tool did not create an attorney-client relationship; (b) the analysis generated by GameCompliance™ constituted legal issue-spotting only and did not constitute legal advice; and (c) this Retainer Agreement, once executed, establishes the attorney-client relationship for the specific Matter or Subscription identified herein.</p>

  <h2>15. California Law — Governing Law and Construction</h2>
  <p class="section-body">This Agreement shall be construed under the laws of California. All obligations of the parties created hereunder are performable in San Diego County, California. If any provision of this Agreement is held invalid, illegal, or unenforceable for any reason, such invalidity shall not affect any other provision, and this Agreement shall be construed as if such provision had never been contained herein.</p>

  <h2>16. Parties Bound — Entire Agreement</h2>
  <p class="section-body">This Agreement shall be binding upon and inure to the benefit of the parties and their respective heirs, executors, administrators, legal representatives, successors, and assigns where permitted. This Agreement constitutes the sole and entire agreement between the parties, supersedes all prior understandings or written or oral agreements concerning the subject matter hereof, and may be modified only by a written instrument signed by both parties.</p>

  <h2>17. Effective Date and Duplicate Copy</h2>
  <p class="section-body">This Agreement will govern all legal services beginning on the date that Attorney began performing work for Client. The date of electronic execution is used for reference only. <strong>Client will be required to pay Attorney the reasonable value of services performed by Attorney, even if this Agreement never formally takes effect.</strong> Attorney will not begin providing legal services until Client has executed this Agreement electronically and any required payment has been processed. Attorney will provide Client with a fully executed duplicate copy of this Agreement as required by Business and Professions Code § 6148.</p>

  <p style="font-size:10pt;color:#555;margin-top:18px;padding-top:10px;border-top:1px solid #ddd;">This Agreement is governed by the California Rules of Professional Conduct and applicable provisions of the California Business and Professions Code, including Business and Professions Code §§ 6200–6206 (fee arbitration) and §§ 17601 et seq. (automatic renewal).</p>

  <!-- SIGNATURE BLOCK -->
  <div class="sig-block">
    <div class="sig-title">EXECUTION RECORD — FULLY EXECUTED AGREEMENT</div>

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

    <div class="sig-row" style="margin-top:14px">
      <div style="flex:1">
        <div class="sig-label">STUDIO / COMPANY</div>
        <div class="sig-value">${signForm.studio || "N/A"}</div>
      </div>
      <div style="flex:1">
        <div class="sig-label">SUBSCRIPTION TIER &amp; MATTER</div>
        <div class="sig-value">${tl} — $${tp}/mo | ${signForm.matter}</div>
      </div>
    </div>

    <div style="margin-top:20px">
      <div class="sig-label" style="margin-bottom:8px;font-weight:bold;">CLIENT ACKNOWLEDGMENTS (BOTH CHECKED AT TIME OF EXECUTION):</div>
      <div class="checkbox-record">I have read, understood, and agree to all terms and conditions of this Attorney-Client Retainer Agreement, including the No Trust Account disclosure in Section 2(B) and the automatic renewal terms in Section 5.</div>
      <div class="checkbox-record">I separately and specifically acknowledge the Jury Trial Waiver in Section 11 and voluntarily waive my constitutional right to a jury trial. I understand I may have an independent attorney review this provision before signing.</div>
    </div>

    <div class="timestamp-box">
      EXECUTION DATE: ${dateStr}<br/>
      EXECUTION TIME: ${timeStr}<br/>
      EXECUTION TIMESTAMP (ISO 8601 / UTC): ${ts}<br/>
      SIGNATURE METHOD: Electronic Click-Through Assent<br/>
      LEGAL BASIS: UETA — Cal. Civ. Code §§ 1633.1 et seq. / eSign Act — 15 U.S.C. § 7001 et seq.<br/>
      ATTORNEY: Wesley R. Williams, Esq. — CA State Bar No. 269157
    </div>

    <div style="margin-top:28px;display:flex;justify-content:space-between;gap:40px">
      <div class="sig-line-block">
        <div class="sig-name">/s/ ${signForm.name}</div>
        <div class="sig-caption">
          <strong>CLIENT — Electronic Signature</strong><br/>
          ${signForm.name}${signForm.studio ? "<br/>" + signForm.studio : ""}<br/>
          Date: ${dateStr}
        </div>
      </div>
      <div class="sig-line-block">
        <div class="sig-name-atty">/s/ Wesley R. Williams</div>
        <div class="sig-caption">
          <strong>ATTORNEY — Countersignature</strong><br/>
          Wesley R. Williams, Esq.<br/>
          CA State Bar No. 269157<br/>
          Date: ${dateStr}
        </div>
      </div>
    </div>
  </div>

  <div class="disclaimer">
    This document constitutes a fully executed, legally binding attorney-client retainer agreement executed electronically by both parties pursuant to the California Uniform Electronic Transactions Act (Cal. Civ. Code §§ 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.). Both parties should retain a copy of this document for their records. Wesley R. Williams, Esq. is licensed to practice law in the State of California only. This website constitutes attorney advertising under California Rules of Professional Conduct Rule 7.1. Prior results do not guarantee a similar outcome.
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
          color: "#88cc88", lineHeight: "2", marginBottom: "16px" }}>
          Congratulations, {signForm.name}.<br />
          Your retainer agreement has been fully executed electronically.<br />
          <span style={{ color: C.yellow }}>Tier: {tierLabel} — ${tierPrice}/mo</span>
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
          color: "#667755", lineHeight: "1.9", marginBottom: "24px" }}>
          Both parties' signatures are recorded above.<br />
          Wesley R. Williams, Esq. will be in touch within one business day.
        </div>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "28px" }}>
          EXECUTION TIMESTAMP: {execTimestamp.toISOString()}<br />
          CA BAR NO. 269157 · ELECTRONIC SIGNATURE VALID UNDER UETA &amp; ESIGN ACT
        </div>

        {/* PDF Download CTA */}
        <div style={{ border: `3px solid ${C.yellow}`, background: `${C.yellow}0a`,
          padding: "20px", marginBottom: "16px", boxShadow: `0 0 20px ${C.yellow}33` }}>
          <div style={{ fontSize: "8px", color: C.yellow, letterSpacing: "2px",
            marginBottom: "10px", textShadow: `0 0 8px ${C.yellow}` }}>
            ── SAVE YOUR FULLY EXECUTED COPY ──
          </div>
          <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
            color: "#aaaa66", lineHeight: "1.8", marginBottom: "16px" }}>
            Both the client and Wesley R. Williams, Esq. should save this PDF for their records.
            Press <strong style={{ color: C.yellow }}>Ctrl+P</strong> (Windows)
            or <strong style={{ color: C.yellow }}>Cmd+P</strong> (Mac) → select
            <strong style={{ color: C.yellow }}> "Save as PDF"</strong>.
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "6px", color: C.dim, letterSpacing: "1px", marginBottom: "6px" }}>CLIENT COPY</div>
              <button className="btn-arcade btn-yellow" onClick={handleDownloadPDF}
                style={{ fontSize: "8px", padding: "12px 20px" }}>
                ⬇ CLIENT PDF
              </button>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "6px", color: C.cyan, letterSpacing: "1px", marginBottom: "6px" }}>ATTORNEY COPY</div>
              <button className="btn-arcade btn-cyan" onClick={handleDownloadPDF}
                style={{ fontSize: "8px", padding: "12px 20px" }}>
                ⬇ ATTORNEY PDF
              </button>
            </div>
          </div>
        </div>

        <button className="btn-arcade btn-cyan" onClick={() => setPage("contact")}
          style={{ fontSize: "8px" }}>CONTACT ATTORNEY</button>
      </div>
    </div>
  );

  // ── STEP 0: Tier selection ──
  if (!selectedTierObj) return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "120px 32px 80px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontSize: "7px", color: C.yellow, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.yellow}` }}>── LEGAL CONTRACT ──</div>
        <h1 className="neon-yellow" style={{ fontSize: "clamp(12px, 2.5vw, 20px)",
          letterSpacing: "3px", marginBottom: "8px" }}>ATTORNEY RETAINER AGREEMENT</h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "20px" }}>
          STEP 1 OF 2 — SELECT YOUR SUBSCRIPTION TIER
        </div>
        <div style={{ fontFamily: "'Courier New', monospace", fontSize: "12px",
          color: "#778899", lineHeight: "1.8", maxWidth: "520px", margin: "0 auto" }}>
          Select the tier that matches your subscription. The retainer agreement will be customized to your tier's scope and fee. If you have not yet subscribed, <button onClick={() => setPage("pricing")} style={{ background: "none", border: "none", color: C.cyan, fontFamily: "'Courier New', monospace", fontSize: "12px", cursor: "crosshair", textDecoration: "underline", padding: 0 }}>visit the pricing page first</button>.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {TIERS.map(tier => (
          <button key={tier.id} onClick={() => { setSelectedTierObj(tier); setSignForm(f => ({ ...f, tier: tier.label })); }}
            style={{
              background: `${tier.color}0a`, border: `3px solid ${tier.color}`,
              color: tier.color, padding: "24px 16px", cursor: "crosshair",
              fontFamily: "'Press Start 2P', monospace", textAlign: "center",
              boxShadow: `0 0 16px ${tier.color}44`,
              display: "flex", flexDirection: "column", gap: "10px", alignItems: "center",
            }}>
            <div style={{ fontSize: "24px" }}>{tier.emoji}</div>
            <div style={{ fontSize: "8px", letterSpacing: "1px" }}>{tier.label}</div>
            <div style={{ fontSize: "7px", color: C.dim }}>{tier.sublabel}</div>
            <div style={{ fontSize: "11px", fontWeight: "700", color: tier.color,
              textShadow: `0 0 10px ${tier.color}` }}>${tier.price}/mo</div>
          </button>
        ))}
      </div>

      <div style={{ border: `2px solid ${C.yellow}33`, padding: "14px 18px",
        background: C.surface, fontSize: "7px", color: C.dim, letterSpacing: "1px",
        lineHeight: "2.2", textAlign: "center" }}>
        NOT SURE WHICH TIER? <button onClick={() => setPage("pricing")} style={{ background: "none", border: "none", color: C.yellow, fontFamily: "'Press Start 2P', monospace", fontSize: "7px", cursor: "crosshair", textDecoration: "underline", letterSpacing: "1px", padding: "0 4px" }}>COMPARE TIERS</button> · ALREADY SUBSCRIBED? SELECT YOUR TIER ABOVE TO PROCEED.
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
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "8px" }}>
          WESLEY R. WILLIAMS, ESQ. · CA BAR NO. 269157
        </div>
        {/* Tier badge */}
        <div style={{ display: "inline-block", padding: "6px 16px", marginTop: "8px",
          border: `2px solid ${selectedTierObj.color}`, background: `${selectedTierObj.color}15`,
          fontSize: "7px", color: selectedTierObj.color, letterSpacing: "2px",
          textShadow: `0 0 8px ${selectedTierObj.color}` }}>
          {selectedTierObj.emoji} {selectedTierObj.label} — ${selectedTierObj.price}/MO
          <button onClick={() => { setSelectedTierObj(null); setScrolled(false); setAgreed(false); setJuryWaived(false); }}
            style={{ background: "none", border: "none", color: C.dim, fontFamily: "'Press Start 2P', monospace",
              fontSize: "6px", cursor: "crosshair", marginLeft: "12px", letterSpacing: "1px" }}>
            [CHANGE]
          </button>
        </div>
      </div>

      {/* Scroll to read notice */}
      {!scrolled && (
        <div style={{ border: `2px solid ${C.yellow}44`, background: `${C.yellow}08`,
          padding: "12px", marginBottom: "16px", fontSize: "7px",
          color: C.yellow, textAlign: "center", letterSpacing: "1px",
          animation: "neonPulse 2s infinite" }}>
          ▼ SCROLL TO BOTTOM OF AGREEMENT TO ENABLE SIGNATURE ▼
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

<div style={{ background: `${selectedTierObj.color}12`, border: `2px solid ${selectedTierObj.color}44`,
  padding: "10px 14px", marginBottom: "16px", fontFamily: "'Courier New', monospace", fontSize: "11px",
  color: selectedTierObj.color, lineHeight: "1.9" }}>
  SUBSCRIPTION TIER: {selectedTierObj.label.toUpperCase()} — ${selectedTierObj.price}/MONTH{"\n"}
  Automatic Renewal Amount: ${selectedTierObj.autoRenew} per month
</div>

This Agreement is made between the Client identified below ("Client") and Wesley R. Williams, Esq. ("Attorney"). In consideration of the mutual promises herein, the parties agree as follows:{"\n\n"}

<strong style={{ color: C.yellow }}>1. SCOPE OF REPRESENTATION</strong>{"\n\n"}
Attorney agrees to represent Client in connection with the specific matter described by Client at the time of engagement (the "Matter"), within the following practice areas: gaming law and video game commerce, real estate and title insurance, fintech, and digital assets. This Agreement covers only the Matter or Subscription scope expressly identified. Any additional matters outside the defined scope require a separate written agreement or amendment.{"\n\n"}

Attorney's services may include, as applicable and agreed: legal research and analysis; drafting, reviewing, and negotiating contracts and agreements; regulatory compliance advice; and correspondence and communications on Client's behalf. Attorney will keep Client informed of the progress of the Matter and will respond within a reasonable time to Client's inquiries.{"\n\n"}

This Agreement will not become binding on either party, and Attorney will not begin providing legal services, until Client has executed this Agreement electronically and any required payment has been processed.{"\n\n"}

<strong style={{ color: "#ffaaaa" }}>EXCLUSION — NO LITIGATION SERVICES:</strong>{" "}Attorney does not provide litigation services, court appearances, or representation in administrative, regulatory, arbitration, or judicial proceedings of any kind. This Agreement expressly excludes all litigation, government enforcement defense, and any matter requiring court or tribunal appearance. Clients requiring litigation services must retain separate litigation counsel. Nothing in this Agreement shall be construed to create an obligation on the part of Attorney to appear in any court or proceeding.{"\n\n"}

<strong style={{ color: C.yellow }}>2. FEES, BILLING, AND TRUST ACCOUNT DISCLOSURE</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>A. Fee Structure.</strong>{" "}Attorney's fees for this engagement are charged under the <strong style={{ color: selectedTierObj.color }}>{selectedTierObj.label} Subscription</strong> at <strong style={{ color: selectedTierObj.color }}>${selectedTierObj.price} per month</strong>, as further described in Section 5. No hourly billing applies unless separately agreed in writing for overage services.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>B. No Client Trust Account — Important Disclosure (California Rule of Professional Conduct 1.15(b)).</strong>{"\n"}
<strong style={{ color: "#ffdd88" }}>Attorney does not maintain a client trust account (IOLTA). All fees paid under this Agreement, including monthly Subscription fees, will be deposited directly into Attorney's operating account.</strong>{"\n\n"}

CLIENT ACKNOWLEDGMENT AND CONSENT: Client understands and agrees that: (i) Client has the right to require that any flat-fee or Subscription payment be deposited into a client trust account until the fee is earned; and (ii) Client is entitled to a refund of any portion of a fee paid in advance that has not been earned in the event the representation terminates. By signing this Agreement, Client expressly consents to the deposit of all fees directly into Attorney's operating account.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>C. Invoicing and Payment.</strong>{" "}For Subscription clients, Stripe, Inc. automatically generates and emails a PDF invoice to Client before each monthly charge and a receipt upon successful payment. For non-subscription flat fee or overage matters, Attorney will issue invoices due within thirty (30) days. Unpaid balances bear interest at ten percent (10%) per annum or the maximum rate permitted by law.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>D. Rate Changes.</strong>{" "}Attorney shall give Client thirty (30) days written notice of any change to the fee schedule. If Client does not agree, Client may terminate this Agreement.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>E. No Guarantees.</strong>{" "}No promises or guarantees as to the outcome of any matter have been made to Client by Attorney.{"\n\n"}

<strong style={{ color: C.yellow }}>3. EXPENSES</strong>{"\n\n"}
All reasonable expenses incurred by Attorney in handling Client's matter shall be paid by Client as incurred. Expenses include but are not limited to: filing fees, postage, overnight fees, state regulatory filing fees, copy costs, certified copies, transcripts, records, travel, parking, and any other case expenses. Mileage is charged at the IRS standard mileage rate.{"\n\n"}

<strong style={{ color: C.yellow }}>4. NEGOTIATION AUTHORITY</strong>{"\n\n"}
Attorney is authorized to enter into negotiations on behalf of Client in connection with the Matter as Attorney deems appropriate, including contract negotiations, regulatory inquiries, and commercial disputes within the scope of this Agreement. Notwithstanding the foregoing, no binding settlement, resolution, or agreement that affects Client's legal rights or financial obligations shall be entered into without Client's prior written approval. Attorney will present all material settlement or resolution proposals to Client before any commitment is made.{"\n\n"}

<strong style={{ color: C.yellow }}>5. SUBSCRIPTION TERMS AND AUTOMATIC RENEWAL</strong>{"\n\n"}

Client has enrolled in the <strong style={{ color: selectedTierObj.color }}>{selectedTierObj.label} Subscription</strong> at <strong style={{ color: selectedTierObj.color }}>${selectedTierObj.price} per month</strong> (the "Subscription"). The monthly Subscription fee covers the following services within the defined practice areas: (a) {tierEmailAccess}; (b) {tierCallSchedule}; (c) up to {tierContractReviews} standard commercial contract review(s) per month; and (d) full access to the GameCompliance™ compliance platform and regulatory alert service. Subscription services are subject to the litigation exclusion in Section 1 above.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Automatic Renewal Disclosure — Required by California Business & Professions Code §17601 et seq.</strong>{"\n"}
<strong style={{ color: "#ffdd88" }}>THE SUBSCRIPTION WILL AUTOMATICALLY RENEW EACH MONTH AT ${selectedTierObj.price} UNLESS CANCELLED. Your subscription will be charged to the payment method on file on the same calendar date each month. To cancel, Client must provide written notice to Attorney at weswilliamsesq@gmail.com at least thirty (30) days before the next billing date. Cancellation takes effect at the end of the then-current billing period. No partial refunds are issued for mid-period cancellations except as required by law.</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Overage Services.</strong>{" "}Work outside the Subscription scope — including matters exceeding the included contract review allotment, complex transactions, M&A, and government enforcement matters not requiring court appearance — is available at $350/hr, billed separately under a written engagement agreement. All litigation remains excluded regardless of fee arrangement.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Modification of Subscription Terms.</strong>{" "}Attorney reserves the right to modify Subscription pricing or scope upon sixty (60) days written notice. Client may cancel without penalty during the notice period.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Payment Processing and Recurring Charge Authorization.</strong>{" "}<strong style={{ color: "#ffdd88" }}>By executing this Agreement and enrolling in the Subscription, Client expressly authorizes Stripe, Inc. to charge Client's payment method on file the amount of ${selectedTierObj.autoRenew} on a recurring monthly basis, on the same calendar date each month, until the Subscription is cancelled in accordance with the cancellation terms above.</strong>{" "}Failed payments result in a 7-day grace period before further action, including possible suspension or withdrawal as provided in Section 9.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Earned Fee / Refund on Termination.</strong>{" "}The monthly Subscription fee is earned on a pro-rata daily basis throughout each billing month. If this Agreement terminates mid-month, Attorney will refund the unearned portion of that month's fee (calculated as the number of unused days divided by total days in the month, multiplied by the monthly fee), unless the parties agree otherwise in writing.{"\n\n"}

<strong style={{ color: C.yellow }}>6. ELECTRONIC SIGNATURE AND COMMUNICATIONS</strong>{"\n\n"}
The parties agree that this Agreement may be executed electronically. An electronic signature constitutes a valid and binding signature under the California Uniform Electronic Transactions Act (Cal. Civ. Code §§ 1633.1 et seq.) and the federal Electronic Signatures in Global and National Commerce Act (15 U.S.C. § 7001 et seq.). Client's affirmative click-through assent constitutes Client's electronic signature and is legally equivalent to a handwritten signature. The parties consent to communicate by electronic mail, which satisfies any writing requirements under the California Rules of Professional Conduct.{"\n\n"}

<strong style={{ color: C.yellow }}>7. CONFIDENTIALITY AND ATTORNEY-CLIENT PRIVILEGE</strong>{"\n\n"}
Attorney will maintain the confidentiality of all information Client discloses in the course of representation, subject to the exceptions in California Rules of Professional Conduct Rule 1.6 and applicable law. All communications between Client and Attorney made for the purpose of seeking or providing legal advice are protected by the attorney-client privilege.{"\n\n"}

<strong style={{ color: C.yellow }}>8. CONFLICTS OF INTEREST</strong>{"\n\n"}
Attorney has conducted a conflicts check based on information available at the time of engagement. If a conflict of interest arises during the representation, Attorney will promptly notify Client and address the conflict in accordance with the California Rules of Professional Conduct.{"\n\n"}

<strong style={{ color: C.yellow }}>9. DISCHARGE AND WITHDRAWAL</strong>{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Client's Right to Discharge.</strong>{" "}Client may discharge Attorney at any time, with or without cause, by providing written notice to Attorney.{"\n\n"}

<strong style={{ color: "#aabbcc" }}>Attorney's Right to Withdraw.</strong>{" "}Attorney may withdraw from the representation only as permitted by the California Rules of Professional Conduct (including Rule 1.16) and applicable law. Attorney may withdraw if Client breaches a material term of this Agreement, including failure to pay the monthly Subscription fee when due. Attorney will first provide Client with reasonable written notice of the breach and at least ten (10) days to cure. If the breach is not cured, Attorney may cease providing further services and withdraw.{"\n\n"}

Upon any termination (by discharge, withdrawal, or otherwise), Attorney will: (a) take all reasonable steps to avoid foreseeable prejudice to Client's interests; (b) promptly return to Client all Client files, papers, and documents in Attorney's possession; (c) promptly refund any unearned portion of fees paid in advance, calculated on a pro-rata daily basis; and (d) deliver a final accounting of any amounts still owed.{"\n\n"}

<strong style={{ color: C.yellow }}>10. ASSOCIATION OF OTHER ATTORNEYS OR SERVICES</strong>{"\n\n"}
Attorney may, at Attorney's sole discretion, employ any other person or service necessary to assist in this representation. Should it become advisable to refer this matter or associate or consult with another attorney or law firm, Attorney will provide Client with information regarding any division of fee arrangement, including the identity of all participating lawyers, the basis for fee division, and each party's share. Attorney will request Client's written consent before any such arrangement is made.{"\n\n"}

<strong style={{ color: C.yellow }}>11. DISPUTE RESOLUTION AND FEE ARBITRATION</strong>{"\n\n"}
Client has the right to request mandatory fee arbitration through the State Bar of California Fee Arbitration Program before filing a lawsuit, pursuant to California Business and Professions Code §§ 6200–6206. Client may exercise this right by notifying Attorney in writing within thirty (30) days of receiving a final billing statement. If Client elects not to proceed under the State Bar fee arbitration procedures within thirty (30) days, any dispute over fees, charges, costs, expenses, or any other dispute between Client and Attorney will be resolved via judicial reference without jury. The sole and exclusive venue shall be San Diego County, California, and/or the Southern District of California (if Federal Court).{"\n\n"}

<strong style={{ color: "#ffdd88" }}>JURY TRIAL WAIVER: By executing this Agreement, Client confirms that Client has read and understands the dispute resolution provisions above and voluntarily agrees to resolution by judicial reference or other court proceeding as warranted in the event Client does not elect State Bar fee arbitration procedures. In doing so, Client and Attorney voluntarily waive important constitutional rights to trial by jury. Client is advised that Client has the right to have an independent attorney review this dispute resolution provision and this entire Agreement prior to signing.</strong>{"\n\n"}

<strong style={{ color: C.yellow }}>12. PREVAILING PARTY ATTORNEY FEES</strong>{"\n\n"}
In the event either party brings an action to enforce any provision of this Agreement, the prevailing party shall be entitled to recover reasonable attorney fees and costs incurred in such action.{"\n\n"}

<strong style={{ color: C.yellow }}>13. TAX DISCLOSURE AND ACKNOWLEDGMENT</strong>{"\n\n"}
<strong style={{ color: "#ffdd88" }}>CLIENT IS ADVISED TO OBTAIN INDEPENDENT AND COMPETENT TAX ADVICE REGARDING THESE LEGAL MATTERS SINCE LEGAL TRANSACTIONS CAN GIVE RISE TO TAX CONSEQUENCES. ATTORNEY HAS NOT AGREED TO RENDER ANY TAX ADVICE AND IS NOT RESPONSIBLE FOR ANY ADVICE REGARDING TAX MATTERS OR PREPARATION OF TAX RETURNS OR OTHER FILINGS, INCLUDING BUT NOT LIMITED TO STATE AND FEDERAL INCOME AND INHERITANCE TAX RETURNS.</strong>{"\n\n"}

<strong style={{ color: C.yellow }}>14. DISCLAIMER — GAMECOMPLIANCE™</strong>{"\n\n"}
If Client was referred through the GameCompliance™ platform, Client acknowledges that: (a) use of the GameCompliance™ tool did not create an attorney-client relationship; (b) the analysis generated by GameCompliance™ constituted legal issue-spotting only and did not constitute legal advice; and (c) this Retainer Agreement, once executed, establishes the attorney-client relationship for the specific Matter or Subscription identified herein.{"\n\n"}

<strong style={{ color: C.yellow }}>15. CALIFORNIA LAW — GOVERNING LAW AND CONSTRUCTION</strong>{"\n\n"}
This Agreement shall be construed under the laws of California. All obligations of the parties created hereunder are performable in San Diego County, California. If any provision of this Agreement is held invalid, illegal, or unenforceable for any reason, such invalidity shall not affect any other provision.{"\n\n"}

<strong style={{ color: C.yellow }}>16. PARTIES BOUND — ENTIRE AGREEMENT</strong>{"\n\n"}
This Agreement shall be binding upon and inure to the benefit of the parties and their respective heirs, executors, administrators, legal representatives, successors, and assigns where permitted. This Agreement constitutes the sole and entire agreement between the parties, supersedes all prior understandings or written or oral agreements concerning the subject matter hereof, and may be modified only by a written instrument signed by both parties.{"\n\n"}

<strong style={{ color: C.yellow }}>17. EFFECTIVE DATE AND DUPLICATE COPY</strong>{"\n\n"}
This Agreement will govern all legal services beginning on the date that Attorney began performing work for Client. The date of electronic execution is used for reference only. <strong style={{ color: "#ffdd88" }}>Client will be required to pay Attorney the reasonable value of services performed by Attorney, even if this Agreement never formally takes effect.</strong> Attorney will not begin providing legal services until Client has executed this Agreement electronically and any required payment has been processed. Attorney will provide Client with a fully executed duplicate copy of this Agreement as required by Business and Professions Code § 6148.{"\n\n"}

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

          {/* Trust account disclosure acknowledgment */}
          <div style={{ border: `2px solid ${C.yellow}33`, background: `${C.yellow}06`,
            padding: "12px 16px", marginBottom: "16px", fontFamily: "'Courier New', monospace",
            fontSize: "11px", color: "#887744", lineHeight: "1.8" }}>
            <strong style={{ color: C.yellow, fontFamily: "'Press Start 2P', monospace", fontSize: "7px",
              letterSpacing: "1px" }}>NO TRUST ACCOUNT DISCLOSURE — § 2(B)</strong>{"\n\n"}
            Attorney does not maintain a client trust account (IOLTA). Fees are deposited directly into Attorney's operating account. You have the right to require funds be held in trust; by proceeding you expressly waive that right.
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
                I HAVE READ AND UNDERSTAND THE ENTIRE RETAINER AGREEMENT ABOVE, INCLUDING THE NO TRUST ACCOUNT DISCLOSURE IN SECTION 2(B) AND THE AUTOMATIC RENEWAL TERMS IN SECTION 5.
                I AGREE TO BE BOUND BY ITS TERMS AND ACKNOWLEDGE THAT MY ELECTRONIC
                SIGNATURE BELOW IS LEGALLY BINDING UNDER THE CALIFORNIA UETA AND
                FEDERAL ESIGN ACT.
              </div>
            </div>
          </div>

          {/* ── JURY WAIVER ── */}
          <div style={{
            border: `3px solid ${juryWaived ? C.pink : C.darker}`,
            background: juryWaived ? `${C.pink}0a` : "#0e0008",
            padding: "4px", marginBottom: "16px",
            boxShadow: juryWaived ? `0 0 15px ${C.pink}44` : "none",
          }}>
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
                  THIS IS A SEPARATE REQUIRED ACKNOWLEDGMENT · SECTION 11 OF AGREEMENT
                </div>
              </div>
            </div>

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
                — Section 11, Attorney-Client Retainer Agreement · Wesley R. Williams, Esq.
              </div>
            </div>

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
                UNDERSTOOD THE JURY TRIAL WAIVER IN SECTION 11 OF THIS AGREEMENT.
                I VOLUNTARILY WAIVE MY CONSTITUTIONAL RIGHT TO A JURY TRIAL AND
                AGREE TO THE DISPUTE RESOLUTION PROCEDURES DESCRIBED THEREIN.
                I UNDERSTAND I MAY HAVE AN INDEPENDENT ATTORNEY REVIEW THIS
                PROVISION BEFORE SIGNING.
              </div>
            </div>
          </div>

          {/* Attorney countersignature notice */}
          <div style={{ border: `2px solid ${C.green}44`, background: `${C.green}08`,
            padding: "14px 16px", marginBottom: "16px",
            fontFamily: "'Courier New', monospace", fontSize: "11px",
            color: "#557755", lineHeight: "1.8" }}>
            <strong style={{ color: C.green, fontFamily: "'Press Start 2P', monospace", fontSize: "6px",
              letterSpacing: "1px" }}>ATTORNEY COUNTERSIGNATURE</strong>{"\n\n"}
            Upon your execution below, Wesley R. Williams, Esq. (CA Bar No. 269157) countersigns this Agreement effective the same date and time. The fully executed agreement with both signatures will be available for download immediately.
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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [cf, setCf] = useState({ name: "", email: "", company: "", matter: "", message: "" });

  const handleSend = async () => {
    setError("");
    if (!cf.name || !cf.email || !cf.message) {
      setError("REQUIRED: NAME, EMAIL, AND MESSAGE");
      return;
    }
    setSending(true);
    try {
      await emailjs.send(
        "service_jsfyq4c",
        "template_pp23qgb",
        {
          name: cf.name,
          email: cf.email,
          title: "New Contact - " + cf.name,
          message: "FROM: " + cf.name + " | EMAIL: " + cf.email + " | AREA: " + (cf.matter || "Not specified") + " | MSG: " + cf.message,
        },
        "wjbKawH6jrlAYYj1x"
      );
      setSent(true);
    } catch (err) {
      console.error("EmailJS error:", err);
      setError("SEND FAILED — TRY EMAIL DIRECTLY: weswilliamsesq@gmail.com");
    } finally {
      setSending(false);
    }
  };

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

            <button className="btn-arcade" onClick={handleSend} disabled={sending}
              style={{ background: sending ? C.darker : C.orange, color: C.bg,
                boxShadow: sending ? "none" : `4px 4px 0 #663300, 0 0 20px ${C.orange}88`,
                padding: "14px", fontSize: "9px", letterSpacing: "1px", width: "100%",
                opacity: sending ? 0.7 : 1 }}>
              {sending ? "► SENDING... ◄" : "► SEND MESSAGE ◄"}
            </button>

            {error && (
              <div style={{ fontSize: "7px", color: C.pink, letterSpacing: "1px",
                textAlign: "center", padding: "8px", border: `2px solid ${C.pink}44`,
                background: `${C.pink}11` }}>
                ⚠ {error}
              </div>
            )}

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
// PRICING PAGE — SUBSCRIPTION ARCADE SHOP (TIERED)
// ═══════════════════════════════════════════════════════════

function PricingPage({ setPage }) {
  const [selectedTier, setSelectedTier] = useState(null);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "120px 32px 80px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "52px" }}>
        <div style={{ fontSize: "8px", color: C.mcGold, letterSpacing: "4px",
          marginBottom: "12px", textShadow: `0 0 10px ${C.mcGold}` }}>
          ── ARCADE SHOP ── SELECT YOUR TIER ──
        </div>
        <h1 style={{ fontSize: "clamp(14px, 3vw, 26px)", letterSpacing: "3px",
          marginBottom: "12px", color: C.mcGold,
          textShadow: `0 0 20px ${C.mcGold}, 0 0 40px ${C.mcGold}` }}>
          CHOOSE YOUR LEVEL
        </h1>
        <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "8px" }}>
          MONTHLY SUBSCRIPTIONS · CANCEL ANYTIME · NO ANNUAL COMMITMENT
        </div>
        <div style={{ height: "2px", background: `linear-gradient(90deg, transparent, ${C.mcGold}, transparent)`,
          margin: "20px auto", maxWidth: "300px" }} />
      </div>

      {/* Tier Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "48px" }}>
        {TIERS.map(tier => (
          <div key={tier.id} style={{
            border: `4px solid ${tier.color}`,
            background: `linear-gradient(160deg, ${tier.color}10 0%, #050508 60%)`,
            boxShadow: selectedTier === tier.id
              ? `0 0 50px ${tier.color}99, inset 0 0 30px ${tier.color}11`
              : `0 0 20px ${tier.color}33`,
            overflow: "hidden",
            display: "flex", flexDirection: "column",
            transition: "box-shadow 0.2s steps(4)",
            cursor: "crosshair",
          }}>
            {/* Tier header bar */}
            <div style={{
              background: tier.color,
              padding: "14px 20px",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: `4px solid #000`,
            }}>
              <div style={{ fontFamily: "'Press Start 2P'", fontSize: "9px",
                color: tier.id === "counsel" ? "#1a0e00" : "#000",
                letterSpacing: "1px" }}>
                {tier.emoji} {tier.label}
              </div>
              <div style={{ fontSize: "7px", color: tier.id === "counsel" ? "#1a0e00" : "#000",
                fontFamily: "'Press Start 2P'", background: "rgba(0,0,0,0.2)",
                padding: "3px 8px" }}>{tier.badge}</div>
            </div>

            <div style={{ padding: "28px 24px", flex: 1, display: "flex", flexDirection: "column" }}>

              {/* Sub-label */}
              <div style={{ fontSize: "7px", color: tier.color, letterSpacing: "2px",
                marginBottom: "8px", textShadow: `0 0 8px ${tier.color}` }}>{tier.sublabel}</div>

              {/* Price */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "4px", marginBottom: "6px" }}>
                <span style={{ fontSize: "13px", color: tier.color, marginTop: "8px" }}>$</span>
                <span style={{ fontSize: "clamp(36px, 5vw, 52px)", fontWeight: "700",
                  color: tier.color, letterSpacing: "-2px", lineHeight: 1,
                  textShadow: `0 0 20px ${tier.color}88` }}>{tier.price}</span>
              </div>
              <div style={{ fontSize: "7px", color: C.dim, letterSpacing: "2px", marginBottom: "16px" }}>
                PER MONTH · BILLED MONTHLY
              </div>

              {/* Description */}
              <div style={{ fontFamily: "'Courier New', monospace", fontSize: "11px",
                color: "#8899aa", lineHeight: "1.7", marginBottom: "20px",
                paddingBottom: "16px", borderBottom: `1px solid ${tier.color}33` }}>
                {tier.desc}
              </div>

              {/* Included */}
              <div style={{ marginBottom: "16px", flex: 1 }}>
                {tier.included.map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start",
                    padding: "8px 0", borderBottom: i < tier.included.length - 1
                      ? `1px solid ${tier.color}22` : "none" }}>
                    <span style={{ fontSize: "14px", flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: "6px", color: tier.color, letterSpacing: "1px",
                        marginBottom: "2px" }}>{item.label}</div>
                      <div style={{ fontFamily: "'Courier New', monospace", fontSize: "10px",
                        color: "#556677", lineHeight: "1.5" }}>{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Not included */}
              <div style={{ padding: "12px", border: `2px solid ${C.darker}`,
                background: "rgba(0,0,0,0.3)", marginBottom: "20px" }}>
                <div style={{ fontSize: "6px", color: C.dim, letterSpacing: "1px",
                  marginBottom: "8px" }}>NOT INCLUDED:</div>
                {tier.notIncluded.map((n, i) => (
                  <div key={i} style={{ fontSize: "6px", color: "#445566",
                    padding: "3px 0", display: "flex", gap: "8px", letterSpacing: "0.5px" }}>
                    <span style={{ color: C.pink }}>✕</span> {n}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <a href={STRIPE_LINKS[tier.id]} target="_blank" rel="noopener noreferrer"
                onClick={() => setSelectedTier(tier.id)}
                style={{
                  display: "block", textAlign: "center",
                  background: tier.color, color: tier.id === "counsel" ? "#1a0e00" : "#000",
                  padding: "14px 20px", fontSize: "9px",
                  fontFamily: "'Press Start 2P', monospace", letterSpacing: "1px",
                  textDecoration: "none",
                  boxShadow: `4px 4px 0 ${tier.colorDark}, 0 0 20px ${tier.color}88`,
                  cursor: "crosshair",
                }}>
                ► SELECT {tier.label} ◄
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison note */}
      <div style={{ border: `2px solid ${C.cyan}33`, background: C.surface,
        padding: "20px 24px", marginBottom: "28px",
        fontFamily: "'Courier New', monospace", fontSize: "11px",
        color: "#667788", lineHeight: "1.9" }}>
        <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "2px",
          marginBottom: "12px" }}>── OVERAGE & UPGRADES ──</div>
        All tiers include overage at <span style={{ color: C.yellow }}>$350/hr</span> for work outside the scope, billed under a separate written engagement. Upgrade or downgrade at any time with 30 days notice. Need something custom? <button onClick={() => setPage("contact")} style={{ background: "none", border: "none", color: C.cyan, fontFamily: "'Courier New', monospace", fontSize: "11px", cursor: "crosshair", textDecoration: "underline", padding: 0 }}>Contact attorney directly.</button>
      </div>

      {/* After subscribe steps */}
      <div style={{ border: `3px solid ${C.cyan}44`, background: C.surface,
        padding: "24px 28px", marginBottom: "28px" }}>
        <div style={{ fontSize: "7px", color: C.cyan, letterSpacing: "3px",
          marginBottom: "16px" }}>── AFTER YOU SUBSCRIBE ──</div>
        {[
          { step: "01", label: "PAYMENT CONFIRMED",   desc: "Stripe sends you a receipt instantly. Your subscription is active." },
          { step: "02", label: "SIGN YOUR RETAINER",  desc: "Click CONTRACT in the nav to sign your attorney-client retainer agreement electronically.", action: () => setPage("retainer") },
          { step: "03", label: "BOOK YOUR FIRST CALL",desc: "Email weswilliamsesq@gmail.com to schedule your onboarding strategy call." },
          { step: "04", label: "YOU'RE COVERED",      desc: "Send legal questions anytime within your tier's scope." },
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
        ⚠ SUBSCRIPTION TERMS: Each subscription constitutes a general retainer for legal services within the defined scope. Subscriptions renew automatically each month at the stated price unless cancelled with 30 days written notice per the Retainer Agreement. Overage services billed at $350/hr by separate written engagement agreement. Litigation excluded at all tiers. California Rules of Professional Conduct apply. Wesley R. Williams, Esq. · CA Bar No. 269157 · Attorney Advertising.
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
  const [cookieConsent, setCookieConsent] = useState(null);
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  // Attorney PDF link handler — auto-generates PDF when Wes clicks link from email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const retainerParam = urlParams.get("retainer");
    if (retainerParam) {
      try {
        const p = new URLSearchParams(decodeURIComponent(retainerParam));
        const execTs = new Date(p.get("ts") || new Date());
        const dateStr = execTs.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        const timeStr = execTs.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZoneName: "short" });
        const tl = p.get("tl") || "General Counsel";
        const tp = p.get("tp") || "2,500";
        const tierData = TIERS.find(t => t.label === tl) || TIERS[1];
        const tcr = tierData.id === "starter" ? "one (1)" : tierData.id === "enterprise" ? "unlimited" : "three (3)";
        const tcs = tierData.id === "starter" ? "no included strategy calls" : tierData.id === "enterprise" ? "two (2) strategy calls of up to 45 minutes each per month" : "one (1) strategy call of up to 45 minutes per month";
        const tea = tierData.id === "starter" ? "two (2) email legal queries per month, with responses within two (2) business days" : "unlimited email and messaging access for legal questions, with responses within one (1) business day";

        // Build and open the attorney PDF
        const win = window.open("", "_blank");
        if (win) {
          // Reuse the same PDF generation — inline here for the attorney link
          const name = p.get("n") || "";
          const email = p.get("e") || "";
          const studio = p.get("s") || "";
          const matter = p.get("m") || "";
          win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"/>
<title>ATTORNEY COPY — Retainer — ${name} — ${dateStr}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; color: #000; background: #fff; }
  .page { max-width: 750px; margin: 0 auto; padding: 50px 50px 70px; }
  .header { text-align: center; border-bottom: 3px solid #000; padding-bottom: 16px; margin-bottom: 24px; }
  .header h1 { font-size: 16pt; letter-spacing: 2px; margin-bottom: 6px; }
  .header .sub { font-size: 10pt; color: #444; line-height: 1.8; }
  .atty-banner { background: #1a3a5c; color: white; padding: 12px 20px; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 13px; display: flex; justify-content: space-between; align-items: center; }
  .tier-box { border: 2px solid #000; padding: 12px 18px; margin: 16px 0; background: #f7f7f7; }
  h2 { font-size: 12pt; font-weight: bold; margin-top: 22px; margin-bottom: 8px; border-bottom: 1px solid #999; padding-bottom: 4px; text-transform: uppercase; }
  p { margin-bottom: 10px; line-height: 1.75; font-size: 11pt; }
  .sig-block { margin-top: 36px; border: 2px solid #000; padding: 28px; background: #f9f9f9; }
  .sig-title { font-size: 13pt; font-weight: bold; text-align: center; margin-bottom: 20px; letter-spacing: 1px; border-bottom: 1px solid #ccc; padding-bottom: 12px; }
  .sig-row { display: flex; gap: 40px; margin-top: 16px; }
  .sig-label { font-size: 9pt; color: #555; margin-bottom: 2px; }
  .sig-value { font-size: 11pt; font-weight: bold; padding-bottom: 4px; border-bottom: 1px solid #000; min-height: 22px; }
  .sig-name { font-size: 15pt; font-style: italic; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
  .sig-name-atty { font-size: 15pt; font-style: italic; font-weight: bold; color: #1a3a5c; border-bottom: 1px solid #000; padding-bottom: 3px; margin-bottom: 4px; }
  .timestamp-box { margin-top: 20px; border: 1px solid #aaa; padding: 14px; background: #f0f0f0; font-size: 9pt; font-family: 'Courier New', monospace; line-height: 1.9; }
  .checkbox-record { margin: 8px 0; font-size: 10pt; line-height: 1.6; }
  .checkbox-record::before { content: "☑  "; font-size: 12pt; }
  .footer { margin-top: 24px; font-size: 9pt; color: #555; font-style: italic; border-top: 1px solid #ccc; padding-top: 14px; line-height: 1.7; }
  @media print { .atty-banner { display: none !important; } .page { padding: 30px; } }
</style></head><body><div class="page">
<div class="atty-banner">
  <span>⚖️ ATTORNEY COPY — Fully Executed Retainer Agreement</span>
  <button onclick="window.print()" style="background:#00fff5;color:#050508;border:none;padding:8px 20px;font-weight:bold;cursor:pointer;">🖨 PRINT / SAVE PDF</button>
</div>
<div class="header">
  <h1>ATTORNEY-CLIENT RETAINER AGREEMENT — ATTORNEY COPY</h1>
  <div class="sub">Wesley R. Williams, Esq. &nbsp;|&nbsp; CA State Bar No. 269157<br/>
  weswilliamsesq@gmail.com &nbsp;|&nbsp; 619.305.6485 &nbsp;|&nbsp; San Diego, California<br/>
  <strong>ATTORNEY ADVERTISING</strong></div>
</div>
<div class="tier-box">
  <strong>SUBSCRIPTION TIER: ${tl.toUpperCase()} — $${tp}/MONTH</strong><br/>
  Client: ${name}${studio ? " | " + studio : ""}<br/>
  Effective Date: ${dateStr}
</div>
<p>This Agreement is made between the Client identified below ("Client") and Wesley R. Williams, Esq. ("Attorney"). In consideration of the mutual promises herein, the parties agree as follows:</p>
<h2>1. Scope of Representation</h2>
<p>Attorney agrees to represent Client within the following practice areas: gaming law and video game commerce, real estate and title insurance, fintech, and digital assets. This Agreement covers only the Matter or Subscription scope expressly identified. Any additional matters outside the defined scope require a separate written agreement.</p>
<p><strong>EXCLUSION — NO LITIGATION SERVICES:</strong> Attorney does not provide litigation services, court appearances, or representation in any proceedings of any kind.</p>
<h2>2. Fees — ${tl} Subscription at $${tp}/Month</h2>
<p>Attorney does not maintain a client trust account (IOLTA). All fees are deposited directly into Attorney's operating account with Client's express consent. Stripe, Inc. processes all subscription payments automatically.</p>
<h2>3. Subscription Scope</h2>
<p>The ${tl} Subscription covers: (a) ${tea}; (b) ${tcs}; (c) up to ${tcr} standard commercial contract review(s) per month; and (d) full access to the GameCompliance&trade; platform. <strong>THE SUBSCRIPTION WILL AUTOMATICALLY RENEW EACH MONTH AT $${tp} UNLESS CANCELLED WITH 30 DAYS WRITTEN NOTICE.</strong></p>
<h2>4. Dispute Resolution & Jury Trial Waiver</h2>
<p>Fee disputes subject to State Bar fee arbitration (Bus. & Prof. Code §§ 6200-6206). All other disputes resolved by judicial reference in San Diego County. <strong>BOTH PARTIES VOLUNTARILY WAIVE CONSTITUTIONAL RIGHT TO JURY TRIAL.</strong></p>
<h2>5. Governing Law</h2>
<p>This Agreement is governed by California law. All obligations performable in San Diego County, California.</p>
<div class="sig-block">
  <div class="sig-title">EXECUTION RECORD — FULLY EXECUTED — ATTORNEY COPY</div>
  <div class="sig-row">
    <div style="flex:1"><div class="sig-label">CLIENT NAME</div><div class="sig-value">${name}</div></div>
    <div style="flex:1"><div class="sig-label">CLIENT EMAIL</div><div class="sig-value">${email}</div></div>
  </div>
  <div class="sig-row" style="margin-top:14px">
    <div style="flex:1"><div class="sig-label">STUDIO / COMPANY</div><div class="sig-value">${studio || "N/A"}</div></div>
    <div style="flex:1"><div class="sig-label">TIER & MATTER</div><div class="sig-value">${tl} — $${tp}/mo | ${matter}</div></div>
  </div>
  <div style="margin-top:20px">
    <div class="sig-label" style="margin-bottom:8px;font-weight:bold;">CLIENT ACKNOWLEDGMENTS:</div>
    <div class="checkbox-record">General Agreement — read, understood, and agreed to all terms including No Trust Account disclosure and automatic renewal.</div>
    <div class="checkbox-record">Jury Trial Waiver — separately and specifically acknowledged; constitutional right to jury trial voluntarily waived.</div>
  </div>
  <div class="timestamp-box">
    EXECUTION DATE: ${dateStr}<br/>
    EXECUTION TIME: ${timeStr}<br/>
    EXECUTION TIMESTAMP (ISO 8601 / UTC): ${execTs.toISOString()}<br/>
    SIGNATURE METHOD: Electronic Click-Through — UETA Cal. Civ. Code §§ 1633.1 / eSign Act 15 U.S.C. § 7001<br/>
    ATTORNEY: Wesley R. Williams, Esq. — CA State Bar No. 269157
  </div>
  <div style="margin-top:28px;display:flex;justify-content:space-between;gap:40px">
    <div style="flex:1">
      <div class="sig-name">/s/ ${name}</div>
      <div style="font-size:9pt;color:#444"><strong>CLIENT — Electronic Signature</strong><br/>${name}${studio ? "<br/>" + studio : ""}<br/>Date: ${dateStr}</div>
    </div>
    <div style="flex:1">
      <div class="sig-name-atty">/s/ Wesley R. Williams</div>
      <div style="font-size:9pt;color:#444"><strong>ATTORNEY — Countersignature</strong><br/>Wesley R. Williams, Esq.<br/>CA State Bar No. 269157<br/>Date: ${dateStr}</div>
    </div>
  </div>
</div>
<div class="footer">ATTORNEY COPY — This document constitutes a fully executed, legally binding attorney-client retainer agreement. Wesley R. Williams, Esq. is licensed to practice law in the State of California only. Attorney Advertising under California Rules of Professional Conduct Rule 7.1.</div>
</div></body></html>`);
          win.document.close();
          win.focus();
        }
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error("Attorney PDF link error:", e);
      }
    }
  }, []);


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
