/* =========================================================
   NYNEX FX — what the viruses actually do to the page.
   Every effect is cosmetic and cleans up after itself.
   Used by terminal.js through window.FX.
   ========================================================= */
(function fx(){
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const add = e => (document.body.appendChild(e), e);

  /* ---------- styles ---------- */
  add(el("style", null, `
  .fxhud{position:fixed;left:50%;top:96px;transform:translateX(-50%);z-index:114;font-family:var(--crt);font-size:22px;letter-spacing:.08em;
    padding:6px 16px;border:2px solid var(--red);background:rgba(10,2,0,.92);color:var(--red);box-shadow:0 0 30px rgba(255,59,31,.45),6px 6px 0 #000;
    text-align:center;white-space:nowrap;pointer-events:none}
  .fxhud b{font-family:var(--disp);font-weight:400;font-size:30px;color:var(--yellow);display:block;letter-spacing:.12em}
  .fxhud.ok{border-color:var(--acid);color:var(--acid);box-shadow:0 0 30px rgba(198,255,0,.35),6px 6px 0 #000}
  @media (max-width:760px){.fxhud{top:auto;bottom:44px;font-size:17px;white-space:normal;width:92vw}.fxhud b{font-size:22px}}

  .fxsea{position:fixed;left:-20vw;right:-20vw;bottom:-10vh;height:0;z-index:111;pointer-events:none;transition:height 1s linear;
    background:linear-gradient(to bottom,rgba(255,122,0,.55),rgba(120,30,0,.85) 30%,rgba(20,4,0,.96))}
  .fxsea::before{content:"";position:absolute;left:0;right:0;top:-18px;height:20px;
    background:radial-gradient(circle at 20px -6px,transparent 18px,rgba(255,122,0,.55) 19px) 0 0/40px 20px repeat-x;animation:waves 1.4s linear infinite}
  @keyframes waves{to{background-position:40px 0}}
  .fxship{position:fixed;z-index:112;pointer-events:none;font-family:var(--crt);font-size:16px;line-height:1;color:var(--amber);white-space:pre;
    text-shadow:0 0 6px var(--orange);transition:transform 1s,bottom 1s linear}

  .fxwin{position:fixed;z-index:113;background:#0d0602;border:2px solid #000;padding:3px;font-family:var(--crt);color:var(--amber);
    box-shadow:inset 2px 2px 0 var(--amber),inset -2px -2px 0 #6b2a00,0 0 0 1px var(--orange),6px 6px 0 rgba(0,0,0,.65)}
  .fxwin .t{display:flex;align-items:center;gap:6px;height:20px;padding:0 4px;background:repeating-linear-gradient(to bottom,var(--red) 0 2px,#1a0a02 2px 4px);
    font-size:17px;line-height:18px}
  .fxwin .t span{margin:0 auto;background:#0d0602;padding:0 8px;color:var(--yellow)}
  .fxwin .t button{width:14px;height:14px;padding:0;background:#0d0602;border:2px solid var(--amber);cursor:pointer}
  .fxwin .t button:hover{background:var(--red)}
  .fxwin .b{padding:8px 12px;white-space:pre;background:#070302;line-height:1.05}
  .fxwin.fall{transition:transform 1.1s cubic-bezier(.5,0,.9,.5),opacity 1.1s;opacity:0}

  .bite{position:fixed;z-index:110;pointer-events:none;transform:scale(0);transition:transform .18s cubic-bezier(.3,1.6,.6,1)}
  .bite i{position:absolute;border-radius:50%;background:#070302;box-shadow:0 0 0 3px #4a2208,0 0 0 5px rgba(255,176,0,.25),inset 0 0 18px #000}
  .bite.in{transform:scale(1)}
  .bite.out{transform:scale(0);transition-duration:.5s}
  .crumb{position:fixed;z-index:110;width:6px;height:6px;background:#c27a2c;pointer-events:none;box-shadow:0 0 4px #ff7a00}
  .cookiewin{left:50%;top:50%;transform:translate(-50%,-50%);width:min(440px,92vw)}
  .cookiewin .b{white-space:normal;text-align:center;padding:16px}
  .cookiewin .big{font-family:var(--disp);font-size:clamp(26px,6vw,40px);color:var(--yellow);text-shadow:3px 3px 0 var(--red);line-height:1.1;animation:htp .3s steps(2) infinite}
  .cookiewin input{margin-top:12px;width:100%;font:inherit;font-size:24px;background:#000;color:var(--yellow);border:2px solid var(--orange);padding:2px 8px;outline:0}
  .cookiewin small{display:block;color:var(--dim);font-size:17px;margin-top:6px}

  .fxball{position:fixed;z-index:112;width:16px;height:16px;background:var(--yellow);box-shadow:0 0 16px var(--orange),0 0 4px #fff;pointer-events:none}
  .fxpad{position:fixed;z-index:112;width:12px;height:120px;background:var(--orange);box-shadow:0 0 18px var(--orange);pointer-events:none}
  .fxtrail{position:fixed;z-index:111;width:16px;height:16px;background:var(--orange);pointer-events:none;transition:opacity .5s,transform .5s}
  .os-win.hit{box-shadow:inset 2px 2px 0 var(--yellow),inset -2px -2px 0 #6b2a00,0 0 0 3px var(--yellow),0 0 50px var(--orange)!important}

  .seg{position:fixed;z-index:114;width:24px;height:24px;margin:-12px 0 0 -12px;display:flex;align-items:center;justify-content:center;
    font-family:var(--crt);font-size:20px;color:#000;background:var(--acid);border:2px solid #000;cursor:crosshair;user-select:none;
    box-shadow:0 0 12px rgba(198,255,0,.7)}
  .seg.head{background:var(--red);color:var(--yellow);width:30px;height:30px;margin:-15px 0 0 -15px;font-size:22px}
  .seg.hurt{background:#fff}
  .seg.boom{transition:transform 1s ease-out,opacity 1s;opacity:0}
  .skim{position:fixed;z-index:114;font-family:var(--crt);font-size:20px;color:var(--yellow);pointer-events:none;text-shadow:0 0 6px var(--orange);
    transition:transform 1.2s,opacity 1.2s}
  #money{color:var(--red);display:none}

  .dive{position:fixed;inset:0;z-index:115;background:#000}
  .dive canvas{width:100%;height:100%;display:block}
  .dive .hud{position:absolute;left:20px;top:16px;font-family:var(--crt);font-size:22px;color:var(--amber);text-shadow:0 0 8px var(--orange);white-space:pre;line-height:1.15}
  .dive .hud2{position:absolute;right:20px;bottom:16px;font-family:var(--crt);font-size:22px;color:var(--orange);text-align:right;white-space:pre}
  .dive .flash{position:absolute;inset:0;background:var(--yellow);opacity:0;transition:opacity .35s}
  html.fx-tilt{overflow:hidden}
  html.fx-tilt body{overflow:hidden}
  `));

  /* ---------- shared HUD ---------- */
  function hud(html, cls = ""){ const h = add(el("div", "fxhud " + cls, html)); return h; }

  /* =========================================================
     DA VINCI — the site is a ship. it starts to list.
     ========================================================= */
  const DV = { on: false };
  const SHIP = "      |\\\n      | \\\n      |__\\\n  ____|_____\n  \\  NYNEX  /\n~~~\\______/~~~";
  DV.start = function(seconds, onCapsize){
    if (DV.on) return false;
    DV.on = true; DV.t = seconds; DV.angle = 0;
    scrollTo(0, 0);
    root.classList.add("fx-tilt");
    root.style.transformOrigin = `50% ${innerHeight / 2}px`;
    root.style.transition = "transform 1s linear";
    DV.sea = add(el("div", "fxsea"));
    DV.ships = [0, 1, 2, 3, 4, 5].map(i => { const s = add(el("div", "fxship", SHIP)); s.style.left = (8 + i * 15) + "vw"; s.style.bottom = "-6vh"; return s; });
    DV.hud = hud("");
    const draw = () => {
      const listing = Math.min(6, Math.ceil((seconds - DV.t) / (seconds / 6)));
      DV.hud.innerHTML = `<b>DA VINCI</b>FLEET BALLAST COMPROMISED · ${listing}/6 TANKERS LISTING · CAPSIZE IN ${String(DV.t).padStart(2, "0")}s<br><span style="color:var(--amber)">type: kill davinci</span>`;
    };
    draw();
    DV.timer = setInterval(() => {
      DV.t--;
      const p = 1 - DV.t / seconds;                       // 0 → 1
      DV.angle = reduce ? 0 : p * 9 + Math.sin(DV.t * 1.3) * (1.5 + p * 2);
      root.style.transform = `rotate(${DV.angle}deg)`;
      DV.sea.style.height = (p * 34) + "vh";
      DV.ships.forEach((s, i) => { s.style.bottom = (p * 34 - 7) + "vh"; s.style.transform = `rotate(${(i % 2 ? 1 : -1) * p * (20 + i * 12)}deg)`; });
      draw();
      if (DV.t <= 0) capsize(onCapsize);
    }, 1000);
    return true;
  };
  function capsize(cb){
    clearInterval(DV.timer);
    DV.hud.innerHTML = "<b>CAPSIZED</b>the whole fleet. and this website.";
    root.style.transition = "transform 1.4s cubic-bezier(.6,-0.2,.4,1.2)";
    if (!reduce) root.style.transform = "rotate(180deg)";
    DV.ships.forEach(s => s.style.transform = "rotate(180deg)");
    DV.sea.style.height = "60vh";
    cb && cb();
    setTimeout(() => DV.stop(true), 4200);
  }
  DV.stop = function(capsized){
    if (!DV.on) return false;
    clearInterval(DV.timer); DV.on = false;
    root.style.transition = "transform 1.2s cubic-bezier(.3,1.4,.5,1)";
    root.style.transform = "rotate(0deg)";
    DV.sea.style.transition = "height 1.2s"; DV.sea.style.height = "0";
    DV.ships.forEach(s => { s.style.bottom = "-20vh"; });
    if (!capsized) { DV.hud.className = "fxhud ok"; DV.hud.innerHTML = "<b>NEUTRALIZED</b>ballast restored · fleet level"; }
    const h = DV.hud, sea = DV.sea, ships = DV.ships;
    setTimeout(() => { h.remove(); sea.remove(); ships.forEach(s => s.remove());
      root.style.transform = root.style.transition = root.style.transformOrigin = ""; root.classList.remove("fx-tilt"); }, 2200);
    return true;
  };

  /* =========================================================
     COOKIE — it eats the page until you feed it.
     ========================================================= */
  const CK = { on: false, bites: [] };
  CK.start = function(onFed){
    if (CK.on) return false;
    CK.on = true; CK.onFed = onFed;
    CK.win = add(el("div", "fxwin cookiewin", `<div class="t"><button aria-label="close" title="close"></button><span>COOKIE.EXE</span></div>
      <div class="b"><div class="big">I WANT A<br>COOKIE</div><input aria-label="Feed it" placeholder="feed it something..." autocomplete="off"><small>it is eating your website.</small></div>`));
    const inp = CK.win.querySelector("input");
    inp.addEventListener("keydown", e => {
      e.stopPropagation();
      if (e.key !== "Enter") return;
      if (/cookie/i.test(inp.value)) CK.feed();
      else { CK.win.querySelector("small").textContent = inp.value ? `"${inp.value}" is not a cookie.` : "...that's nothing. give it a COOKIE."; inp.value = ""; bite(); bite(); }
    });
    CK.win.querySelector("button").addEventListener("click", () => {
      // closing it just makes it angrier
      CK.win.querySelector("small").textContent = "you can't close me. COOKIE.";
      for (let i = 0; i < 4; i++) setTimeout(bite, i * 120);
      CK.win.style.left = rnd(30, 70) + "%"; CK.win.style.top = rnd(30, 70) + "%";
    });
    const tk = document.getElementById("ticker");
    if (tk) { CK.ticker = tk.innerHTML; tk.textContent = "★ COOKIE ★ I WANT A COOKIE ★ GIVE ME A COOKIE ★ NOM NOM ★ COOKIE ".repeat(6); }
    setTimeout(() => inp.focus(), 50);
    CK.timer = setInterval(bite, reduce ? 2500 : 900);
    bite();
    return true;
  };
  function bite(){
    if (!CK.on || CK.bites.length > 60) return;
    const size = rnd(70, 170), x = rnd(-30, innerWidth - size + 30), y = rnd(60, innerHeight - size);
    const b = add(el("div", "bite"));
    Object.assign(b.style, { left: x + "px", top: y + "px", width: size + "px", height: size + "px" });
    // three overlapping circles make a bite mark
    [[0, 0, .62], [.33, .12, .58], [.12, .4, .6]].forEach(([dx, dy, s]) => {
      const i = el("i"); Object.assign(i.style, { left: dx * size + "px", top: dy * size + "px", width: s * size + "px", height: s * size + "px" }); b.appendChild(i);
    });
    requestAnimationFrame(() => b.classList.add("in"));
    CK.bites.push(b);
    if (!reduce) for (let i = 0; i < 6; i++) {
      const c = add(el("div", "crumb"));
      const cx = x + size / 2, cy = y + size / 2;
      Object.assign(c.style, { left: cx + "px", top: cy + "px" });
      c.animate([{ transform: "translate(0,0)", opacity: 1 }, { transform: `translate(${rnd(-80, 80)}px,${rnd(120, 300)}px) rotate(${rnd(90, 400)}deg)`, opacity: 0 }],
        { duration: rnd(700, 1300), easing: "cubic-bezier(.3,0,.8,.6)" }).onfinish = () => c.remove();
    }
  }
  CK.feed = function(){
    if (!CK.on) return false;
    CK.on = false; clearInterval(CK.timer);
    CK.win.querySelector(".b").innerHTML = `<div class="big" style="animation:none">OM NOM NOM</div><small>cookie.exe is satisfied and wanders off.</small>`;
    CK.bites.forEach((b, i) => setTimeout(() => { b.classList.add("out"); setTimeout(() => b.remove(), 600); }, i * 25));
    CK.bites = [];
    const tk = document.getElementById("ticker"); if (tk && CK.ticker) tk.innerHTML = CK.ticker;
    const w = CK.win; setTimeout(() => w.remove(), 1600);
    CK.onFed && CK.onFed();
    return true;
  };

  /* =========================================================
     RABBIT — windows that breed.
     ========================================================= */
  const RB = { on: false, wins: [] };
  const BUNNY = " (\\(\\\n ( -.-)\n o_(\")(\")";
  RB.start = function(onDone){
    if (RB.on) return false;
    RB.on = true; RB.onDone = onDone;
    spawnRabbit(innerWidth / 2 - 80, innerHeight / 2 - 60);
    RB.timer = setInterval(() => {
      const n = RB.wins.length;
      if (n >= 96) { RB.collapse(true); return; }
      RB.wins.slice(0, n).forEach(w => { if (RB.wins.length < 128) spawnRabbit(); });
      if (RB.hud) RB.hud.innerHTML = `<b>RABBIT.EXE</b>${RB.wins.length} copies · memory ${Math.min(100, Math.round(RB.wins.length / 96 * 100))}%`;
    }, reduce ? 1500 : 900);
    RB.hud = hud("<b>RABBIT.EXE</b>1 copy · it's breeding");
    return true;
  };
  function spawnRabbit(x, y){
    const w = add(el("div", "fxwin", `<div class="t"><button aria-label="close" title="close"></button><span>RABBIT.EXE</span></div><div class="b">${BUNNY}</div>`));
    x = x ?? rnd(0, innerWidth - 150); y = y ?? rnd(40, innerHeight - 120);
    Object.assign(w.style, { left: x + "px", top: y + "px" });
    if (!reduce) w.animate([{ transform: "scale(.2)" }, { transform: "scale(1)" }], { duration: 180, easing: "cubic-bezier(.3,1.6,.6,1)" });
    // close one, two more appear. classic.
    w.querySelector("button").addEventListener("click", () => {
      const r = w.getBoundingClientRect(); w.remove(); RB.wins = RB.wins.filter(v => v !== w);
      if (RB.on) { spawnRabbit(r.left - 40, r.top + 30); spawnRabbit(r.left + 40, r.top - 20); }
    });
    RB.wins.push(w);
  }
  RB.collapse = function(full){
    if (!RB.on) return false;
    RB.on = false; clearInterval(RB.timer);
    RB.hud.className = full ? "fxhud" : "fxhud ok";
    RB.hud.innerHTML = full ? "<b>OUT OF MEMORY</b>rabbit.exe ate itself" : "<b>KILLED</b>every last rabbit";
    RB.wins.forEach((w, i) => setTimeout(() => {
      w.classList.add("fall"); w.style.transform = `translateY(${innerHeight}px) rotate(${rnd(-90, 90)}deg)`;
      setTimeout(() => w.remove(), 1200);
    }, reduce ? 0 : i * 8));
    RB.wins = [];
    const h = RB.hud; setTimeout(() => h.remove(), 2500);
    RB.onDone && RB.onDone(full);
    return true;
  };

  /* =========================================================
     PONG — the whole screen is the court. windows are obstacles.
     ========================================================= */
  const PG = { on: false };
  PG.start = function(seconds, onDone){
    if (PG.on) return false;
    PG.on = true; PG.onDone = onDone; PG.rally = 0; PG.hits = 0;
    PG.ball = add(el("div", "fxball"));
    PG.l = add(el("div", "fxpad")); PG.r = add(el("div", "fxpad"));
    PG.l.style.left = "6px"; PG.r.style.right = "6px";
    PG.hud = hud("");
    let x = innerWidth / 2, y = innerHeight / 2, vx = 7, vy = 4.5, ly = y, ry = y, last = performance.now(), end = last + seconds * 1000, trailN = 0;
    const draw = () => PG.hud.innerHTML = `<b>PONG.EXE</b>rally ${PG.rally} · windows smacked ${PG.hits}`;
    draw();
    const step = now => {
      if (!PG.on) return;
      const dt = Math.min(3, (now - last) / 16.7); last = now;
      x += vx * dt; y += vy * dt;
      const H = innerHeight - 40;
      if (y < 60) { y = 60; vy = Math.abs(vy); }
      if (y > H - 16) { y = H - 16; vy = -Math.abs(vy); }
      // paddles track the ball (badly, on purpose)
      ly += (y - ly) * .09 * dt; ry += (y - ry) * .11 * dt;
      PG.l.style.top = (ly - 60) + "px"; PG.r.style.top = (ry - 60) + "px";
      if (x < 18) { x = 18; vx = Math.abs(vx) * 1.04; PG.rally++; draw(); }
      if (x > innerWidth - 34) { x = innerWidth - 34; vx = -Math.abs(vx) * 1.04; PG.rally++; draw(); }
      vx = Math.max(-16, Math.min(16, vx));
      // bounce off open windows and shove them
      document.querySelectorAll(".os-win:not([hidden])").forEach(w => {
        if (w._pong > now) return;
        const r = w.getBoundingClientRect();
        if (x + 16 < r.left || x > r.right || y + 16 < r.top || y > r.bottom) return;
        const ox = Math.min(x + 16 - r.left, r.right - x), oy = Math.min(y + 16 - r.top, r.bottom - y);
        if (ox < oy) { vx = -vx; x += vx > 0 ? ox : -ox; } else { vy = -vy; y += vy > 0 ? oy : -oy; }
        if (!w.classList.contains("max") && innerWidth > 760) {
          w.style.left = (parseFloat(w.style.left) || r.left) - vx * 3 + "px";
          w.style.top = Math.max(0, (parseFloat(w.style.top) || r.top) - vy * 3) + "px";
        }
        w._pong = now + 350;
        w.classList.add("hit"); setTimeout(() => w.classList.remove("hit"), 140);
        PG.hits++; draw();
      });
      PG.ball.style.transform = `translate(${x}px,${y}px)`;
      if (!reduce && (trailN++ % 2 === 0)) {
        const t = add(el("div", "fxtrail")); t.style.left = x + "px"; t.style.top = y + "px"; t.style.opacity = .5;
        requestAnimationFrame(() => { t.style.opacity = 0; t.style.transform = "scale(.2)"; }); setTimeout(() => t.remove(), 520);
      }
      if (now > end) { PG.stop(true); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  };
  PG.stop = function(timeout){
    if (!PG.on) return false;
    PG.on = false;
    [PG.ball, PG.l, PG.r].forEach(e => e.remove());
    PG.hud.className = "fxhud ok"; PG.hud.innerHTML = `<b>GAME OVER</b>rally ${PG.rally} · ${PG.hits} windows smacked`;
    const h = PG.hud; setTimeout(() => h.remove(), 2200);
    PG.onDone && PG.onDone(timeout, PG.rally, PG.hits);
    return true;
  };

  /* =========================================================
     WORM — crawls out of the garbage and skims money until squashed.
     ========================================================= */
  const WM = { on: false, money: 0 };
  const WORD = "W0RM.SALAMI";
  WM.start = function(fromRect, onSkim, onDead){
    if (WM.on) return false;
    WM.on = true; WM.hp = 5; WM.onSkim = onSkim; WM.onDead = onDead;
    const r = fromRect || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 };
    let hx = r.left + r.width / 2, hy = r.top + r.height / 2, ang = rnd(0, 6.28), speed = 3;
    const trail = [];
    WM.segs = WORD.split("").map((ch, i) => {
      const s = add(el("div", "seg" + (i === 0 ? " head" : ""), ch));
      s.addEventListener("pointerdown", e => { e.preventDefault(); e.stopPropagation(); WM.hit(); });
      return s;
    });
    const tray = document.getElementById("money");
    if (tray) tray.style.display = "inline";
    let last = performance.now();
    WM.skimT = setInterval(() => {
      const amt = Math.floor(rnd(200, 900)); WM.money += amt;
      if (tray) tray.textContent = "-$" + (WM.money / 100).toFixed(2);
      const s = add(el("div", "skim", "+$" + (amt / 100).toFixed(2)));
      s.style.left = hx + "px"; s.style.top = hy + "px";
      requestAnimationFrame(() => { s.style.transform = "translateY(-60px)"; s.style.opacity = 0; }); setTimeout(() => s.remove(), 1300);
      WM.onSkim && WM.onSkim(WM.money);
    }, 1800);
    const step = now => {
      if (!WM.on) return;
      const dt = Math.min(3, (now - last) / 16.7); last = now;
      ang += rnd(-.18, .18) * dt;
      hx += Math.cos(ang) * speed * WM.speed() * dt; hy += Math.sin(ang) * speed * WM.speed() * dt;
      if (hx < 20 || hx > innerWidth - 20) { ang = Math.PI - ang; hx = Math.max(20, Math.min(innerWidth - 20, hx)); }
      if (hy < 70 || hy > innerHeight - 50) { ang = -ang; hy = Math.max(70, Math.min(innerHeight - 50, hy)); }
      trail.unshift([hx, hy]); if (trail.length > 140) trail.pop();
      WM.segs.forEach((s, i) => { const p = trail[Math.min(trail.length - 1, i * 7)]; s.style.left = p[0] + "px"; s.style.top = p[1] + "px"; });
      WM.pos = [hx, hy];
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return true;
  };
  WM.speed = () => 1 + (5 - WM.hp) * .45;
  WM.hit = function(){
    if (!WM.on) return;
    WM.hp--;
    WM.segs.forEach(s => s.classList.add("hurt")); setTimeout(() => WM.segs.forEach(s => s.classList.remove("hurt")), 120);
    if (WM.hp <= 0) WM.kill(); else { const h = hud(`<b>${WM.hp}</b>more hits`); setTimeout(() => h.remove(), 700); }
  };
  WM.kill = function(){
    if (!WM.on) return false;
    WM.on = false; clearInterval(WM.skimT);
    WM.segs.forEach(s => {
      s.classList.add("boom"); s.style.transform = `translate(${rnd(-300, 300)}px,${rnd(-300, 300)}px) rotate(${rnd(-720, 720)}deg)`;
      setTimeout(() => s.remove(), 1000);
    });
    const tray = document.getElementById("money");
    if (tray) { tray.style.color = "var(--acid)"; tray.textContent = "+$" + (WM.money / 100).toFixed(2) + " returned"; setTimeout(() => tray.style.display = "none", 5000); }
    const h = hud(`<b>WORM SQUASHED</b>$${(WM.money / 100).toFixed(2)} returned to the accounts it skimmed`, "ok"); setTimeout(() => h.remove(), 3000);
    WM.onDead && WM.onDead(WM.money);
    return true;
  };

  /* =========================================================
     GIBSON DIVE — fly into the supercomputer.
     ========================================================= */
  function dive(ms = 5200){
    return new Promise(res => {
      if (reduce) { res(); return; }
      const d = add(el("div", "dive", `<canvas></canvas><div class="hud"></div><div class="hud2"></div><div class="flash"></div>`));
      const c = d.querySelector("canvas"), x = c.getContext("2d"), hudL = d.querySelector(".hud"), hudR = d.querySelector(".hud2");
      const dpr = Math.min(devicePixelRatio || 1, 2), W = innerWidth, H = innerHeight;
      c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0);
      const f = Math.min(W, H) * .8, HEXC = "0123456789ABCDEF";
      // towers stand in rings around the flight path
      const towers = [];
      for (let z = 100; z < 4000; z += 160) for (let k = 0; k < 6; k++) {
        const a = k / 6 * Math.PI * 2 + z * .002;
        towers.push({ a, r: rnd(260, 420), z, h: rnd(200, 900), seed: Math.random() * 1e4 });
      }
      const t0 = performance.now();
      const step = now => {
        const t = (now - t0) / ms; if (t >= 1) { d.querySelector(".flash").style.opacity = 1; setTimeout(() => { d.remove(); res(); }, 380); return; }
        const camZ = t * t * 3600, roll = t * 1.4;
        x.fillStyle = "rgba(0,0,0,.35)"; x.fillRect(0, 0, W, H);
        // core glow at the end of the tunnel
        const g = x.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 40 + t * Math.max(W, H) * .6);
        g.addColorStop(0, `rgba(255,225,74,${.15 + t * .6})`); g.addColorStop(1, "rgba(255,90,0,0)");
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.font = "14px VT323, monospace"; x.textAlign = "center";
        towers.sort((p, q) => q.z - p.z);
        for (const tw of towers) {
          let zz = tw.z - camZ; if (zz < 20) zz += 4000; if (zz > 3900) continue;
          const a = tw.a + roll, cx = Math.cos(a) * tw.r, cy = Math.sin(a) * tw.r;
          const sx = W / 2 + cx * f / zz, sy = H / 2 + cy * f / zz, w = 70 * f / zz, hh = tw.h * f / zz;
          const fade = Math.max(0, 1 - zz / 3900);
          x.save(); x.translate(sx, sy); x.rotate(a + Math.PI / 2);
          x.fillStyle = `rgba(14,5,0,${.9 * fade})`; x.strokeStyle = `rgba(255,122,0,${fade})`; x.lineWidth = Math.max(1, 2 * f / zz);
          x.fillRect(-w / 2, -hh, w, hh); x.strokeRect(-w / 2, -hh, w, hh);
          if (w > 18) {
            x.fillStyle = `rgba(255,176,0,${fade})`;
            const rows = Math.min(30, Math.floor(hh / (16 * Math.max(.6, w / 70))));
            for (let i = 0; i < rows; i++) {
              const s = Math.floor(tw.seed + i * 7 + now / 60) % 16;
              if ((s + i) % 3 === 0) continue;
              x.fillText(HEXC[s] + HEXC[(s * 7) % 16], 0, -hh + (i + 1) * hh / (rows + 1));
            }
          }
          x.restore();
        }
        const depth = Math.floor(camZ * 3.7);
        hudL.textContent = `ELLINGSON MINERAL // GIBSON\nCORE ACCESS ......... ${t > .3 ? "OPEN" : "NEGOTIATING"}\nTRACE ............... ${t > .6 ? "DISABLED" : "ACTIVE"}\nDEPTH ............... ${depth}`;
        hudR.textContent = `${Array.from({ length: 4 }, () => Array.from({ length: 8 }, () => HEXC[Math.random() * 16 | 0]).join("")).join("\n")}`;
        requestAnimationFrame(step);
      };
      x.fillStyle = "#000"; x.fillRect(0, 0, W, H);
      requestAnimationFrame(step);
    });
  }

  window.FX = { davinci: DV, cookie: CK, rabbit: RB, pong: PG, worm: WM, dive };
})();
