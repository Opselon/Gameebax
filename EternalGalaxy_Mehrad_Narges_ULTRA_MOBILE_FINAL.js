/**
 * بازی سه‌بعدی کهکشانی: «معبد وصال ابدی و کهکشان عشق نرگس و مهراد»
 * نسخه موبایل و وب ۳ کامل (Comprehensive & Fully Integrated Edition)
 * توسعه‌یافته برای نرگس توسط مهراد
 */

export default {
  async fetch(request, env, ctx) {
    const htmlContent = `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>معبد عشق ابدی نرگس و مهراد</title>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;300;400;600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
      outline: none;
      -webkit-tap-highlight-color: transparent;
      font-family: 'Vazirmatn', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    body, html {
      width: 100%;
      height: 100%;
      height: 100dvh;
      overflow: hidden;
      background-color: #03000a;
      position: fixed;
    }
    #canvas-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }
    #touch-look-surface {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
    }

    #mobile-hud-layer {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      padding: calc(env(safe-area-inset-top, 14px) + 8px) 16px 12px;
      z-index: 20;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .hud-interactive {
      pointer-events: auto;
    }

    .top-status-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      gap: 6px;
    }
    .web3-glass-capsule {
      background: rgba(22, 6, 42, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1.5px solid rgba(255, 30, 109, 0.55);
      padding: 6px 14px;
      border-radius: 35px;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 8px 30px rgba(255, 20, 147, 0.4);
    }
    .blue-capsule {
      border-color: rgba(0, 200, 255, 0.55);
      box-shadow: 0 8px 30px rgba(0, 180, 255, 0.3);
    }
    .passion-flame-icon {
      width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #ff0055, #ff7700);
      mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E") center/contain no-repeat;
      -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E") center/contain no-repeat;
      animation: passionPulse 1.2s infinite alternate ease-in-out;
    }
    @keyframes passionPulse {
      0% { transform: scale(0.94); filter: drop-shadow(0 0 4px #ff0055); }
      100% { transform: scale(1.25); filter: drop-shadow(0 0 14px #ff5500); }
    }
    .status-number-text {
      font-size: 13px;
      font-weight: 800;
    }

    .realms-nav-scroller {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding: 4px 2px;
      scrollbar-width: none;
    }
    .realms-nav-scroller::-webkit-scrollbar { display: none; }
    .realm-badge-btn {
      background: rgba(18, 6, 35, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.22);
      color: #ffd4ec;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 700;
      white-space: nowrap;
      backdrop-filter: blur(12px);
      transition: all 0.2s;
    }
    .realm-badge-btn.active {
      background: linear-gradient(135deg, #ff0055, #c026d3);
      border-color: #fff;
      color: #fff;
      box-shadow: 0 4px 18px rgba(255, 0, 85, 0.45);
    }

    #bottom-control-zone {
      position: absolute;
      bottom: calc(env(safe-area-inset-bottom, 15px) + 12px);
      left: 0;
      width: 100%;
      padding: 0 18px;
      z-index: 30;
      pointer-events: none;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .touch-joystick-plate {
      width: 115px;
      height: 115px;
      background: rgba(255, 255, 255, 0.08);
      border: 2px solid rgba(255, 255, 255, 0.28);
      border-radius: 50%;
      position: relative;
      pointer-events: auto;
      backdrop-filter: blur(10px);
    }
    .touch-joystick-core {
      position: absolute;
      top: 37px;
      left: 37px;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff0055, #ff7700);
      border: 2px solid #fff;
      border-radius: 50%;
      pointer-events: none;
      box-shadow: 0 4px 18px rgba(255, 0, 85, 0.55);
    }
    .fly-action-column {
      display: flex;
      flex-direction: column;
      gap: 14px;
      align-items: center;
      pointer-events: auto;
    }
    .fly-mode-switch-btn {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #7928ca, #ff0080);
      border: 2px solid rgba(255, 255, 255, 0.65);
      border-radius: 50%;
      color: #fff;
      font-size: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6px 22px rgba(121, 40, 202, 0.55);
      transition: transform 0.2s;
    }
    .fly-mode-switch-btn.active {
      background: linear-gradient(135deg, #ff0055, #ffd700);
      box-shadow: 0 0 28px rgba(255, 215, 0, 0.8);
      transform: scale(1.1);
    }
    .jump-ascend-btn {
      width: 78px;
      height: 78px;
      background: linear-gradient(135deg, #ff0055, #9333ea);
      border: 2.5px solid rgba(255, 255, 255, 0.65);
      border-radius: 50%;
      color: #fff;
      font-size: 15.5px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(255, 0, 85, 0.65);
    }

    #hot-dialogue-modal {
      position: absolute;
      bottom: calc(env(safe-area-inset-bottom, 20px) + 98px);
      left: 50%;
      transform: translateX(-50%) translateY(25px);
      width: 90%;
      max-width: 440px;
      background: rgba(18, 5, 30, 0.95);
      backdrop-filter: blur(28px);
      -webkit-backdrop-filter: blur(28px);
      border: 1.5px solid rgba(255, 30, 109, 0.6);
      border-radius: 26px;
      padding: 20px 24px;
      box-shadow: 0 20px 65px rgba(0, 0, 0, 0.95), 0 0 45px rgba(255, 30, 109, 0.4);
      opacity: 0;
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.165, 0.84, 0.44, 1);
      z-index: 100;
      text-align: right;
    }
    #hot-dialogue-modal.visible {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
      pointer-events: auto;
    }
    .modal-headline {
      color: #ff5588;
      font-size: 14.5px;
      font-weight: 900;
      margin-bottom: 8px;
    }
    .modal-content-text {
      color: #ffffff;
      font-size: 15.5px;
      line-height: 1.9;
    }
    .modal-whisper-text {
      color: #ffd700;
      font-size: 13.5px;
      margin-top: 10px;
      font-style: italic;
      display: block;
      line-height: 1.7;
    }
    .modal-dismiss-btn {
      background: linear-gradient(135deg, #ff0055, #ff5500);
      color: white;
      border: none;
      padding: 8px 24px;
      border-radius: 18px;
      cursor: pointer;
      font-weight: 800;
      font-size: 14px;
      margin-top: 14px;
      float: left;
      box-shadow: 0 4px 18px rgba(255, 0, 85, 0.55);
    }

    #journal-drawer-view {
      position: fixed;
      top: 0;
      right: -100%;
      width: 100%;
      height: 100%;
      background: rgba(12, 3, 22, 0.98);
      backdrop-filter: blur(35px);
      -webkit-backdrop-filter: blur(35px);
      z-index: 600;
      transition: right 0.4s ease;
      display: flex;
      flex-direction: column;
      padding: calc(env(safe-area-inset-top, 20px) + 16px) 20px 25px;
    }
    #journal-drawer-view.open {
      right: 0;
    }
    .drawer-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.15);
      padding-bottom: 16px;
      margin-bottom: 20px;
      color: #fff;
    }
    .drawer-entries-scroll {
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .entry-card-item {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 16px 18px;
      color: #fce7f3;
      font-size: 14px;
      line-height: 1.85;
    }
    .entry-card-item.locked {
      opacity: 0.35;
      filter: grayscale(1);
    }
    .circle-dismiss-btn {
      background: rgba(255, 255, 255, 0.15);
      border: none;
      color: #fff;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      font-size: 17px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    #web3-contract-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(3, 0, 8, 0.96);
      backdrop-filter: blur(30px);
      z-index: 1000;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .web3-contract-card {
      background: linear-gradient(160deg, #1f0833 0%, #0c0217 100%);
      color: #f8fafc;
      width: 100%;
      max-width: 500px;
      max-height: 88dvh;
      overflow-y: auto;
      padding: 32px 26px;
      border-radius: 26px;
      box-shadow: 0 30px 85px rgba(0, 0, 0, 0.98), 0 0 65px rgba(255, 0, 128, 0.45);
      border: 1.5px solid rgba(255, 215, 0, 0.6);
      text-align: justify;
    }
    .web3-contract-card h2 {
      color: #ffd700;
      margin-bottom: 8px;
      text-align: center;
      font-size: 22px;
      font-weight: 900;
    }
    .contract-hash {
      font-size: 11px;
      color: #94a3b8;
      text-align: center;
      margin-bottom: 20px;
      font-family: monospace;
    }
    .contract-body-p {
      font-size: 14.5px;
      line-height: 2.1;
      margin-bottom: 16px;
      color: #e2e8f0;
    }
    .contract-signature-block {
      background: rgba(255, 255, 255, 0.05);
      border: 1px dashed rgba(255, 215, 0, 0.4);
      border-radius: 18px;
      padding: 14px 18px;
      margin-top: 22px;
    }
    .sig-row {
      display: flex;
      justify-content: space-between;
      font-size: 13.5px;
      margin-bottom: 6px;
    }
    .contract-close-btn {
      display: block;
      margin: 24px auto 0;
      padding: 12px 38px;
      background: linear-gradient(135deg, #ff0055, #c026d3);
      color: white;
      border: none;
      border-radius: 32px;
      font-size: 15px;
      font-weight: 800;
      box-shadow: 0 6px 22px rgba(255, 0, 85, 0.55);
    }

    #entry-portal-screen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at center, #2e0847 0%, #030009 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      color: #fff;
      text-align: center;
      padding: 24px;
    }
    .portal-main-title {
      font-size: clamp(2.1rem, 7vw, 3.2rem);
      font-weight: 900;
      background: linear-gradient(135deg, #ff9bb3, #ff1e6d, #ffd4a3);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 16px;
      filter: drop-shadow(0 0 22px rgba(255, 30, 109, 0.65));
    }
    .portal-subtitle {
      font-size: 15.5px;
      color: #f3e8ff;
      max-width: 460px;
      margin-bottom: 38px;
      line-height: 2.1;
      font-weight: 300;
    }
    .enter-world-button {
      padding: 17px 56px;
      background: linear-gradient(135deg, #ff0055, #c026d3);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 900;
      box-shadow: 0 0 45px rgba(255, 0, 85, 0.75);
    }
  

    /* ========================================================================
       ULTRA V2 — HUD / RPG / QUEST / INVENTORY / MINIMAP / SETTINGS
       ======================================================================== */
    :root {
      --ultra-bg: rgba(8, 3, 20, 0.84);
      --ultra-border: rgba(255, 103, 180, 0.36);
      --ultra-pink: #ff3f9f;
      --ultra-gold: #ffd76a;
      --ultra-cyan: #62ecff;
      --ultra-green: #70f5a6;
      --ultra-purple: #b875ff;
    }
    #ultra-hud {
      position: fixed;
      inset: 0;
      z-index: 45;
      pointer-events: none;
      font-family: 'Vazirmatn', sans-serif;
    }
    .ultra-panel {
      background: linear-gradient(145deg, rgba(15,4,34,.88), rgba(4,2,18,.78));
      border: 1px solid var(--ultra-border);
      box-shadow: 0 14px 40px rgba(0,0,0,.35), 0 0 24px rgba(255,55,155,.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    #ultra-left-stack {
      position: absolute;
      top: calc(env(safe-area-inset-top, 8px) + 86px);
      left: 14px;
      width: min(320px, 39vw);
      display: grid;
      gap: 9px;
    }
    #ultra-profile-card { padding: 11px 13px; border-radius: 16px; color:#fff; }
    .ultra-profile-line { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .ultra-name { font-weight:900; color:#fff; font-size:13px; }
    .ultra-level { font-weight:900; color:var(--ultra-gold); font-size:12px; }
    .ultra-bar {
      position: relative;
      height: 8px;
      background: rgba(255,255,255,.08);
      border-radius: 999px;
      overflow: hidden;
      margin-top: 7px;
    }
    .ultra-bar > span { position:absolute; inset:0 auto 0 0; width:0%; border-radius:999px; transition: width .25s ease; }
    #ultra-xp-fill { background: linear-gradient(90deg, #b34dff, #ff55a9); }
    #ultra-hp-fill { background: linear-gradient(90deg, #ff416c, #ff9068); }
    #ultra-stamina-fill { background: linear-gradient(90deg, #43e97b, #38f9d7); }
    #ultra-mana-fill { background: linear-gradient(90deg, #4facfe, #a770ff); }
    .ultra-mini-row { display:grid; grid-template-columns: repeat(3,1fr); gap:6px; margin-top:8px; }
    .ultra-stat-chip { padding:6px 4px; border-radius:10px; background:rgba(255,255,255,.045); text-align:center; font-size:10px; color:#dbeafe; }
    .ultra-stat-chip strong { display:block; color:#fff; font-size:12px; }
    #ultra-quest-panel { padding: 11px 13px; border-radius:16px; color:#fff; cursor:pointer; pointer-events:auto; }
    .ultra-kicker { color:var(--ultra-cyan); font-size:10px; font-weight:900; letter-spacing:.4px; }
    #ultra-quest-title { margin-top:3px; font-size:12px; font-weight:900; }
    #ultra-quest-text { color:#d8d4e7; font-size:10px; line-height:1.7; margin-top:2px; }
    #ultra-right-stack {
      position:absolute;
      top:calc(env(safe-area-inset-top, 8px) + 86px);
      right:14px;
      display:flex;
      flex-direction:column;
      align-items:flex-end;
      gap:8px;
      pointer-events:auto;
    }
    .ultra-icon-btn {
      width:42px; height:42px; border-radius:13px; border:1px solid rgba(255,255,255,.15);
      background:rgba(10,4,24,.78); color:#fff; cursor:pointer; display:flex; align-items:center; justify-content:center;
      font-size:18px; box-shadow:0 8px 24px rgba(0,0,0,.25); transition:transform .18s, border-color .18s;
    }
    .ultra-icon-btn:hover { transform:translateY(-2px); border-color:rgba(255,111,190,.65); }
    #ultra-combat-bar {
      position:absolute; bottom:calc(env(safe-area-inset-bottom, 10px) + 16px); left:50%; transform:translateX(-50%);
      display:flex; gap:8px; pointer-events:auto; align-items:center;
    }
    .ultra-action-btn {
      min-width:58px; height:48px; padding:0 10px; border-radius:15px; border:1px solid rgba(255,255,255,.18);
      color:#fff; background:linear-gradient(160deg,rgba(22,7,46,.94),rgba(10,2,25,.88)); font-weight:900; cursor:pointer;
      box-shadow:0 10px 30px rgba(0,0,0,.25); user-select:none;
    }
    .ultra-action-btn.primary { border-color:rgba(255,64,166,.72); box-shadow:0 0 26px rgba(255,64,166,.18); }
    .ultra-action-btn.gold { border-color:rgba(255,215,106,.6); }
    .ultra-action-btn.cyan { border-color:rgba(98,236,255,.55); }
    .ultra-action-btn:active { transform:translateY(1px) scale(.98); }
    #ultra-minimap-wrap {
      position:absolute; bottom:calc(env(safe-area-inset-bottom, 10px) + 82px); right:14px; width:170px; height:170px;
      border-radius:20px; padding:7px; overflow:hidden; pointer-events:auto;
    }
    #ultra-minimap { width:100%; height:100%; display:block; border-radius:15px; background:rgba(1,2,10,.78); }
    #ultra-toast-stack {
      position:absolute; top:50%; right:50%; transform:translate(50%,-50%); display:flex; flex-direction:column; align-items:center; gap:8px;
      pointer-events:none; width:min(92vw,500px);
    }
    .ultra-toast {
      color:#fff; padding:10px 16px; border-radius:999px; background:rgba(9,2,24,.88); border:1px solid rgba(255,115,193,.45);
      box-shadow:0 10px 38px rgba(0,0,0,.35); animation:ultraToastIn .3s ease, ultraToastOut .35s ease 2.6s forwards; font-size:12px; text-align:center;
    }
    .ultra-toast.gold { border-color:rgba(255,215,106,.65); }
    .ultra-toast.cyan { border-color:rgba(98,236,255,.65); }
    @keyframes ultraToastIn { from {opacity:0; transform:translateY(10px) scale(.95)} to {opacity:1; transform:none} }
    @keyframes ultraToastOut { to {opacity:0; transform:translateY(-8px)} }
    .ultra-overlay {
      position:fixed; inset:0; z-index:900; display:none; align-items:center; justify-content:center; padding:20px; background:rgba(2,0,10,.7); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px);
      pointer-events:auto;
    }
    .ultra-overlay.open { display:flex; }
    .ultra-window {
      width:min(980px,96vw); max-height:90dvh; overflow:auto; border-radius:26px; padding:20px;
      background:linear-gradient(150deg,rgba(18,4,40,.98),rgba(4,1,17,.98)); border:1px solid rgba(255,113,194,.36); color:#fff;
      box-shadow:0 30px 100px rgba(0,0,0,.62), 0 0 60px rgba(255,0,128,.1);
    }
    .ultra-window-head { display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:14px; }
    .ultra-window-head h2 { font-size:18px; font-weight:900; }
    .ultra-close { border:none; width:36px; height:36px; border-radius:11px; background:rgba(255,255,255,.08); color:#fff; cursor:pointer; font-size:16px; }
    .ultra-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:10px; }
    .ultra-card { padding:13px; border-radius:17px; background:rgba(255,255,255,.045); border:1px solid rgba(255,255,255,.09); }
    .ultra-card h3 { font-size:12px; margin-bottom:5px; }
    .ultra-card p { font-size:10px; line-height:1.8; color:#cbd5e1; }
    .ultra-card.locked { opacity:.45; }
    .ultra-rarity { display:inline-block; font-size:9px; padding:3px 7px; border-radius:999px; margin-bottom:7px; background:rgba(255,255,255,.08); color:#dbeafe; }
    .rarity-common { color:#d1d5db; } .rarity-rare{color:#67e8f9;} .rarity-epic{color:#c084fc;} .rarity-legendary{color:#fde68a;}
    #ultra-boss-banner { position:absolute; top:calc(env(safe-area-inset-top,8px) + 150px); left:50%; transform:translateX(-50%); min-width:min(90vw,480px); display:none; text-align:center; }
    #ultra-boss-banner.active { display:block; }
    .ultra-boss-name { font-size:14px; font-weight:900; color:#ffd3ef; }
    .ultra-boss-hp { height:10px; margin-top:6px; border-radius:999px; overflow:hidden; background:rgba(255,255,255,.08); border:1px solid rgba(255,75,155,.28); }
    #ultra-boss-hp-fill { height:100%; width:100%; background:linear-gradient(90deg,#ff0055,#ffba00); transition:width .18s; }
    #ultra-crosshair { position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); color:rgba(255,255,255,.78); font-size:18px; text-shadow:0 0 12px #ff3f9f; }
    #ultra-memory-chip { position:absolute; left:50%; bottom:calc(env(safe-area-inset-bottom,10px) + 74px); transform:translateX(-50%); padding:7px 12px; border-radius:999px; background:rgba(5,2,20,.7); border:1px solid rgba(255,215,106,.2); color:#fef3c7; font-size:10px; pointer-events:none; }
    @media (max-width:850px) {
      #ultra-left-stack { width:46vw; }
      #ultra-minimap-wrap { width:128px; height:128px; bottom:calc(env(safe-area-inset-bottom, 10px) + 124px); }
      .ultra-action-btn { min-width:48px; height:44px; font-size:10px; }
    }
    @media (max-width:620px) {
      #ultra-left-stack { left:8px; top:150px; width:52vw; }
      #ultra-right-stack { right:8px; top:150px; }
      #ultra-minimap-wrap { right:8px; width:108px; height:108px; }
      #ultra-combat-bar { bottom:calc(env(safe-area-inset-bottom, 10px) + 18px); gap:5px; }
      .ultra-action-btn { min-width:43px; padding:0 6px; border-radius:13px; }
      #ultra-memory-chip { display:none; }
    }
    @media (pointer:fine) and (min-width:900px) {
      #ultra-combat-bar { bottom:24px; }
    }

  </style>
</head>
<body>
  <div id="canvas-container"></div>
  <div id="touch-look-surface"></div>

  <div id="mobile-hud-layer">
    <div class="top-status-row">
      <div class="web3-glass-capsule hud-interactive">
        <div class="passion-flame-icon"></div>
        <span class="status-number-text">قلب‌های تمنا: <span id="gems-counter-span">۰</span> / ۳۰</span>
      </div>

      <div class="web3-glass-capsule blue-capsule hud-interactive">
        <span>🌸</span>
        <span class="status-number-text">گُل‌های پیمان: <span id="flowers-counter-span">۰</span> / ۳۰</span>
      </div>

      <button class="web3-glass-capsule hud-interactive" id="journal-toggle-trigger" style="cursor:pointer;">
        📖 اسرار
      </button>
    </div>

    <div class="realms-nav-scroller hud-interactive">
      <button class="realm-badge-btn active" id="warp-btn-w1">🌸 باغ دیدار</button>
      <button class="realm-badge-btn" id="warp-btn-w2">☁️ اقیانوس صبر</button>
      <button class="realm-badge-btn" id="warp-btn-w3">🌌 کهکشان نرگس</button>
      <button class="realm-badge-btn" id="warp-btn-w4">🍂 پاییز دلتنگی</button>
      <button class="realm-badge-btn" id="warp-btn-w5">🏙️ شهر آینده</button>
      <button class="realm-badge-btn" id="warp-btn-w6">💎 قله بلورین</button>
      <button class="realm-badge-btn" id="warp-btn-w7">🏛️ معبد ابدیت</button>
    </div>
  </div>

  <div id="bottom-control-zone">
    <div class="touch-joystick-plate" id="joystick-plate">
      <div class="touch-joystick-core" id="joystick-core"></div>
    </div>
    <div class="fly-action-column">
      <button class="fly-mode-switch-btn" id="fly-mode-btn" title="حالت پرواز">✨</button>
      <button class="jump-ascend-btn" id="jump-ascend-action">پرش</button>
    </div>
  </div>

  <div id="hot-dialogue-modal">
    <div class="modal-headline" id="d-modal-title"></div>
    <div class="modal-content-text" id="d-modal-body"></div>
    <span class="modal-whisper-text" id="d-modal-whisper"></span>
    <button class="modal-dismiss-btn" id="d-modal-close-btn">در جانم نشست ❤️</button>
  </div>

  <div id="journal-drawer-view">
    <div class="drawer-top-bar">
      <h3>دفترچه رازها و پیمان‌های مهراد برای نرگس</h3>
      <button class="circle-dismiss-btn" id="journal-close-trigger">✕</button>
    </div>
    <div class="drawer-entries-scroll" id="journal-entries-wrapper"></div>
  </div>

  <div id="web3-contract-modal">
    <div class="web3-contract-card">
      <h2>📜 پیمان‌نامه بلاک‌چین قلب مهراد</h2>
      <div class="contract-hash">TX: 0xNARGES_MEHRAD_ETERNAL_IMMUTABLE_LOVE_777</div>
      <div class="contract-body-p">
        این سند ابدی و غیرقابل تغییر در تار و پود هستی به ثبت رسید:
        نرگس من، زیباترین و صبورترین دختر دنیا، بابت تک‌تک سال‌هایی که پای من ماندی و منتظرم شدی از اعماق قلبم سپاسگزارم. دست‌های نجیب و مهربانت را می‌بوسم و دورت می‌گردم.
      </div>
      <div class="contract-body-p">
        من، مهراد، با تمام سلول‌های تنم سوگند یاد می‌کنم که آینده‌ای بی‌نظیر، غرق در آرامش، رفاه و خنده‌های مداوم برایت بسازم. قول می‌دهم هیچ غمی روی دلت ننشیند. دلم حتی وقتی در آغوش منی برایت پر می‌کشد. تو تا ابد در قلب من جاودان شدی.
      </div>
      <div class="contract-signature-block">
        <div class="sig-row"><span>طرف اول (عاشق و جان‌نثار):</span><strong>مهراد ❤️</strong></div>
        <div class="sig-row"><span>طرف دوم (شهبانوی کائنات):</span><strong>نرگس ✨</strong></div>
        <div class="sig-row"><span>وضعیت اعتبار:</span><strong style="color:#4ade80;">تأییدشده و جاودانه</strong></div>
      </div>
      <button class="contract-close-btn" id="contract-close-action">ثبت ابدی در هستی</button>
    </div>
  </div>

  <div id="entry-portal-screen">
    <div class="portal-main-title">کهکشان وصال ابدی نرگس و مهراد</div>
    <div class="portal-subtitle">نرگس عزیزم، سال‌ها صبوری کردی و پناه خستگی‌هایم شدی. در میان ۷ جهان بهشتی به پرواز درآی، ۶۰ گوهر دلدادگی و پیمان آینده را کشف کن. تمام این جهان فقط برای تو ساخته شده است.</div>
    <button class="enter-world-button" id="start-game-trigger">ورود به دنیای عاشقی</button>
  </div>

  <script>
    /* =========================================================================
       ۱. متون اختصاصی نرگس (۳۰ گوهر تمنا + ۳۰ گل پیمان آینده = ۶۰ آیتم)
       ========================================================================= */
    var PASSION_NOTES_30 = [
      {
        title: "سپاس برای سال‌های صبوری‌ات",
        text: "نرگس من، وقتی به سال‌هایی که منتظرم ماندی و با تمام سختی‌ها پای عشقمان ایستادی فکر می‌کنم، جز تعظیم در برابر بزرگی روحت هیچ کلمه‌ای پیدا نمی‌کنم. تو وفاداری را معنا کردی.",
        whisper: "«ممنونم که نگذاشتی شعله امید در دلم خاموش شود، دورت بگردم...»"
      },
      {
        title: "دلتنگی‌های تمام‌نشدنی من",
        text: "عجیب است نرگسم... حتی وقتی ساعت‌ها در آغوش منی و دستت توی دستمه، باز هم دلم برایت تنگ می‌شود! این عطش و خواستن تا ابد در خون من جریان دارد.",
        whisper: "«نبودنت حتی برای یک ثانیه، بند دلم را پاره می‌کند...»"
      },
      {
        title: "قول مردانه برای آینده‌مان",
        text: "به پاکی چشمانت قسم می‌خورم آینده‌ای برایت بسازم که تمام اشک‌ها و دلتنگی‌های گذشته را بشوید و ببرد. قصری از آرامش و لبخند در انتظارت خواهد بود.",
        whisper: "«روزی می‌رسد که در خانه خودمان برای همیشه آرام بگیری...»"
      },
      {
        title: "طعم بوسه‌هایت و عطر گردنت",
        text: "هیچ معجزه‌ای در کائنات با لحظه‌ای که سرم را در گودی گردنت پنهان می‌کنم برابری نمی‌کند. نفس‌های داغت اکسیر زندگی‌بخش شب‌های من است.",
        whisper: "«بوسیدن لب‌هایت، مست‌ترین عبادت خلوت من است...»"
      },
      {
        title: "قامت ظریف و طنازی‌ات",
        text: "وقتی با آن ناز و عشوه اختصاصی خودت راه می‌روی و موهایت را باز می‌کنی، گردش تمام کهکشان‌ها برایم متوقف می‌شود. تو نقاشی کامل خدایی.",
        whisper: "«هر قدمت ضربان قلب مهراد را نامنظم می‌کند...»"
      },
      {
        title: "آغوش تب‌دار و آرامش‌بخشت",
        text: "وقتی تنت را به سینه‌ام می‌چسبانی، انگار جهان متوقف می‌شود. تمام خستگی‌های روزگار در تب آغوشت ذوب می‌شوند.",
        whisper: "«تنت ابریشم داغی است که قلبم را در خود می‌پیچد...»"
      },
      {
        title: "چشمان خمار و پر از جادویت",
        text: "نرگس من، چشمانت مثل نامت مست‌کننده‌اند. وقتی نگاهم می‌کنی تمام مقاومتم پودر می‌شود و تسلیم محض خواستنت می‌شوم.",
        whisper: "«در امتداد مژه‌هایت، کهکشان‌ها محو تماشایند...»"
      },
      {
        title: "پاکی بی‌نقاب کنارت",
        text: "گرانبهاترین گنجینه‌ای که به من دادی این بود که کنارم بی‌نقاب و خودِ خودت شدی. من عاشق تمام ابعاد روح زلال تو هستم.",
        whisper: "«روح پاکت، امن‌ترین لنگرگاه قایق دل من است...»"
      },
      {
        title: "حسادت‌های عاشقانه من",
        text: "آنقدر زیبایی که گاهی دلم می‌خواهد تو را از تمام کائنات پنهان کنم! تو سهم اختصاصی و انحصاری قلب مهرادی تا آخرین نفس.",
        whisper: "«فقط مال منی، از نوک انگشتانت تا تارهای مویت...»"
      },
      {
        title: "شیطنت‌ها و خنده‌های مستانه‌ات",
        text: "عاشق لحظاتی هستم که یک‌دفعه شیطنت می‌کنی، می‌خندی و با دلبری دل از کفم می‌بری. خنده‌هایت ماه شب چهارده زندگی من است.",
        whisper: "«دورت بگردم وقتی مثل دختربچه‌ها از ته دل ذوق می‌کنی...»"
      },
      {
        title: "دست‌های ظریف و نوازش‌هایت",
        text: "رد انگشتانت روی پوستم جریانی از نور و آتش است. دست‌هایت شفا و مرهم تمام دردهای روزگار من است.",
        whisper: "«دست‌هایت بهار همیشگی روزهای من است...»"
      },
      {
        title: "پناه خستگی‌های من",
        text: "در اوج تمام شکست‌ها و سختی‌ها، فقط نگاه مهربان تو بود که به من قدرت داد دوباره بلند شوم و ادامه دهم. تو ستون روح منی.",
        whisper: "«اگر باشی، با تمام دنیا می‌جنگم و پیروز می‌شوم...»"
      },
      {
        title: "عطر گیسوانت در نسیم",
        text: "وقتی باد در موهایت می‌پیچد، مستی محض هوای اتاق را پر می‌کند. هیچ عطری در پاریس به پای بوی موهای نرگسم نمی‌رسد.",
        whisper: "«تار تار موهایت، زنجیر طلایی اسارت دل من است...»"
      },
      {
        title: "نجواهای دلبرانه شبانه",
        text: "شب‌هایی که پشت تلفن یا کنارم آرام پچ‌پچ می‌کنی، ضربان قلبم روی مدار خواستنت تنظیم می‌شود.",
        whisper: "«صدایت نت‌به‌نت ترانه هستی و زندگی من است...»"
      },
      {
        title: "صبح‌های روشن کنار تو",
        text: "زیباترین نقاشی کائنات برای من دیدن چشمان نیمه‌باز و لبخند اول صبح تو بدون هیچ آرایشی است. طبیعی و بی‌نقص.",
        whisper: "«صبح یعنی نفس کشیدن در حریم امن آغوش تو...»"
      },
      {
        title: "طعم دستپخت و چای با عشقت",
        text: "هر چیزی که دست‌های مهربانت لمسش کنند طعم بهشت می‌گیرد. برکت خانه من رد عطر دست‌های تو خواهد بود.",
        whisper: "«شهد عشق تو در تک‌تک سلول‌های وجودم نشسته...»"
      },
      {
        title: "قهرها و نازهای خواستنی‌ات",
        text: "حتی وقتی با ناز اخم می‌کنی و رو برمی‌گردانی، دلم برایت ضعف می‌رود. نازت را به قیمت تمام جانم خریدارم.",
        whisper: "«دورت بگردم که حتی قهرهایت هم شیرین‌ترین عذاب دنیاست...»"
      },
      {
        title: "وقار و وقار زنانه تو",
        text: "در عین وقار و استقلال بیرونی‌ات، اینکه در برابر من نرم، عاشق و پرمحبت می‌شوی بزرگ‌ترین افتخار پادشاهی من است.",
        whisper: "«ملکه مغرور جهان و همدم مهربان مهراد...»"
      },
      {
        title: "اشک‌های پاکت در روزهای دوری",
        text: "سوگند می‌خورم که دیگر هرگز نگذارم اشکی جز از سر ذوق و شوق از آن چشمان نجیب و بی‌همتا فرو بریزد.",
        whisper: "«فدای تک‌تک نفس‌هایت در آن ثانیه‌های تلخ دلتنگی...»"
      },
      {
        title: "تپش مشترک سینه‌هایمان",
        text: "وقتی سینه‌ام به سینه‌ات فشرده می‌شود حس می‌کنم دو قطعه از یک جانیم که بعد از قرن‌ها بالاخره به هم رسیدند.",
        whisper: "«یکی شدیم در تب و تمنای وصالی جاودانه...»"
      },
      {
        title: "وفاداری بی‌حد و مرزت",
        text: "عشقی که تو به پای من ریختی هیچ قیمتی ندارد. من تا ابد خود را مدیون و خادم وفاداری پاک تو می‌دانم.",
        whisper: "«سند قلبم را با جوهر وفایت مهر و موم کردم...»"
      },
      {
        title: "سکوت‌های عمیق دو نفره",
        text: "لحظاتی که حتی کلمه‌ای رد و بدل نمی‌شود اما نگاه‌هایمان هزار مثنوی تمنا زمزمه می‌کنند.",
        whisper: "«سکوت در کنار تو، زیباترین موسیقی آفرینش است...»"
      },
      {        title: "حس مالکیت در قلب من",
        text: "تو پادشاه بلامنازع قلب منی. کلیدی که این در را باز کرد فقط در دست‌های توست و هیچ‌کس جایت را نمی‌گیرد.",
        whisper: "«تمام هستی مهراد برای ابد به نام نرگس سند خورد...»"
      },
      {
        title: "چشمان منتظرت در تاریکی",
        text: "تصویر چشم‌های منتظرت هرگز از خاطرم نمی‌رود. آن انتظار مقدس، من را تبدیل به مردی ساخت که امروز پیش روی توست.",
        whisper: "«می‌ارزید سال‌ها دویدن، برای لحظه‌ای رسیدن به تو...»"
      },
      {
        title: "لبخند پیروزمندانه تو",
        text: "عاشق وقت‌هایی‌ام که با هوش و ظرافتت لبخند می‌زنی و نشان می‌دهی که همیشه حق با توست. بله، همیشه حق با توست!",
        whisper: "«همیشه برنده تویی که فاتح قلب منی...»"
      },
      {
        title: "گرمی دستانت در زمستان",
        text: "دست در دست تو گذاشتن، یعنی بهار در چله زمستان. هر سرمایی در برابر گرمای دستت تسلیم است.",
        whisper: "«دست‌هایت پناهگاه همیشگی انگشتان یخ‌زده من است...»"
      },
      {
        title: "رویای بافتن موهایت",
        text: "رویای هر شب من این است که روبه‌روی آینه بنشینی و من آرام‌ارام تارهای گیسوانت را ببافم و ببوسم.",
        whisper: "«آرامش محض یعنی سرانگشتان من میان تارهای موی تو...»"
      },
      {
        title: "تپش‌های بی‌قرار نامت",
        text: "قلب من سال‌هاست نام تو را هجی می‌کند: «نر-گس... نر-گس...». تو ضرب‌آهنگ حیات منی.",
        whisper: "«نفسم به نفس‌هایت بند است جانان من...»"
      },
      {
        title: "عهد ناگسستنی مهراد",
        text: "عهدی که با تو بستم از کوه‌ها استوارتر است. هیچ رنجی و هیچ فاصله‌ای نخواهد توانست بند وصال ما را سست کند.",
        whisper: "«قول مردانه دادم و تا ابد سر حرفم هستم...»"
      },
      {
        title: "تو تمام دنیای منی",
        text: "نرگس، تو تنها دلیل، انگیزه و هدف تمام تکاپوهای منی. با تمام روح و کالبدم عاشقتم. دورت بگردم تا ابد.",
        whisper: "«تو مرا جانی و جهانی... برای ابد، مهراد ❤️»"
      }
    ];

    var FUTURE_PROMISES_30 = [
      { t: "قول خانه رویایی", b: "قول می‌دهم خانه‌ای پر از پنجره‌های آفتاب‌گیر و گلدان‌های نرگس بسازیم که فقط صدای خنده‌هایت در آن بپیچد." },
      { t: "قول بیداری با بوسه", b: "قول می‌دهم هر روز صبح قبل از اینکه خورشید بتابد، با بوسه‌ای ملایم بر پلک‌هایت بیدارت کنم." },
      { t: "قول تکیه‌گاه ابدی", b: "قول می‌دهم در طوفان‌ها سدی محکم باشم تا حتی نسیم تند هم پوست لطیفت را نیازارد." },
      { t: "قول سفر به دور دنیا", b: "قول می‌دهم دستت را بگیرم و به زیباترین گوشه‌های این کره خاکی ببریم و رد پای عشقمون رو ثبت کنیم." },
      { t: "قول جبران روزهای انتظار", b: "قول می‌دهم آنقدر روزهای پیش‌رویمان شیرین باشد که تلخی ثانیه‌های انتظار گذشته را کلاً فراموش کنی." },
      { t: "قول احترام بی‌پایان", b: "قول می‌دهم همیشه با همان عشقی که روز اول در قلبم کاشتی، ستایشت کنم و به خواسته‌هایت احترام بگذارم." },
      { t: "قول گوش دادن به حرف‌های دلت", b: "قول می‌دهم ساعت‌ها بنشینم و به هر چیزی که در دل داری با اشتیاق گوش دهم." },
      { t: "قول آرامش مطلق", b: "قول می‌دهم حریمی بسازم که در آن هیچ استرسی راه پیدا نکند و همیشه احساس امنیت کنی." },
      { t: "قول بافتن موهایت", b: "قول می‌دهم نوازشگر شب‌های بی‌خوابی‌ات باشم و موهایت را با عشق ببافم." },
      { t: "قول وفاداری تا پای جان", b: "قول می‌دهم نگاهم جز به چشمان تو به هیچ منظره‌ای در این عالم خیره نشود." },
      { t: "قول سورپرایزهای بی‌هوا", b: "قول می‌دهم نگذارم رابطه ما گرفتار روزمرگی شود و مدام با شاخه گلی خوشحالت کنم." },
      { t: "قول پاک کردن هر اشک", b: "قول می‌دهم اگر اشکی هم ریخت، بلافاصله لبانم روی گونه‌هایت فرود بیاید و پاکش کند." },
      { t: "قول پرستاری در بیماری‌ها", b: "قول می‌دهم در ناخوشی‌ها صبورترین و دلسوزترین پرستار کنارت باشم." },
      { t: "قول حمایت از اهدافت", b: "قول می‌دهم بزرگ‌ترین مشوق رویاها و پیشرفت‌های فردی‌ات در زندگی باشم." },
      { t: "قول خنداندن از ته دل", b: "قول می‌دهم هر روز حداقل یک بار قهقهه از ته دلت را به گوشم برسانی." },
      { t: "قول غذای مورد علاقه‌ات", b: "قول می‌دهم در روزهای خستگی‌ات خودم بهترین غذاها را با عشق برایت آماده کنم." },
      { t: "قول پیاده‌روی‌های زیر باران", b: "قول می‌دهم زیر قطره‌های باران پالتویم را دورت بپیچم و در خیابان‌ها برقصیم." },
      { t: "قول صبر و شکیبایی", b: "قول می‌دهم همانطور که تو سال‌ها صبوری کردی، من هم در تمام چالش‌ها صبور و آرام بمانم." },
      { t: "قول درک کردن نگاهت", b: "قول می‌دهم قبل از اینکه به زبان بیاوری، از چشم‌هایت بخوانم که چه در دل داری." },
      { t: "قول جشن گرفتن عشقمون", b: "قول می‌دهم تمام سالگردهای دیدارمان را مثل روز اول باشکوه و مقدس بشمارم." },
      { t: "قول محکم گرفتن دستانت", b: "قول می‌دهم در خیابان و جلوی چشم همه با غرور دست‌هایت را محکم در دستم بگیرم." },
      { t: "قول بخشیدن غرور", b: "قول می‌دهم هرگز اجازه ندهم غرور مردانه بین من و تو فاصله‌ای بیندازد." },
      { t: "قول خواب آرام", b: "قول می‌دهم سینه‌ام بالشت همیشگی خواب‌های آرام و پر از رویای تو باشد." },
      { t: "قول عکاسی از لحظه‌هایت", b: "قول می‌دهم قشنگ‌ترین لبخندهایت را در قاب لنز و قلبم برای همیشه ثبت کنم." },
      { t: "قول پناه امن شبانه", b: "قول می‌دهم در تاریکی‌ها و کابوس‌ها محکم تو را به خود بچسبانم و بگویم مهراد اینجاست." },
      { t: "قول رفاقت مادام‌العمر", b: "قول می‌دهم قبل از هر نقشی، صمیمی‌ترین و رازدارترین رفیق تمام لحظه‌هایت باشم." },
      { t: "قول ساختن آینده روشن", b: "قول می‌دهم تمام تلاشم را بکنم تا آینده مالی و معنوی فوق‌العاده‌ای تجربه کنیم." },
      { t: "قول نگاه اول صبح", b: "قول می‌دهم همیشه با اشتیاق بیدار شدن در کنارت چشمانم را به روی دنیا باز کنم." },
      { t: "قول دورت گشتن مداوم", b: "قول می‌دهم هر روز چند بار با تمام جانم بگویم: نرگسم، دورت بگردم!" },
      { t: "قول ابدیت مهراد", b: "قول می‌دهم حتی اگر جهان به آخر برسد، عشق من در کائنات به یادت باقی بماند." }
    ];

    /* =========================================================================
       ۲. سینث‌سایزر صوتی آرامش‌بخش Web Audio API
       ========================================================================= */
    var MobileSoundSystem = function() {
      this.ctx = null;
      this.masterGain = null;
    };

    MobileSoundSystem.prototype.init = function() {
      var AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.28, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.startAmbientHarmony();
    };

    MobileSoundSystem.prototype.startAmbientHarmony = function() {
      if (!this.ctx) return;
      var progression = [
        [174.61, 220.00, 261.63, 329.63],
        [196.00, 246.94, 293.66, 349.23],
        [220.00, 261.63, 329.63, 392.00],
        [164.81, 196.00, 246.94, 293.66]
      ];
      var chordIndex = 0;
      var self = this;

      var stepChord = function() {
        var notes = progression[chordIndex];
        chordIndex = (chordIndex + 1) % progression.length;
        var now = self.ctx.currentTime;

        for (var i = 0; i < notes.length; i++) {
          var osc = self.ctx.createOscillator();
          var g = self.ctx.createGain();
          var filter = self.ctx.createBiquadFilter();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(notes[i], now);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(420, now);
          filter.Q.setValueAtTime(2.0, now);

          g.gain.setValueAtTime(0.001, now);
          g.gain.linearRampToValueAtTime(0.035, now + 2.5);
          g.gain.exponentialRampToValueAtTime(0.0001, now + 7.5);

          osc.connect(filter);
          filter.connect(g);
          g.connect(self.masterGain);

          osc.start(now);
          osc.stop(now + 8.0);
        }
        setTimeout(stepChord, 7100);
      };
      stepChord();
    };

    MobileSoundSystem.prototype.playPickupNote = function() {
      if (!this.ctx) return;
      var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      var now = this.ctx.currentTime;
      for (var i = 0; i < notes.length; i++) {
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(notes[i], now + i * 0.04);

        g.gain.setValueAtTime(0.001, now + i * 0.04);
        g.gain.linearRampToValueAtTime(0.18, now + i * 0.04 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 1.1);

        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 1.2);
      }
    };

    MobileSoundSystem.prototype.playLevitationHum = function() {
      if (!this.ctx) return;
      var now = this.ctx.currentTime;
      var osc = this.ctx.createOscillator();
      var g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.22);

      g.gain.setValueAtTime(0.12, now);
      g.gain.linearRampToValueAtTime(0.001, now + 0.26);

      osc.connect(g);
      g.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.28);
    };

    MobileSoundSystem.prototype.playRescueHarpSound = function() {
      if (!this.ctx) return;
      var harpNotes = [329.63, 392.00, 493.88, 587.33, 659.25, 783.99];
      var now = this.ctx.currentTime;
      for (var i = 0; i < harpNotes.length; i++) {
        var osc = this.ctx.createOscillator();
        var g = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(harpNotes[i], now + i * 0.06);

        g.gain.setValueAtTime(0.12, now + i * 0.06);
        g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.9);

        osc.connect(g);
        g.connect(this.masterGain);

        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.95);
      }
    };

    MobileSoundSystem.prototype.playBoomFirework = function() {
      if (!this.ctx) return;
      var now = this.ctx.currentTime;
      var bSize = Math.floor(this.ctx.sampleRate * 1.1);
      var buffer = this.ctx.createBuffer(1, bSize, this.ctx.sampleRate);
      var data = buffer.getChannelData(0);
      for (var i = 0; i < bSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      var noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      var filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(700, now);
      filter.frequency.exponentialRampToValueAtTime(50, now + 1.0);

      var g = this.ctx.createGain();
      g.gain.setValueAtTime(0.35, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

      noise.connect(filter);
      filter.connect(g);
      g.connect(this.masterGain);

      noise.start(now);
    };

    var audioCore = new MobileSoundSystem();

    /* =========================================================================
       ۳. راه‌اندازی صحنه Three.js و نورپردازی بهینه‌شده موبایل
       ========================================================================= */
    var canvasBox = document.getElementById('canvas-container');
    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0e021a, 0.006);

    var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2500);
    var renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    canvasBox.appendChild(renderer.domElement);

    // آسمان ستاره‌ای
    var starCount = 4200;
    var starGeo = new THREE.BufferGeometry();
    var starPos = new Float32Array(starCount * 3);
    var starColors = new Float32Array(starCount * 3);

    for (var s = 0; s < starCount * 3; s += 3) {
      starPos[s] = (Math.random() - 0.5) * 1600;
      starPos[s + 1] = Math.random() * 800 - 100;
      starPos[s + 2] = (Math.random() - 0.5) * 1600;

      var clr = new THREE.Color();
      var roll = Math.random();
      if (roll > 0.6) clr.setRGB(1.0, 0.55, 0.85);
      else if (roll > 0.3) clr.setRGB(0.5, 0.85, 1.0);
      else clr.setRGB(1.0, 0.95, 0.75);

      starColors[s] = clr.r;
      starColors[s + 1] = clr.g;
      starColors[s + 2] = clr.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    var starFieldPoints = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ size: 1.8, vertexColors: true, transparent: true, opacity: 0.92 })
    );
    scene.add(starFieldPoints);

    // نورپردازی
    var ambientLightSource = new THREE.AmbientLight(0xf2dcff, 0.85);
    scene.add(ambientLightSource);

    var mainSunLight = new THREE.DirectionalLight(0xfff3e6, 1.3);
    mainSunLight.position.set(80, 140, 70);
    mainSunLight.castShadow = true;
    mainSunLight.shadow.mapSize.width = 1024;
    mainSunLight.shadow.mapSize.height = 1024;
    mainSunLight.shadow.camera.near = 0.5;
    mainSunLight.shadow.camera.far = 450;
    var dScope = 100;
    mainSunLight.shadow.camera.left = -dScope;
    mainSunLight.shadow.camera.right = dScope;
    mainSunLight.shadow.camera.top = dScope;
    mainSunLight.shadow.camera.bottom = -dScope;
    scene.add(mainSunLight);

    var neonRimLight = new THREE.DirectionalLight(0xff007f, 0.75);
    neonRimLight.position.set(-80, -30, -70);
    scene.add(neonRimLight);

    /* =========================================================================
       ۴. ساخت ۷ جهان بهشتی باشکوه
       ========================================================================= */
    var colliders = [];
    var islandsWorldGroup = new THREE.Group();
    scene.add(islandsWorldGroup);

    function createParadiseIslandMesh(x, y, z, radius, height, grassHex, isCloud, decorType) {
      var grp = new THREE.Group();
      grp.position.set(x, y, z);

      var topMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius * 0.88, height, isCloud ? 14 : 20),
        new THREE.MeshStandardMaterial({
          color: grassHex,
          roughness: isCloud ? 0.4 : 0.75,
          emissive: isCloud ? 0x4a1835 : 0x000000,
          flatShading: true
        })
      );
      topMesh.receiveShadow = true;
      topMesh.castShadow = true;
      grp.add(topMesh);

      var coneMesh = new THREE.Mesh(
        new THREE.ConeGeometry(radius * 0.88, height * 2.8, 14),
        new THREE.MeshStandardMaterial({ color: isCloud ? 0x3d1230 : 0x1a0924, roughness: 0.9, flatShading: true })
      );
      coneMesh.rotation.x = Math.PI;
      coneMesh.position.y = -height * 1.6;
      coneMesh.castShadow = true;
      grp.add(coneMesh);

      // پوشش گیاهی و دکوراسیون اقلیم‌ها
      var tCount = Math.floor(radius * 0.9);
      for (var t = 0; t < tCount; t++) {
        var ang = Math.random() * Math.PI * 2;
        var rDist = Math.random() * (radius - 2.5);
        var tx = Math.cos(ang) * rDist;
        var tz = Math.sin(ang) * rDist;

        if (decorType === 'trees') {
          var trunk = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.38, 2.5, 6),
            new THREE.MeshLambertMaterial({ color: 0x42261a })
          );
          trunk.position.set(tx, height / 2 + 1.25, tz);
          trunk.castShadow = true;
          grp.add(trunk);

          var foliage = new THREE.Mesh(
            new THREE.DodecahedronGeometry(1.4 + Math.random() * 0.5),
            new THREE.MeshStandardMaterial({
              color: Math.random() > 0.4 ? 0xff8da8 : 0x55aa44,
              flatShading: true
            })
          );
          foliage.position.set(tx, height / 2 + 2.8, tz);
          foliage.castShadow = true;
          grp.add(foliage);
        } else if (decorType === 'autumn') {
          var aTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.35, 2.8, 6), new THREE.MeshLambertMaterial({ color: 0x3b2214 }));
          aTrunk.position.set(tx, height / 2 + 1.4, tz);
          grp.add(aTrunk);
          var aFoliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), new THREE.MeshStandardMaterial({ color: Math.random() > 0.5 ? 0xe65c00 : 0xd97706, flatShading: true }));
          aFoliage.position.set(tx, height / 2 + 3.0, tz);
          grp.add(aFoliage);
        } else if (decorType === 'crystals') {
          var cryH = 3 + Math.random() * 4;
          var crystal = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.0, 0),
            new THREE.MeshPhysicalMaterial({ color: 0x00ffff, emissive: 0x005577, roughness: 0.1, transmission: 0.8, transparent: true })
          );
          crystal.scale.set(0.8, cryH, 0.8);
          crystal.position.set(tx, height / 2 + cryH / 2, tz);
          grp.add(crystal);
        } else if (decorType === 'ruins') {
          var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 6 + Math.random() * 4, 8), new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.9 }));
          pillar.position.set(tx, height / 2 + 3, tz);
          pillar.castShadow = true;
          grp.add(pillar);
        }
      }

      islandsWorldGroup.add(grp);

      colliders.push({
        x: x,
        y: y + height / 2,
        z: z,
        radius: radius,
        topY: y + height / 2
      });

      return grp;
    }

    // ۱. باغ دیدار
    createParadiseIslandMesh(0, 0, 0, 22, 4, 0x2e7d32, false, 'trees');
    // ۲. اقیانوس صبر
    createParadiseIslandMesh(-80, 25, 60, 20, 3.5, 0xff99bb, true, 'none');
    // ۳. کهکشان نرگس
    createParadiseIslandMesh(90, 48, -90, 22, 4, 0x241242, false, 'crystals');
    // ۴. پاییز دلتنگی
    createParadiseIslandMesh(120, 75, 40, 20, 4, 0x854d0e, false, 'autumn');
    // ۵. شهر آینده
    createParadiseIslandMesh(-60, 105, -120, 24, 4.5, 0x1e293b, false, 'ruins');
    // ۶. قله بلورین
    createParadiseIslandMesh(-140, 140, -40, 20, 4, 0x38bdf8, false, 'crystals');
    // ۷. معبد وصال و ابدیت
    createParadiseIslandMesh(0, 180, 130, 26, 5, 0x99184b, false, 'ruins');

    // پل‌های معلق سنگی
    function buildSteppingStones(start, end, count) {
      for (var i = 1; i < count; i++) {
        var t = i / count;
        var x = THREE.MathUtils.lerp(start.x, end.x, t);
        var y = THREE.MathUtils.lerp(start.y, end.y, t) + Math.sin(t * Math.PI) * 4.0;
        var z = THREE.MathUtils.lerp(start.z, end.z, t);

        var sMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(1.5, 1.2, 0.75, 8),
          new THREE.MeshStandardMaterial({ color: 0xdec0f7, roughness: 0.4, emissive: 0x4a1458, emissiveIntensity: 0.4 })
        );
        sMesh.position.set(x, y, z);
        sMesh.castShadow = true;
        scene.add(sMesh);

        colliders.push({ x: x, y: y + 0.38, z: z, radius: 1.6, topY: y + 0.38 });
      }
    }
    buildSteppingStones(new THREE.Vector3(0, 2, 0), new THREE.Vector3(-80, 26.5, 60), 7);
    buildSteppingStones(new THREE.Vector3(-80, 26.5, 60), new THREE.Vector3(90, 50, -90), 9);

    /* =========================================================================
       ۵. ساخت ۶۰ آیتم عشق (۳۰ قلب تمنا + ۳۰ گل پیمان)
       ========================================================================= */
    var totalCollectibles = [];

    // هندسه قلب
    var heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0);
    heartShape.bezierCurveTo(0, -0.3, -0.6, -0.3, -0.6, 0);
    heartShape.bezierCurveTo(-0.6, 0.3, 0, 0.6, 0, 1.0);
    heartShape.bezierCurveTo(0, 0.6, 0.6, 0.3, 0.6, 0);
    heartShape.bezierCurveTo(0.6, -0.3, 0, -0.3, 0, 0);
    var heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.35, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.1, bevelThickness: 0.1 });
    heartGeo.center();
    var heartMaterial = new THREE.MeshStandardMaterial({ color: 0xff0055, emissive: 0xff2a75, emissiveIntensity: 0.9, roughness: 0.15, metalness: 0.6 });

    // هندسه گل نیلوفر/ارکیده
    var flowerGeo = new THREE.Group();
    var flowerCore = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00 }));
    flowerGeo.add(flowerCore);
    for (var p = 0; p < 6; p++) {
      var petal = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.3, 4), new THREE.MeshStandardMaterial({ color: 0x00e5ff, emissive: 0x0088cc, side: THREE.DoubleSide }));
      petal.rotation.x = Math.PI / 2 - 0.2;
      petal.position.z = 0.65;
      var pivot = new THREE.Group();
      pivot.rotation.y = (p / 6) * Math.PI * 2;
      pivot.add(petal);
      flowerGeo.add(pivot);
    }

    // پخش ۶۰ آیتم در سراسر جهان‌ها
    var spawnCoords = [
      // ۱. باغ دیدار
      {x: 0, y: 4, z: -8}, {x: 8, y: 4, z: 7}, {x: -8, y: 4, z: 6}, {x: -4, y: 4, z: 12}, {x: 5, y: 4, z: -12}, {x: -11, y: 4, z: -5}, {x: 12, y: 4, z: 0}, {x: 0, y: 4, z: 14},
      // ۲. اقیانوس صبر
      {x: -80, y: 28, z: 60}, {x: -88, y: 28, z: 65}, {x: -72, y: 28, z: 55}, {x: -85, y: 28, z: 50}, {x: -75, y: 28, z: 70}, {x: -92, y: 28, z: 58}, {x: -68, y: 28, z: 62}, {x: -80, y: 28, z: 74},
      // ۳. کهکشان نرگس
      {x: 90, y: 52, z: -90}, {x: 98, y: 52, z: -84}, {x: 82, y: 52, z: -96}, {x: 95, y: 52, z: -100}, {x: 85, y: 52, z: -80}, {x: 102, y: 52, z: -92}, {x: 78, y: 52, z: -88}, {x: 90, y: 52, z: -76},
      // ۴. پاییز دلتنگی
      {x: 120, y: 79, z: 40}, {x: 126, y: 79, z: 46}, {x: 114, y: 79, z: 34}, {x: 128, y: 79, z: 32}, {x: 112, y: 79, z: 48}, {x: 122, y: 79, z: 52}, {x: 118, y: 79, z: 28}, {x: 132, y: 79, z: 40},
      // ۵. شهر آینده
      {x: -60, y: 109, z: -120}, {x: -68, y: 109, z: -115}, {x: -52, y: 109, z: -125}, {x: -64, y: 109, z: -132}, {x: -56, y: 109, z: -108}, {x: -72, y: 109, z: -122}, {x: -48, y: 109, z: -118}, {x: -60, y: 109, z: -104},
      // ۶. قله بلورین
      {x: -140, y: 144, z: -40}, {x: -146, y: 144, z: -35}, {x: -134, y: 144, z: -45}, {x: -148, y: 144, z: -48}, {x: -132, y: 144, z: -32}, {x: -142, y: 144, z: -26}, {x: -138, y: 144, z: -54}, {x: -152, y: 144, z: -40},
      // ۷. معبد ابدیت
      {x: 0, y: 185, z: 130}, {x: 8, y: 185, z: 136}, {x: -8, y: 185, z: 136}, {x: 0, y: 185, z: 122}, {x: 10, y: 185, z: 124}, {x: -10, y: 185, z: 124}, {x: 12, y: 185, z: 132}, {x: -12, y: 185, z: 132},
      // نقاط تکمیلی در پل‌ها
      {x: -40, y: 16, z: 30}, {x: -20, y: 12, z: 15}, {x: 5, y: 40, z: -15}, {x: 45, y: 44, z: -50}
    ];

    for (var it = 0; it < 60; it++) {
      var isGem = it < 30;
      var cPos = spawnCoords[it];
      var cMesh;

      if (isGem) {
        cMesh = new THREE.Mesh(heartGeo, heartMaterial);
        cMesh.scale.set(1.4, 1.4, 1.4);
        cMesh.rotation.z = Math.PI;
      } else {
        cMesh = flowerGeo.clone();
        cMesh.scale.set(1.5, 1.5, 1.5);
      }

      cMesh.position.set(cPos.x, cPos.y, cPos.z);
      scene.add(cMesh);

      var pLight = new THREE.PointLight(isGem ? 0xff1464 : 0x00e5ff, 1.4, 8);
      pLight.position.set(cPos.x, cPos.y, cPos.z);
      scene.add(pLight);

      totalCollectibles.push({
        id: it,
        type: isGem ? 'heart' : 'flower',
        mesh: cMesh,
        light: pLight,
        collected: false,
        data: isGem ? PASSION_NOTES_30[it] : FUTURE_PROMISES_30[it - 30],
        baseY: cPos.y
      });
    }

    /* =========================================================================
       ۶. محراب بزرگ وصال در جهان هفتم
       ========================================================================= */
    var altarMasterGroup = new THREE.Group();
    altarMasterGroup.position.set(0, 183, 130);

    var altarBasePlatform = new THREE.Mesh(
      new THREE.CylinderGeometry(5.5, 6.0, 1.4, 20),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2, metalness: 0.35 })
    );
    altarMasterGroup.add(altarBasePlatform);

    var goldenRing = new THREE.Mesh(
      new THREE.TorusGeometry(4.6, 0.28, 16, 64),
      new THREE.MeshStandardMaterial({ color: 0xffd700, roughness: 0.15, metalness: 0.95 })
    );
    goldenRing.rotation.x = Math.PI / 2;
    goldenRing.position.y = 0.85;
    altarMasterGroup.add(goldenRing);

    var diamondMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.2, 2),
      new THREE.MeshPhysicalMaterial({ color: 0x00ffff, emissive: 0x006688, roughness: 0.05, metalness: 0.1, transmission: 0.9, transparent: true })
    );
    diamondMesh.position.set(0, 5.2, 0);
    altarMasterGroup.add(diamondMesh);

    var centralGiantHeart = new THREE.Mesh(
      heartGeo,
      new THREE.MeshPhysicalMaterial({ color: 0xff0044, emissive: 0x990022, roughness: 0.1, transmission: 0.75, opacity: 0.96, transparent: true })
    );
    centralGiantHeart.rotation.z = Math.PI;
    centralGiantHeart.position.y = 2.6;
    centralGiantHeart.scale.set(4.0, 4.0, 4.0);
    altarMasterGroup.add(centralGiantHeart);

    scene.add(altarMasterGroup);

    /* =========================================================================
       ۷. کاراکتر نرگس، پروانه‌های همراه و هاله نور
       ========================================================================= */
    var player = new THREE.Group();
    player.position.set(0, 4.5, 0);
    scene.add(player);

    var skinMat = new THREE.MeshStandardMaterial({ color: 0xffe4d6, roughness: 0.45 });
    var dressMat = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.5 });

    var headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), skinMat);
    headMesh.position.y = 1.45;
    headMesh.castShadow = true;
    player.add(headMesh);

    var flowerCrown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24), new THREE.MeshLambertMaterial({ color: 0xff1493 }));
    flowerCrown.position.set(0.18, 1.9, 0.12);
    player.add(flowerCrown);

    var dressMesh = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.25, 16), dressMat);
    dressMesh.position.y = 0.75;
    dressMesh.castShadow = true;
    player.add(dressMesh);

    var levitationAuraGroup = new THREE.Group();
    levitationAuraGroup.position.set(0, -0.1, 0);

    var auraRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.06, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0xff00aa, emissiveIntensity: 0.9, roughness: 0.1 })
    );
    auraRingMesh.rotation.x = Math.PI / 2;
    levitationAuraGroup.add(auraRingMesh);

    var auraInnerRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.7, 0.04, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0xffd700, emissive: 0xffaa00, emissiveIntensity: 0.8, roughness: 0.2 })
    );
    auraInnerRingMesh.rotation.x = Math.PI / 2;
    levitationAuraGroup.add(auraInnerRingMesh);

    levitationAuraGroup.visible = false;
    player.add(levitationAuraGroup);

    // پروانه‌های عاشق دور نرگس
    var butterflies = [];
    for (var b = 0; b < 4; b++) {
      var bWing = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.25), new THREE.MeshBasicMaterial({ color: 0xffd700, side: THREE.DoubleSide }));
      scene.add(bWing);
      butterflies.push({ mesh: bWing, angle: b * 1.5, radius: 1.4 + b * 0.3, speed: 0.02 + b * 0.005 });
    }

    // ذرات آب‌وهوا (بارش گلبرگ)
    var petalCount = 400;
    var petalGeo = new THREE.BufferGeometry();
    var petalPositions = new Float32Array(petalCount * 3);
    for (var pi = 0; pi < petalCount * 3; pi += 3) {
      petalPositions[pi] = (Math.random() - 0.5) * 120;
      petalPositions[pi + 1] = Math.random() * 50;
      petalPositions[pi + 2] = (Math.random() - 0.5) * 120;
    }
    petalGeo.setAttribute('position', new THREE.BufferAttribute(petalPositions, 3));
    var petalParticles = new THREE.Points(petalGeo, new THREE.PointsMaterial({ color: 0xffb3ba, size: 0.8, transparent: true, opacity: 0.8 }));
    scene.add(petalParticles);

    /* =========================================================================
       ۸. کنترل‌های لمسی موبایل، جوی‌استیک و ناوبری
       ========================================================================= */
    var touchMoveVector = { x: 0, y: 0 };
    var isFlightActive = false;
    var cameraAngleYaw = 0;
    var cameraAnglePitch = 0.32;
    var isDraggingLook = false;
    var lastTouchLookPoint = { x: 0, y: 0 };

    var touchSurface = document.getElementById('touch-look-surface');
    touchSurface.addEventListener('touchstart', function(e) {
      var t = e.changedTouches[0];
      lastTouchLookPoint.x = t.clientX;
      lastTouchLookPoint.y = t.clientY;
      isDraggingLook = true;
    }, { passive: true });

    touchSurface.addEventListener('touchmove', function(e) {
      if (!isDraggingLook) return;
      var t = e.changedTouches[0];
      var dx = t.clientX - lastTouchLookPoint.x;
      var dy = t.clientY - lastTouchLookPoint.y;
      lastTouchLookPoint.x = t.clientX;
      lastTouchLookPoint.y = t.clientY;

      cameraAngleYaw -= dx * 0.007;
      cameraAnglePitch = Math.max(0.1, Math.min(1.1, cameraAnglePitch + dy * 0.005));
    }, { passive: true });

    touchSurface.addEventListener('touchend', function() { isDraggingLook = false; });
    touchSurface.addEventListener('touchcancel', function() { isDraggingLook = false; });

    var joyPlate = document.getElementById('joystick-plate');
    var joyCore = document.getElementById('joystick-core');
    var joyActiveId = null;
    var joyCenterCoords = { x: 0, y: 0 };

    joyPlate.addEventListener('touchstart', function(e) {
      var t = e.changedTouches[0];
      joyActiveId = t.identifier;
      var rect = joyPlate.getBoundingClientRect();
      joyCenterCoords.x = rect.left + rect.width / 2;
      joyCenterCoords.y = rect.top + rect.height / 2;
    }, { passive: true });

    joyPlate.addEventListener('touchmove', function(e) {
      for (var i = 0; i < e.changedTouches.length; i++) {
        var t = e.changedTouches[i];
        if (t.identifier === joyActiveId) {
          var dx = t.clientX - joyCenterCoords.x;
          var dy = t.clientY - joyCenterCoords.y;
          var dist = Math.min(Math.hypot(dx, dy), 38);
          var angle = Math.atan2(dy, dx);

          var kx = Math.cos(angle) * dist;
          var ky = Math.sin(angle) * dist;

          joyCore.style.transform = 'translate(' + kx + 'px,' + ky + 'px)';
          touchMoveVector.x = kx / 38;
          touchMoveVector.y = -ky / 38;
        }
      }
    }, { passive: true });

    var resetJoystickState = function() {
      joyCore.style.transform = 'translate(0px,0px)';
      touchMoveVector.x = 0;
      touchMoveVector.y = 0;
      joyActiveId = null;
    };
    joyPlate.addEventListener('touchend', resetJoystickState);
    joyPlate.addEventListener('touchcancel', resetJoystickState);

    var flyModeBtn = document.getElementById('fly-mode-btn');
    flyModeBtn.addEventListener('click', function() {
      isFlightActive = !isFlightActive;
      audioCore.playLevitationHum();
      levitationAuraGroup.visible = isFlightActive;

      if (isFlightActive) {
        flyModeBtn.classList.add('active');
        document.getElementById('jump-ascend-action').innerText = 'اوج';
      } else {
        flyModeBtn.classList.remove('active');
        document.getElementById('jump-ascend-action').innerText = 'پرش';
      }
    });

    var isHoldingAscend = false;
    var jumpBtn = document.getElementById('jump-ascend-action');
    jumpBtn.addEventListener('touchstart', function(e) {
      e.preventDefault();
      isHoldingAscend = true;
      audioCore.playLevitationHum();
      if (!isFlightActive && isPlayerGrounded) {
        playerVelocity.y = 12.5;
        isPlayerGrounded = false;
      }
    });
    jumpBtn.addEventListener('touchend', function() { isHoldingAscend = false; });
    jumpBtn.addEventListener('touchcancel', function() { isHoldingAscend = false; });

    function warpPlayerDirectly(targetPos) {
      audioCore.playRescueHarpSound();
      player.position.copy(targetPos);
      playerVelocity.set(0, 0, 0);
    }

    var realmWarpMap = [
      { btn: 'warp-btn-w1', pos: new THREE.Vector3(0, 6, 0) },
      { btn: 'warp-btn-w2', pos: new THREE.Vector3(-80, 31, 60) },
      { btn: 'warp-btn-w3', pos: new THREE.Vector3(90, 54, -90) },
      { btn: 'warp-btn-w4', pos: new THREE.Vector3(120, 81, 40) },
      { btn: 'warp-btn-w5', pos: new THREE.Vector3(-60, 111, -120) },
      { btn: 'warp-btn-w6', pos: new THREE.Vector3(-140, 146, -40) },
      { btn: 'warp-btn-w7', pos: new THREE.Vector3(0, 187, 130) }
    ];

    realmWarpMap.forEach(function(item) {
      document.getElementById(item.btn).addEventListener('click', function() {
        warpPlayerDirectly(item.pos);
        document.querySelectorAll('.realm-badge-btn').forEach(function(btn) { btn.classList.remove('active'); });
        document.getElementById(item.btn).classList.add('active');
      });
    });

    /* =========================================================================
       ۹. آتش‌بازی و دیالوگ‌ها
       ========================================================================= */
    var fireworkParticleSystems = [];
    function launchFireworkDisplay(x, y, z) {
      audioCore.playBoomFirework();
      var sparkCount = 75;
      var geo = new THREE.BufferGeometry();
      var positions = new Float32Array(sparkCount * 3);
      var velocities = [];

      for (var i = 0; i < sparkCount; i++) {
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        var theta = Math.random() * Math.PI * 2;
        var phi = Math.acos(Math.random() * 2 - 1);
        var speed = 6 + Math.random() * 8;

        velocities.push(new THREE.Vector3(
          Math.sin(phi) * Math.cos(theta) * speed,
          Math.sin(phi) * Math.sin(theta) * speed,
          Math.cos(phi) * speed
        ));
      }

      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      var mat = new THREE.PointsMaterial({
        color: new THREE.Color().setHSL(Math.random(), 0.95, 0.65),
        size: 1.8,
        transparent: true,
        opacity: 1
      });

      var points = new THREE.Points(geo, mat);
      scene.add(points);

      fireworkParticleSystems.push({
        points: points,
        geo: geo,
        velocities: velocities,
        life: 1.4,
        maxLife: 1.4
      });
    }

    var totalGemsFound = 0;
    var totalFlowersFound = 0;
    var gemsCounterSpan = document.getElementById('gems-counter-span');
    var flowersCounterSpan = document.getElementById('flowers-counter-span');
    var hotDialogueModal = document.getElementById('hot-dialogue-modal');
    var dModalTitle = document.getElementById('d-modal-title');    var dModalBody = document.getElementById('d-modal-body');
    var dModalWhisper = document.getElementById('d-modal-whisper');
    var dModalCloseBtn = document.getElementById('d-modal-close-btn');

    var journalDrawerView = document.getElementById('journal-drawer-view');
    var journalToggleTrigger = document.getElementById('journal-toggle-trigger');
    var journalCloseTrigger = document.getElementById('journal-close-trigger');
    var journalEntriesWrapper = document.getElementById('journal-entries-wrapper');
    var web3ContractModal = document.getElementById('web3-contract-modal');
    var contractCloseAction = document.getElementById('contract-close-action');

    function toPersianDigits(n) {
      var p = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
      return n.toString().split('').map(function(c) {
        var num = parseInt(c);
        return isNaN(num) ? c : p[num];
      }).join('');
    }

    function renderJournalList() {
      journalEntriesWrapper.innerHTML = '';
      for (var i = 0; i < totalCollectibles.length; i++) {
        var item = totalCollectibles[i];
        var card = document.createElement('div');
        card.className = 'entry-card-item' + (item.collected ? '' : ' locked');
        if (item.collected) {
          if (item.type === 'heart') {
            card.innerHTML = '<strong>' + toPersianDigits(i + 1) + '. ❤️ ' + item.data.title + '</strong><br/>' + item.data.text + '<br/><span style="color:#ffd700;font-size:12.5px;font-style:italic;">' + item.data.whisper + '</span>';
          } else {
            card.innerHTML = '<strong>' + toPersianDigits(i + 1) + '. 🌸 ' + item.data.t + '</strong><br/>' + item.data.b + '<br/><span style="color:#00ffff;font-size:12px;">«عهد ابدی مهراد به نرگس»</span>';
          }
        } else {
          card.innerHTML = '<strong>' + toPersianDigits(i + 1) + '. گوهر قفل‌شده</strong><br/>در میان ۷ جهان بهشتی به جست‌وجو ادامه بده...';
        }
        journalEntriesWrapper.appendChild(card);
      }
    }
    renderJournalList();

    journalToggleTrigger.addEventListener('click', function() {
      renderJournalList();
      journalDrawerView.classList.add('open');
    });
    journalCloseTrigger.addEventListener('click', function() {
      journalDrawerView.classList.remove('open');
    });

    function showHotDialogue(item) {
      if (item.type === 'heart') {
        dModalTitle.innerText = '🔥 ' + item.data.title;
        dModalBody.innerText = item.data.text;
        dModalWhisper.innerText = item.data.whisper;
      } else {
        dModalTitle.innerText = '🌸 ' + item.data.t;
        dModalBody.innerText = item.data.b;
        dModalWhisper.innerText = "«قول مردونه برای ساختن آینده‌مون...»";
      }
      hotDialogueModal.classList.add('visible');
    }
    dModalCloseBtn.addEventListener('click', function() {
      hotDialogueModal.classList.remove('visible');
    });

    function triggerWeb3ProposalCeremony() {
      warpPlayerDirectly(new THREE.Vector3(0, 187, 126));

      var burstCount = 0;
      var interval = setInterval(function() {
        launchFireworkDisplay(
          (Math.random() - 0.5) * 50,
          195 + Math.random() * 25,
          130 + (Math.random() - 0.5) * 50
        );
        burstCount++;
        if (burstCount > 18) {
          clearInterval(interval);
          web3ContractModal.style.display = 'flex';
        }
      }, 350);
    }

    contractCloseAction.addEventListener('click', function() {
      web3ContractModal.style.display = 'none';
      setInterval(function() {
        launchFireworkDisplay(
          (Math.random() - 0.5) * 60,
          190 + Math.random() * 30,
          130 + (Math.random() - 0.5) * 60
        );
      }, 1400);
    });

    document.getElementById('start-game-trigger').addEventListener('click', function() {
      audioCore.init();
      document.getElementById('entry-portal-screen').style.display = 'none';
    });

    /* =========================================================================
       ۱۰. حلقه پردازش انیمیشن و فیزیک سه‌بعدی
       ========================================================================= */
    var playerVelocity = new THREE.Vector3();
    var isPlayerGrounded = false;
    var clock = new THREE.Clock();

    function gameLoopAnimation() {
      requestAnimationFrame(gameLoopAnimation);
      var delta = Math.min(clock.getDelta(), 0.1);
      var time = clock.getElapsedTime();

      // هدایت بازیکن
      var wishDirection = new THREE.Vector3();
      if (Math.hypot(touchMoveVector.x, touchMoveVector.y) > 0.05) {
        var forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngleYaw);
        var right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraAngleYaw);

        wishDirection.addScaledVector(forward, touchMoveVector.y);
        wishDirection.addScaledVector(right, touchMoveVector.x);
        wishDirection.normalize();

        var targetRot = Math.atan2(wishDirection.x, wishDirection.z);
        player.rotation.y = THREE.MathUtils.lerp(player.rotation.y, targetRot, 10 * delta);
      }

      var speed = isFlightActive ? 16.0 : 10.0;
      playerVelocity.x = wishDirection.x * speed;
      playerVelocity.z = wishDirection.z * speed;

      if (isFlightActive) {
        auraRingMesh.rotation.z = time * 3.5;
        auraInnerRingMesh.rotation.z = -time * 4.5;

        if (isHoldingAscend) {
          playerVelocity.y = 9.0;
        } else {
          playerVelocity.y = THREE.MathUtils.lerp(playerVelocity.y, 0, 4 * delta);
        }
      } else {
        playerVelocity.y += -24 * delta;
      }

      var nextPosition = player.position.clone();
      nextPosition.x += playerVelocity.x * delta;
      nextPosition.y += playerVelocity.y * delta;
      nextPosition.z += playerVelocity.z * delta;

      // برخورد با سطوح
      var isFloorDetected = false;
      if (!isFlightActive) {
        for (var c = 0; c < colliders.length; c++) {
          var col = colliders[c];
          var dist2D = Math.hypot(nextPosition.x - col.x, nextPosition.z - col.z);
          if (dist2D < col.radius + 0.35) {
            if (player.position.y >= col.topY - 0.5 && nextPosition.y <= col.topY) {
              nextPosition.y = col.topY;
              playerVelocity.y = 0;
              isFloorDetected = true;
              break;
            }
          }
        }
        isPlayerGrounded = isFloorDetected;
      }

      // سیستم نجات در سقوط
      if (nextPosition.y < -25) {
        audioCore.playRescueHarpSound();
        nextPosition.set(0, 6, 0);
        playerVelocity.set(0, 0, 0);
      }
      player.position.copy(nextPosition);

      // دوربین سوم شخص
      var camDist = 9.5;
      var camHeight = 3.6;
      var targetCamX = player.position.x + Math.sin(cameraAngleYaw) * camDist * Math.cos(cameraAnglePitch);
      var targetCamZ = player.position.z + Math.cos(cameraAngleYaw) * camDist * Math.cos(cameraAnglePitch);
      var targetCamY = player.position.y + camHeight + Math.sin(cameraAnglePitch) * camDist;

      camera.position.lerp(new THREE.Vector3(targetCamX, targetCamY, targetCamZ), 6 * delta);
      camera.lookAt(player.position.x, player.position.y + 1.2, player.position.z);

      // چرخش و تعقیب پروانه‌ها
      for (var pb = 0; pb < butterflies.length; pb++) {
        var bObj = butterflies[pb];
        bObj.angle += bObj.speed;
        bObj.mesh.position.x = player.position.x + Math.cos(bObj.angle) * bObj.radius;
        bObj.mesh.position.z = player.position.z + Math.sin(bObj.angle) * bObj.radius;
        bObj.mesh.position.y = player.position.y + 1.2 + Math.sin(time * 4 + pb) * 0.4;
        bObj.mesh.rotation.y = time * 8;
      }

      // حرکت گلبرگ‌های باران در اطراف بازیکن
      var pArray = petalParticles.geometry.attributes.position.array;
      for (var pt = 1; pt < petalCount * 3; pt += 3) {
        pArray[pt] -= 8.0 * delta;
        if (pArray[pt] < player.position.y - 10) {
          pArray[pt] = player.position.y + 35 + Math.random() * 10;
        }
      }
      petalParticles.geometry.attributes.position.needsUpdate = true;
      petalParticles.position.set(player.position.x, 0, player.position.z);

      // آهنربای عشق برای دریافت ۶۰ آیتم
      for (var k = 0; k < totalCollectibles.length; k++) {
        var item = totalCollectibles[k];
        if (!item.collected) {
          item.mesh.rotation.y = time * 2.5;
          item.mesh.position.y = item.baseY + Math.sin(time * 3 + item.id) * 0.35;
          item.light.position.y = item.mesh.position.y;

          var distToNarges = player.position.distanceTo(item.mesh.position);

          if (distToNarges < 7.5) {
            item.mesh.position.lerp(player.position, 7 * delta);
          }

          if (distToNarges < 2.0) {
            item.collected = true;
            scene.remove(item.mesh);
            scene.remove(item.light);

            if (item.type === 'heart') {
              totalGemsFound++;
              gemsCounterSpan.innerText = toPersianDigits(totalGemsFound);
            } else {
              totalFlowersFound++;
              flowersCounterSpan.innerText = toPersianDigits(totalFlowersFound);
            }

            audioCore.playPickupNote();
            launchFireworkDisplay(item.mesh.position.x, item.mesh.position.y + 1, item.mesh.position.z);
            showHotDialogue(item);
            renderJournalList();

            if (totalGemsFound >= 30 && totalFlowersFound >= 30) {
              triggerWeb3ProposalCeremony();
            }
          }
        }
      }

      // انیمیشن محراب
      centralGiantHeart.rotation.y = time * 0.8;
      diamondMesh.rotation.y = time * 1.5;
      diamondMesh.position.y = 5.2 + Math.sin(time * 2.2) * 0.25;

      // انیمیشن ذرات آتش‌بازی
      for (var f = fireworkParticleSystems.length - 1; f >= 0; f--) {
        var fw = fireworkParticleSystems[f];
        fw.life -= delta;
        var pArr = fw.geo.attributes.position.array;

        for (var vi = 0; vi < fw.velocities.length; vi++) {
          pArr[vi * 3] += fw.velocities[vi].x * delta;
          pArr[vi * 3 + 1] += fw.velocities[vi].y * delta;
          pArr[vi * 3 + 2] += fw.velocities[vi].z * delta;
          fw.velocities[vi].y -= 4.8 * delta;
        }
        fw.geo.attributes.position.needsUpdate = true;
        fw.points.material.opacity = fw.life / fw.maxLife;

        if (fw.life <= 0) {
          scene.remove(fw.points);
          fw.geo.dispose();
          fw.points.material.dispose();
          fireworkParticleSystems.splice(f, 1);
        }
      }

      renderer.render(scene, camera);
    }

    window.addEventListener('resize', function() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    gameLoopAnimation();
/* ============================================================================
   ۱۱. ULTRA V2 ENGINE — سیستم پیشرفت، مأموریت، مبارزه، حافظه و ذخیره‌سازی
   Designed specifically around the existing 7-realm / 60-collectible core.
   ============================================================================ */
(function UltraEternalGalaxy() {
  'use strict';

  var U = window.__ETERNAL_GALAXY_ULTRA__ = window.__ETERNAL_GALAXY_ULTRA__ || {};
  U.version = '2.0.0-ULTRA';
  U.startedAt = Date.now();
  U.saveKey = 'eternal-galaxy-mehrad-narges-ultra-v2';
  U.settingsKey = 'eternal-galaxy-mehrad-narges-ultra-settings';
  U.frame = 0;
  U.elapsed = 0;
  U.lastSave = 0;
  U.lastHud = 0;
  U.lastMap = 0;
  U.dayClock = 0;
  U.eventClock = 0;
  U.worldIndex = 0;
  U.currentWeather = 'starlight';
  U.performanceLevel = 'high';

  function byId(id) { return document.getElementById(id); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a,b,t) { return a + (b-a)*t; }
  function dist3(a,b) { return Math.sqrt((a.x-b.x)*(a.x-b.x) + (a.y-b.y)*(a.y-b.y) + (a.z-b.z)*(a.z-b.z)); }
  function pct(a,b) { return b <= 0 ? 0 : clamp((a/b)*100,0,100); }
  function nowISO() { return new Date().toISOString(); }
  function pnum(n) { return typeof toPersianDigits === 'function' ? toPersianDigits(Math.round(n)) : String(Math.round(n)); }
  function safeJSONParse(text, fallback) { try { return JSON.parse(text); } catch(e) { return fallback; } }
  function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function notify(text, kind, ttl) {
    var stack = byId('ultra-toast-stack');
    if (!stack) return;
    var node = document.createElement('div');
    node.className = 'ultra-toast' + (kind ? ' ' + kind : '');
    node.textContent = text;
    stack.appendChild(node);
    setTimeout(function(){ if (node.parentNode) node.parentNode.removeChild(node); }, ttl || 3200);
  }
  function closeOverlay(id) { var x=byId(id); if(x) x.classList.remove('open'); }
  function openOverlay(id) { var x=byId(id); if(x) x.classList.add('open'); }

  U.profile = {
    name: 'مهراد',
    partner: 'نرگس',
    level: 1,
    xp: 0,
    skillPoints: 0,
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    mana: 100,
    maxMana: 100,
    coins: 250,
    essence: 0,
    shards: 0,
    totalPlaySeconds: 0,
    enemiesDefeated: 0,
    bossDefeated: false,
    dashes: 0,
    attacks: 0,
    pulses: 0,
    memories: [],
    discoveredRealms: [0],
    crafted: 0,
    distance: 0,
    bestCombo: 0,
    combo: 0,
    comboTimer: 0,
    consecutiveHits: 0,
    worldVisits: {},
    inventory: {
      starDust: 0,
      moonShard: 0,
      roseCrystal: 0,
      promiseSeed: 0,
      eternalKey: 0,
      skyFeather: 0,
      memoryInk: 0,
      astralCore: 0,
      nectar: 0,
      prism: 0
    },
    skills: {
      heartForce: 0,
      astralArmor: 0,
      swiftWings: 0,
      deepMana: 0,
      resonance: 0,
      luckyPath: 0,
      celestialPulse: 0,
      guardianBond: 0,
      eternalStep: 0
    },
    collected: [],
    achievements: {},
    quests: {},
    unlockedRecipes: ['heart_potion','star_lens','promise_seed'],
    settings: {
      quality: 'auto',
      particles: true,
      weather: true,
      damageNumbers: true,
      adaptiveResolution: true,
      sound: true,
      haptics: true,
      minimap: true
    }
  };

  U.worlds = [
    {id:0,name:'باغ دیدار',emoji:'🌸',center:{x:0,y:4,z:0},weather:'petals',color:'#ff7cac',lore:'جایی که هر سفر از آن شروع می‌شود؛ باغی برای اولین نگاه و اولین عهد.'},
    {id:1,name:'اقیانوس صبر',emoji:'☁️',center:{x:-80,y:29,z:60},weather:'mist',color:'#8eeaff',lore:'جزیره‌ای میان مه و نور که پاداشش برای کسانی است که عجله نمی‌کنند.'},
    {id:2,name:'کهکشان نرگس',emoji:'🌌',center:{x:90,y:53,z:-90},weather:'aurora',color:'#b18cff',lore:'قلمروی بلورین که خاطرات روشن در آن به ستاره تبدیل می‌شوند.'},
    {id:3,name:'پاییز دلتنگی',emoji:'🍂',center:{x:120,y:80,z:40},weather:'leaves',color:'#ff9d5c',lore:'رنگ‌های گرم، صدای برگ‌ها و قصه لحظه‌هایی که دوری را پشت سر گذاشتند.'},
    {id:4,name:'شهر آینده',emoji:'🏙️',center:{x:-60,y:110,z:-120},weather:'neon',color:'#5fe1ff',lore:'شهری بر فراز ابرها؛ جایی که آینده و رویاهای بزرگ به معماری تبدیل می‌شوند.'},
    {id:5,name:'قله بلورین',emoji:'💎',center:{x:-140,y:145,z:-40},weather:'crystal',color:'#7de8ff',lore:'بلندترین قله؛ هر قدم در آن باید با کنترل انرژی و مهارت برداشته شود.'},
    {id:6,name:'معبد وصال',emoji:'🏛️',center:{x:0,y:186,z:130},weather:'eternal',color:'#ffd76a',lore:'نقطه پایانی مسیر اصلی؛ اما در نسخه ULTRA پایان نیست، آغاز لایه دوم بازی است.'}
  ];

  U.weatherProfiles = {
    petals:{fog:0x170721,density:0.006,light:1.15,petalRate:1.0},
    mist:{fog:0x08142b,density:0.012,light:0.82,petalRate:0.15},
    aurora:{fog:0x160c2d,density:0.0045,light:1.28,petalRate:0.22},
    leaves:{fog:0x2b1208,density:0.007,light:0.95,petalRate:0.7},
    neon:{fog:0x071225,density:0.004,light:1.2,petalRate:0.28},
    crystal:{fog:0x071b26,density:0.006,light:1.08,petalRate:0.08},
    eternal:{fog:0x27001d,density:0.0035,light:1.45,petalRate:0.35}
  };

  U.loreCards = [
    ['آغاز','در این جهان، هر گوهر یک خاطره و هر قدم بخشی از مسیر است.'],
    ['هفت جهان','هفت قلمرو با حال‌وهوای متفاوت ساخته شده‌اند تا سفر فقط یک مسیر خطی نباشد.'],
    ['حافظه','هر رویداد مهم در دفتر حافظه ذخیره می‌شود و بخشی از Codex را باز می‌کند.'],
    ['وصال','جمع‌آوری ۶۰ گنج فعلی هنوز پایان اصلی را فعال می‌کند؛ ULTRA یک لایه ادامه‌دار روی آن می‌سازد.'],
    ['پیمان','چالش‌های آینده، صبر، کشف، مبارزه و مهارت را در یک ساختار مشترک جمع می‌کنند.'],
    ['نگهبان','دشمنان جدید از «سایه‌های فراموشی» ساخته شده‌اند و با پیشرفت بازیکن فعال‌تر می‌شوند.'],
    ['قله','در قله بلورین، تمرکز مانا و توانایی‌های حرکتی ارزش بیشتری دارند.'],
    ['معبد','پس از ورود به معبد، یک باس و یک چرخه مأموریت ثانویه باز می‌شود.']
  ];

  U.recipes = {
    heart_potion:{name:'معجون قلب',emoji:'❤️',cost:{essence:25,roseCrystal:1},gives:{health:35}},
    star_lens:{name:'عدسی ستاره‌ای',emoji:'🔭',cost:{starDust:20,moonShard:2},gives:{coins:120}},
    promise_seed:{name:'بذر پیمان',emoji:'🌱',cost:{promiseSeed:2,nectar:3},gives:{xp:160}},
    astral_core:{name:'هسته اختری',emoji:'🔷',cost:{astralCore:2,prism:3,memoryInk:2},gives:{shards:5}},
    eternal_token:{name:'نشان ابدیت',emoji:'👑',cost:{shards:3,eternalKey:1,roseCrystal:4},gives:{coins:600,xp:300}}
  };

  U.skillData = [
    {id:'heartForce',name:'نیروی قلب',emoji:'❤️',max:5,desc:'آسیب ضربه مستقیم را افزایش می‌دهد.',cost:function(l){return 1+l;}},
    {id:'astralArmor',name:'زره اختری',emoji:'🛡️',max:5,desc:'آسیب دریافتی را کاهش می‌دهد.',cost:function(l){return 1+l;}},
    {id:'swiftWings',name:'بال‌های تند',emoji:'🪽',max:5,desc:'سرعت حرکت و جهش افزایش می‌یابد.',cost:function(l){return 1+l;}},
    {id:'deepMana',name:'چشمه مانا',emoji:'🔷',max:5,desc:'ظرفیت مانا و بازسازی آن بیشتر می‌شود.',cost:function(l){return 1+l;}},
    {id:'resonance',name:'رزونانس',emoji:'🎵',max:5,desc:'ضربه‌های متوالی XP و کمبو بیشتری می‌سازند.',cost:function(l){return 1+l;}},
    {id:'luckyPath',name:'مسیر بخت',emoji:'🍀',max:5,desc:'شانس افت آیتم‌های نادر را افزایش می‌دهد.',cost:function(l){return 1+l;}},
    {id:'celestialPulse',name:'پالس آسمانی',emoji:'☄️',max:5,desc:'قدرت پالس منطقه‌ای را بالا می‌برد.',cost:function(l){return 1+l;}},
    {id:'guardianBond',name:'پیوند نگهبان',emoji:'🦋',max:5,desc:'پروانه‌ها دشمنان ضعیف را برای لحظه‌ای کند می‌کنند.',cost:function(l){return 1+l;}},
    {id:'eternalStep',name:'گام ابدیت',emoji:'✨',max:5,desc:'هزینه و زمان بازیابی جهش کاهش پیدا می‌کند.',cost:function(l){return 1+l;}}
  ];

  U.questData = [
    {id:'first_heart',title:'اولین جرقه',desc:'اولین قلب تمنا را پیدا کن.',target:1,kind:'hearts',xp:100,coins:60},
    {id:'collector_10',title:'گردآورنده',desc:'۱۰ گوهر از ۶۰ گنج اولیه جمع کن.',target:10,kind:'collectibles',xp:220,coins:120},
    {id:'collector_30',title:'قلب کهکشان',desc:'۳۰ قلب تمنا را کامل کن.',target:30,kind:'gems',xp:550,coins:250},
    {id:'promise_30',title:'باغ پیمان',desc:'۳۰ گل پیمان را کامل کن.',target:30,kind:'flowers',xp:550,coins:250},
    {id:'wanderer',title:'هفت جهان',desc:'به هر ۷ جهان سفر کن.',target:7,kind:'worlds',xp:450,coins:300},
    {id:'distance',title:'مسافر ستاره‌ای',desc:'در جهان‌ها مسافت طولانی طی کن.',target:2500,kind:'distance',xp:500,coins:250},
    {id:'combo10',title:'ضرب‌آهنگ',desc:'کمبو را به ۱۰ برسان.',target:10,kind:'bestCombo',xp:260,coins:160},
    {id:'defeat10',title:'شکارچی سایه',desc:'۱۰ دشمن را شکست بده.',target:10,kind:'defeated',xp:420,coins:220},
    {id:'craft3',title:'کیمیاگر خاطره',desc:'۳ آیتم بساز.',target:3,kind:'crafted',xp:320,coins:180},
    {id:'skill5',title:'استاد مسیر',desc:'حداقل ۵ امتیاز مهارت خرج کن.',target:5,kind:'skillsSpent',xp:330,coins:200},
    {id:'boss',title:'فراتر از پایان',desc:'نگهبان فراموشی را شکست بده.',target:1,kind:'boss',xp:1500,coins:1000},
    {id:'eternal',title:'نشان ابدیت',desc:'نشان ابدیت را بساز.',target:1,kind:'eternalToken',xp:2200,coins:1800}
  ];

  U.achievementData = [
    ['seed','🌱','شروع سفر','ورود به کهکشان'],
    ['heart1','❤️','اولین تپش','اولین قلب را بگیر'],
    ['heart15','💗','نیمه راه','۱۵ قلب جمع کن'],
    ['heart30','💖','قلب‌افزار','همه ۳۰ قلب را جمع کن'],
    ['flower15','🌸','گل‌افزار','۱۵ گل جمع کن'],
    ['flower30','🌺','باغبان ابدیت','همه ۳۰ گل را جمع کن'],
    ['realm2','🌌','دومین جهان','جهان دوم را کشف کن'],
    ['realm7','🏛️','معبدگشا','معبد را ببین'],
    ['explorer','🧭','کاوشگر','به هر هفت جهان سر بزن'],
    ['fighter1','⚔️','اولین پیروزی','اولین دشمن را شکست بده'],
    ['fighter25','🔥','شکارچی سایه','۲۵ دشمن را شکست بده'],
    ['fighter100','👑','فرمانروای میدان','۱۰۰ دشمن را شکست بده'],
    ['combo5','🎼','ریتم‌ساز','کمبو ۵'],
    ['combo15','🎵','هارمونی جنگ','کمبو ۱۵'],
    ['combo30','🎶','کنسرت ستاره‌ای','کمبو ۳۰'],
    ['crafter1','🔧','کیمیاگر','اولین ساخت'],
    ['crafter10','🛠️','معمار خاطره','۱۰ ساخت'],
    ['skill1','✨','جرقه مهارت','اولین مهارت'],
    ['skill10','⚡','هسته توان','۱۰ ارتقای مهارت'],
    ['boss','🐉','نگهبان‌شکن','باس را شکست بده'],
    ['memory10','📖','آرشیودار','۱۰ حافظه ثبت کن'],
    ['coins1000','💰','ثروت ستاره‌ای','۱۰۰۰ سکه'],
    ['fast','🏃','حرکت نور','یک جهان را با جهش و سرعت پشت سر بگذار'],
    ['survivor','🛡️','بی‌فروپاشی','باس را با جان بالاتر از ۳۰٪ شکست بده'],
    ['ultra','🌠','ULTRA','لایه دوم بازی را باز کن'],
    ['codex','📚','کتاب‌خوان آسمانی','همه مدخل‌های Codex را باز کن'],
    ['daily','☀️','مسافر روزانه','چالش روزانه را کامل کن'],
    ['secret','🔮','رازدار','اوراکل حافظه را پیدا و فعال کن'],
    ['eternal','👑','نشان ابدیت','نشان ابدیت را بساز']
  ];

  U.codexUnlocks = new Array(U.loreCards.length).fill(false);
  U.daily = {index:0,title:'مسیر تازه',desc:'۵ دشمن را شکست بده و ۲ گوهر پیدا کن.',target:7,progress:0,rewardXP:180,rewardCoins:120,done:false};

  addEventListeners();
  function addEventListeners() {
    ['ultra-inventory-btn','ultra-quest-btn','ultra-skill-btn','ultra-achievement-btn','ultra-settings-btn','ultra-save-btn'].forEach(function(id){
      var el=byId(id); if(!el) return;
      el.addEventListener('click', function(){
        if(id==='ultra-inventory-btn') { renderInventory(); openOverlay('ultra-inventory-modal'); }
        if(id==='ultra-quest-btn') { renderQuests(); openOverlay('ultra-quest-modal'); }
        if(id==='ultra-skill-btn') { renderSkills(); openOverlay('ultra-skill-modal'); }
        if(id==='ultra-achievement-btn') { renderAchievements(); openOverlay('ultra-achievement-modal'); }
        if(id==='ultra-settings-btn') { renderSettings(); openOverlay('ultra-settings-modal'); }
        if(id==='ultra-save-btn') saveGame(true);
      });
    });
    document.querySelectorAll('[data-close]').forEach(function(btn){ btn.addEventListener('click',function(){ closeOverlay(btn.getAttribute('data-close')); }); });
    var memoryBtn=byId('ultra-memory-btn'); if(memoryBtn) memoryBtn.addEventListener('click',function(){U.openMemoryTimeline();});
    byId('ultra-quest-panel').addEventListener('click',function(){ renderQuests(); openOverlay('ultra-quest-modal'); });
    byId('ultra-attack-btn').addEventListener('click', playerAttack);
    byId('ultra-pulse-btn').addEventListener('click', playerPulse);
    byId('ultra-heal-btn').addEventListener('click', playerHeal);
    byId('ultra-dash-btn').addEventListener('click', playerDash);
    byId('ultra-interact-btn').addEventListener('click', interact);

    window.addEventListener('keydown', function(e){
      if(e.target && (e.target.tagName==='INPUT' || e.target.tagName==='TEXTAREA')) return;
      if(e.key===' '){ e.preventDefault(); playerAttack(); }
      if(e.key.toLowerCase()==='q') playerPulse();
      if(e.key.toLowerCase()==='r') playerHeal();
      if(e.key.toLowerCase()==='shift') playerDash();
      if(e.key.toLowerCase()==='e') interact();
      if(e.key==='i') { renderInventory(); openOverlay('ultra-inventory-modal'); }
      if(e.key==='m') { renderQuests(); openOverlay('ultra-quest-modal'); }
      if(e.key==='k') { renderSkills(); openOverlay('ultra-skill-modal'); }
      if(e.key==='o') { renderAchievements(); openOverlay('ultra-achievement-modal'); }
      if(e.key==='F5') { e.preventDefault(); saveGame(true); }
      if(e.key.toLowerCase()==='c') { renderCodex(); openOverlay('ultra-codex-modal'); }
    });

    window.addEventListener('beforeunload', function(){ saveGame(false); });
  }

  function bindDesktopMovement() {
    var keys={w:false,a:false,s:false,d:false};
    window.addEventListener('keydown',function(e){
      var k=e.key.toLowerCase();
      if(k==='w'||k==='arrowup') keys.w=true;
      if(k==='a'||k==='arrowleft') keys.a=true;
      if(k==='s'||k==='arrowdown') keys.s=true;
      if(k==='d'||k==='arrowright') keys.d=true;
      if(['arrowup','arrowdown','arrowleft','arrowright',' '].indexOf(k)>=0) e.preventDefault();
    });
    window.addEventListener('keyup',function(e){
      var k=e.key.toLowerCase();
      if(k==='w'||k==='arrowup') keys.w=false;
      if(k==='a'||k==='arrowleft') keys.a=false;
      if(k==='s'||k==='arrowdown') keys.s=false;
      if(k==='d'||k==='arrowright') keys.d=false;
    });
    U.keys=keys;
  }

  bindDesktopMovement();

  function initProfileFromLegacy() {
    U.profile.collected=[];
    for(var i=0;i<totalCollectibles.length;i++) if(totalCollectibles[i].collected) U.profile.collected.push(i);
    U.profile.health=U.profile.maxHealth;
    U.profile.stamina=U.profile.maxStamina;
    U.profile.mana=U.profile.maxMana;
    syncLegacyCounters();
  }

  function syncLegacyCounters() {
    var g=0,f=0;
    for(var i=0;i<totalCollectibles.length;i++) if(totalCollectibles[i].collected){ if(totalCollectibles[i].type==='heart')g++; else f++; }
    totalGemsFound=g; totalFlowersFound=f;
    if(gemsCounterSpan) gemsCounterSpan.innerText=pnum(g);
    if(flowersCounterSpan) flowersCounterSpan.innerText=pnum(f);
  }

  function currentWorld() {
    if(!player) return U.worlds[0];
    var best=U.worlds[0], bestD=Infinity;
    for(var i=0;i<U.worlds.length;i++){
      var w=U.worlds[i];
      var d=Math.hypot(player.position.x-w.center.x,player.position.y-w.center.y,player.position.z-w.center.z);
      if(d<bestD){best=w;bestD=d;U.worldIndex=w.id;}
    }
    return best;
  }

  function worldSurfaceIndex() {
    var w=currentWorld();
    return w ? w.id : 0;
  }

  function updateWorldVisit() {
    var idx=worldSurfaceIndex();
    U.profile.worldVisits[idx]=(U.profile.worldVisits[idx]||0)+1;
    if(U.profile.discoveredRealms.indexOf(idx)<0){
      U.profile.discoveredRealms.push(idx);
      unlockCodex(idx);
      grantXP(110,'کشف جهان جدید');
      notify(U.worlds[idx].emoji+' جهان جدید کشف شد: '+U.worlds[idx].name,'cyan');
    }
  }

  function unlockCodex(idx) {
    U.codexUnlocks[idx]=true;
    if(U.codexUnlocks.filter(Boolean).length>=U.codexUnlocks.length) unlockAchievement('codex');
  }

  function memory(text, category) {
    var item={time:nowISO(),text:text,category:category||'journey',world:currentWorld().name};
    U.profile.memories.push(item);
    if(U.profile.memories.length>80) U.profile.memories.shift();
    if(U.profile.memories.length===10) unlockAchievement('memory10');
    var chip=byId('ultra-memory-chip'); if(chip) chip.textContent='حافظه جهان: '+text;
  }

  function xpNeed(level) { return 100 + Math.floor(Math.pow(level,1.4)*45); }

  function grantXP(amount, reason) {
    var mult=1+U.profile.skills.resonance*0.035;
    var value=Math.max(1,Math.round(amount*mult));
    U.profile.xp += value;
    U.profile.lastReward = reason ? {xp:value,reason:reason,time:nowISO()} : U.profile.lastReward;
    var guard=0;
    while(U.profile.xp>=xpNeed(U.profile.level) && guard<30){
      U.profile.xp-=xpNeed(U.profile.level);
      U.profile.level++;
      U.profile.skillPoints+=1;
      U.profile.maxHealth+=6;
      U.profile.maxStamina+=4;
      U.profile.maxMana+=7;
      U.profile.health=U.profile.maxHealth;
      U.profile.stamina=U.profile.maxStamina;
      U.profile.mana=U.profile.maxMana;
      notify('✨ سطح '+pnum(U.profile.level)+' باز شد — یک امتیاز مهارت گرفتی!','gold',4200);
      unlockAchievement('seed');
      guard++;
    }
  }

  function damagePlayer(raw, source) {
    var reduction=U.profile.skills.astralArmor*0.045;
    var finalDamage=Math.max(1,raw*(1-reduction));
    U.profile.health=clamp(U.profile.health-finalDamage,0,U.profile.maxHealth);
    U.profile.combo=0; U.profile.comboTimer=0;
    if(U.profile.health<=0){
      U.profile.health=U.profile.maxHealth*0.55;
      player.position.set(0,6,0);
      playerVelocity.set(0,0,0);
      notify('💫 قلبت شکست نخورد؛ جهان تو را به باغ دیدار بازگرداند.','cyan',4200);
      memory('پس از سقوط، مسیر از نو آغاز شد.','rescue');
    } else if(source){ notify('💥 '+source+' — '+pnum(finalDamage)+' آسیب','',2200); }
  }

  function restorePlayer(amount) {
    var before=U.profile.health;
    U.profile.health=clamp(U.profile.health+amount,0,U.profile.maxHealth);
    return U.profile.health-before;
  }

  function playerAttack() {
    if(!player) return;
    U.profile.attacks++;
    var radius=5.8+U.profile.skills.heartForce*0.25;
    var base=24*(1+U.profile.skills.heartForce*0.12);
    var hit=0;
    for(var i=enemies.length-1;i>=0;i--){
      var e=enemies[i]; if(!e.alive) continue;
      var d=dist3(player.position,e.group.position);
      if(d<=radius){ damageEnemy(e,base*(1+Math.min(U.profile.combo,15)*0.018)); hit++; }
    }
    if(U.boss && U.boss.alive && dist3(player.position,U.boss.group.position)<10){ damageBoss(base*1.45); hit++; }
    if(hit>0){
      U.profile.consecutiveHits++;
      U.profile.combo=Math.min(99,U.profile.combo+hit);
      U.profile.comboTimer=2.8;
      U.profile.bestCombo=Math.max(U.profile.bestCombo,U.profile.combo);
      grantXP(8+hit*4,'ضربه موفق');
      if(U.profile.combo>=5) unlockAchievement('combo5');
      if(U.profile.combo>=15) unlockAchievement('combo15');
      if(U.profile.combo>=30) unlockAchievement('combo30');
      if(U.profile.combo>=10 && !U.profile.quests.combo10) progressQuestKind('bestCombo',U.profile.combo);
      pulseEffect(player.position,0xff4fbe,1.2,0.22);
      playCombatTone('hit');
    } else playCombatTone('miss');
  }

  function playerPulse() {
    if(U.profile.mana<25) { notify('🔷 مانا کافی نیست.','',1800); return; }
    U.profile.mana-=25;
    U.profile.pulses++;
    var radius=14+U.profile.skills.celestialPulse*1.4;
    var power=45*(1+U.profile.skills.celestialPulse*0.13);
    var hits=0;
    for(var i=enemies.length-1;i>=0;i--){
      var e=enemies[i]; if(!e.alive) continue;
      if(dist3(player.position,e.group.position)<radius){ damageEnemy(e,power); e.stun=1.4; hits++; }
    }
    if(U.boss && U.boss.alive && dist3(player.position,U.boss.group.position)<radius*1.15){ damageBoss(power*1.15); }
    grantXP(12+hits*8,'پالس آسمانی');
    pulseEffect(player.position,0x74e6ff,radius,0.65);
    playCombatTone('pulse');
  }

  function playerHeal() {
    if(U.profile.mana<18) { notify('🔷 برای ترمیم، مانا کم است.','',1800); return; }
    U.profile.mana-=18;
    var got=restorePlayer(28+U.profile.skills.deepMana*4);
    if(got>0) notify('💚 '+pnum(got)+' جان ترمیم شد.','cyan',1800); else notify('❤️ جانت کامل است.','',1600);
    playCombatTone('heal');
  }

  function playerDash() {
    var cost=Math.max(15,24-U.profile.skills.eternalStep*2);
    if(U.profile.stamina<cost){ notify('⚡ توان کافی برای جهش نیست.','',1800); return; }
    U.profile.stamina-=cost; U.profile.dashes++;
    var dir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(0,1,0),cameraAngleYaw);
    if(U.keys && (U.keys.w||U.keys.a||U.keys.s||U.keys.d)){
      var x=(U.keys.d?1:0)-(U.keys.a?1:0), y=(U.keys.w?1:0)-(U.keys.s?1:0);
      var v=new THREE.Vector3(x,0,y);
      if(v.lengthSq()>0){v.normalize(); dir.copy(new THREE.Vector3(v.x,0,-v.z).applyAxisAngle(new THREE.Vector3(0,1,0),cameraAngleYaw));}
    }
    player.position.addScaledVector(dir,11+U.profile.skills.swiftWings*0.85);
    playerVelocity.y=Math.max(playerVelocity.y,2.5);
    pulseEffect(player.position,0xffd76a,2.0,0.38);
    grantXP(6,'جهش');
  }

  function interact() {
    if(U.oracle && U.oracle.group && dist3(player.position,U.oracle.group.position)<10){
      oracleSpeak();
      return;
    }
    if(U.boss && U.boss.alive && dist3(player.position,U.boss.group.position)<14){ notify('🐉 «من حافظه‌های فراموش‌شده‌ام؛ اگر می‌خواهی از اینجا عبور کنی، مرا شکست بده.»','gold',4800); return; }
    var nearest=null, nd=Infinity;
    for(var i=0;i<totalCollectibles.length;i++){
      var item=totalCollectibles[i]; if(item.collected) continue;
      var d=dist3(player.position,item.mesh.position); if(d<nd){nd=d;nearest=item;}
    }
    if(nearest && nd<8){ nearest.mesh.position.lerp(player.position,0.8); notify('🧲 جاذبه خاطره فعال شد.','cyan',1200); }
    else notify('✦ هیچ تعامل مهمی در این نزدیکی نیست.','',1500);
  }

  function playCombatTone(kind){
    try{
      if(!U.profile.settings.sound || !audioCore || !audioCore.ctx) return;
      var c=audioCore.ctx, g=c.createGain(), o=c.createOscillator(), now=c.currentTime;
      var freq={hit:420,miss:150,pulse:230,heal:660}[kind]||300;
      o.type=kind==='pulse'?'sawtooth':'triangle'; o.frequency.setValueAtTime(freq,now);
      if(kind==='hit') o.frequency.exponentialRampToValueAtTime(freq*1.8,now+0.09);
      if(kind==='heal') o.frequency.exponentialRampToValueAtTime(freq*1.35,now+0.16);
      g.gain.setValueAtTime(0.0001,now); g.gain.exponentialRampToValueAtTime(0.08,now+0.015); g.gain.exponentialRampToValueAtTime(0.0001,now+0.22);
      o.connect(g); g.connect(audioCore.masterGain); o.start(now); o.stop(now+0.24);
    }catch(e){}
  }
  U.fx=[];
  function pulseEffect(pos,color,size,duration){
    var geo=new THREE.TorusGeometry(Math.max(.2,size*.28),Math.max(.03,size*.02),8,42);
    var mat=new THREE.MeshBasicMaterial({color:color,transparent:true,opacity:.72,side:THREE.DoubleSide});
    var mesh=new THREE.Mesh(geo,mat); mesh.position.copy(pos); mesh.rotation.x=Math.PI/2; scene.add(mesh);
    U.fx.push({mesh:mesh,age:0,duration:duration,start:size*.25,end:size});
  }
  function sparkBurst(pos,color,count){
    if(U.profile.settings.particles===false) return;
    var n=count||18, geo=new THREE.BufferGeometry(), arr=new Float32Array(n*3), vel=[];
    for(var i=0;i<n;i++){
      arr[i*3]=pos.x; arr[i*3+1]=pos.y; arr[i*3+2]=pos.z;
      vel.push(new THREE.Vector3((Math.random()-.5)*5,Math.random()*5,(Math.random()-.5)*5));
    }
    geo.setAttribute('position',new THREE.BufferAttribute(arr,3));
    var mat=new THREE.PointsMaterial({color:color||0xff66b6,size:0.7,transparent:true,opacity:.85});
    var pts=new THREE.Points(geo,mat); scene.add(pts); U.fx.push({points:pts,age:0,duration:1.0,vel:vel});
  }

  function createEnemyMesh(type){
    var g=new THREE.Group();
    var palette={wisp:0x9c5cff,sentinel:0x62ecff,reaver:0xff426c,bloom:0xffd76a}[type]||0xff4fa3;
    var core=new THREE.Mesh(new THREE.IcosahedronGeometry(type==='sentinel'?0.9:0.72,type==='reaver'?1:0),new THREE.MeshStandardMaterial({color:palette,emissive:palette,emissiveIntensity:.65,metalness:.35,roughness:.25}));
    core.castShadow=true; g.add(core);
    var ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,.07,8,24),new THREE.MeshBasicMaterial({color:palette,transparent:true,opacity:.75}));
    ring.rotation.x=Math.PI/2; g.add(ring);
    if(type==='sentinel'){
      var beam=new THREE.Mesh(new THREE.CylinderGeometry(.08,.08,2.8,8),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.6}));
      beam.rotation.z=Math.PI/2; g.add(beam);
    }
    return {group:g,core:core,ring:ring};
  }

  var enemies=[];
  var enemyIdSeq=1;
  var enemySpawnTimer=0;
  var enemyMax=14;

  var enemySpecs={
    wisp:{name:'سایه نجوا',hp:55,speed:4.3,damage:8,range:2.4,xp:32,drop:'starDust'},
    sentinel:{name:'نگهبان بلور',hp:95,speed:2.8,damage:13,range:3.0,xp:52,drop:'moonShard'},
    reaver:{name:'دزد قلب',hp:135,speed:3.5,damage:18,range:3.3,xp:76,drop:'roseCrystal'},
    bloom:{name:'شکوفه فراموشی',hp:180,speed:2.1,damage:22,range:3.6,xp:95,drop:'memoryInk'}
  };

  function spawnEnemy(type,pos,force){
    if(enemies.filter(function(e){return e.alive;}).length>=enemyMax && !force) return null;
    type=type||randomChoice(['wisp','wisp','sentinel','reaver']);
    var spec=enemySpecs[type]; var parts=createEnemyMesh(type);    parts.group.position.copy(pos); scene.add(parts.group);
    var enemy={id:enemyIdSeq++,type:type,spec:spec,group:parts.group,core:parts.core,ring:parts.ring,hp:spec.hp,maxHp:spec.hp,alive:true,state:'idle',attackCd:0,stun:0,wander:Math.random()*6.28,seed:Math.random()*1000,hitFlash:0};
    enemies.push(enemy); return enemy;
  }

  function spawnEnemiesNearPlayer(force){
    if(!player) return;
    var alive=enemies.filter(function(e){return e.alive;}).length;
    if(alive>enemyMax*.7 && !force) return;
    var count=force?4:Math.max(0,Math.min(3,enemyMax-alive));
    var base=player.position;
    for(var i=0;i<count;i++){
      var ang=Math.random()*Math.PI*2, rad=18+Math.random()*20;
      var y=base.y+Math.sin(ang+i)*2;
      var pos=new THREE.Vector3(base.x+Math.cos(ang)*rad,y,base.z+Math.sin(ang)*rad);
      var t=U.worldIndex>=5&&Math.random()<.45?'sentinel':(U.worldIndex>=3&&Math.random()<.32?'reaver':'wisp');
      spawnEnemy(t,pos,false);
    }
  }

  function removeEnemy(enemy){
    if(!enemy || !enemy.alive) return;
    enemy.alive=false; scene.remove(enemy.group);
  }

  function damageEnemy(enemy,amount){
    if(!enemy || !enemy.alive) return;
    enemy.hp-=amount; enemy.hitFlash=.16; enemy.state='chase';
    if(U.profile.settings.damageNumbers) floatingNumber(enemy.group.position,Math.round(amount));
    if(enemy.hp<=0) defeatEnemy(enemy);
  }

  function defeatEnemy(enemy){
    if(!enemy.alive) return;
    enemy.alive=false; scene.remove(enemy.group);
    U.profile.enemiesDefeated++;
    U.profile.comboTimer=2.8;
    U.profile.combo=Math.min(99,U.profile.combo+1);
    U.profile.bestCombo=Math.max(U.profile.bestCombo,U.profile.combo);
    var xp=enemy.spec.xp + Math.round(U.profile.combo*2);
    grantXP(xp,enemy.spec.name);
    U.profile.coins += 12 + Math.floor(Math.random()*18);
    U.profile.essence += 3 + Math.floor(Math.random()*4);
    addDrop(enemy);
    sparkBurst(enemy.group.position,enemy.type==='reaver'?0xff5078:0x70e6ff,22);
    unlockAchievement('fighter1');
    if(U.profile.enemiesDefeated>=25) unlockAchievement('fighter25');
    if(U.profile.enemiesDefeated>=100) unlockAchievement('fighter100');
    progressQuestKind('defeated',U.profile.enemiesDefeated);
    progressQuestKind('bestCombo',U.profile.bestCombo);
    progressDaily(1);
    memory('یک '+enemy.spec.name+' شکست خورد.','combat');
  }

  function addDrop(enemy){
    var roll=Math.random(), luck=U.profile.skills.luckyPath*.035;
    var item=enemy.spec.drop;
    if(roll<.12+luck) item=randomChoice(['astralCore','prism','skyFeather','memoryInk']);
    if(U.profile.inventory[item]===undefined) U.profile.inventory[item]=0;
    U.profile.inventory[item]++;
    if(item==='moonShard') notify('🌙 قطعه ماه پیدا شد.','cyan',1700);
    if(item==='roseCrystal') notify('🌹 کریستال رز پیدا شد.','gold',1700);
  }

  function floatingNumber(pos,value){
    var div=document.createElement('div');
    div.style.position='fixed'; div.style.zIndex='920'; div.style.pointerEvents='none'; div.style.color='#fff'; div.style.fontWeight='900'; div.style.textShadow='0 2px 10px #000';
    div.style.fontSize='13px'; div.textContent='-'+value;
    document.body.appendChild(div);
    var start=performance.now();
    function step(t){
      if(!div.parentNode) return;
      var a=Math.min(1,(t-start)/650), v=worldToScreen(pos);
      div.style.left=v.x+'px'; div.style.top=(v.y-a*42)+'px'; div.style.opacity=String(1-a);
      if(a<1) requestAnimationFrame(step); else div.remove();
    }
    requestAnimationFrame(step);
  }

  function worldToScreen(pos){
    var v=pos.clone().project(camera);
    return {x:(v.x+1)*.5*window.innerWidth,y:(-v.y+1)*.5*window.innerHeight};
  }

  function enemyAI(delta){
    for(var i=enemies.length-1;i>=0;i--){
      var e=enemies[i];
      if(!e.alive) continue;
      e.attackCd=Math.max(0,e.attackCd-delta); e.stun=Math.max(0,e.stun-delta); e.hitFlash=Math.max(0,e.hitFlash-delta);
      e.ring.rotation.z+=delta*1.8;
      var d=dist3(player.position,e.group.position);
      if(d>80){ removeEnemy(e); continue; }
      if(e.stun>0){ e.core.scale.setScalar(.85); continue; }
      e.core.scale.setScalar(1+Math.sin(U.elapsed*5+e.seed)*.07);
      if(d<e.spec.range){
        e.state='attack';
        if(e.attackCd<=0){ e.attackCd=.9+(Math.random()*.5); damagePlayer(e.spec.damage,e.spec.name); pulseEffect(e.group.position,0xff386f,1.3,.18); }
      } else if(d<34){
        e.state='chase';
        var dx=player.position.x-e.group.position.x, dz=player.position.z-e.group.position.z;
        var len=Math.max(.001,Math.hypot(dx,dz));
        e.group.position.x += dx/len*e.spec.speed*delta;
        e.group.position.z += dz/len*e.spec.speed*delta;
        e.group.position.y = lerp(e.group.position.y,player.position.y+Math.sin(U.elapsed*2+e.seed)*1.2,.08);
      } else {
        e.state='wander';
        e.wander+=Math.sin(U.elapsed*.4+e.seed)*.03+delta*.25;
        e.group.position.x += Math.cos(e.wander)*e.spec.speed*.18*delta;
        e.group.position.z += Math.sin(e.wander)*e.spec.speed*.18*delta;
        e.group.position.y += Math.sin(U.elapsed*1.5+e.seed)*delta*.14;
      }
      var turn=Math.atan2(player.position.x-e.group.position.x,player.position.z-e.group.position.z);
      e.group.rotation.y=lerp(e.group.rotation.y,turn,.12);
    }
    enemies=enemies.filter(function(e){return e.alive;});
  }
  U.boss=null;
  function createBoss(){
    if(U.boss && U.boss.alive) return U.boss;
    var g=new THREE.Group();
    var outer=new THREE.Mesh(new THREE.DodecahedronGeometry(2.4,1),new THREE.MeshStandardMaterial({color:0x5b0b42,emissive:0xa50064,emissiveIntensity:1.0,roughness:.15,metalness:.45}));
    g.add(outer);
    var crown=new THREE.Mesh(new THREE.TorusGeometry(3.3,.14,10,64),new THREE.MeshBasicMaterial({color:0xffd76a,transparent:true,opacity:.9}));
    crown.rotation.x=Math.PI/2; g.add(crown);
    var eye=new THREE.Mesh(new THREE.SphereGeometry(.48,16,16),new THREE.MeshBasicMaterial({color:0xffffff})); eye.position.z=2.18; g.add(eye);
    var light=new THREE.PointLight(0xff2b96,2.4,22); g.add(light);
    g.position.set(0,190,130); scene.add(g);
    U.boss={group:g,outer:outer,crown:crown,light:light,hp:650,maxHp:650,alive:true,phase:1,attackCd:2,projectileCd:2.4,age:0};
    byId('ultra-boss-banner').classList.add('active');
    byId('ultra-boss-name').textContent='🐉 نگهبان فراموشی — فاز ۱';
    byId('ultra-boss-hp-fill').style.width='100%';
    notify('🐉 باس مخفی بیدار شد: نگهبان فراموشی!','gold',5000);
    memory('نگهبان فراموشی در معبد ابدیت بیدار شد.','boss');
    unlockAchievement('ultra');
    return U.boss;
  }

  function damageBoss(amount){
    if(!U.boss || !U.boss.alive) return;
    U.boss.hp-=amount;
    var b=U.boss;
    var ratio=b.hp/b.maxHp;
    b.phase=ratio<=.25?3:(ratio<=.6?2:1);
    byId('ultra-boss-name').textContent='🐉 نگهبان فراموشی — فاز '+pnum(b.phase);
    byId('ultra-boss-hp-fill').style.width=pct(b.hp,b.maxHp)+'%';
    sparkBurst(b.group.position,b.phase===3?0xff5b88:0xd76aff,30);
    if(b.hp<=0) defeatBoss();
  }

  function defeatBoss(){
    var b=U.boss; if(!b || !b.alive) return;
    b.alive=false; scene.remove(b.group); byId('ultra-boss-banner').classList.remove('active');
    U.profile.bossDefeated=true; U.profile.coins+=1000; U.profile.shards+=5; U.profile.inventory.eternalKey++;
    grantXP(1500,'شکست نگهبان فراموشی');
    unlockAchievement('boss');
    progressQuestKind('boss',1);
    progressDaily(3);
    if(U.profile.health>U.profile.maxHealth*.3) unlockAchievement('survivor');
    notify('👑 نگهبان شکست خورد — لایه دوم کهکشان باز شد!','gold',6000);
    memory('نبرد معبد پایان یافت؛ مسیر ULTRA ادامه دارد.','boss');
    launchFireworkDisplay(player.position.x,player.position.y+4,player.position.z);
    for(var i=0;i<10;i++) setTimeout(function(){launchFireworkDisplay((Math.random()-.5)*20,190+Math.random()*14,130+(Math.random()-.5)*20);},i*110);
  }

  function bossAI(delta){
    if(!U.boss || !U.boss.alive) return;
    var b=U.boss; b.age+=delta; b.attackCd-=delta; b.projectileCd-=delta;
    var d=dist3(player.position,b.group.position);
    b.crown.rotation.z+=delta*(1+b.phase*.4); b.outer.rotation.y+=delta*(.7+b.phase*.2); b.outer.position.y=Math.sin(b.age*2)*.5;
    if(d>34){
      var dir=new THREE.Vector3(player.position.x-b.group.position.x,0,player.position.z-b.group.position.z); if(dir.length()>0.1) dir.normalize();
      b.group.position.addScaledVector(dir,(2.2+b.phase*.5)*delta);
    }
    if(b.attackCd<=0 && d<18){
      b.attackCd=Math.max(.55,1.45-b.phase*.18);
      damagePlayer(20+b.phase*6,'نگهبان فراموشی'); pulseEffect(b.group.position,0xff0a77,5,.3);
    }
    if(b.projectileCd<=0){
      b.projectileCd=Math.max(.7,3.0-b.phase*.5);
      bossProjectile();
    }
    if(b.phase>=2){
      var pos=new THREE.Vector3(b.group.position.x+Math.sin(b.age)*7,b.group.position.y+1,b.group.position.z+Math.cos(b.age)*7);
      if(Math.random()<delta*.6) spawnEnemy('wisp',pos,true);
    }
  }

  var bossShots=[];
  function bossProjectile(){
    if(!U.boss || !U.boss.alive) return;
    var geo=new THREE.SphereGeometry(.28,10,10), mat=new THREE.MeshBasicMaterial({color:0xff4e96});
    var m=new THREE.Mesh(geo,mat); m.position.copy(U.boss.group.position); scene.add(m);
    var dir=player.position.clone().sub(m.position); if(dir.length()>0) dir.normalize();
    bossShots.push({mesh:m,vel:dir.multiplyScalar(11+U.boss.phase*2),life:4});
  }

  function updateBossShots(delta){
    for(var i=bossShots.length-1;i>=0;i--){
      var s=bossShots[i]; s.life-=delta; s.mesh.position.addScaledVector(s.vel,delta);
      if(dist3(s.mesh.position,player.position)<1.6){ damagePlayer(12+U.boss.phase*4,'پرتابه سایه'); s.life=0; }
      if(s.life<=0){scene.remove(s.mesh);s.mesh.geometry.dispose();s.mesh.material.dispose();bossShots.splice(i,1);}
    }
  }

  U.oracle=null;
  function createOracle(){
    var g=new THREE.Group();
    var orb=new THREE.Mesh(new THREE.SphereGeometry(.9,18,18),new THREE.MeshPhysicalMaterial({color:0xfef3c7,emissive:0xff9bd2,emissiveIntensity:1.6,transparent:true,opacity:.94,roughness:.05})); g.add(orb);
    var halo=new THREE.Mesh(new THREE.TorusGeometry(1.4,.08,10,40),new THREE.MeshBasicMaterial({color:0xffd76a,transparent:true,opacity:.8})); halo.rotation.x=Math.PI/2; g.add(halo);
    g.position.set(8,190,126); scene.add(g); U.oracle={group:g,orb:orb,halo:halo,cool:0,times:0};
  }
  function oracleSpeak(){
    if(!U.oracle) return;
    U.oracle.times++; var lines=[
      '«هر آنچه جمع می‌کنی فقط امتیاز نیست؛ تبدیل به بخشی از داستانت می‌شود.»',
      '«در این جهان، عجله لازم نیست. مسیر را یاد بگیر و بعد سرعت را زیاد کن.»',
      '«وقتی ۶۰ گوهر اولیه کامل شوند، پایان قدیمی روشن می‌شود؛ اما باس، پایان واقعی نیست.»',
      '«از هفت جهان عبور کن و چیزی بساز که فقط در حافظه خودت وجود دارد.»',
      '«قدرتت را با مهارت بساز، نه فقط با جمع‌آوری.»'
    ];
    notify('🔮 اوراکل: '+randomChoice(lines),'gold',5200);
    grantXP(80,'گفت‌وگو با اوراکل');
    if(U.oracle.times>=1) unlockAchievement('secret');
    if(U.oracle.times>=3) U.profile.inventory.memoryInk++;
    unlockCodex(7);
  }

  createOracle();

  function progressQuestKind(kind,value){
    for(var i=0;i<U.questData.length;i++){
      var q=U.questData[i]; if(U.profile.quests[q.id]) continue;
      if(q.kind===kind){
        U.profile.quests[q.id]=clamp(value,0,q.target);
        if(U.profile.quests[q.id]>=q.target) completeQuest(q);
      }
    }
  }

  function questProgress(q){
    var g=0,f=0,c=0;
    for(var i=0;i<totalCollectibles.length;i++){if(totalCollectibles[i].collected){c++;if(totalCollectibles[i].type==='heart')g++;else f++;}}
    if(q.kind==='hearts') return g;
    if(q.kind==='gems') return g;
    if(q.kind==='flowers') return f;
    if(q.kind==='collectibles') return c;
    if(q.kind==='worlds') return U.profile.discoveredRealms.length;
    if(q.kind==='distance') return Math.floor(U.profile.distance);
    if(q.kind==='bestCombo') return U.profile.bestCombo;
    if(q.kind==='defeated') return U.profile.enemiesDefeated;
    if(q.kind==='crafted') return U.profile.crafted;
    if(q.kind==='skillsSpent') return totalSkillsSpent();
    if(q.kind==='boss') return U.profile.bossDefeated?1:0;
    if(q.kind==='eternalToken') return U.profile.inventory.eternalToken||0;
    return U.profile.quests[q.id]||0;
  }

  function completeQuest(q){
    if(U.profile.quests[q.id]==='done') return;
    U.profile.quests[q.id]='done'; U.profile.coins+=q.coins; grantXP(q.xp,'تکمیل مأموریت '+q.title); notify('🗺️ مأموریت کامل شد: '+q.title,'gold',4000);
    memory('مأموریت «'+q.title+'» به پایان رسید.','quest');
  }

  function refreshQuestState(){
    for(var i=0;i<U.questData.length;i++){
      var q=U.questData[i]; if(U.profile.quests[q.id]==='done') continue;
      var v=questProgress(q); U.profile.quests[q.id]=Math.max(U.profile.quests[q.id]||0,v);
      if(v>=q.target) completeQuest(q);
    }
  }

  function progressDaily(amount){
    if(U.daily.done) return;
    U.daily.progress=clamp(U.daily.progress+amount,0,U.daily.target);
    if(U.daily.progress>=U.daily.target){
      U.daily.done=true; U.profile.coins+=U.daily.rewardCoins; grantXP(U.daily.rewardXP,'چالش روزانه'); unlockAchievement('daily'); notify('☀️ چالش روزانه کامل شد!','gold',4200); }
  }

  function seedDaily(){
    var date=new Date(); var seed=date.getFullYear()*10000+(date.getMonth()+1)*100+date.getDate();
    var variants=[
      {title:'نبرد بامداد',desc:'۵ دشمن را شکست بده و ۲ گوهر پیدا کن.',target:7},
      {title:'گل‌های روشن',desc:'۵ گل جمع کن و ۲ بار جهش بزن.',target:7},
      {title:'مسافر صبور',desc:'به ۳ جهان مختلف سفر کن و ۱ حافظه ثبت کن.',target:4},
      {title:'رزونانس',desc:'کمبو ۱۰ بساز و ۳ پالس اجرا کن.',target:13},
      {title:'کیمیاگر روز',desc:'۲ آیتم بساز و ۱۵۰ XP بگیر.',target:4}
    ];
    var idx=seed%variants.length; var base=variants[idx]; U.daily={index:idx,title:base.title,desc:base.desc,target:base.target,progress:0,rewardXP:180,rewardCoins:120,done:false};
  }
  function totalSkillsSpent(){ var n=0; for(var k in U.profile.skills) n+=U.profile.skills[k]; return n; }
  function upgradeSkill(id){
    var data=null;
    for(var i=0;i<U.skillData.length;i++) if(U.skillData[i].id===id) data=U.skillData[i];
    if(!data) return;
    var lvl=U.profile.skills[id]||0, cost=data.cost(lvl);
    if(lvl>=data.max){notify('✨ این مهارت به حداکثر رسیده.','gold',1800);return;}
    if(U.profile.skillPoints<cost){notify('✨ امتیاز مهارت کافی نیست.','',1800);return;}
    U.profile.skillPoints-=cost; U.profile.skills[id]=lvl+1; applySkillDerivedStats(); grantXP(20,'ارتقای '+data.name); renderSkills();
    unlockAchievement('skill1'); if(totalSkillsSpent()>=10) unlockAchievement('skill10'); progressQuestKind('skillsSpent',totalSkillsSpent());
    notify('✨ '+data.name+' → سطح '+pnum(lvl+1),'gold',2400); saveGame(false);
  }

  function applySkillDerivedStats(){
    U.profile.maxStamina=100+U.profile.level*4+U.profile.skills.swiftWings*7;
    U.profile.maxMana=100+U.profile.level*7+U.profile.skills.deepMana*12;
    U.profile.maxHealth=100+U.profile.level*6+U.profile.skills.astralArmor*10;
    U.profile.stamina=clamp(U.profile.stamina,0,U.profile.maxStamina);
    U.profile.mana=clamp(U.profile.mana,0,U.profile.maxMana);
    U.profile.health=clamp(U.profile.health,0,U.profile.maxHealth);
  }

  function craft(id){
    var r=U.recipes[id]; if(!r) return;
    for(var k in r.cost){
      var have=(U.profile.inventory[k]!==undefined?U.profile.inventory[k]:U.profile[k]);
      if(have<r.cost[k]){notify('🔧 مواد ساخت کافی نیست: '+k,'',1900);return;}
    }
    for(var k2 in r.cost){
      if(U.profile.inventory[k2]!==undefined) U.profile.inventory[k2]-=r.cost[k2]; else U.profile[k2]-=r.cost[k2];
    }
    if(r.gives.health) restorePlayer(r.gives.health);
    if(r.gives.xp) grantXP(r.gives.xp,'ساخت '+r.name);
    if(r.gives.coins) U.profile.coins+=r.gives.coins;
    if(r.gives.shards) U.profile.shards+=r.gives.shards;
    if(id==='eternal_token'){U.profile.inventory.eternalToken=(U.profile.inventory.eternalToken||0)+1;unlockAchievement('eternal');progressQuestKind('eternalToken',1);}
    U.profile.crafted++; unlockAchievement('crafter1'); if(U.profile.crafted>=10) unlockAchievement('crafter10'); progressQuestKind('crafted',U.profile.crafted); notify('🔧 ساخته شد: '+r.emoji+' '+r.name,'cyan',2200); saveGame(false); renderInventory();
  }

  function unlockAchievement(id){
    if(U.profile.achievements[id]) return;
    U.profile.achievements[id]=true;
    var rec=null; for(var i=0;i<U.achievementData.length;i++) if(U.achievementData[i][0]===id) rec=U.achievementData[i];
    if(rec) notify('🏆 دستاورد باز شد: '+rec[2],'gold',3800);
    grantXP(35,'دستاورد '+id);
  }

  function inspectAchievements(){
    var g=0,f=0,c=0; for(var i=0;i<totalCollectibles.length;i++){if(totalCollectibles[i].collected){c++;if(totalCollectibles[i].type==='heart')g++;else f++;}}
    if(g>=1)unlockAchievement('heart1'); if(g>=15)unlockAchievement('heart15'); if(g>=30)unlockAchievement('heart30');
    if(f>=15)unlockAchievement('flower15'); if(f>=30)unlockAchievement('flower30');
    if(U.profile.discoveredRealms.length>=2)unlockAchievement('realm2'); if(U.profile.discoveredRealms.indexOf(6)>=0)unlockAchievement('realm7'); if(U.profile.discoveredRealms.length>=7)unlockAchievement('explorer');
    if(U.profile.coins>=1000)unlockAchievement('coins1000'); if(U.profile.crafted>=1)unlockAchievement('crafter1'); if(U.profile.crafted>=10)unlockAchievement('crafter10');
  }

  function renderInventory(){
    var wrap=byId('ultra-inventory-content'); if(!wrap) return; wrap.innerHTML='';
    var items=[
      ['starDust','گرد ستاره','✨','ماده پایه برای ساخت ابزارهای اختری','common'],['moonShard','قطعه ماه','🌙','قطعه کمیاب از نگهبانان بلور','rare'],['roseCrystal','کریستال رز','🌹','هسته انرژی برای ترمیم','epic'],['promiseSeed','بذر پیمان','🌱','بذرهای ذخیره‌شده از جهان‌های گل‌پاش','common'],
      ['eternalKey','کلید ابدیت','🗝️','کلید بازکننده لایه‌های معبد','legendary'],['skyFeather','پر آسمان','🪽','افت نادر از دشمنان هوایی','rare'],['memoryInk','جوهر حافظه','🖋️','جوهر مخصوص آرشیو Codex','epic'],['astralCore','هسته اختری','🔷','منبع خالص انرژی','legendary'],
      ['nectar','شهد','🍯','برای بذرهای پیمان','common'],['prism','منشور','🔮','کریستال چندلایه برای ساخت نشانه ابدیت','epic']
    ];
    items.forEach(function(it){var val=U.profile.inventory[it[0]]||0; var card=document.createElement('div'); card.className='ultra-card'; card.innerHTML='<span class="ultra-rarity rarity-'+it[4]+'">'+it[4]+'</span><h3>'+it[2]+' '+it[1]+' × '+pnum(val)+'</h3><p>'+it[3]+'</p>'; wrap.appendChild(card);});
    var money=document.createElement('div'); money.className='ultra-card'; money.innerHTML='<h3>💰 سرمایه</h3><p>سکه: <strong>'+pnum(U.profile.coins)+'</strong><br>اسنس: <strong>'+pnum(U.profile.essence)+'</strong><br>شارد: <strong>'+pnum(U.profile.shards)+'</strong></p>'; wrap.appendChild(money);
    Object.keys(U.recipes).forEach(function(id){var r=U.recipes[id], card=document.createElement('div'); card.className='ultra-card'; var cost=''; for(var k in r.cost) cost+=(k+': '+r.cost[k]+'  '); card.innerHTML='<span class="ultra-rarity rarity-epic">CRAFT</span><h3>'+r.emoji+' '+r.name+'</h3><p>'+cost+'</p><button class="ultra-action-btn cyan" data-craft="'+id+'">ساخت</button>'; wrap.appendChild(card);});
    wrap.querySelectorAll('[data-craft]').forEach(function(b){b.addEventListener('click',function(){craft(b.getAttribute('data-craft'));});});
  }

  function renderQuests(){
    refreshQuestState(); var wrap=byId('ultra-quest-content'); if(!wrap)return; wrap.innerHTML='';
    U.questData.forEach(function(q){var v=questProgress(q), done=U.profile.quests[q.id]==='done', card=document.createElement('div'); card.className='ultra-card '+(done?'':''); card.innerHTML='<span class="ultra-rarity '+(done?'rarity-legendary':'rarity-rare')+'">'+(done?'DONE':'ACTIVE')+'</span><h3>'+q.title+'</h3><p>'+q.desc+'<br>پیشرفت: '+pnum(v)+' / '+pnum(q.target)+'<br>پاداش: '+pnum(q.xp)+' XP + '+pnum(q.coins)+' سکه</p>'; wrap.appendChild(card);});
  }

  function renderSkills(){
    var wrap=byId('ultra-skill-content'); if(!wrap)return; wrap.innerHTML='';
    var top=document.createElement('div'); top.className='ultra-card'; top.innerHTML='<h3>✨ امتیاز مهارت: '+pnum(U.profile.skillPoints)+'</h3><p>امتیازها با هر سطح به دست می‌آیند. ارتقاها روی نبرد، حرکت و منابع اثر مستقیم دارند.</p>'; wrap.appendChild(top);
    U.skillData.forEach(function(s){var lvl=U.profile.skills[s.id]||0, card=document.createElement('div'); card.className='ultra-card'; card.innerHTML='<span class="ultra-rarity rarity-epic">LV '+pnum(lvl)+' / '+pnum(s.max)+'</span><h3>'+s.emoji+' '+s.name+'</h3><p>'+s.desc+'<br>هزینه ارتقای بعدی: '+(lvl<s.max?s.cost(lvl):'MAX')+'</p><button class="ultra-action-btn gold" data-skill="'+s.id+'">ارتقا</button>'; wrap.appendChild(card);});
    wrap.querySelectorAll('[data-skill]').forEach(function(b){b.addEventListener('click',function(){upgradeSkill(b.getAttribute('data-skill'));});});
  }

  function renderAchievements(){
    inspectAchievements(); var wrap=byId('ultra-achievement-content'); if(!wrap)return; wrap.innerHTML='';
    var count=0; U.achievementData.forEach(function(a){var ok=!!U.profile.achievements[a[0]]; if(ok)count++; var card=document.createElement('div'); card.className='ultra-card '+(ok?'':'locked'); card.innerHTML='<span class="ultra-rarity '+(ok?'rarity-legendary':'rarity-common')+'">'+(ok?'UNLOCKED':'LOCKED')+'</span><h3>'+a[1]+' '+a[2]+'</h3><p>'+a[3]+'</p>'; wrap.appendChild(card);});
    var head=document.createElement('div'); head.className='ultra-card'; head.innerHTML='<h3>🏆 پیشرفت کل</h3><p>'+pnum(count)+' / '+pnum(U.achievementData.length)+' دستاورد</p>'; wrap.insertBefore(head,wrap.firstChild);
  }

  function renderSettings(){
    var wrap=byId('ultra-settings-content'); if(!wrap)return; wrap.innerHTML='';
    function toggle(key,label){var card=document.createElement('div');card.className='ultra-card';var checked=U.profile.settings[key];card.innerHTML='<h3>'+label+'</h3><p>وضعیت: <strong>'+ (checked?'فعال':'خاموش') +'</strong></p><button class="ultra-action-btn cyan" data-toggle="'+key+'">تغییر</button>';wrap.appendChild(card);}
    toggle('particles','✨ ذرات'); toggle('weather','🌦️ آب‌وهوا'); toggle('damageNumbers','💥 اعداد آسیب'); toggle('adaptiveResolution','🖥️ رزولوشن تطبیقی'); toggle('sound','🔊 صدا'); toggle('haptics','📳 لرزش'); toggle('minimap','🧭 مینی‌مپ');
    var quality=document.createElement('div');quality.className='ultra-card';quality.innerHTML='<h3>🎛 کیفیت</h3><p>حالت فعلی: '+U.profile.settings.quality+'</p><button class="ultra-action-btn gold" data-quality="auto">AUTO</button> <button class="ultra-action-btn" data-quality="high">HIGH</button> <button class="ultra-action-btn" data-quality="eco">ECO</button>';wrap.appendChild(quality);
    var codex=document.createElement('div');codex.className='ultra-card';codex.innerHTML='<h3>📚 Codex</h3><p>مدخل‌های باز: '+pnum(U.codexUnlocks.filter(Boolean).length)+' / '+pnum(U.codexUnlocks.length)+'</p><button class="ultra-action-btn cyan" id="ultra-open-codex">باز کردن</button>';wrap.appendChild(codex);
    var wipe=document.createElement('div');wipe.className='ultra-card';wipe.innerHTML='<h3>🧹 مدیریت ذخیره</h3><p>ذخیره فعلی را حذف نکن مگر اینکه واقعاً بخواهی از صفر شروع کنی.</p><button class="ultra-action-btn" id="ultra-reset-save">شروع دوباره</button>';wrap.appendChild(wipe);
    wrap.querySelectorAll('[data-toggle]').forEach(function(b){b.addEventListener('click',function(){var k=b.getAttribute('data-toggle');U.profile.settings[k]=!U.profile.settings[k];renderSettings();saveSettings();});});
    wrap.querySelectorAll('[data-quality]').forEach(function(b){b.addEventListener('click',function(){setQuality(b.getAttribute('data-quality'));renderSettings();});});
    byId('ultra-open-codex').addEventListener('click',function(){renderCodex();openOverlay('ultra-codex-modal');});
    byId('ultra-reset-save').addEventListener('click',function(){if(confirm('ذخیره ULTRA حذف شود و بازی از ابتدا شروع شود؟')){localStorage.removeItem(U.saveKey);location.reload();}});
  }

  function renderCodex(){
    var wrap=byId('ultra-codex-content'); if(!wrap)return; wrap.innerHTML='';
    U.loreCards.forEach(function(c,i){var ok=U.codexUnlocks[i], card=document.createElement('div'); card.className='ultra-card '+(ok?'':'locked'); card.innerHTML='<span class="ultra-rarity '+(ok?'rarity-epic':'rarity-common')+'">'+(ok?'DISCOVERED':'UNKNOWN')+'</span><h3>'+c[0]+'</h3><p>'+(ok?c[1]:'این مدخل هنوز در سفر تو کشف نشده است.')+'</p>'; wrap.appendChild(card);});
  }

  function saveSettings(){try{localStorage.setItem(U.settingsKey,JSON.stringify(U.profile.settings));}catch(e){}}
  function loadSettings(){try{var s=safeJSONParse(localStorage.getItem(U.settingsKey)||'',null);if(s)for(var k in U.profile.settings)if(s[k]!==undefined)U.profile.settings[k]=s[k];}catch(e){}}
  function serializeState(){
    var c=[]; for(var i=0;i<totalCollectibles.length;i++) if(totalCollectibles[i].collected)c.push(i);
    U.profile.collected=c;
    return JSON.stringify({version:U.version,savedAt:nowISO(),profile:U.profile,world:U.worldIndex,codex:U.codexUnlocks,daily:U.daily,position:player?{x:player.position.x,y:player.position.y,z:player.position.z}:null});
  }

  function saveGame(manual){
    try{
      refreshQuestState(); inspectAchievements(); saveSettings(); localStorage.setItem(U.saveKey,serializeState()); U.lastSave=Date.now();
      if(manual) notify('💾 بازی ذخیره شد — '+new Date().toLocaleTimeString('fa-IR'),'cyan',2200);
    }catch(e){ if(manual)notify('⚠️ ذخیره‌سازی انجام نشد.','',2200); }
  }

  function restoreCollectiblesFromState(){
    var set={}; (U.profile.collected||[]).forEach(function(i){set[i]=true;});
    for(var i=0;i<totalCollectibles.length;i++){
      var item=totalCollectibles[i];
      if(set[i] && !item.collected){ item.collected=true; scene.remove(item.mesh); scene.remove(item.light); }
    }
    syncLegacyCounters();
  }

  function loadGame(){
    loadSettings();
    try{
      var raw=localStorage.getItem(U.saveKey); if(!raw) return false;
      var saved=safeJSONParse(raw,null); if(!saved || !saved.profile) return false;
      var src=saved.profile;
      for(var k in U.profile){ if(src[k]!==undefined) U.profile[k]=src[k]; }
      if(!U.profile.inventory)U.profile.inventory={};
      if(!U.profile.skills)U.profile.skills={}; if(!U.profile.achievements)U.profile.achievements={}; if(!U.profile.quests)U.profile.quests={};
      U.codexUnlocks=saved.codex||U.codexUnlocks; U.daily=saved.daily||U.daily;
      if(saved.position && player) player.position.set(saved.position.x,saved.position.y,saved.position.z);
      restoreCollectiblesFromState(); applySkillDerivedStats(); inspectAchievements(); refreshQuestState();
      notify('🌌 ذخیره قبلی بازی بارگذاری شد.','cyan',3200); memory('یک سفر قدیمی دوباره ادامه پیدا کرد.','load');
      return true;
    }catch(e){return false;}
  }

  function setQuality(mode){
    U.profile.settings.quality=mode; U.performanceLevel=mode;
    var map={eco:.95,high:1.65,auto:Math.min(window.devicePixelRatio||1,1.5)};
    try{renderer.setPixelRatio(map[mode]||1.3);}catch(e){}
    notify('🎛 کیفیت گرافیکی: '+mode.toUpperCase(),'cyan',1800); saveSettings();
  }

  function adaptiveQuality(delta){
    U.fpsFrames=(U.fpsFrames||0)+1; U.fpsTime=(U.fpsTime||0)+delta;
    if(U.fpsTime<2) return; var fps=U.fpsFrames/U.fpsTime; U.fpsFrames=0; U.fpsTime=0;
    if(U.profile.settings.quality!=='auto' || !U.profile.settings.adaptiveResolution) return;
    var current=renderer.getPixelRatio?renderer.getPixelRatio():1;
    if(fps<42 && current>0.85) renderer.setPixelRatio(Math.max(.85,current*.90));
    if(fps>57 && current<Math.min(window.devicePixelRatio||1.5,1.65)) renderer.setPixelRatio(Math.min(Math.min(window.devicePixelRatio||1.5,1.65),current*1.08));
  }

  function regenerateDailyIfNeeded(){
    var key=new Date().toDateString();
    try{
      var marker=localStorage.getItem(U.saveKey+'-daily');
      if(marker!==key){seedDaily();localStorage.setItem(U.saveKey+'-daily',key);}
    }catch(e){}
  }

  function collectLegacy(item){
    if(item.__ultraProcessed) return; item.__ultraProcessed=true;
    if(item.type==='heart'){U.profile.inventory.roseCrystal++;progressQuestKind('hearts',totalGemsFound);}
    else {U.profile.inventory.promiseSeed++;}
    U.profile.essence+=2;
    grantXP(item.type==='heart'?32:36,'جمع '+(item.type==='heart'?'قلب':'گل'));
    progressQuestKind('collectibles',totalGemsFound+totalFlowersFound);
    progressQuestKind(item.type==='heart'?'gems':'flowers',item.type==='heart'?totalGemsFound:totalFlowersFound);
    progressDaily(1);
    var total=totalGemsFound+totalFlowersFound;
    if(total===1)unlockAchievement('heart1'); if(total>=15)unlockAchievement('heart15');
    if(totalGemsFound>=30)unlockAchievement('heart30'); if(totalFlowersFound>=15)unlockAchievement('flower15'); if(totalFlowersFound>=30)unlockAchievement('flower30');
    if(total>=60){memory('هر ۶۰ گوهر اولیه در این سفر پیدا شدند.','milestone');unlockAchievement('ultra');}
    saveGame(false);
  }

  function scanLegacyCollectibles(){
    for(var i=0;i<totalCollectibles.length;i++) if(totalCollectibles[i].collected && !totalCollectibles[i].__ultraProcessed) collectLegacy(totalCollectibles[i]);
  }

  function manageLegacyTerminal(){
    if(totalGemsFound>=30 && totalFlowersFound>=30 && !U.terminalSeen){U.terminalSeen=true;unlockAchievement('ultra');notify('🌠 پایان کلاسیک فعال شد؛ حالا محتوای ULTRA را هم تجربه کن.','gold',6000);}
  }

  function regenResources(delta){
    U.profile.stamina=clamp(U.profile.stamina+(17+U.profile.skills.swiftWings*2)*delta,0,U.profile.maxStamina);
    U.profile.mana=clamp(U.profile.mana+(6+U.profile.skills.deepMana*1.8)*delta,0,U.profile.maxMana);
    if(U.profile.health< U.profile.maxHealth && !U.boss) U.profile.health=clamp(U.profile.health+1.2*delta,0,U.profile.maxHealth);
    if(U.profile.comboTimer>0){U.profile.comboTimer-=delta;if(U.profile.comboTimer<=0)U.profile.combo=0;}
  }

  function movementKeyboardBridge(){
    if(!U.keys) return;
    var x=(U.keys.d?1:0)-(U.keys.a?1:0), y=(U.keys.w?1:0)-(U.keys.s?1:0);
    if(x||y){var n=Math.hypot(x,y);touchMoveVector.x=x/n;touchMoveVector.y=y/n;}
    else if(!joyActiveId){touchMoveVector.x=0;touchMoveVector.y=0;}
  }

  function trackDistance(delta){
    var v=Math.hypot(playerVelocity.x,playerVelocity.z); U.profile.distance+=v*delta;
    if(U.profile.distance>=2500)progressQuestKind('distance',Math.floor(U.profile.distance));
    if(U.profile.distance>100 && !U.profile.achievements.fast)unlockAchievement('fast');
  }

  function worldPresentation(){
    var w=currentWorld(), wp=U.weatherProfiles[w.weather]||U.weatherProfiles.petals;
    if(U.profile.settings.weather){
      try{scene.fog.color.setHex(wp.fog);scene.fog.density=wp.density;mainSunLight.intensity=wp.light;}catch(e){}
    }
    var wl=byId('ultra-world-label'); if(wl) wl.textContent=w.emoji+' '+w.name;
    if(U.profile.settings.minimap) byId('ultra-minimap-wrap').style.display='block'; else byId('ultra-minimap-wrap').style.display='none';
  }

  function drawMinimap(){
    if(!U.profile.settings.minimap || !player) return;
    var c=byId('ultra-minimap'),ctx=c.getContext('2d'); if(!ctx)return;
    ctx.clearRect(0,0,c.width,c.height); ctx.fillStyle='rgba(2,4,15,.92)';ctx.fillRect(0,0,c.width,c.height);
    var scale=.95, ox=c.width/2, oy=c.height/2, range=210;
    function mp(x,y){return {x:ox+(x-player.position.x)/range*c.width*.5*scale,y:oy+(y-player.position.z)/range*c.height*.5*scale};}
    for(var i=0;i<U.worlds.length;i++){var p=mp(U.worlds[i].center.x,U.worlds[i].center.z);if(p.x<-20||p.x>c.width+20||p.y<-20||p.y>c.height+20)continue;ctx.beginPath();ctx.arc(p.x,p.y,8,0,Math.PI*2);ctx.fillStyle=i===U.worldIndex?'#ffd76a':'rgba(177,143,255,.55)';ctx.fill();ctx.font='18px sans-serif';ctx.fillText(U.worlds[i].emoji,p.x-9,p.y-12);}
    enemies.forEach(function(e){if(!e.alive)return;var p=mp(e.group.position.x,e.group.position.z);ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle='#ff4c78';ctx.fill();});
    var pp=mp(player.position.x,player.position.z);ctx.beginPath();ctx.arc(pp.x,pp.y,6,0,Math.PI*2);ctx.fillStyle='#62ecff';ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(ox,0);ctx.lineTo(ox,c.height);ctx.moveTo(0,oy);ctx.lineTo(c.width,oy);ctx.stroke();
  }

  function updateHUD(){
    var p=U.profile, need=xpNeed(p.level);
    byId('ultra-level-label').textContent='Lv. '+pnum(p.level);
    byId('ultra-xp-label').textContent='XP '+pnum(p.xp)+' / '+pnum(need);
    byId('ultra-xp-fill').style.width=pct(p.xp,need)+'%';
    byId('ultra-hp-fill').style.width=pct(p.health,p.maxHealth)+'%';
    byId('ultra-stamina-fill').style.width=pct(p.stamina,p.maxStamina)+'%';
    byId('ultra-mana-fill').style.width=pct(p.mana,p.maxMana)+'%';
    byId('ultra-hp-text').textContent=pnum(p.health);byId('ultra-stamina-text').textContent=pnum(p.stamina);byId('ultra-mana-text').textContent=pnum(p.mana);
    var q=null;for(var i=0;i<U.questData.length;i++){var qq=U.questData[i];if(U.profile.quests[qq.id]!=='done'){q=qq;break;}}
    if(q){var v=questProgress(q);byId('ultra-quest-title').textContent=q.title;byId('ultra-quest-text').textContent=q.desc+' ('+pnum(v)+'/'+pnum(q.target)+')';byId('ultra-quest-fill').style.width=pct(v,q.target)+'%';}
    else {byId('ultra-quest-title').textContent='🌠 مسیر اصلی کامل';byId('ultra-quest-text').textContent='اکنون لایه ULTRA را ادامه بده.';byId('ultra-quest-fill').style.width='100%';}
  }
  function oracleTick(delta){
    if(!U.oracle)return; U.oracle.halo.rotation.z+=delta*1.2; U.oracle.orb.position.y=Math.sin(U.elapsed*2)*.18; U.oracle.cool=Math.max(0,U.oracle.cool-delta);
  }

  function updateFX(delta){
    for(var i=U.fx.length-1;i>=0;i--){var fx=U.fx[i];fx.age+=delta;var t=fx.age/fx.duration;
      if(fx.mesh){fx.mesh.scale.setScalar(lerp(fx.start,fx.end,t));fx.mesh.material.opacity=(1-t)*.72;fx.mesh.rotation.z+=delta*1.8;}
      if(fx.points){var a=fx.points.geometry.attributes.position.array;for(var j=0;j<fx.vel.length;j++){a[j*3]+=fx.vel[j].x*delta;a[j*3+1]+=fx.vel[j].y*delta;a[j*3+2]+=fx.vel[j].z*delta;fx.vel[j].y-=5*delta;}fx.points.geometry.attributes.position.needsUpdate=true;fx.points.material.opacity=(1-t)*.85;}
      if(t>=1){scene.remove(fx.mesh||fx.points);if(fx.mesh){fx.mesh.geometry.dispose();fx.mesh.material.dispose();}if(fx.points){fx.points.geometry.dispose();fx.points.material.dispose();}U.fx.splice(i,1);}
    }
  }

  function ambientWorldFX(delta){
    if(!U.profile.settings.particles)return;
    if(U.frame%3===0 && Math.random()<delta*1.5){
      var w=currentWorld(), p=new THREE.Vector3(player.position.x+(Math.random()-.5)*18,player.position.y+6+Math.random()*9,player.position.z+(Math.random()-.5)*18);
      var color=w.id===3?0xff8a32:(w.id===6?0xffd76a:(w.id===2?0x9b8cff:0xff78b0)); sparkBurst(p,color,3);
    }
  }

  function handleWorldEvents(delta){
    U.eventClock+=delta;
    if(U.eventClock<12)return; U.eventClock=0;
    updateWorldVisit();
    var w=currentWorld();
    if(w.id===6 && !U.bossDefeated && totalGemsFound+totalFlowersFound>=24) createBoss();
    if(w.id===6 && U.bossDefeated && !U.profile.achievements.ultra) unlockAchievement('ultra');
    if(Math.random()<.38) randomWorldEvent(w);
  }

  function randomWorldEvent(w){
    var events={
      0:['🌸 بارش شکوفه‌های قلب؛ سرعت بازسازی جان افزایش یافت.','یک عطر تازه در باغ دیدار پیچید.'],
      1:['☁️ مه کنار رفت و مسیر مخفی آشکار شد.','اقیانوس صبر امروز آرام‌تر از همیشه است.'],
      2:['🌌 شفق نرگس فعال شد؛ مانا سریع‌تر بازمی‌گردد.','یک ستاره دنباله‌دار از بالای کهکشان عبور کرد.'],
      3:['🍂 طوفان برگ‌های دلتنگی؛ دشمنان بیشتری ظاهر شدند.','صدای برگ‌ها یک خاطره قدیمی را زنده کرد.'],
      4:['🏙️ شبکه نئون شهر آینده برق‌گرفت.','سامانه‌های شهر آینده یک مسیر داده‌ای باز کردند.'],
      5:['💎 موج بلوری؛ چند قطعه ماه در محیط ظاهر شدند.','درخشش قله بلورین برای چند ثانیه بیشتر شد.'],
      6:['🏛️ زنگ معبد نواخته شد؛ نگهبانان نزدیک‌تر می‌شوند.','هسته معبد برای لحظه‌ای کاملاً روشن شد.']
    };
    var line=randomChoice(events[w.id]||events[0]);notify(line,w.id===6?'gold':'cyan',2600);memory(line,'world-event');
    if(w.id===3)spawnEnemiesNearPlayer(true); if(w.id===5)U.profile.inventory.moonShard++; if(w.id===2)U.profile.mana=U.profile.maxMana;
  }

  function updateSeasonalVisuals(){
    var t=(new Date().getMonth()+1); var season=t<=2||t===12?'winter':t<=5?'spring':t<=8?'summer':'autumn';
    document.body.dataset.ultraSeason=season;
  }

  function maybeSpawnEnemies(delta){
    enemySpawnTimer-=delta; if(enemySpawnTimer>0)return; enemySpawnTimer=4.0;
    if(currentWorld().id===6 && U.boss && U.boss.alive) { if(Math.random()<.65)spawnEnemiesNearPlayer(false); return; }
    spawnEnemiesNearPlayer(false);
  }

  function updatePlayerAnimation(delta){
    if(!player)return; var moving=Math.hypot(playerVelocity.x,playerVelocity.z)>1.2;
    headMesh.rotation.z=lerp(headMesh.rotation.z,moving?Math.sin(U.elapsed*8)*.035:0,.16);
    dressMesh.scale.y=1+Math.sin(U.elapsed*(moving?10:3))*(moving?.035:.015);
    flowerCrown.rotation.y+=delta*.7;
    if(isFlightActive){levitationAuraGroup.scale.setScalar(1+Math.sin(U.elapsed*6)*.08);} else levitationAuraGroup.scale.setScalar(1);
  }

  function handleAutoDiscovery(){
    var w=currentWorld(); if(U.profile.discoveredRealms.indexOf(w.id)<0){U.profile.discoveredRealms.push(w.id);unlockCodex(w.id);grantXP(110,'کشف '+w.name);notify(w.emoji+' '+w.name+' کشف شد','cyan',3200);}
    if(U.profile.discoveredRealms.length>=7)progressQuestKind('worlds',7);
  }

  function tick(delta){
    U.elapsed+=delta;U.frame++;U.profile.totalPlaySeconds+=delta;
    movementKeyboardBridge();regenResources(delta);trackDistance(delta);handleAutoDiscovery();scanLegacyCollectibles();refreshQuestState();inspectAchievements();
    worldPresentation();enemyAI(delta);bossAI(delta);updateBossShots(delta);maybeSpawnEnemies(delta);oracleTick(delta);updateFX(delta);ambientWorldFX(delta);
    updatePlayerAnimation(delta);handleWorldEvents(delta);adaptiveQuality(delta);regenerateDailyIfNeeded();manageLegacyTerminal();
    if(U.elapsed-U.lastHud>.15){U.lastHud=U.elapsed;updateHUD();}
    if(U.elapsed-U.lastMap>.25){U.lastMap=U.elapsed;drawMinimap();}
    if(Date.now()-U.lastSave>12000)saveGame(false);
  }

  var lastUltra=performance.now();
  function ultraLoop(ts){
    var delta=Math.min(.05,(ts-lastUltra)/1000);lastUltra=ts;
    try{tick(delta);}catch(e){U.lastError=String(e);}
    requestAnimationFrame(ultraLoop);
  }

  function upgradeLegacyTouchControls(){
    if(typeof isHoldingAscend!=='undefined'){}
    var oldStart=document.getElementById('start-game-trigger');
    if(oldStart){oldStart.addEventListener('click',function(){setTimeout(function(){notify('🌌 موتور ULTRA آماده است. WASD / Space / Q / R / Shift / E هم فعال است.','cyan',3600);},600);});}
  }

  function seedCollectibleHooks(){
    totalCollectibles.forEach(function(item){item.__ultraProcessed=false;});
  }

  function init(){
    seedDaily(); regenerateDailyIfNeeded(); initProfileFromLegacy(); seedCollectibleHooks();
    loadGame(); applySkillDerivedStats();
    if(U.profile.collected && U.profile.collected.length) restoreCollectiblesFromState();
    updateSeasonalVisuals(); renderSettings(); updateHUD();
    notify('🌌 ULTRA V2 فعال شد — این فقط نسخه نمایشی نیست؛ سیستم پیشرفت واقعی روی جهان موجود است.','gold',5200);
    memory('ورود مهراد به نسخه ULTRA کهکشان وصال ثبت شد.','boot');
    upgradeLegacyTouchControls();
    requestAnimationFrame(ultraLoop);
  }

  /* ------------------------------------------------------------------------
     Memory / Journal bridge: keep the original 60 collectible journal intact
     and extend it with an independent persistent memory timeline.
     ------------------------------------------------------------------------ */
  U.openMemoryTimeline=function(){
    var id='ultra-memory-timeline-modal'; var old=byId(id);
    if(!old){
      old=document.createElement('div'); old.id=id; old.className='ultra-overlay';
      old.innerHTML='<div class="ultra-window"><div class="ultra-window-head"><h2>🧠 خط زمانی حافظه</h2><button class="ultra-close" data-memory-close>✕</button></div><div id="ultra-memory-list" class="ultra-grid"></div></div>';
      document.body.appendChild(old); old.querySelector('[data-memory-close]').addEventListener('click',function(){old.classList.remove('open');});
    }
    var list=byId('ultra-memory-list');list.innerHTML='';
    U.profile.memories.slice().reverse().forEach(function(m){var c=document.createElement('div');c.className='ultra-card';c.innerHTML='<span class="ultra-rarity rarity-rare">'+m.category+'</span><h3>'+m.world+'</h3><p>'+m.text+'<br><small>'+m.time+'</small></p>';list.appendChild(c);});
    old.classList.add('open');
  };

  /* ------------------------------------------------------------------------
     Non-destructive accessors for future extensions.
     ------------------------------------------------------------------------ */
  U.api={
    save:saveGame,
    notify:notify,
    xp:grantXP,
    damage:damagePlayer,
    heal:restorePlayer,
    enemy:spawnEnemy,
    boss:createBoss,
    memory:memory,
    quest:progressQuestKind,
    achievement:unlockAchievement,
    openMemory:U.openMemoryTimeline,
    state:function(){return U.profile;}
  };

  init();
})();

/* ============================================================================
   ۱۲. ULTRA DATA PACK — یادداشت‌های جهان، رویدادها و پیام‌های ویژه
   These entries are intentionally kept as plain objects so the game can be
   expanded later without rewriting the core engine.
   ============================================================================ */
(function UltraDataExpansion(){
  var U=window.__ETERNAL_GALAXY_ULTRA__;
  if(!U)return;
  U.advancedMessages=[
    'هر گوهر یک قدم است؛ هر قدم یک خاطره.',
    'هفت جهان، یک مسیر و هزار راه برای تجربه آن.',
    'وقتی قدرت کافی نداری، مسیر را عوض کن؛ همیشه لازم نیست بجنگی.',
    'مهارت‌ها برای تبدیل بازی از جمع‌آوری ساده به تصمیم‌گیری طراحی شده‌اند.',
    'در معبد، محیط فقط پس‌زمینه نیست؛ بخشی از چالش است.',
    'جهش برای عبور سریع است، پالس برای کنترل میدان و ترمیم برای بقا.',
    'مینی‌مپ باید به تصمیم تو کمک کند، نه اینکه تمام جهان را لو بدهد.',
    'حافظه‌های ذخیره‌شده بخشی از هویت این بازی هستند.'
  ];
  U.regionTips={
    0:['اطراف باغ را کامل بگرد.','اولین دشمن‌ها در فاصله میانی ظاهر می‌شوند.','گل‌های پیمان را پشت درخت‌ها هم بررسی کن.'],
    1:['مه دید را کم می‌کند؛ از مینی‌مپ استفاده کن.','جهش روی شکاف‌ها زمان خوبی برای تمرین است.','صبر در این جهان واقعاً یک مکانیک است.'],
    2:['مانا در اینجا سریع‌تر برمی‌گردد.','بلورها نشانه مسیرهای امن هستند.','دشمنان نگهبان در ارتفاع بیشتر ظاهر می‌شوند.'],
    3:['کمبو را حفظ کن ولی بی‌گدار وارد گروه دشمنان نشو.','باد برگ‌ها می‌تواند دید را فریب دهد.','منابع ساخت از دشمنان قوی‌تر بیشتر می‌افتند.'],
    4:['شهر آینده پر از مسیرهای فرعی است.','سرعت حرکت در راهروها مزیت دارد.','یک رویداد نئون ممکن است منابع بدهد.'],
    5:['قله بلورین برای بازیکنانی با مهارت حرکت ساخته شده است.','منابع کمیاب‌تر در این قلمرو ظاهر می‌شوند.','پالس می‌تواند فضای اطراف را امن‌تر کند.'],
    6:['قبل از باس، جان و مانا را کامل کن.','فاز دوم باس دشمنان کمکی ایجاد می‌کند.','بعد از شکست باس، مأموریت‌های ساخت جدی‌تر می‌شوند.']
  };
})();

/* ============================================================================
   ۱۳. DEBUG / TELEMETRY PANEL — بدون شبکه و بدون ارسال اطلاعات
   ============================================================================ */
(function UltraTelemetry(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.metrics={fps:0,frame:0,lastError:'',renderer:'webgl',heap:'n/a'};
  var last=performance.now(),frames=0;
  setInterval(function(){
    var t=performance.now(),dt=(t-last)/1000; U.metrics.fps=dt>0?Math.round(frames/dt):0;U.metrics.frame=U.frame;U.metrics.lastError=U.lastError||'';frames=0;last=t;
  },1000);
  var old=window.requestAnimationFrame;
  if(window.performance && performance.memory) U.metrics.heap='available';
  U.showTelemetry=function(){
    notify('FPS: '+U.metrics.fps+' | Frame: '+U.metrics.frame+(U.metrics.heap==='available'?' | Heap API: available':''), 'cyan',3500);
  };
  window.addEventListener('keydown',function(e){if(e.key==='F3'){U.showTelemetry();}});
})();

/* ============================================================================
   ۱۴. MEMORY INDEX — ثبت خاطرات ثابت بر مبنای هویت بازی
   ============================================================================ */
(function UltraMemoryIndex(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.identity={owner:'مهراد',dedication:'برای نرگس',title:'معبد وصال ابدی و کهکشان عشق'};
  U.memoryPrompts=[
    'اولین ورود به باغ دیدار را ثبت کن.',
    'رسیدن به اقیانوس صبر را به عنوان تغییر فاز ثبت کن.',
    'کشف کهکشان نرگس را به شکل یک لحظه ستاره‌ای ذخیره کن.',
    'در پاییز دلتنگی، یک رویداد تصادفی را ثبت کن.',
    'در شهر آینده، رسیدن به سطح جدید را ثبت کن.',
    'در قله بلورین، اولین ساخت کمیاب را ثبت کن.',
    'در معبد، نبرد با نگهبان را به عنوان نقطه عطف ذخیره کن.'
  ];
})();

/* ============================================================================
   ۱۵. COMPATIBILITY SHIM — اطمینان از اینکه نسخه قدیمی و ULTRA هم‌زمان کار کنند
   ============================================================================ */
(function UltraCompatibility(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  window.EternalGalaxyUltra=U;
  window.openUltraMemory=function(){U.openMemoryTimeline();};
  window.saveEternalGalaxy=function(){U.api.save(true);};
})();

/* ============================================================================
   ۱۷. ULTRA CONTENT PACK — رویدادها، چالش‌ها، دیالوگ‌ها و صحنه‌های مخفی
   ============================================================================ */
(function UltraContentPack(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.eventCatalog=[

    {id:'ev_001',realm:1,title:'رویداد ستاره‌ای 001',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:30},
    {id:'ev_002',realm:2,title:'رویداد ستاره‌ای 002',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:40},
    {id:'ev_003',realm:3,title:'رویداد ستاره‌ای 003',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:50},
    {id:'ev_004',realm:4,title:'رویداد ستاره‌ای 004',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:60},
    {id:'ev_005',realm:5,title:'رویداد ستاره‌ای 005',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:70},
    {id:'ev_006',realm:6,title:'رویداد ستاره‌ای 006',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:80},
    {id:'ev_007',realm:0,title:'رویداد ستاره‌ای 007',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:90},
    {id:'ev_008',realm:1,title:'رویداد ستاره‌ای 008',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:20},
    {id:'ev_009',realm:2,title:'رویداد ستاره‌ای 009',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:30},
    {id:'ev_010',realm:3,title:'رویداد ستاره‌ای 010',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:40},
    {id:'ev_011',realm:4,title:'رویداد ستاره‌ای 011',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:50},
    {id:'ev_012',realm:5,title:'رویداد ستاره‌ای 012',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:60},
    {id:'ev_013',realm:6,title:'رویداد ستاره‌ای 013',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:70},
    {id:'ev_014',realm:0,title:'رویداد ستاره‌ای 014',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:80},
    {id:'ev_015',realm:1,title:'رویداد ستاره‌ای 015',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:90},
    {id:'ev_016',realm:2,title:'رویداد ستاره‌ای 016',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:20},
    {id:'ev_017',realm:3,title:'رویداد ستاره‌ای 017',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:30},
    {id:'ev_018',realm:4,title:'رویداد ستاره‌ای 018',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:40},
    {id:'ev_019',realm:5,title:'رویداد ستاره‌ای 019',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:50},
    {id:'ev_020',realm:6,title:'رویداد ستاره‌ای 020',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:60},
    {id:'ev_021',realm:0,title:'رویداد ستاره‌ای 021',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:70},
    {id:'ev_022',realm:1,title:'رویداد ستاره‌ای 022',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:80},
    {id:'ev_023',realm:2,title:'رویداد ستاره‌ای 023',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:90},
    {id:'ev_024',realm:3,title:'رویداد ستاره‌ای 024',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:20},
    {id:'ev_025',realm:4,title:'رویداد ستاره‌ای 025',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:30},
    {id:'ev_026',realm:5,title:'رویداد ستاره‌ای 026',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:40},
    {id:'ev_027',realm:6,title:'رویداد ستاره‌ای 027',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:50},
    {id:'ev_028',realm:0,title:'رویداد ستاره‌ای 028',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:60},
    {id:'ev_029',realm:1,title:'رویداد ستاره‌ای 029',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:70},
    {id:'ev_030',realm:2,title:'رویداد ستاره‌ای 030',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:80},
    {id:'ev_031',realm:3,title:'رویداد ستاره‌ای 031',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:90},
    {id:'ev_032',realm:4,title:'رویداد ستاره‌ای 032',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:20},
    {id:'ev_033',realm:5,title:'رویداد ستاره‌ای 033',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:30},
    {id:'ev_034',realm:6,title:'رویداد ستاره‌ای 034',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:40},
    {id:'ev_035',realm:0,title:'رویداد ستاره‌ای 035',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:50},
    {id:'ev_036',realm:1,title:'رویداد ستاره‌ای 036',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:60},
    {id:'ev_037',realm:2,title:'رویداد ستاره‌ای 037',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:70},
    {id:'ev_038',realm:3,title:'رویداد ستاره‌ای 038',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:80},
    {id:'ev_039',realm:4,title:'رویداد ستاره‌ای 039',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:90},
    {id:'ev_040',realm:5,title:'رویداد ستاره‌ای 040',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:20},    {id:'ev_041',realm:6,title:'رویداد ستاره‌ای 041',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:30},
    {id:'ev_042',realm:0,title:'رویداد ستاره‌ای 042',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:40},
    {id:'ev_043',realm:1,title:'رویداد ستاره‌ای 043',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:50},
    {id:'ev_044',realm:2,title:'رویداد ستاره‌ای 044',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:60},
    {id:'ev_045',realm:3,title:'رویداد ستاره‌ای 045',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:70},
    {id:'ev_046',realm:4,title:'رویداد ستاره‌ای 046',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:80},
    {id:'ev_047',realm:5,title:'رویداد ستاره‌ای 047',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:90},
    {id:'ev_048',realm:6,title:'رویداد ستاره‌ای 048',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:20},
    {id:'ev_049',realm:0,title:'رویداد ستاره‌ای 049',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:30},
    {id:'ev_050',realm:1,title:'رویداد ستاره‌ای 050',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:40},
    {id:'ev_051',realm:2,title:'رویداد ستاره‌ای 051',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:50},
    {id:'ev_052',realm:3,title:'رویداد ستاره‌ای 052',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:60},
    {id:'ev_053',realm:4,title:'رویداد ستاره‌ای 053',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:70},
    {id:'ev_054',realm:5,title:'رویداد ستاره‌ای 054',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:80},
    {id:'ev_055',realm:6,title:'رویداد ستاره‌ای 055',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:90},
    {id:'ev_056',realm:0,title:'رویداد ستاره‌ای 056',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:20},
    {id:'ev_057',realm:1,title:'رویداد ستاره‌ای 057',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:30},
    {id:'ev_058',realm:2,title:'رویداد ستاره‌ای 058',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:40},
    {id:'ev_059',realm:3,title:'رویداد ستاره‌ای 059',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:50},
    {id:'ev_060',realm:4,title:'رویداد ستاره‌ای 060',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:60},
    {id:'ev_061',realm:5,title:'رویداد ستاره‌ای 061',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:70},
    {id:'ev_062',realm:6,title:'رویداد ستاره‌ای 062',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:80},
    {id:'ev_063',realm:0,title:'رویداد ستاره‌ای 063',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:90},
    {id:'ev_064',realm:1,title:'رویداد ستاره‌ای 064',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:20},
    {id:'ev_065',realm:2,title:'رویداد ستاره‌ای 065',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:30},
    {id:'ev_066',realm:3,title:'رویداد ستاره‌ای 066',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:40},
    {id:'ev_067',realm:4,title:'رویداد ستاره‌ای 067',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:50},
    {id:'ev_068',realm:5,title:'رویداد ستاره‌ای 068',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:60},
    {id:'ev_069',realm:6,title:'رویداد ستاره‌ای 069',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:70},
    {id:'ev_070',realm:0,title:'رویداد ستاره‌ای 070',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:80},
    {id:'ev_071',realm:1,title:'رویداد ستاره‌ای 071',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:90},
    {id:'ev_072',realm:2,title:'رویداد ستاره‌ای 072',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:20},
    {id:'ev_073',realm:3,title:'رویداد ستاره‌ای 073',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:30},
    {id:'ev_074',realm:4,title:'رویداد ستاره‌ای 074',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:40},
    {id:'ev_075',realm:5,title:'رویداد ستاره‌ای 075',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:50},
    {id:'ev_076',realm:6,title:'رویداد ستاره‌ای 076',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:60},
    {id:'ev_077',realm:0,title:'رویداد ستاره‌ای 077',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:70},
    {id:'ev_078',realm:1,title:'رویداد ستاره‌ای 078',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:80},
    {id:'ev_079',realm:2,title:'رویداد ستاره‌ای 079',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:90},
    {id:'ev_080',realm:3,title:'رویداد ستاره‌ای 080',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:20},
    {id:'ev_081',realm:4,title:'رویداد ستاره‌ای 081',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:30},
    {id:'ev_082',realm:5,title:'رویداد ستاره‌ای 082',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:40},
    {id:'ev_083',realm:6,title:'رویداد ستاره‌ای 083',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:50},
    {id:'ev_084',realm:0,title:'رویداد ستاره‌ای 084',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:60},
    {id:'ev_085',realm:1,title:'رویداد ستاره‌ای 085',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:70},
    {id:'ev_086',realm:2,title:'رویداد ستاره‌ای 086',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:80},
    {id:'ev_087',realm:3,title:'رویداد ستاره‌ای 087',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:90},
    {id:'ev_088',realm:4,title:'رویداد ستاره‌ای 088',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:20},
    {id:'ev_089',realm:5,title:'رویداد ستاره‌ای 089',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:30},
    {id:'ev_090',realm:6,title:'رویداد ستاره‌ای 090',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:40},
    {id:'ev_091',realm:0,title:'رویداد ستاره‌ای 091',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:50},
    {id:'ev_092',realm:1,title:'رویداد ستاره‌ای 092',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:60},
    {id:'ev_093',realm:2,title:'رویداد ستاره‌ای 093',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:70},
    {id:'ev_094',realm:3,title:'رویداد ستاره‌ای 094',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:80},
    {id:'ev_095',realm:4,title:'رویداد ستاره‌ای 095',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:90},
    {id:'ev_096',realm:5,title:'رویداد ستاره‌ای 096',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:20},
    {id:'ev_097',realm:6,title:'رویداد ستاره‌ای 097',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:30},
    {id:'ev_098',realm:0,title:'رویداد ستاره‌ای 098',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:40},
    {id:'ev_099',realm:1,title:'رویداد ستاره‌ای 099',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:50},
    {id:'ev_100',realm:2,title:'رویداد ستاره‌ای 100',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:60},
    {id:'ev_101',realm:3,title:'رویداد ستاره‌ای 101',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:70},
    {id:'ev_102',realm:4,title:'رویداد ستاره‌ای 102',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:80},
    {id:'ev_103',realm:5,title:'رویداد ستاره‌ای 103',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:90},
    {id:'ev_104',realm:6,title:'رویداد ستاره‌ای 104',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:20},
    {id:'ev_105',realm:0,title:'رویداد ستاره‌ای 105',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:30},
    {id:'ev_106',realm:1,title:'رویداد ستاره‌ای 106',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:40},
    {id:'ev_107',realm:2,title:'رویداد ستاره‌ای 107',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:50},
    {id:'ev_108',realm:3,title:'رویداد ستاره‌ای 108',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:60},
    {id:'ev_109',realm:4,title:'رویداد ستاره‌ای 109',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:70},
    {id:'ev_110',realm:5,title:'رویداد ستاره‌ای 110',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:80},
    {id:'ev_111',realm:6,title:'رویداد ستاره‌ای 111',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:90},
    {id:'ev_112',realm:0,title:'رویداد ستاره‌ای 112',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:20},
    {id:'ev_113',realm:1,title:'رویداد ستاره‌ای 113',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:30},
    {id:'ev_114',realm:2,title:'رویداد ستاره‌ای 114',text:'یک تغییر کوچک اما محسوس در جهان شماره 3 رخ داد.',reward:40},
    {id:'ev_115',realm:3,title:'رویداد ستاره‌ای 115',text:'یک تغییر کوچک اما محسوس در جهان شماره 4 رخ داد.',reward:50},
    {id:'ev_116',realm:4,title:'رویداد ستاره‌ای 116',text:'یک تغییر کوچک اما محسوس در جهان شماره 5 رخ داد.',reward:60},
    {id:'ev_117',realm:5,title:'رویداد ستاره‌ای 117',text:'یک تغییر کوچک اما محسوس در جهان شماره 6 رخ داد.',reward:70},
    {id:'ev_118',realm:6,title:'رویداد ستاره‌ای 118',text:'یک تغییر کوچک اما محسوس در جهان شماره 7 رخ داد.',reward:80},
    {id:'ev_119',realm:0,title:'رویداد ستاره‌ای 119',text:'یک تغییر کوچک اما محسوس در جهان شماره 1 رخ داد.',reward:90},
    {id:'ev_120',realm:1,title:'رویداد ستاره‌ای 120',text:'یک تغییر کوچک اما محسوس در جهان شماره 2 رخ داد.',reward:20}
  ];
  U.challengeCatalog=[
    {id:'ch_001',name:'چالش 001',kind:'combat',value:4,xp:55,coins:30},
    {id:'ch_002',name:'چالش 002',kind:'travel',value:5,xp:70,coins:40},
    {id:'ch_003',name:'چالش 003',kind:'craft',value:6,xp:85,coins:50},
    {id:'ch_004',name:'چالش 004',kind:'survive',value:7,xp:100,coins:60},
    {id:'ch_005',name:'چالش 005',kind:'collect',value:8,xp:115,coins:70},
    {id:'ch_006',name:'چالش 006',kind:'combat',value:9,xp:130,coins:80},
    {id:'ch_007',name:'چالش 007',kind:'travel',value:10,xp:145,coins:20},
    {id:'ch_008',name:'چالش 008',kind:'craft',value:11,xp:160,coins:30},
    {id:'ch_009',name:'چالش 009',kind:'survive',value:12,xp:40,coins:40},
    {id:'ch_010',name:'چالش 010',kind:'collect',value:13,xp:55,coins:50},
    {id:'ch_011',name:'چالش 011',kind:'combat',value:14,xp:70,coins:60},
    {id:'ch_012',name:'چالش 012',kind:'travel',value:3,xp:85,coins:70},
    {id:'ch_013',name:'چالش 013',kind:'craft',value:4,xp:100,coins:80},
    {id:'ch_014',name:'چالش 014',kind:'survive',value:5,xp:115,coins:20},
    {id:'ch_015',name:'چالش 015',kind:'collect',value:6,xp:130,coins:30},
    {id:'ch_016',name:'چالش 016',kind:'combat',value:7,xp:145,coins:40},
    {id:'ch_017',name:'چالش 017',kind:'travel',value:8,xp:160,coins:50},
    {id:'ch_018',name:'چالش 018',kind:'craft',value:9,xp:40,coins:60},
    {id:'ch_019',name:'چالش 019',kind:'survive',value:10,xp:55,coins:70},
    {id:'ch_020',name:'چالش 020',kind:'collect',value:11,xp:70,coins:80},
    {id:'ch_021',name:'چالش 021',kind:'combat',value:12,xp:85,coins:20},
    {id:'ch_022',name:'چالش 022',kind:'travel',value:13,xp:100,coins:30},
    {id:'ch_023',name:'چالش 023',kind:'craft',value:14,xp:115,coins:40},
    {id:'ch_024',name:'چالش 024',kind:'survive',value:3,xp:130,coins:50},
    {id:'ch_025',name:'چالش 025',kind:'collect',value:4,xp:145,coins:60},
    {id:'ch_026',name:'چالش 026',kind:'combat',value:5,xp:160,coins:70},
    {id:'ch_027',name:'چالش 027',kind:'travel',value:6,xp:40,coins:80},
    {id:'ch_028',name:'چالش 028',kind:'craft',value:7,xp:55,coins:20},
    {id:'ch_029',name:'چالش 029',kind:'survive',value:8,xp:70,coins:30},
    {id:'ch_030',name:'چالش 030',kind:'collect',value:9,xp:85,coins:40},
    {id:'ch_031',name:'چالش 031',kind:'combat',value:10,xp:100,coins:50},
    {id:'ch_032',name:'چالش 032',kind:'travel',value:11,xp:115,coins:60},
    {id:'ch_033',name:'چالش 033',kind:'craft',value:12,xp:130,coins:70},
    {id:'ch_034',name:'چالش 034',kind:'survive',value:13,xp:145,coins:80},
    {id:'ch_035',name:'چالش 035',kind:'collect',value:14,xp:160,coins:20},
    {id:'ch_036',name:'چالش 036',kind:'combat',value:3,xp:40,coins:30},
    {id:'ch_037',name:'چالش 037',kind:'travel',value:4,xp:55,coins:40},
    {id:'ch_038',name:'چالش 038',kind:'craft',value:5,xp:70,coins:50},
    {id:'ch_039',name:'چالش 039',kind:'survive',value:6,xp:85,coins:60},
    {id:'ch_040',name:'چالش 040',kind:'collect',value:7,xp:100,coins:70},
    {id:'ch_041',name:'چالش 041',kind:'combat',value:8,xp:115,coins:80},
    {id:'ch_042',name:'چالش 042',kind:'travel',value:9,xp:130,coins:20},
    {id:'ch_043',name:'چالش 043',kind:'craft',value:10,xp:145,coins:30},
    {id:'ch_044',name:'چالش 044',kind:'survive',value:11,xp:160,coins:40},
    {id:'ch_045',name:'چالش 045',kind:'collect',value:12,xp:40,coins:50},
    {id:'ch_046',name:'چالش 046',kind:'combat',value:13,xp:55,coins:60},
    {id:'ch_047',name:'چالش 047',kind:'travel',value:14,xp:70,coins:70},
    {id:'ch_048',name:'چالش 048',kind:'craft',value:3,xp:85,coins:80},
    {id:'ch_049',name:'چالش 049',kind:'survive',value:4,xp:100,coins:20},
    {id:'ch_050',name:'چالش 050',kind:'collect',value:5,xp:115,coins:30},
    {id:'ch_051',name:'چالش 051',kind:'combat',value:6,xp:130,coins:40},
    {id:'ch_052',name:'چالش 052',kind:'travel',value:7,xp:145,coins:50},
    {id:'ch_053',name:'چالش 053',kind:'craft',value:8,xp:160,coins:60},
    {id:'ch_054',name:'چالش 054',kind:'survive',value:9,xp:40,coins:70},
    {id:'ch_055',name:'چالش 055',kind:'collect',value:10,xp:55,coins:80},
    {id:'ch_056',name:'چالش 056',kind:'combat',value:11,xp:70,coins:20},
    {id:'ch_057',name:'چالش 057',kind:'travel',value:12,xp:85,coins:30},
    {id:'ch_058',name:'چالش 058',kind:'craft',value:13,xp:100,coins:40},
    {id:'ch_059',name:'چالش 059',kind:'survive',value:14,xp:115,coins:50},
    {id:'ch_060',name:'چالش 060',kind:'collect',value:3,xp:130,coins:60},
    {id:'ch_061',name:'چالش 061',kind:'combat',value:4,xp:145,coins:70},
    {id:'ch_062',name:'چالش 062',kind:'travel',value:5,xp:160,coins:80},
    {id:'ch_063',name:'چالش 063',kind:'craft',value:6,xp:40,coins:20},
    {id:'ch_064',name:'چالش 064',kind:'survive',value:7,xp:55,coins:30},
    {id:'ch_065',name:'چالش 065',kind:'collect',value:8,xp:70,coins:40},
    {id:'ch_066',name:'چالش 066',kind:'combat',value:9,xp:85,coins:50},
    {id:'ch_067',name:'چالش 067',kind:'travel',value:10,xp:100,coins:60},
    {id:'ch_068',name:'چالش 068',kind:'craft',value:11,xp:115,coins:70},
    {id:'ch_069',name:'چالش 069',kind:'survive',value:12,xp:130,coins:80},
    {id:'ch_070',name:'چالش 070',kind:'collect',value:13,xp:145,coins:20},
    {id:'ch_071',name:'چالش 071',kind:'combat',value:14,xp:160,coins:30},
    {id:'ch_072',name:'چالش 072',kind:'travel',value:3,xp:40,coins:40},
    {id:'ch_073',name:'چالش 073',kind:'craft',value:4,xp:55,coins:50},
    {id:'ch_074',name:'چالش 074',kind:'survive',value:5,xp:70,coins:60},
    {id:'ch_075',name:'چالش 075',kind:'collect',value:6,xp:85,coins:70},
    {id:'ch_076',name:'چالش 076',kind:'combat',value:7,xp:100,coins:80},
    {id:'ch_077',name:'چالش 077',kind:'travel',value:8,xp:115,coins:20},
    {id:'ch_078',name:'چالش 078',kind:'craft',value:9,xp:130,coins:30},
    {id:'ch_079',name:'چالش 079',kind:'survive',value:10,xp:145,coins:40},
    {id:'ch_080',name:'چالش 080',kind:'collect',value:11,xp:160,coins:50},
    {id:'ch_081',name:'چالش 081',kind:'combat',value:12,xp:40,coins:60},
    {id:'ch_082',name:'چالش 082',kind:'travel',value:13,xp:55,coins:70},
    {id:'ch_083',name:'چالش 083',kind:'craft',value:14,xp:70,coins:80},
    {id:'ch_084',name:'چالش 084',kind:'survive',value:3,xp:85,coins:20},
    {id:'ch_085',name:'چالش 085',kind:'collect',value:4,xp:100,coins:30},
    {id:'ch_086',name:'چالش 086',kind:'combat',value:5,xp:115,coins:40},
    {id:'ch_087',name:'چالش 087',kind:'travel',value:6,xp:130,coins:50},
    {id:'ch_088',name:'چالش 088',kind:'craft',value:7,xp:145,coins:60},
    {id:'ch_089',name:'چالش 089',kind:'survive',value:8,xp:160,coins:70},
    {id:'ch_090',name:'چالش 090',kind:'collect',value:9,xp:40,coins:80},
    {id:'ch_091',name:'چالش 091',kind:'combat',value:10,xp:55,coins:20},
    {id:'ch_092',name:'چالش 092',kind:'travel',value:11,xp:70,coins:30},
    {id:'ch_093',name:'چالش 093',kind:'craft',value:12,xp:85,coins:40},
    {id:'ch_094',name:'چالش 094',kind:'survive',value:13,xp:100,coins:50},
    {id:'ch_095',name:'چالش 095',kind:'collect',value:14,xp:115,coins:60},
    {id:'ch_096',name:'چالش 096',kind:'combat',value:3,xp:130,coins:70},
    {id:'ch_097',name:'چالش 097',kind:'travel',value:4,xp:145,coins:80},
    {id:'ch_098',name:'چالش 098',kind:'craft',value:5,xp:160,coins:20},
    {id:'ch_099',name:'چالش 099',kind:'survive',value:6,xp:40,coins:30},
    {id:'ch_100',name:'چالش 100',kind:'collect',value:7,xp:55,coins:40},
    {id:'ch_101',name:'چالش 101',kind:'combat',value:8,xp:70,coins:50},
    {id:'ch_102',name:'چالش 102',kind:'travel',value:9,xp:85,coins:60},
    {id:'ch_103',name:'چالش 103',kind:'craft',value:10,xp:100,coins:70},
    {id:'ch_104',name:'چالش 104',kind:'survive',value:11,xp:115,coins:80},
    {id:'ch_105',name:'چالش 105',kind:'collect',value:12,xp:130,coins:20},
    {id:'ch_106',name:'چالش 106',kind:'combat',value:13,xp:145,coins:30},
    {id:'ch_107',name:'چالش 107',kind:'travel',value:14,xp:160,coins:40},
    {id:'ch_108',name:'چالش 108',kind:'craft',value:3,xp:40,coins:50},
    {id:'ch_109',name:'چالش 109',kind:'survive',value:4,xp:55,coins:60},
    {id:'ch_110',name:'چالش 110',kind:'collect',value:5,xp:70,coins:70},
    {id:'ch_111',name:'چالش 111',kind:'combat',value:6,xp:85,coins:80},
    {id:'ch_112',name:'چالش 112',kind:'travel',value:7,xp:100,coins:20},
    {id:'ch_113',name:'چالش 113',kind:'craft',value:8,xp:115,coins:30},
    {id:'ch_114',name:'چالش 114',kind:'survive',value:9,xp:130,coins:40},
    {id:'ch_115',name:'چالش 115',kind:'collect',value:10,xp:145,coins:50},
    {id:'ch_116',name:'چالش 116',kind:'combat',value:11,xp:160,coins:60},
    {id:'ch_117',name:'چالش 117',kind:'travel',value:12,xp:40,coins:70},
    {id:'ch_118',name:'چالش 118',kind:'craft',value:13,xp:55,coins:80},
    {id:'ch_119',name:'چالش 119',kind:'survive',value:14,xp:70,coins:20},
    {id:'ch_120',name:'چالش 120',kind:'collect',value:3,xp:85,coins:30}
  ];
  U.dialogueCatalog={
    oracle_001:['«خاطره 001 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_002:['«خاطره 002 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_003:['«خاطره 003 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_004:['«خاطره 004 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_005:['«خاطره 005 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_006:['«خاطره 006 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_007:['«خاطره 007 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_008:['«خاطره 008 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_009:['«خاطره 009 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_010:['«خاطره 010 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_011:['«خاطره 011 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_012:['«خاطره 012 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_013:['«خاطره 013 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_014:['«خاطره 014 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_015:['«خاطره 015 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_016:['«خاطره 016 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_017:['«خاطره 017 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_018:['«خاطره 018 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_019:['«خاطره 019 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_020:['«خاطره 020 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_021:['«خاطره 021 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_022:['«خاطره 022 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_023:['«خاطره 023 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_024:['«خاطره 024 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_025:['«خاطره 025 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_026:['«خاطره 026 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_027:['«خاطره 027 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_028:['«خاطره 028 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_029:['«خاطره 029 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_030:['«خاطره 030 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_031:['«خاطره 031 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_032:['«خاطره 032 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_033:['«خاطره 033 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_034:['«خاطره 034 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_035:['«خاطره 035 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_036:['«خاطره 036 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_037:['«خاطره 037 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_038:['«خاطره 038 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_039:['«خاطره 039 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_040:['«خاطره 040 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_041:['«خاطره 041 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_042:['«خاطره 042 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_043:['«خاطره 043 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_044:['«خاطره 044 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_045:['«خاطره 045 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_046:['«خاطره 046 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_047:['«خاطره 047 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_048:['«خاطره 048 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_049:['«خاطره 049 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_050:['«خاطره 050 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_051:['«خاطره 051 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_052:['«خاطره 052 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_053:['«خاطره 053 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_054:['«خاطره 054 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_055:['«خاطره 055 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_056:['«خاطره 056 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_057:['«خاطره 057 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_058:['«خاطره 058 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_059:['«خاطره 059 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_060:['«خاطره 060 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_061:['«خاطره 061 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_062:['«خاطره 062 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_063:['«خاطره 063 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_064:['«خاطره 064 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_065:['«خاطره 065 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_066:['«خاطره 066 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_067:['«خاطره 067 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_068:['«خاطره 068 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_069:['«خاطره 069 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_070:['«خاطره 070 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_071:['«خاطره 071 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_072:['«خاطره 072 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_073:['«خاطره 073 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_074:['«خاطره 074 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_075:['«خاطره 075 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_076:['«خاطره 076 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_077:['«خاطره 077 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_078:['«خاطره 078 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_079:['«خاطره 079 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_080:['«خاطره 080 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_081:['«خاطره 081 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_082:['«خاطره 082 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_083:['«خاطره 083 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_084:['«خاطره 084 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_085:['«خاطره 085 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_086:['«خاطره 086 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_087:['«خاطره 087 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_088:['«خاطره 088 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_089:['«خاطره 089 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_090:['«خاطره 090 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_091:['«خاطره 091 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_092:['«خاطره 092 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_093:['«خاطره 093 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_094:['«خاطره 094 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_095:['«خاطره 095 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_096:['«خاطره 096 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_097:['«خاطره 097 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_098:['«خاطره 098 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_099:['«خاطره 099 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»'],
    oracle_100:['«خاطره 100 را فراموش نکن.»','«این جهان برای انتخاب‌هایت پاسخ دارد.»','«قدم بعدی را خودت انتخاب کن.»']
  };
  U.realmObjectives=[
    {realm:0,name:'باغ دیدار',objective:'هدف ویژه قلمرو 1',threshold:8,rewardXP:120,rewardCoins:60},
    {realm:1,name:'اقیانوس صبر',objective:'هدف ویژه قلمرو 2',threshold:12,rewardXP:180,rewardCoins:100},
    {realm:2,name:'کهکشان نرگس',objective:'هدف ویژه قلمرو 3',threshold:16,rewardXP:240,rewardCoins:140},
    {realm:3,name:'پاییز دلتنگی',objective:'هدف ویژه قلمرو 4',threshold:20,rewardXP:300,rewardCoins:180},
    {realm:4,name:'شهر آینده',objective:'هدف ویژه قلمرو 5',threshold:24,rewardXP:360,rewardCoins:220},
    {realm:5,name:'قله بلورین',objective:'هدف ویژه قلمرو 6',threshold:28,rewardXP:420,rewardCoins:260},
    {realm:6,name:'معبد وصال',objective:'هدف ویژه قلمرو 7',threshold:32,rewardXP:480,rewardCoins:300}
  ];
  U.lootTable=[
    {id:'loot_001',rarity:'rare',value:13,weight:99},
    {id:'loot_002',rarity:'epic',value:16,weight:98},
    {id:'loot_003',rarity:'legendary',value:19,weight:97},
    {id:'loot_004',rarity:'common',value:22,weight:96},
    {id:'loot_005',rarity:'rare',value:25,weight:95},
    {id:'loot_006',rarity:'epic',value:28,weight:94},
    {id:'loot_007',rarity:'legendary',value:31,weight:93},
    {id:'loot_008',rarity:'common',value:34,weight:92},
    {id:'loot_009',rarity:'rare',value:37,weight:91},
    {id:'loot_010',rarity:'epic',value:40,weight:90},
    {id:'loot_011',rarity:'legendary',value:43,weight:89},
    {id:'loot_012',rarity:'common',value:46,weight:88},
    {id:'loot_013',rarity:'rare',value:49,weight:87},
    {id:'loot_014',rarity:'epic',value:52,weight:86},
    {id:'loot_015',rarity:'legendary',value:55,weight:85},
    {id:'loot_016',rarity:'common',value:58,weight:84},
    {id:'loot_017',rarity:'rare',value:61,weight:83},
    {id:'loot_018',rarity:'epic',value:64,weight:82},
    {id:'loot_019',rarity:'legendary',value:67,weight:81},
    {id:'loot_020',rarity:'common',value:70,weight:80},
    {id:'loot_021',rarity:'rare',value:73,weight:79},
    {id:'loot_022',rarity:'epic',value:76,weight:78},
    {id:'loot_023',rarity:'legendary',value:79,weight:77},
    {id:'loot_024',rarity:'common',value:82,weight:76},
    {id:'loot_025',rarity:'rare',value:85,weight:75},
    {id:'loot_026',rarity:'epic',value:88,weight:74},
    {id:'loot_027',rarity:'legendary',value:91,weight:73},
    {id:'loot_028',rarity:'common',value:94,weight:72},
    {id:'loot_029',rarity:'rare',value:97,weight:71},
    {id:'loot_030',rarity:'epic',value:100,weight:70},
    {id:'loot_031',rarity:'legendary',value:103,weight:69},
    {id:'loot_032',rarity:'common',value:106,weight:68},
    {id:'loot_033',rarity:'rare',value:109,weight:67},
    {id:'loot_034',rarity:'epic',value:112,weight:66},
    {id:'loot_035',rarity:'legendary',value:115,weight:65},
    {id:'loot_036',rarity:'common',value:118,weight:64},
    {id:'loot_037',rarity:'rare',value:121,weight:63},
    {id:'loot_038',rarity:'epic',value:124,weight:62},
    {id:'loot_039',rarity:'legendary',value:127,weight:61},
    {id:'loot_040',rarity:'common',value:130,weight:60},
    {id:'loot_041',rarity:'rare',value:133,weight:59},
    {id:'loot_042',rarity:'epic',value:136,weight:58},
    {id:'loot_043',rarity:'legendary',value:139,weight:57},
    {id:'loot_044',rarity:'common',value:142,weight:56},
    {id:'loot_045',rarity:'rare',value:145,weight:55},
    {id:'loot_046',rarity:'epic',value:148,weight:54},
    {id:'loot_047',rarity:'legendary',value:151,weight:53},
    {id:'loot_048',rarity:'common',value:154,weight:52},
    {id:'loot_049',rarity:'rare',value:157,weight:51},
    {id:'loot_050',rarity:'epic',value:160,weight:50},
    {id:'loot_051',rarity:'legendary',value:163,weight:49},
    {id:'loot_052',rarity:'common',value:166,weight:48},
    {id:'loot_053',rarity:'rare',value:169,weight:47},
    {id:'loot_054',rarity:'epic',value:172,weight:46},
    {id:'loot_055',rarity:'legendary',value:175,weight:45},
    {id:'loot_056',rarity:'common',value:178,weight:44},
    {id:'loot_057',rarity:'rare',value:181,weight:43},
    {id:'loot_058',rarity:'epic',value:184,weight:42},
    {id:'loot_059',rarity:'legendary',value:187,weight:41},
    {id:'loot_060',rarity:'common',value:190,weight:40},
    {id:'loot_061',rarity:'rare',value:193,weight:39},
    {id:'loot_062',rarity:'epic',value:196,weight:38},
    {id:'loot_063',rarity:'legendary',value:199,weight:37},
    {id:'loot_064',rarity:'common',value:202,weight:36},
    {id:'loot_065',rarity:'rare',value:205,weight:35},
    {id:'loot_066',rarity:'epic',value:208,weight:34},
    {id:'loot_067',rarity:'legendary',value:211,weight:33},
    {id:'loot_068',rarity:'common',value:214,weight:32},
    {id:'loot_069',rarity:'rare',value:217,weight:31},
    {id:'loot_070',rarity:'epic',value:220,weight:30},
    {id:'loot_071',rarity:'legendary',value:223,weight:29},
    {id:'loot_072',rarity:'common',value:226,weight:28},
    {id:'loot_073',rarity:'rare',value:229,weight:27},
    {id:'loot_074',rarity:'epic',value:232,weight:26},
    {id:'loot_075',rarity:'legendary',value:235,weight:25},
    {id:'loot_076',rarity:'common',value:238,weight:24},
    {id:'loot_077',rarity:'rare',value:241,weight:23},
    {id:'loot_078',rarity:'epic',value:244,weight:22},
    {id:'loot_079',rarity:'legendary',value:247,weight:21},
    {id:'loot_080',rarity:'common',value:250,weight:20},
    {id:'loot_081',rarity:'rare',value:253,weight:19},
    {id:'loot_082',rarity:'epic',value:256,weight:18},
    {id:'loot_083',rarity:'legendary',value:259,weight:17},
    {id:'loot_084',rarity:'common',value:262,weight:16},
    {id:'loot_085',rarity:'rare',value:265,weight:15},
    {id:'loot_086',rarity:'epic',value:268,weight:14},
    {id:'loot_087',rarity:'legendary',value:271,weight:13},
    {id:'loot_088',rarity:'common',value:274,weight:12},
    {id:'loot_089',rarity:'rare',value:277,weight:11},
    {id:'loot_090',rarity:'epic',value:280,weight:10},
    {id:'loot_091',rarity:'legendary',value:283,weight:9},
    {id:'loot_092',rarity:'common',value:286,weight:8},
    {id:'loot_093',rarity:'rare',value:289,weight:7},
    {id:'loot_094',rarity:'epic',value:292,weight:6},
    {id:'loot_095',rarity:'legendary',value:295,weight:5},
    {id:'loot_096',rarity:'common',value:298,weight:4},
    {id:'loot_097',rarity:'rare',value:301,weight:3},
    {id:'loot_098',rarity:'epic',value:304,weight:2},
    {id:'loot_099',rarity:'legendary',value:307,weight:1},
    {id:'loot_100',rarity:'common',value:310,weight:1}
  ];
  U.secretDoors=[
    {id:'door_01',realm:1,position:{x:-9,z:-14},need:3,type:'memory'},
    {id:'door_02',realm:2,position:{x:0,z:-7},need:4,type:'memory'},
    {id:'door_03',realm:3,position:{x:9,z:0},need:5,type:'memory'},
    {id:'door_04',realm:4,position:{x:18,z:7},need:6,type:'memory'},
    {id:'door_05',realm:5,position:{x:-18,z:14},need:7,type:'memory'},
    {id:'door_06',realm:6,position:{x:-9,z:21},need:2,type:'memory'},
    {id:'door_07',realm:0,position:{x:0,z:-21},need:3,type:'memory'},
    {id:'door_08',realm:1,position:{x:9,z:-14},need:4,type:'memory'},
    {id:'door_09',realm:2,position:{x:18,z:-7},need:5,type:'memory'},
    {id:'door_10',realm:3,position:{x:-18,z:0},need:6,type:'memory'},
    {id:'door_11',realm:4,position:{x:-9,z:7},need:7,type:'memory'},
    {id:'door_12',realm:5,position:{x:0,z:14},need:2,type:'memory'},
    {id:'door_13',realm:6,position:{x:9,z:21},need:3,type:'memory'},
    {id:'door_14',realm:0,position:{x:18,z:-21},need:4,type:'memory'},
    {id:'door_15',realm:1,position:{x:-18,z:-14},need:5,type:'memory'},
    {id:'door_16',realm:2,position:{x:-9,z:-7},need:6,type:'memory'},
    {id:'door_17',realm:3,position:{x:0,z:0},need:7,type:'memory'},
    {id:'door_18',realm:4,position:{x:9,z:7},need:2,type:'memory'},
    {id:'door_19',realm:5,position:{x:18,z:14},need:3,type:'memory'},
    {id:'door_20',realm:6,position:{x:-18,z:21},need:4,type:'memory'},
    {id:'door_21',realm:0,position:{x:-9,z:-21},need:5,type:'memory'},
    {id:'door_22',realm:1,position:{x:0,z:-14},need:6,type:'memory'},
    {id:'door_23',realm:2,position:{x:9,z:-7},need:7,type:'memory'},
    {id:'door_24',realm:3,position:{x:18,z:0},need:2,type:'memory'},
    {id:'door_25',realm:4,position:{x:-18,z:7},need:3,type:'memory'},
    {id:'door_26',realm:5,position:{x:-9,z:14},need:4,type:'memory'},
    {id:'door_27',realm:6,position:{x:0,z:21},need:5,type:'memory'},
    {id:'door_28',realm:0,position:{x:9,z:-21},need:6,type:'memory'},
    {id:'door_29',realm:1,position:{x:18,z:-14},need:7,type:'memory'},
    {id:'door_30',realm:2,position:{x:-18,z:-7},need:2,type:'memory'},
    {id:'door_31',realm:3,position:{x:-9,z:0},need:3,type:'memory'},
    {id:'door_32',realm:4,position:{x:0,z:7},need:4,type:'memory'},
    {id:'door_33',realm:5,position:{x:9,z:14},need:5,type:'memory'},
    {id:'door_34',realm:6,position:{x:18,z:21},need:6,type:'memory'},
    {id:'door_35',realm:0,position:{x:-18,z:-21},need:7,type:'memory'},
    {id:'door_36',realm:1,position:{x:-9,z:-14},need:2,type:'memory'},
    {id:'door_37',realm:2,position:{x:0,z:-7},need:3,type:'memory'},
    {id:'door_38',realm:3,position:{x:9,z:0},need:4,type:'memory'},
    {id:'door_39',realm:4,position:{x:18,z:7},need:5,type:'memory'},
    {id:'door_40',realm:5,position:{x:-18,z:14},need:6,type:'memory'},
    {id:'door_41',realm:6,position:{x:-9,z:21},need:7,type:'memory'},
    {id:'door_42',realm:0,position:{x:0,z:-21},need:2,type:'memory'},
    {id:'door_43',realm:1,position:{x:9,z:-14},need:3,type:'memory'},
    {id:'door_44',realm:2,position:{x:18,z:-7},need:4,type:'memory'},
    {id:'door_45',realm:3,position:{x:-18,z:0},need:5,type:'memory'},
    {id:'door_46',realm:4,position:{x:-9,z:7},need:6,type:'memory'},
    {id:'door_47',realm:5,position:{x:0,z:14},need:7,type:'memory'},
    {id:'door_48',realm:6,position:{x:9,z:21},need:2,type:'memory'},
    {id:'door_49',realm:0,position:{x:18,z:-21},need:3,type:'memory'},
    {id:'door_50',realm:1,position:{x:-18,z:-14},need:4,type:'memory'}
  ];
  U.milestones=[
    {id:'ms_01',target:2,label:'نقطه عطف 01',reward:35},
    {id:'ms_02',target:4,label:'نقطه عطف 02',reward:45},
    {id:'ms_03',target:6,label:'نقطه عطف 03',reward:55},
    {id:'ms_04',target:8,label:'نقطه عطف 04',reward:65},
    {id:'ms_05',target:10,label:'نقطه عطف 05',reward:75},
    {id:'ms_06',target:12,label:'نقطه عطف 06',reward:85},
    {id:'ms_07',target:14,label:'نقطه عطف 07',reward:95},
    {id:'ms_08',target:16,label:'نقطه عطف 08',reward:105},
    {id:'ms_09',target:18,label:'نقطه عطف 09',reward:115},
    {id:'ms_10',target:20,label:'نقطه عطف 10',reward:25},
    {id:'ms_11',target:22,label:'نقطه عطف 11',reward:35},
    {id:'ms_12',target:24,label:'نقطه عطف 12',reward:45},
    {id:'ms_13',target:26,label:'نقطه عطف 13',reward:55},
    {id:'ms_14',target:28,label:'نقطه عطف 14',reward:65},
    {id:'ms_15',target:30,label:'نقطه عطف 15',reward:75},
    {id:'ms_16',target:32,label:'نقطه عطف 16',reward:85},
    {id:'ms_17',target:34,label:'نقطه عطف 17',reward:95},
    {id:'ms_18',target:36,label:'نقطه عطف 18',reward:105},
    {id:'ms_19',target:38,label:'نقطه عطف 19',reward:115},
    {id:'ms_20',target:40,label:'نقطه عطف 20',reward:25},
    {id:'ms_21',target:42,label:'نقطه عطف 21',reward:35},
    {id:'ms_22',target:44,label:'نقطه عطف 22',reward:45},
    {id:'ms_23',target:46,label:'نقطه عطف 23',reward:55},
    {id:'ms_24',target:48,label:'نقطه عطف 24',reward:65},
    {id:'ms_25',target:50,label:'نقطه عطف 25',reward:75},
    {id:'ms_26',target:52,label:'نقطه عطف 26',reward:85},
    {id:'ms_27',target:54,label:'نقطه عطف 27',reward:95},
    {id:'ms_28',target:56,label:'نقطه عطف 28',reward:105},
    {id:'ms_29',target:58,label:'نقطه عطف 29',reward:115},
    {id:'ms_30',target:60,label:'نقطه عطف 30',reward:25},
    {id:'ms_31',target:62,label:'نقطه عطف 31',reward:35},
    {id:'ms_32',target:64,label:'نقطه عطف 32',reward:45},
    {id:'ms_33',target:66,label:'نقطه عطف 33',reward:55},
    {id:'ms_34',target:68,label:'نقطه عطف 34',reward:65},
    {id:'ms_35',target:70,label:'نقطه عطف 35',reward:75},
    {id:'ms_36',target:72,label:'نقطه عطف 36',reward:85},
    {id:'ms_37',target:74,label:'نقطه عطف 37',reward:95},
    {id:'ms_38',target:76,label:'نقطه عطف 38',reward:105},
    {id:'ms_39',target:78,label:'نقطه عطف 39',reward:115},
    {id:'ms_40',target:80,label:'نقطه عطف 40',reward:25},
    {id:'ms_41',target:82,label:'نقطه عطف 41',reward:35},
    {id:'ms_42',target:84,label:'نقطه عطف 42',reward:45},
    {id:'ms_43',target:86,label:'نقطه عطف 43',reward:55},
    {id:'ms_44',target:88,label:'نقطه عطف 44',reward:65},
    {id:'ms_45',target:90,label:'نقطه عطف 45',reward:75},
    {id:'ms_46',target:92,label:'نقطه عطف 46',reward:85},
    {id:'ms_47',target:94,label:'نقطه عطف 47',reward:95},
    {id:'ms_48',target:96,label:'نقطه عطف 48',reward:105},
    {id:'ms_49',target:98,label:'نقطه عطف 49',reward:115},
    {id:'ms_50',target:100,label:'نقطه عطف 50',reward:25},
    {id:'ms_51',target:102,label:'نقطه عطف 51',reward:35},
    {id:'ms_52',target:104,label:'نقطه عطف 52',reward:45},
    {id:'ms_53',target:106,label:'نقطه عطف 53',reward:55},
    {id:'ms_54',target:108,label:'نقطه عطف 54',reward:65},
    {id:'ms_55',target:110,label:'نقطه عطف 55',reward:75},
    {id:'ms_56',target:112,label:'نقطه عطف 56',reward:85},
    {id:'ms_57',target:114,label:'نقطه عطف 57',reward:95},
    {id:'ms_58',target:116,label:'نقطه عطف 58',reward:105},
    {id:'ms_59',target:118,label:'نقطه عطف 59',reward:115},
    {id:'ms_60',target:120,label:'نقطه عطف 60',reward:25}
  ];
})();
/* ============================================================================
   ۱۸. ULTRA DIRECTOR — اتصال محتوای Content Pack به چرخه بازی
   ============================================================================ */
(function UltraDirector(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.director={eventIndex:0,challengeIndex:0,secretIndex:0,beatCount:0};
  U.director.pickEvent=function(realm){
    var pool=U.eventCatalog.filter(function(x){return x.realm===realm;});
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:U.eventCatalog[0];
  };
  U.director.pickChallenge=function(kind){
    var pool=U.challengeCatalog.filter(function(x){return !kind||x.kind===kind;});
    return pool.length?pool[Math.floor(Math.random()*pool.length)]:U.challengeCatalog[0];
  };
  U.director.oracleLine=function(){
    var keys=Object.keys(U.dialogueCatalog);
    var arr=U.dialogueCatalog[keys[Math.floor(Math.random()*keys.length)]];
    return arr[Math.floor(Math.random()*arr.length)];
  };
  U.director.shouldSpawnSecret=function(){
    return U.profile.memories.length>=5 && U.profile.level>=3 && U.profile.discoveredRealms.length>=3;
  };
  U.director.spawnSecretHint=function(){
    if(!U.director.shouldSpawnSecret())return;
    var d=U.secretDoors[Math.floor(Math.random()*U.secretDoors.length)];
    notify('🔮 سرنخ درب مخفی: جهان '+pnum(d.realm+1)+' — مختصات نسبی '+pnum(d.position.x)+','+pnum(d.position.z),'cyan',3400);
  };
  U.director.applyEvent=function(ev){
    if(!ev)return;
    var bonus=ev.reward;
    U.profile.essence+=1+(bonus%4);
    grantXP(bonus,'رویداد '+ev.title);
    U.director.beatCount++;
    memory(ev.title+': '+ev.text,'director');
    notify('🌠 '+ev.title+' — +'+pnum(bonus)+' XP','cyan',2600);
  };
  U.director.runChallengeBeat=function(kind){
    var c=U.director.pickChallenge(kind); if(!c)return;
    U.director.currentChallenge=c;
    progressDaily(1);
  };
  var heartbeat=0;
  setInterval(function(){
    try{
      if(!player)return;
      heartbeat++;
      if(heartbeat%2===0)U.director.runChallengeBeat('travel');
      if(heartbeat%3===0)U.director.runChallengeBeat('combat');
      if(heartbeat%5===0)U.director.runChallengeBeat('collect');
      if(heartbeat%7===0)U.director.runChallengeBeat('craft');
      if(heartbeat%11===0)U.director.runChallengeBeat('survive');
      if(heartbeat%13===0)U.director.applyEvent(U.director.pickEvent(U.worldIndex));
      if(heartbeat%17===0)U.director.spawnSecretHint();
    }catch(e){U.director.error=String(e);}
  },15000);
})();

/* ============================================================================
   ۱۹. ULTRA UTILITY LIBRARY — APIهای کوچک برای توسعه آینده
   ============================================================================ */
(function UltraUtilityLibrary(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.utils={};
  U.utils.formatTime=function(sec){
    var s=Math.max(0,Math.floor(sec));
    var h=Math.floor(s/3600); s%=3600;
    var m=Math.floor(s/60); s%=60;
    return pnum(h)+'س '+pnum(m)+'د '+pnum(s)+'ث';
  };
  U.utils.distanceToRealm=function(id){
    var w=U.worlds[id]; if(!w||!player)return Infinity;
    return Math.hypot(player.position.x-w.center.x,player.position.y-w.center.y,player.position.z-w.center.z);
  };
  U.utils.nearestRealm=function(){
    var best=0,bd=Infinity;
    for(var i=0;i<U.worlds.length;i++){var d=U.utils.distanceToRealm(i);if(d<bd){bd=d;best=i;}}
    return best;
  };
  U.utils.hasMaterial=function(key,count){ return (U.profile.inventory[key]||0)>=count; };
  U.utils.addMaterial=function(key,count){ U.profile.inventory[key]=(U.profile.inventory[key]||0)+Math.max(0,count); };
  U.utils.spendMaterial=function(key,count){
    if(!U.utils.hasMaterial(key,count))return false;
    U.profile.inventory[key]-=count; return true;
  };
  U.utils.randomRange=function(a,b){return a+Math.random()*(b-a);};
  U.utils.randomInt=function(a,b){return Math.floor(U.utils.randomRange(a,b+1));};
  U.utils.weightedPick=function(entries){
    var total=0;entries.forEach(function(e){total+=Math.max(0,e.weight||0);});
    if(total<=0)return entries[0];
    var r=Math.random()*total;for(var i=0;i<entries.length;i++){r-=entries[i].weight||0;if(r<=0)return entries[i];}
    return entries[entries.length-1];
  };
  U.utils.cloneJSON=function(obj){return safeJSONParse(JSON.stringify(obj),{});};
  U.utils.topAchievements=function(n){
    var rows=[];U.achievementData.forEach(function(a){if(U.profile.achievements[a[0]])rows.push({id:a[0],name:a[2]});});return rows.slice(-n);
  };
  U.utils.collectCount=function(type){
    var n=0;for(var i=0;i<totalCollectibles.length;i++)if(totalCollectibles[i].collected&&(!type||totalCollectibles[i].type===type))n++;return n;
  };
  U.utils.progressMain=function(){return U.utils.collectCount()+U.profile.enemiesDefeated;};
  U.utils.isEndgame=function(){return U.profile.bossDefeated&&U.profile.inventory.eternalToken>0;};
  U.utils.describe=function(){return U.profile.name+' × '+U.profile.partner+' | Lv '+U.profile.level+' | '+currentWorld().name;};
  U.utils.timestamp=function(){return nowISO();};
  U.utils.safeCall=function(fn,fallback){try{return fn();}catch(e){return fallback;}};
})();

/* ============================================================================
   ۲۰. EXTENSIBLE MODULE SLOTS — نقاط اتصال واقعی برای محتوای آینده
   ============================================================================ */
(function UltraModuleSlots(){
  var U=window.__ETERNAL_GALAXY_ULTRA__; if(!U)return;
  U.modules=U.modules||{};
  U.modules['slot_001']={enabled:true,id:'slot_001',priority:1,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_001'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_001'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_001'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_002']={enabled:true,id:'slot_002',priority:2,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_002'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_002'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_002'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_003']={enabled:true,id:'slot_003',priority:3,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_003'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_003'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_003'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_004']={enabled:true,id:'slot_004',priority:4,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_004'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_004'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_004'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_005']={enabled:true,id:'slot_005',priority:5,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_005'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_005'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_005'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_006']={enabled:true,id:'slot_006',priority:6,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_006'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_006'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_006'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_007']={enabled:true,id:'slot_007',priority:7,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_007'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_007'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_007'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_008']={enabled:true,id:'slot_008',priority:8,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_008'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_008'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_008'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_009']={enabled:true,id:'slot_009',priority:0,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_009'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_009'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_009'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_010']={enabled:true,id:'slot_010',priority:1,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_010'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_010'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_010'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_011']={enabled:true,id:'slot_011',priority:2,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_011'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_011'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_011'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_012']={enabled:true,id:'slot_012',priority:3,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_012'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_012'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_012'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_013']={enabled:true,id:'slot_013',priority:4,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_013'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_013'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_013'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_014']={enabled:true,id:'slot_014',priority:5,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_014'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_014'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_014'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_015']={enabled:true,id:'slot_015',priority:6,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_015'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_015'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_015'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_016']={enabled:true,id:'slot_016',priority:7,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_016'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_016'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_016'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_017']={enabled:true,id:'slot_017',priority:8,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_017'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_017'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_017'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_018']={enabled:true,id:'slot_018',priority:0,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_018'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_018'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_018'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_019']={enabled:true,id:'slot_019',priority:1,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_019'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_019'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_019'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_020']={enabled:true,id:'slot_020',priority:2,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_020'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_020'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_020'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_021']={enabled:true,id:'slot_021',priority:3,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_021'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_021'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_021'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_022']={enabled:true,id:'slot_022',priority:4,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_022'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_022'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_022'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_023']={enabled:true,id:'slot_023',priority:5,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_023'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_023'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_023'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_024']={enabled:true,id:'slot_024',priority:6,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_024'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_024'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_024'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_025']={enabled:true,id:'slot_025',priority:7,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_025'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_025'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_025'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_026']={enabled:true,id:'slot_026',priority:8,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_026'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_026'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_026'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_027']={enabled:true,id:'slot_027',priority:0,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_027'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_027'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_027'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_028']={enabled:true,id:'slot_028',priority:1,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_028'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_028'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_028'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_029']={enabled:true,id:'slot_029',priority:2,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_029'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_029'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_029'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_030']={enabled:true,id:'slot_030',priority:3,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_030'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_030'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_030'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_031']={enabled:true,id:'slot_031',priority:4,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_031'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_031'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_031'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_032']={enabled:true,id:'slot_032',priority:5,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_032'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_032'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_032'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_033']={enabled:true,id:'slot_033',priority:6,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_033'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_033'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_033'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_034']={enabled:true,id:'slot_034',priority:7,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_034'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_034'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_034'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_035']={enabled:true,id:'slot_035',priority:8,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_035'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_035'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_035'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_036']={enabled:true,id:'slot_036',priority:0,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_036'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_036'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_036'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_037']={enabled:true,id:'slot_037',priority:1,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_037'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_037'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_037'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_038']={enabled:true,id:'slot_038',priority:2,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_038'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_038'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_038'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_039']={enabled:true,id:'slot_039',priority:3,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_039'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_039'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_039'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_040']={enabled:true,id:'slot_040',priority:4,state:'ready',tick:function(delta){return delta*0;}};  U.modules['slot_040'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_040'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_040'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_041']={enabled:true,id:'slot_041',priority:5,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_041'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_041'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_041'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_042']={enabled:true,id:'slot_042',priority:6,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_042'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_042'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_042'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_043']={enabled:true,id:'slot_043',priority:7,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_043'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_043'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_043'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_044']={enabled:true,id:'slot_044',priority:8,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_044'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_044'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_044'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_045']={enabled:true,id:'slot_045',priority:0,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_045'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_045'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_045'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_046']={enabled:true,id:'slot_046',priority:1,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_046'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_046'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_046'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_047']={enabled:true,id:'slot_047',priority:2,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_047'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_047'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_047'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_048']={enabled:true,id:'slot_048',priority:3,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_048'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_048'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_048'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_049']={enabled:true,id:'slot_049',priority:4,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_049'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_049'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_049'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_050']={enabled:true,id:'slot_050',priority:5,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_050'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_050'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_050'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_051']={enabled:true,id:'slot_051',priority:6,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_051'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_051'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_051'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_052']={enabled:true,id:'slot_052',priority:7,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_052'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_052'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_052'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_053']={enabled:true,id:'slot_053',priority:8,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_053'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_053'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_053'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_054']={enabled:true,id:'slot_054',priority:0,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_054'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_054'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_054'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_055']={enabled:true,id:'slot_055',priority:1,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_055'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_055'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_055'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_056']={enabled:true,id:'slot_056',priority:2,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_056'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_056'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_056'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_057']={enabled:true,id:'slot_057',priority:3,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_057'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_057'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_057'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_058']={enabled:true,id:'slot_058',priority:4,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_058'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_058'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_058'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_059']={enabled:true,id:'slot_059',priority:5,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_059'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_059'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_059'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_060']={enabled:true,id:'slot_060',priority:6,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_060'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_060'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_060'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_061']={enabled:true,id:'slot_061',priority:7,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_061'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_061'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_061'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_062']={enabled:true,id:'slot_062',priority:8,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_062'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_062'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_062'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_063']={enabled:true,id:'slot_063',priority:0,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_063'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_063'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_063'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_064']={enabled:true,id:'slot_064',priority:1,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_064'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_064'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_064'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_065']={enabled:true,id:'slot_065',priority:2,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_065'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_065'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_065'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_066']={enabled:true,id:'slot_066',priority:3,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_066'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_066'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_066'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_067']={enabled:true,id:'slot_067',priority:4,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_067'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_067'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_067'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_068']={enabled:true,id:'slot_068',priority:5,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_068'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_068'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_068'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_069']={enabled:true,id:'slot_069',priority:6,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_069'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_069'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_069'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_070']={enabled:true,id:'slot_070',priority:7,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_070'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_070'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_070'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_071']={enabled:true,id:'slot_071',priority:8,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_071'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_071'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_071'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_072']={enabled:true,id:'slot_072',priority:0,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_072'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_072'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_072'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_073']={enabled:true,id:'slot_073',priority:1,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_073'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_073'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_073'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_074']={enabled:true,id:'slot_074',priority:2,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_074'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_074'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_074'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_075']={enabled:true,id:'slot_075',priority:3,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_075'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_075'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_075'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_076']={enabled:true,id:'slot_076',priority:4,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_076'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_076'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_076'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_077']={enabled:true,id:'slot_077',priority:5,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_077'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_077'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_077'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_078']={enabled:true,id:'slot_078',priority:6,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_078'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_078'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_078'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_079']={enabled:true,id:'slot_079',priority:7,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_079'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_079'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_079'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_080']={enabled:true,id:'slot_080',priority:8,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_080'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_080'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_080'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_081']={enabled:true,id:'slot_081',priority:0,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_081'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_081'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_081'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_082']={enabled:true,id:'slot_082',priority:1,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_082'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_082'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_082'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_083']={enabled:true,id:'slot_083',priority:2,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_083'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_083'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_083'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_084']={enabled:true,id:'slot_084',priority:3,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_084'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_084'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_084'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_085']={enabled:true,id:'slot_085',priority:4,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_085'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_085'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_085'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_086']={enabled:true,id:'slot_086',priority:5,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_086'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_086'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_086'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_087']={enabled:true,id:'slot_087',priority:6,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_087'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_087'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_087'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_088']={enabled:true,id:'slot_088',priority:7,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_088'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_088'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_088'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_089']={enabled:true,id:'slot_089',priority:8,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_089'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_089'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_089'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_090']={enabled:true,id:'slot_090',priority:0,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_090'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_090'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_090'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_091']={enabled:true,id:'slot_091',priority:1,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_091'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_091'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_091'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_092']={enabled:true,id:'slot_092',priority:2,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_092'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_092'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_092'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_093']={enabled:true,id:'slot_093',priority:3,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_093'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_093'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_093'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_094']={enabled:true,id:'slot_094',priority:4,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_094'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_094'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_094'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_095']={enabled:true,id:'slot_095',priority:5,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_095'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_095'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_095'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_096']={enabled:true,id:'slot_096',priority:6,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_096'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_096'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_096'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_097']={enabled:true,id:'slot_097',priority:7,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_097'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_097'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_097'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_098']={enabled:true,id:'slot_098',priority:8,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_098'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_098'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_098'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_099']={enabled:true,id:'slot_099',priority:0,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_099'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_099'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_099'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_100']={enabled:true,id:'slot_100',priority:1,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_100'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_100'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_100'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_101']={enabled:true,id:'slot_101',priority:2,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_101'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_101'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_101'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_102']={enabled:true,id:'slot_102',priority:3,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_102'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_102'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_102'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_103']={enabled:true,id:'slot_103',priority:4,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_103'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_103'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_103'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_104']={enabled:true,id:'slot_104',priority:5,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_104'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_104'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_104'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_105']={enabled:true,id:'slot_105',priority:6,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_105'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_105'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_105'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_106']={enabled:true,id:'slot_106',priority:7,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_106'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_106'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_106'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_107']={enabled:true,id:'slot_107',priority:8,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_107'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_107'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_107'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_108']={enabled:true,id:'slot_108',priority:0,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_108'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_108'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_108'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_109']={enabled:true,id:'slot_109',priority:1,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_109'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_109'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_109'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_110']={enabled:true,id:'slot_110',priority:2,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_110'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_110'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_110'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_111']={enabled:true,id:'slot_111',priority:3,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_111'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_111'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_111'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_112']={enabled:true,id:'slot_112',priority:4,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_112'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_112'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_112'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_113']={enabled:true,id:'slot_113',priority:5,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_113'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_113'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_113'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_114']={enabled:true,id:'slot_114',priority:6,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_114'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_114'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_114'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_115']={enabled:true,id:'slot_115',priority:7,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_115'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_115'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_115'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_116']={enabled:true,id:'slot_116',priority:8,state:'ready',tick:function(delta){return delta*1;}};
  U.modules['slot_116'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_116'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_116'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_117']={enabled:true,id:'slot_117',priority:0,state:'ready',tick:function(delta){return delta*2;}};
  U.modules['slot_117'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_117'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_117'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_118']={enabled:true,id:'slot_118',priority:1,state:'ready',tick:function(delta){return delta*3;}};
  U.modules['slot_118'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_118'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_118'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_119']={enabled:true,id:'slot_119',priority:2,state:'ready',tick:function(delta){return delta*4;}};
  U.modules['slot_119'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_119'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_119'].reset=function(){this.state='ready';return this.id;};
  U.modules['slot_120']={enabled:true,id:'slot_120',priority:3,state:'ready',tick:function(delta){return delta*0;}};
  U.modules['slot_120'].activate=function(){this.enabled=true;this.state='ready';return this.id;};
  U.modules['slot_120'].deactivate=function(){this.enabled=false;this.state='paused';return this.id;};
  U.modules['slot_120'].reset=function(){this.state='ready';return this.id;};
  U.moduleCount=Object.keys(U.modules).length;
})();
  </script>


  <div id="ultra-hud">
    <div id="ultra-left-stack">
      <div id="ultra-profile-card" class="ultra-panel">
        <div class="ultra-profile-line"><span class="ultra-name">🌌 مهراد × نرگس</span><span class="ultra-level" id="ultra-level-label">Lv. 1</span></div>
        <div class="ultra-bar"><span id="ultra-xp-fill"></span></div>
        <div class="ultra-profile-line" style="margin-top:3px"><span id="ultra-xp-label" style="font-size:9px;color:#cbd5e1">XP 0 / 100</span><span id="ultra-world-label" style="font-size:9px;color:#e9d5ff">باغ دیدار</span></div>
        <div class="ultra-bar"><span id="ultra-hp-fill"></span></div>
        <div class="ultra-bar"><span id="ultra-stamina-fill"></span></div>
        <div class="ultra-bar"><span id="ultra-mana-fill"></span></div>
        <div class="ultra-mini-row">
          <div class="ultra-stat-chip">❤️<strong id="ultra-hp-text">100</strong>جان</div>
          <div class="ultra-stat-chip">⚡<strong id="ultra-stamina-text">100</strong>توان</div>
          <div class="ultra-stat-chip">🔷<strong id="ultra-mana-text">100</strong>مانا</div>
        </div>
      </div>
      <div id="ultra-quest-panel" class="ultra-panel">
        <div class="ultra-kicker">مأموریت فعال</div>
        <div id="ultra-quest-title">بارِ اول</div>
        <div id="ultra-quest-text">برای آغاز سفر، اولین گوهر را پیدا کن.</div>
        <div class="ultra-bar"><span id="ultra-quest-fill" style="background:linear-gradient(90deg,#ffd76a,#ff8a65)"></span></div>
      </div>
    </div>

    <div id="ultra-right-stack">
      <button class="ultra-icon-btn" id="ultra-inventory-btn" title="اینونتوری">🎒</button>
      <button class="ultra-icon-btn" id="ultra-quest-btn" title="مأموریت‌ها">🗺️</button>
      <button class="ultra-icon-btn" id="ultra-skill-btn" title="مهارت‌ها">✨</button>
      <button class="ultra-icon-btn" id="ultra-achievement-btn" title="دستاوردها">🏆</button>
      <button class="ultra-icon-btn" id="ultra-settings-btn" title="تنظیمات">⚙️</button>
      <button class="ultra-icon-btn" id="ultra-save-btn" title="ذخیره">💾</button><button class="ultra-icon-btn" id="ultra-memory-btn" title="حافظه">🧠</button>
    </div>

    <div id="ultra-minimap-wrap" class="ultra-panel"><canvas id="ultra-minimap" width="360" height="360"></canvas></div>
    <div id="ultra-boss-banner"><div class="ultra-boss-name" id="ultra-boss-name">نگهبان فراموشی</div><div class="ultra-boss-hp"><div id="ultra-boss-hp-fill"></div></div></div>
    <div id="ultra-crosshair">✦</div>
    <div id="ultra-memory-chip">حافظه جهان: آماده ثبت یک لحظه تازه ✦</div>
    <div id="ultra-toast-stack"></div>

    <div id="ultra-combat-bar">
      <button class="ultra-action-btn primary" id="ultra-attack-btn">⚔ ضربه</button>
      <button class="ultra-action-btn cyan" id="ultra-pulse-btn">◉ پالس</button>
      <button class="ultra-action-btn gold" id="ultra-heal-btn">✚ ترمیم</button>
      <button class="ultra-action-btn" id="ultra-dash-btn">➤ جهش</button>
      <button class="ultra-action-btn" id="ultra-interact-btn">E تعامل</button>
    </div>
  </div>

  <div id="ultra-inventory-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>🎒 گنجینه و تجهیزات</h2><button class="ultra-close" data-close="ultra-inventory-modal">✕</button></div><div id="ultra-inventory-content" class="ultra-grid"></div></div></div>
  <div id="ultra-quest-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>🗺️ اطلس مأموریت‌ها</h2><button class="ultra-close" data-close="ultra-quest-modal">✕</button></div><div id="ultra-quest-content" class="ultra-grid"></div></div></div>
  <div id="ultra-skill-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>✨ درخت مهارت‌های وصال</h2><button class="ultra-close" data-close="ultra-skill-modal">✕</button></div><div id="ultra-skill-content" class="ultra-grid"></div></div></div>
  <div id="ultra-achievement-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>🏆 تالار افتخارات</h2><button class="ultra-close" data-close="ultra-achievement-modal">✕</button></div><div id="ultra-achievement-content" class="ultra-grid"></div></div></div>
  <div id="ultra-settings-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>⚙️ کنترل مرکز کهکشان</h2><button class="ultra-close" data-close="ultra-settings-modal">✕</button></div><div id="ultra-settings-content" class="ultra-grid"></div></div></div>
  <div id="ultra-codex-modal" class="ultra-overlay"><div class="ultra-window"><div class="ultra-window-head"><h2>📚 Codex — تاریخچه کهکشان</h2><button class="ultra-close" data-close="ultra-codex-modal">✕</button></div><div id="ultra-codex-content" class="ultra-grid"></div></div></div>

</body>
</html>`;

    return new Response(htmlContent, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-cache"
      }
    });
  }
};