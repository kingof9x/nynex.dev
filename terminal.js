/* =========================================================
   NYNEX TERMINAL
   A love letter to 90s hacker movies. Original code and art.
   Open it with the Terminal icon, the NYNEX button, or the ~ key.
   ========================================================= */
(function terminal(){
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const win = $("#terminal"), box = $("#term"), out = $("#termOut"), inp = $("#termIn"), ps = $("#termPs"), line = $("#termLine");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state ---------- */
  const S = {
    user: "guest", cwd: "~", gibson: false, wormFound: false, wormDead: false, skimmed: 0,
    cookie: false, cookieTries: 0, procs: {}, hist: [], hi: 0, fails: 0, booted: false
  };
  let busy = false, aborted = false, asking = null;

  /* ---------- output helpers ---------- */
  // print("text"), print("<span class=o>html</span>", true)
  function print(s = "", html = false){
    const d = document.createElement("div");
    if (html) d.innerHTML = s; else d.textContent = s;
    out.appendChild(d);
    // keep the scrollback from growing forever
    while (out.childNodes.length > 600) out.firstChild.remove();
    box.scrollTop = box.scrollHeight;
    return d;
  }
  const h = (cls, s) => `<span class="${cls}">${esc(s)}</span>`;
  const cmd = c => `<span class="cmdlink" data-cmd="${esc(c)}">${esc(c)}</span>`;
  const ABORT = Symbol("abort");
  const sleep = ms => new Promise((res, rej) => setTimeout(() => aborted ? rej(ABORT) : res(), reduce ? Math.min(ms, 40) : ms));
  async function type(s, cls = "", speed = 18){
    const d = print("", true), sp = document.createElement("span"); if (cls) sp.className = cls; d.appendChild(sp);
    if (reduce) { sp.textContent = s; return; }
    for (let i = 0; i < s.length; i++) { sp.textContent += s[i]; if (i % 2 === 0) await sleep(speed); }
  }
  async function bar(label, ms = 1200, w = 24){
    const d = print("", true);
    for (let i = 0; i <= w; i++) {
      d.innerHTML = `${esc(label)} ${h("o", "[" + "#".repeat(i) + ".".repeat(w - i) + "]")} ${h("y", Math.round(i / w * 100) + "%")}`;
      box.scrollTop = box.scrollHeight;
      await sleep(ms / w);
    }
  }
  function prompt(){
    const where = S.gibson && S.cwd.startsWith("/gibson") ? "gibson" : "nynex";
    ps.textContent = S.cookie ? "COOKIE MONSTER>" : asking ? asking.label : `${S.user}@${where}:${S.cwd}$`;
  }
  function setBusy(b){ busy = b; line.classList.toggle("busy", b && !asking); if (!b) { prompt(); focusIn(); } }
  const focusIn = () => { if (!win.hidden) inp.focus({ preventScroll: true }); };
  // wait for the user to type one line (used for passwords etc.)
  function ask(label, secret = false){
    return new Promise(res => {
      asking = { label, res, secret }; inp.type = secret ? "password" : "text";
      line.classList.remove("busy"); prompt(); inp.focus({ preventScroll: true });
    });
  }
  function shake(){ if (reduce) return; win.classList.remove("shake"); void win.offsetWidth; win.classList.add("shake"); }

  /* ---------- tiny synth for modem / phreak noises ---------- */
  let ac;
  function tone(freqs, ms, vol = .05){
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const g = ac.createGain(); g.gain.value = vol; g.connect(ac.destination);
      const t = ac.currentTime;
      freqs.forEach(f => { const o = ac.createOscillator(); o.frequency.value = f; o.connect(g); o.start(t); o.stop(t + ms / 1000); });
      g.gain.setTargetAtTime(0, t + ms / 1000 - .02, .01);
    } catch(e){}
  }
  const DTMF = { 1:[697,1209],2:[697,1336],3:[697,1477],4:[770,1209],5:[770,1336],6:[770,1477],7:[852,1209],8:[852,1336],9:[852,1477],0:[941,1336] };

  /* ---------- file system ---------- */
  const FILES = {
    "~": {
      "readme.txt": () => [
        h("y", "WELCOME TO THE NYNEX TERMINAL"),
        "This box is a playground. Nothing here touches a real system.",
        "",
        "Things worth trying:",
        `  ${cmd("help")}            the command list`,
        `  ${cmd("ls viruses")}      famous malware. it really runs. on this page.`,
        `  ${cmd("hack gibson")}     the big one`,
        `  ${cmd("open resume")}     the boring-but-real part of the site`,
        "",
        "",
        "The desktop works too: Viruses, Trash and the Gibson are all clickable.",
        h("d", "rumor has it there's a worm hiding in the Gibson's garbage."),
      ],
      "handles.txt": () => [
        h("y", "KNOWN HANDLES ON THIS BOARD"),
        "  zerocool       retired at eleven. allegedly.",
        "  crashoverride  same kid, new name, louder",
        "  acidburn       will beat you at anything. has.",
        "  cerealkiller   lives on the edge of the chat log",
        "  phantomphreak  owns more phones than socks",
        "  lordnikon      remembers everything you ever typed",
        "  joey           still looking for a handle",
        "",
        h("d", `try: ${cmd("login acidburn")}`),
      ],
      "books.txt": () => [
        h("y", "THE RAINBOW SHELF"),
        "Real 1980s-90s US DoD security manuals, each nicknamed by its cover color.",
        "",
        "  " + h("o", "ORANGE") + "  Trusted Computer System Evaluation Criteria (1985)",
        "  " + h("r", "RED   ") + "  Trusted Network Interpretation",
        "  " + h("g", "GREEN ") + "  Password Management Guideline",
        "  " + h("w", "PINK  ") + "  Rating Maintenance Phase",
        "",
        h("d", "this whole website is orange for a reason."),
      ],
      ".plague": () => [
        h("r", "MEMO // DO NOT DISTRIBUTE"),
        "re: the 'garbage' file",
        "",
        "It's just garbage. Nobody will ever look in there.",
        "Keep the worm running. A fraction of a cent per transaction",
        "adds up faster than anyone notices.",
        "",
        "If anyone starts asking, release the virus as a distraction.",
        h("d", "                                              — P."),
      ],
      "viruses/": "dir",
      "gibson/": "dir",
    },
    "~/viruses": {
      "davinci.exe": "exe", "cookie.exe": "exe", "rabbit.exe": "exe", "pong.exe": "exe",
      "README": () => [
        h("y", "QUARANTINE // HANDLE WITH CARE"),
        `  davinci.exe   the tanker one. ${cmd("run davinci")}`,
        `  cookie.exe    it's hungry. ${cmd("run cookie")}`,
        `  rabbit.exe    replicates. ${cmd("run rabbit")}`,
        `  pong.exe      harmless. probably. ${cmd("run pong")}`,
        "",
        h("d", `see what's running with ${cmd("ps")}, stop it with kill <name>.`),
      ],
    },
    "/gibson": {
      "garbage.dat": "garbage",
      "ellingson.log": () => [
        h("y", "ELLINGSON MINERAL // GIBSON SYSTEM LOG"),
        "03:12:07  login sysop ............. OK",
        "03:12:44  login sysop ............. OK",
        "03:13:02  login ??? ............... OK  " + h("r", "<-- that's you"),
        "03:13:05  large transfer queued -> /gibson/garbage.dat",
        "03:13:06  security officer paged. pager ignored.",
      ],
      "ballast.cfg": () => [
        "fleet.tankers        = 6",
        "fleet.ballast.mode   = AUTO",
        "fleet.ballast.owner  = " + h("r", "davinci.exe ??"),
        h("d", "# somebody changed this at 03:00. nobody admits it."),
      ],
    },
  };
  // trash is just another name for garbage
  const ALIAS = { "trash": "garbage.dat", "trash.dat": "garbage.dat", "garbage": "garbage.dat" };

  function resolveDir(arg){
    if (!arg || arg === "~" || arg === "/home/guest") return "~";
    if (arg === "/" ) return "/";
    if (arg === "..") return S.cwd === "~/viruses" || S.cwd === "/gibson" ? "~" : S.cwd === "~" ? "/" : "~";
    const a = arg.replace(/\/+$/, "");
    if (a === "viruses" || a === "~/viruses") return "~/viruses";
    if (a === "gibson" || a === "/gibson" || a === "~/gibson") return "/gibson";
    if (a === "~/..") return "/";
    return null;
  }
  function getFile(name){
    name = ALIAS[name] || name;
    if (name.includes("/")) {
      const i = name.lastIndexOf("/"), d = resolveDir(name.slice(0, i)), f = name.slice(i + 1);
      return d && FILES[d] && FILES[d][f] !== undefined ? { dir: d, name: f, v: FILES[d][f] } : null;
    }
    if (name === "garbage.dat" && S.gibson) return { dir: "/gibson", name, v: "garbage" };
    const here = FILES[S.cwd] || {};
    if (here[name] !== undefined) return { dir: S.cwd, name, v: here[name] };
    if (here[name + "/"] !== undefined) return { dir: S.cwd, name: name + "/", v: "dir" };
    return null;
  }
  function locked(dir){ return dir === "/gibson" && !S.gibson; }

  /* ---------- garbage.dat ---------- */
  // 64 rows of noise. the worm hides in one of them, in a different place every visit.
  const HEX = "0123456789abcdef", ROWS = 64, WORM_ROW = 20 + Math.floor(Math.random() * 36);
  function noise(n, seed){ let s = seed, r = ""; for (let i = 0; i < n; i++) { s = (s * 1103515245 + 12345) & 0x7fffffff; r += HEX[(s >>> 16) % 16]; } return r; }
  function garbageRow(i){
    const off = (0x2600 + i * 16).toString(16).padStart(6, "0");
    if (i === WORM_ROW) return { off, hex: "2e 2e 77 30 72 6d 2e 73 61 6c 61 6d 69 2e 2e 2e", asc: "..w0rm.salami...", worm: true };
    return { off, hex: noise(32, 7 + i * 31).match(/../g).join(" "),
      asc: noise(16, 99 + i * 17).replace(/[0-9a-f]/g, c => ".:;~^`',_-=+*%#"[parseInt(c, 16) % 15]) };
  }
  function garbageLines(reveal, from = WORM_ROW - 6, n = 12){
    const rows = [];
    for (let i = from; i < from + n; i++) {
      const r = garbageRow(i);
      if (r.worm && reveal) rows.push(`${h("d", r.off)}  ${h("r", r.hex)}  ${h("inv", r.asc)}  ${h("r", "<-- FOUND IT")}`);
      else rows.push(`${h("d", r.off)}  ${h("o", r.hex)}  ${h("y", r.asc)}`);
    }
    return rows;
  }
  // the hex viewer window: click the row the worm is hiding in
  function renderGarbage(){
    const v = $("#hexView"); if (!v) return;
    if (!S.gibson) { v.innerHTML = `<div class="locked">garbage.dat<b>ON THE GIBSON</b><button class="btn" data-run="hack gibson">HACK IN</button></div>`; return; }
    let html = `<div class="d" style="color:var(--dim)">offset  00 01 02 03 04 05 06 07 08 09 0a 0b 0c 0d 0e 0f  ascii           · spot anything odd? click it. stare into the middle and you might fall in.</div>`;
    for (let i = 0; i < ROWS; i++) {
      const r = garbageRow(i);
      html += `<button data-row="${i}"${S.wormFound && r.worm ? ' class="found"' : ""}><span class="off">${r.off}</span>  ${r.hex}  <span class="asc">${esc(r.asc)}</span></button>`;
    }
    v.innerHTML = html;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("#hexView button[data-row]"); if (!b) return;
    if (+b.dataset.row === WORM_ROW) { b.classList.add("found"); findWorm(b.getBoundingClientRect()); }
    else if (inMiddle(e)) FX.numbers.start(e.clientX, e.clientY);
    else { b.classList.remove("miss"); void b.offsetWidth; b.classList.add("miss"); }
  });
  // the middle of the document is where you "go into the numbers"
  function inMiddle(e){
    const body = $("#garbage .os-body"); if (!body) return false;
    const r = body.getBoundingClientRect(), u = (e.clientX - r.left) / r.width, v = (e.clientY - r.top) / r.height;
    return u > .25 && u < .75 && v > .3 && v < .7;
  }
  // also catch clicks in the middle that land between rows
  document.addEventListener("click", e => {
    if (!e.target.closest("#garbage .os-body") || e.target.closest("#hexView button")) return;
    if (inMiddle(e)) FX.numbers.start(e.clientX, e.clientY);
  });
  function openGarbage(){
    if (!S.gibson) { openWin("gibson"); return false; }
    renderGarbage(); openWin("garbage"); return true;
  }

  /* ---------- worm ---------- */
  function findWorm(rect){
    if (S.wormDead) { print(h("g", "the worm is already dead. you did that."), true); return; }
    if (S.wormFound && FX.worm.on) return;
    S.wormFound = true;
    termOpen();
    print(h("r", `SIGNATURE MATCH at 0x${(0x2600 + WORM_ROW * 16).toString(16).padStart(6, "0")}: w0rm.salami`), true);
    print(h("y", "It's a worm.") + " It shaves a fraction of a cent off every transaction and stashes it in the garbage.", true);
    print(h("r", "...and now that you've found it, it's making a run for it."), true);
    print(`${h("y", "CLICK IT")} five times to squash it, or ${cmd("kill worm")}. watch the taskbar: it's skimming as it goes.`, true);
    shake();
    FX.worm.start(rect, null, money => {
      S.wormDead = true; S.skimmed = money;
      print(h("g", "WORM TERMINATED.") + ` ${h("y", "$" + (money / 100).toFixed(2))} returned to the accounts it was skimmed from.`, true);
      print(h("d", "the security officer is going to have a very bad day."), true);
      renderGibson();
    });
  }

  /* ---------- viruses: the effects live in fx.js ---------- */
  function runDavinci(){
    if (FX.davinci.on) return print(h("r", "davinci.exe is already running. you might want to kill it."), true);
    print(h("r", "DA VINCI VIRUS ENGAGED"), true);
    print("Ballast control for the tanker fleet has been taken over. This website is one of the tankers.", false);
    print(`It capsizes in ${h("y", "30s")} unless you ${cmd("kill davinci")}.`, true);
    shake();
    FX.davinci.start(30, () => {
      print(h("r", "THE FLEET HAS CAPSIZED."), true);
      print(h("d", "(simulated. no actual oil tankers were harmed. try again, faster: run davinci)"), true);
    });
  }
  function runCookie(){
    if (FX.cookie.on) return print(h("r", "it's already loose. it wants a cookie."), true);
    S.cookie = true; S.cookieTries = 0; shake();
    print(h("r", "COOKIE.EXE IS LOOSE"), true);
    print(h("y", "it's eating the website. it has taken your prompt too."), true);
    FX.cookie.start(() => { S.cookie = false; prompt(); print(h("y", "OM NOM NOM. cookie.exe is satisfied and wanders off. the site grows back."), true); });
    prompt();
  }
  function runRabbit(){
    if (FX.rabbit.on) return print(h("r", "the rabbits are already out."), true);
    print(h("r", "rabbit.exe: a program whose only job is to copy itself."), true);
    print(`Close one and two more appear. ${cmd("kill rabbit")} if you've had enough.`, true);
    FX.rabbit.start(full => print(full ? h("y", "memory full. rabbit.exe ate itself. classic.") : h("g", "rabbits terminated."), true));
  }
  function runPong(){
    if (FX.pong.on) return print("pong is already running.");
    print(h("y", "pong.exe: the whole screen is the court. your windows are in the way."), true);
    print(h("d", "open a few windows first for more chaos. 30 second match."), true);
    FX.pong.start(30, (_, rally, hits) => print(`${h("y", "GAME OVER.")} rally ${rally}, windows smacked ${hits}.`, true));
  }

  /* ---------- desktop windows ---------- */
  const openWin = id => window.NYNEX && NYNEX.open(id);
  function termOpen(){ const t = $("#terminal"); if (t && t.hidden) openWin("terminal"); }
  const ICON = {
    exe: `<svg viewBox="0 0 32 32"><rect x="4" y="5" width="24" height="22" fill="#160a02" stroke="#ff3b1f" stroke-width="2"/><rect x="4" y="5" width="24" height="4" fill="#ff3b1f"/><path d="M16 12l6 11H10z" fill="#ffe14a"/><rect x="15" y="15" width="2" height="4" fill="#000"/><rect x="15" y="20" width="2" height="2" fill="#000"/></svg>`,
    txt: `<svg viewBox="0 0 32 32"><path d="M7 3h13l5 5v21H7z" fill="#160a02" stroke="#ff7a00" stroke-width="2"/><g fill="#ffb000"><rect x="10" y="12" width="12" height="2"/><rect x="10" y="16" width="12" height="2"/><rect x="10" y="20" width="8" height="2"/></g></svg>`,
    dat: `<svg viewBox="0 0 32 32"><path d="M7 3h13l5 5v21H7z" fill="#160a02" stroke="#c6ff00" stroke-width="2"/><g fill="#c6ff00"><rect x="10" y="11" width="3" height="3"/><rect x="15" y="11" width="3" height="3" opacity=".5"/><rect x="20" y="11" width="2" height="3"/><rect x="10" y="16" width="2" height="3" opacity=".5"/><rect x="14" y="16" width="3" height="3"/><rect x="19" y="16" width="3" height="3" opacity=".5"/><rect x="11" y="21" width="3" height="3"/><rect x="17" y="21" width="3" height="3"/></g></svg>`,
    junk: `<svg viewBox="0 0 32 32"><path d="M7 3h13l5 5v21H7z" fill="#160a02" stroke="#a07a55" stroke-width="2" stroke-dasharray="3 2"/><g fill="#a07a55"><rect x="10" y="12" width="12" height="2"/><rect x="10" y="17" width="9" height="2"/></g></svg>`,
    lock: `<svg viewBox="0 0 32 32"><rect x="7" y="14" width="18" height="14" fill="#160a02" stroke="#ff3b1f" stroke-width="2"/><path d="M11 14v-4a5 5 0 0 1 10 0v4" fill="none" stroke="#ff3b1f" stroke-width="3"/><rect x="15" y="19" width="2" height="5" fill="#ffe14a"/></svg>`,
  };
  const fileBtn = (icon, name, run, note = "") => `<button class="file" data-run="${esc(run)}">${ICON[icon]}<span>${esc(name)}</span>${note ? `<small>${esc(note)}</small>` : ""}</button>`;
  function renderFolders(){
    const v = $("#virusFiles");
    if (v) v.innerHTML = fileBtn("exe", "davinci.exe", "run davinci", "capsizes things") + fileBtn("exe", "cookie.exe", "run cookie", "hungry")
      + fileBtn("exe", "rabbit.exe", "run rabbit", "breeds") + fileBtn("exe", "pong.exe", "run pong", "bouncy") + fileBtn("txt", "README", "cat viruses/README");
    const t = $("#trashFiles");
    if (t) t.innerHTML = fileBtn("dat", "garbage.dat", "#garbage", S.gibson ? "4 MB" : "on the gibson") + fileBtn("junk", "resume_FINAL_v2_REAL.doc", "#junk1")
      + fileBtn("junk", "aol_trial_disk.img", "#junk2") + fileBtn("junk", "passwords.txt", "#junk3");
  }
  function renderGibson(){
    const g = $("#gibsonBody"); if (!g) return;
    if (!S.gibson) {
      g.innerHTML = `<div class="locked">ELLINGSON MINERAL CORPORATION<b>LOCKED</b>supercomputer · authorized users only<br><span style="color:var(--dim)">the garbage file lives in here.</span><br><button class="btn" data-run="hack gibson">HACK IN</button></div>`;
      return;
    }
    g.innerHTML = `<div class="files">${fileBtn("dat", "garbage.dat", "#garbage", S.wormDead ? "clean" : "4 MB · look closer")}${fileBtn("txt", "ellingson.log", "cat gibson/ellingson.log")}${fileBtn("txt", "ballast.cfg", "cat gibson/ballast.cfg")}${fileBtn("exe", "davinci.exe", "run davinci", "who put this here?")}</div>
      <div class="folder-note">${S.wormDead ? "the worm is dead. the garbage is just garbage again." : "you're in. the worm is hiding in garbage.dat. open it and find the row that doesn't belong."}</div>`;
  }
  const JUNK = {
    "#junk1": () => [h("y", "resume_FINAL_v2_REAL.doc"), "an older draft. the real one is in the Resume window.", cmd("open resume")],
    "#junk2": () => [h("y", "aol_trial_disk.img"), "1,000 free hours. expired in 1996."],
    "#junk3": () => [h("y", "passwords.txt"), "god", "love", "secret", "...the fourth one is smudged.", h("d", "(this is why you don't keep these in the trash.)")],
  };
  // clicks on any [data-run] (folder files, the HACK IN button)
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-run]"); if (!b) return;
    e.preventDefault();
    const r = b.dataset.run;
    if (r === "#garbage") {
      if (!openGarbage()) { termOpen(); print(h("r", "garbage.dat lives on the Gibson. hack in first: ") + cmd("hack gibson"), true); }
      return;
    }
    if (JUNK[r]) { termOpen(); JUNK[r]().forEach(l => print(l, true)); return; }
    window.TERM.run(r);
  });

  /* ---------- the Gibson ---------- */
  const GIBSON = [
    "      ▄▄     ▄▄▄▄     ▄▄",
    "     ████   ██████   ████",
    "     █░░█   █░▓▓░█   █░░█",
    "     █▓░█   █░░░░█   █░▓█",
    "     █░░█   █▓░░▓█   █░░█",
    "     █░▓█   █░░░░█   █▓░█",
    "  ▄▄▄████▄▄▄██████▄▄▄████▄▄▄",
    "  ███  G  I  B  S  O  N  ███",
  ];
  const PASSWORDS = ["god", "love", "secret", "sex"];
  async function hackGibson(){
    if (S.gibson) { print(`You're already in. ${cmd("cd gibson")} and have a look around.`, true); return; }
    setBusy(true);
    print(h("d", "// target: Ellingson Mineral Corp. supercomputer"), true);
    const num = "2125550199";
    const d = print("", true);
    for (let i = 0; i < num.length; i++) {
      d.innerHTML = "ATDT " + h("y", num.slice(0, i + 1));
      tone(DTMF[num[i]], 90); await sleep(120);
    }
    await sleep(300);
    tone([1650, 2100], 500, .02); await sleep(500);
    print(h("o", "CONNECT 14400/ARQ/V32BIS"), true);
    await sleep(300);
    for (const l of GIBSON) { print(h("o art", l), true); await sleep(60); }
    print("");
    await type("ELLINGSON MINERAL CORPORATION  // AUTHORIZED USERS ONLY", "y");
    print("");
    let ok = false;
    for (let tries = 0; tries < 3 && !ok; tries++) {
      const u = await ask("login:");
      if (u === null) throw ABORT;
      print(`${h("o", "login:")} ${esc(u || "")}`, true);
      const p = await ask("password:", true);
      if (p === null) throw ABORT;
      print(`${h("o", "password:")} ${"*".repeat((p || "").length)}`, true);
      if (PASSWORDS.includes((p || "").trim().toLowerCase())) ok = true;
      else {
        S.fails++; shake();
        print(h("r", "ACCESS DENIED"), true);
        if (tries === 0) print(h("d", "hint: people still use the four most common passwords. one of them is \"god\"."), true);
        if (tries === 1) print(h("r", "WARNING: security officer notified. trace in progress..."), true);
      }
    }
    setBusy(true);
    if (!ok) {
      await bar("TRACE ..................", 900);
      print(h("r", "TRACE COMPLETE. the security officer says hi. connection dropped."), true);
      print(h("d", "NO CARRIER"), true);
      return;
    }
    print(h("g", "ACCESS GRANTED. welcome, sysop."), true);
    await sleep(200);
    await bar("mapping the core ......", 900);
    await bar("disabling the trace ....", 700);
    await FX.dive();
    S.gibson = true; S.cwd = "/gibson";
    renderGibson(); renderFolders(); renderGarbage(); openWin("gibson");
    print("");
    print(h("y", "You're in the Gibson.") + " Nobody really looks at the " + h("o", "garbage") + " file, do they?", true);
    print(`open ${cmd("cat garbage.dat")} and find the row that doesn't belong.`, true);
    print(h("d", "( one more thing: say it with me. type: hack the planet )"), true);
  }

  /* ---------- hack the planet ---------- */
  let htpT;
  function hackThePlanet(){
    const o = $("#htp"); if (!o) return;
    o.classList.add("on"); clearTimeout(htpT);
    htpT = setTimeout(() => o.classList.remove("on"), 2600);
    [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone([f], 120, .04), i * 120));
  }
  window.NYNEX_HTP = hackThePlanet;

  /* ---------- commands ---------- */
  const HELP = [
    ["help", "this list"], ["ls [dir]", "list files (ls -a for hidden)"], ["cd <dir>", "change directory"],
    ["cat <file>", "read a file"], ["run <virus>", "run something from ~/viruses"], ["ps / kill <name>", "list / stop running processes"],
    ["hack gibson", "you know you want to"], ["scan <file>", "look for anything hiding in a file"],
    ["login <handle>", "pick a handle"], ["dial <number>", "make some phreak noise"],
    ["open <window>", "services, events, projects, resume"], ["whoami / date / uname / history / clear / exit", ""],
  ];
  const HANDLES = {
    zerocool: "Logged in as zerocool. Banned from computers until 18. Clearly that worked.",
    crashoverride: "Logged in as crashoverride. Same kid, much louder.",
    acidburn: "Logged in as acidburn. She has already beaten your high score.",
    cerealkiller: "Logged in as cerealkiller. Snacks are now root.",
    phantomphreak: "Logged in as phantomphreak. Every payphone in the city just rang once.",
    lordnikon: "Logged in as lordnikon. Try `history`. He remembers.",
    joey: "Logged in as joey. You still don't have a real handle. Hack something first.",
    theplague: null, plague: null,
  };

  const C = {
    help(){
      print(h("y", "NYNEX TERMINAL // COMMANDS"), true);
      HELP.forEach(([c, d]) => print(`  ${h("o", c.padEnd(18))}${h("d", d)}`, true));
      print(h("d", "  tab completes, ↑/↓ for history, ctrl+c stops a running command. there are also a few secrets."), true);
    },
    clear(){ out.innerHTML = ""; },
    cls(){ out.innerHTML = ""; },
    whoami(){ print(S.user === "guest" ? `guest. you need a handle. see ${cmd("cat handles.txt")}` : S.user, S.user === "guest"); },
    pwd(){ print(S.cwd === "~" ? "/home/" + S.user : S.cwd.replace("~", "/home/" + S.user)); },
    date(){ print(new Date().toString().replace(/\d{4}/, "1995")); print(h("d", "(the clock on this box is stuck. it's always 1995 in here.)"), true); },
    uname(){ print("NYNEX/OS 9.5 tty2600 orange-book-certified i486DX2-66 16MB RAM 28.8k"); },
    echo(a){ print(a.join(" ")); },
    ls(a){
      const all = a.includes("-a") || a.includes("-la") || a.includes("-al");
      const target = a.find(x => !x.startsWith("-"));
      const d = target ? resolveDir(target) : S.cwd;
      if (d === "/") { print(`${h("o", "home/")}  ${h("o", "gibson/")}  ${h("d", "dev/  etc/  tmp/")}`, true); return; }
      if (!d || !FILES[d]) { print(`ls: ${target}: no such directory`); return; }
      if (locked(d)) { print(h("r", "ls: /gibson: permission denied. you're not in yet. try: ") + cmd("hack gibson"), true); return; }
      const names = Object.keys(FILES[d]).filter(n => all || !n.startsWith("."));
      if (all) names.unshift(".", "..");
      print(names.map(n => n.endsWith("/") ? h("o", n) : n.endsWith(".exe") ? h("r", n) : n === "garbage.dat" ? h("y", n) : h("w", n)).join("   "), true);
    },
    dir(a){ C.ls(a); },
    cd(a){
      const d = resolveDir(a[0]);
      if (!d) { print(`cd: ${a[0]}: no such directory`); return; }
      if (d === "/") { print(h("d", "nothing to see up there. back home you go."), true); S.cwd = "~"; return; }
      if (locked(d)) { print(h("r", "cd: /gibson: permission denied. ") + cmd("hack gibson") + h("d", " first."), true); return; }
      S.cwd = d;
    },
    cat(a){
      if (!a[0]) { print("cat: which file? try " + cmd("ls"), true); return; }
      const f = getFile(a[0]);
      if (!f) {
        if (["garbage.dat", "trash", "garbage"].includes(a[0]) && !S.gibson) { print(h("r", "cat: that file lives on the Gibson. ") + cmd("hack gibson"), true); return; }
        print(`cat: ${a[0]}: no such file`); return;
      }
      if (locked(f.dir)) { print(h("r", "permission denied"), true); return; }
      if (f.v === "dir") { print(`cat: ${a[0]}: is a directory`); return; }
      if (f.v === "exe") { print(`cat: binary file. maybe ${cmd("run " + f.name.replace(".exe", ""))} it instead?`, true); return; }
      if (f.v === "garbage") {
        print(h("d", `garbage.dat  // 4,096,000 bytes of nothing important. ${ROWS} rows shown in the hex viewer.`), true);
        garbageLines(S.wormFound, 0, 6).forEach(l => print(l, true));
        print(h("d", "... opening the hex viewer. find the row that doesn't belong, or ") + cmd("scan garbage.dat"), true);
        openGarbage();
        return;
      }
      f.v().forEach(l => print(l, true));
    },
    more(a){ C.cat(a); }, less(a){ C.cat(a); }, type(a){ C.cat(a); },
    async scan(a){
      const name = ALIAS[a[0]] || a[0];
      if (!name) { print("scan: which file?"); return; }
      if (name !== "garbage.dat") {
        const f = getFile(name);
        if (!f || f.v === "dir") { print(`scan: ${name}: no such file`); return; }
        if (locked(f.dir)) { print(h("r", "permission denied"), true); return; }
        await bar("scanning " + name, 600); print(h("g", "clean. nothing hiding in here."), true); return;
      }
      if (!S.gibson) { print(h("r", "scan: garbage.dat is on the Gibson. ") + cmd("hack gibson"), true); return; }
      await bar("scanning garbage.dat ...", 1600);
      if (S.wormDead) { print(h("g", "clean. the worm is gone. you did that."), true); return; }
      garbageLines(true).forEach(l => print(l, true));
      renderGarbage(); openGarbage();
      await sleep(500);
      const row = document.querySelector(`#hexView button[data-row="${WORM_ROW}"]`);
      if (row) { row.scrollIntoView({ block: "center" }); row.classList.add("found"); }
      findWorm(row && !$("#garbage").hidden ? row.getBoundingClientRect() : null);
    },
    grep(a){ if (a.some(x => /worm/i.test(x))) return C.scan([a.find(x => !/worm/i.test(x)) || "garbage.dat"]); print("grep: nothing found. try scanning a file instead."); },
    find(a){ if (a.some(x => /worm/i.test(x))) return C.scan(["garbage.dat"]); print(h("d", "find: try ") + cmd("scan garbage.dat"), true); },
    ps(){
      print(h("y", "  PID  NAME"), true);
      print("    1  init"); print("   42  ticker.d"); print("  386  datacity.exe");
      if (FX.worm.on) print(`  ${h("r", "666  w0rm.salami")}`, true);
      if (FX.davinci.on) print(`  ${h("r", "1995  davinci.exe")}`, true);
      if (FX.cookie.on) print(`  ${h("r", "   7  cookie.exe")}`, true);
      if (FX.rabbit.on) print(`  ${h("r", "  23  rabbit.exe")} ${h("d", "(and its children)")}`, true);
      if (FX.pong.on) print(`  ${h("r", "1972  pong.exe")}`, true);
    },
    kill(a){
      const n = (a.find(x => !x.startsWith("-")) || "").toLowerCase().replace(".exe", "");
      if (/worm|salami|666/.test(n)) {
        if (!FX.worm.on) { print(S.wormDead ? "worm: already dead." : "kill: no worm running. have you looked in the garbage?"); return; }
        FX.worm.kill(); return;
      }
      if (/davinci|da|vinci|1995/.test(n)) {
        if (!FX.davinci.stop()) { print("kill: davinci isn't running."); return; }
        print(h("g", "DA VINCI NEUTRALIZED. ballast control restored. the fleet is level."), true);
        return;
      }
      if (/rabbit|wabbit|23/.test(n)) { if (!FX.rabbit.collapse(false)) print("kill: no rabbits running."); return; }
      if (/pong|1972/.test(n)) { if (!FX.pong.stop(false)) print("kill: pong isn't running."); return; }
      if (/cookie/.test(n)) { print(h("r", "kill: cookie.exe refuses to die. it wants something."), true); return; }
      if (/^(1|init)$/.test(n)) { print(h("r", "nice try. init is immortal."), true); return; }
      if (n === "all" || n === "-9") { ["worm", "davinci", "rabbit", "pong"].forEach(x => C.kill([x])); return; }
      print(`kill: ${n || "?"}: no such process. see ${cmd("ps")}`, true);
    },
    async run(a){
      const n = (a[0] || "").toLowerCase().replace(/\.exe$/, "").replace(/^\.\//, "").replace(/^viruses\//, "").replace("-", "");
      if (!n) { print(`run what? ${cmd("cat viruses/README")}`, true); return; }
      if (n === "davinci" || n === "da" && (a[1] || "").toLowerCase() === "vinci") return runDavinci();
      if (n === "cookie" || n === "cookiemonster") return runCookie();
      if (n === "rabbit" || n === "wabbit") return runRabbit();
      if (n === "pong") return runPong();
      if (n === "worm") { print(h("d", "you can't run the worm. somebody already is. it's in the Gibson's garbage."), true); return; }
      print(`run: ${n}: not found in ~/viruses`);
    },
    login(a){
      const n = (a[0] || "").toLowerCase().replace(/[^a-z]/g, "");
      if (!n) { print(`login as who? ${cmd("cat handles.txt")}`, true); return; }
      if (n === "theplague" || n === "plague") { shake(); print(h("r", "ACCOUNT LOCKED. that one belongs to the security officer, and he is not amused."), true); return; }
      if (n === "guest") { S.user = "guest"; print("back to being nobody."); return; }
      S.user = n;
      print(HANDLES[n] ? HANDLES[n].replace(/`([^`]+)`/g, (_, c) => cmd(c)) : `Logged in as ${esc(n)}. Nice handle. Never heard of you.`, true);
    },
    su(a){ C.login(a); },
    history(){
      if (S.user === "lordnikon") print(h("y", "photographic memory engaged:"), true);
      S.hist.forEach((c, i) => print(`${h("d", String(i + 1).padStart(4))}  ${esc(c)}`, true));
    },
    async dial(a){
      const num = (a.join("") || "2600").replace(/[^0-9]/g, "").slice(0, 16) || "2600";
      setBusy(true);
      const d = print("", true);
      for (let i = 0; i < num.length; i++) { d.innerHTML = "ATDT " + h("y", num.slice(0, i + 1)); tone(DTMF[num[i]], 90); await sleep(130); }
      if (num === "2600") { tone([2600], 700, .03); await sleep(700); print(h("y", "2600 Hz.") + " the tone that used to make long-distance trunks think the line was free. a phreak classic.", true); }
      else print(h("d", "BUSY"), true);
    },
    phreak(){ return C.dial(["2600"]); },
    hack(a){
      const t = a.join(" ").toLowerCase();
      if (/gibson/.test(t)) return hackGibson();
      if (/planet/.test(t)) { print(h("y", "HACK THE PLANET!"), true); hackThePlanet(); return; }
      if (/nasa|pentagon|fbi|cia/.test(t)) { print(h("d", "let's not. pick on the Gibson instead."), true); return; }
      print(`hack what? the obvious answer is ${cmd("hack gibson")}`, true);
    },
    open(a){
      const n = (a[0] || "").toLowerCase().replace(/[^a-z]/g, "");
      const ok = ["services", "events", "projects", "resume"];
      const m = ok.find(x => x.startsWith(n) && n);
      if (!m) { print(`open: try ${ok.map(cmd).join(", ")}`, true); return; }
      print(`opening ${m}...`); window.NYNEX && NYNEX.open(m);
    },
    resume(){ C.open(["resume"]); }, contact(){ C.open(["resume"]); }, services(){ C.open(["services"]); }, events(){ C.open(["events"]); }, projects(){ C.open(["projects"]); },
    exit(){ window.NYNEX && NYNEX.close("terminal"); },
    logout(){ if (S.user !== "guest") { S.user = "guest"; print("logged out."); } else C.exit(); },
    quit(){ C.exit(); },
    sudo(a){ shake(); print(h("r", `${S.user} is not in the sudoers file. This incident will be reported to the security officer.`), true); },
    rm(a){
      const t = a.join(" ");
      if (/worm/.test(t)) return C.kill(["worm"]);
      if (/-rf?\s*\/?$|\/\s*$|-rf \//.test(t) || t.includes("*")) { shake(); print(h("r", "deleting everything..."), true); print(h("d", "just kidding. this is a website."), true); return; }
      print("rm: permission denied. nothing in here is yours to delete.");
    },
    vi(){ print("vi: you're stuck now. just kidding: there is no editor here."); }, vim(){ C.vi(); }, emacs(){ print("emacs: a fine operating system, lacking only a decent editor."); }, nano(){ C.vi(); },
    ping(a){ print(`PING ${a[0] || "gibson"}: 64 bytes, time=1995ms ${h("d", "(dial-up, what did you expect)")}`, true); },
    ssh(a){ print((a[0] || "").includes("gibson") ? `ssh is for people with passwords. ${cmd("hack gibson")}` : "ssh: connection refused.", true); },
    telnet(a){ C.ssh(a); },
    trace(){ print(h("d", "tracing you... you're on nynex.dev. that was easy."), true); },
    matrix(){ print(h("d", "wrong movie. wrong color, too."), true); },
    password(){ print(h("d", "the four most common passwords haven't changed since 1995. that's the joke and the problem."), true); },
    passwd(){ C.password(); },
    mess(a){ if (/best/.test(a.join(" "))) print(h("y", "...and you know how the rest of that goes."), true); else print("mess: with what?"); },
    rollerblade(){ print(h("o", "  _[__]_\n   (  )\n  /|  |\\\n  _|  |_\n o o  o o   wheeee"), true); },
    rollerblades(){ C.rollerblade(); },
    payphone(){ return C.dial(["2600"]); },
    neofetch(){
      [
        `${h("o", "  ███╗   ██╗")}   ${h("y", S.user + "@nynex")}`,
        `${h("o", "  ████╗  ██║")}   ${h("d", "--------------")}`,
        `${h("o", "  ██╔██╗ ██║")}   ${h("o", "OS:")} NYNEX/OS 9.5`,
        `${h("o", "  ██║╚██╗██║")}   ${h("o", "Modem:")} 28.8k (lies, it's 14.4)`,
        `${h("o", "  ██║ ╚████║")}   ${h("o", "Theme:")} Orange Book`,
        `${h("o", "  ╚═╝  ╚═══╝")}   ${h("o", "Uptime:")} since 1995`,
      ].forEach(l => print(l, true));
    },
    sysinfo(){ C.neofetch(); },
    konami(){ print(h("d", "you know the code. try it on the page itself, not in here."), true); },
    secret(){ print(h("d", "that's one of the four. you're getting warmer."), true); },
    god(){ C.secret(); }, love(){ C.secret(); },
    numbers(){ print(h("d", "going into the numbers. move the mouse or press a key to come back."), true); setTimeout(() => FX.numbers.start(), 400); },
    screensaver(){ return C.numbers(); },
    cookie(){ print(h("d", "nothing is asking for a cookie right now. ") + cmd("run cookie"), true); },
  };
  const NAMES = Object.keys(C).filter(k => !["god","love","secret","cls","dir","more","less","type","su","quit","passwd","nano","vim","rollerblades","payphone","sysinfo","grep","find","mess","screensaver"].includes(k));

  /* ---------- dispatch ---------- */
  async function exec(raw){
    const text = raw.trim();
    if (!text) return;
    S.hist.push(text); S.hi = S.hist.length;
    const low = text.toLowerCase().replace(/[!.\s]+$/g, "");

    // cookie monster owns the prompt until fed
    if (S.cookie) {
      if (/cookie/.test(low) && !/^run|^kill/.test(low)) {
        FX.cookie.feed();
      } else {
        S.cookieTries++;
        print(h("r", ["COOKIE!", "I WANT COOKIE!", "GIVE ME COOKIE!", "NO COOKIE, NO COMPUTER."][S.cookieTries % 4]), true);
        if (S.cookieTries === 3) print(h("d", "(hint: type exactly what it's asking for.)"), true);
        shake();
      }
      return;
    }
    if (/^hack\s*the\s*planet$/.test(low)) { print(h("y", "HACK THE PLANET!"), true); hackThePlanet(); return; }
    if (/^mess with the best$/.test(low)) return C.mess(["best"]);

    const parts = text.split(/\s+/), name = parts[0].toLowerCase(), args = parts.slice(1);
    // ./davinci.exe style
    if (/^(\.\/)?[a-z]+\.exe$/.test(name)) return C.run([name]);
    const fn = C[name];
    if (!fn) {
      if (HANDLES[name.replace(/[^a-z]/g, "")] !== undefined) return C.login([name]);
      print(`${esc(name)}: command not found. ${h("d", "type")} ${cmd("help")}`, true);
      return;
    }
    await fn(args);
  }

  async function submit(){
    const v = inp.value; inp.value = "";
    if (asking) { const a = asking; asking = null; inp.type = "text"; line.classList.toggle("busy", busy); prompt(); a.res(v); return; }
    if (busy) return;
    print(`${h("term-ps", ps.textContent)} ${h("y", v)}`, true);
    setBusy(true); aborted = false;
    try { await exec(v); }
    catch(e){ if (e === ABORT) print(h("r", "^C"), true); else { print(h("r", "segfault: " + (e && e.message || e)), true); console.error(e); } }
    aborted = false; asking = null; inp.type = "text";
    setBusy(false);
  }

  function complete(){
    const v = inp.value, parts = v.split(/\s+/);
    if (parts.length === 1) {
      const m = NAMES.filter(n => n.startsWith(parts[0].toLowerCase()));
      if (m.length === 1) inp.value = m[0] + " ";
      else if (m.length > 1) print(h("d", m.join("  ")), true);
      return;
    }
    const last = parts[parts.length - 1];
    let pool = Object.keys(FILES[S.cwd] || {}).filter(n => !n.startsWith("."));
    if (parts[0] === "run" || parts[0] === "kill") pool = parts[0] === "run" ? ["davinci", "cookie", "rabbit", "pong"] : ["worm", "davinci", "rabbit", "pong", "all"];
    if (parts[0] === "open") pool = ["services", "events", "projects", "resume"];
    if (parts[0] === "login") pool = Object.keys(HANDLES).filter(x => x !== "plague");
    if (parts[0] === "hack") pool = ["gibson", "the planet"];
    const m = pool.filter(n => n.startsWith(last));
    if (m.length === 1) { parts[parts.length - 1] = m[0]; inp.value = parts.join(" ") + (m[0].endsWith("/") ? "" : " "); }
    else if (m.length > 1) print(h("d", m.join("  ")), true);
  }

  inp.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); submit(); }
    else if (e.key === "Tab") { e.preventDefault(); if (!asking) complete(); }
    else if (e.key === "ArrowUp" && !asking) { e.preventDefault(); if (S.hi > 0) inp.value = S.hist[--S.hi]; }
    else if (e.key === "ArrowDown" && !asking) { e.preventDefault(); S.hi = Math.min(S.hist.length, S.hi + 1); inp.value = S.hist[S.hi] || ""; }
    else if (e.key === "c" && e.ctrlKey && inp.selectionStart === inp.selectionEnd) {
      e.preventDefault();
      if (busy) abort();
      else { print(`${h("term-ps", ps.textContent)} ${esc(inp.value)}${h("r", "^C")}`, true); inp.value = ""; }
    }
    else if (e.key === "l" && e.ctrlKey) { e.preventDefault(); out.innerHTML = ""; }
    else if (e.key === "Escape") { e.stopPropagation(); if (!inp.value) window.NYNEX && NYNEX.close("terminal"); else inp.value = ""; }
    e.stopPropagation();
  });
  // Escape in the input clears it first; the window manager's Escape handler runs on window, so stop it there
  inp.addEventListener("keyup", e => e.stopPropagation());

  function abort(){
    aborted = true;
    if (asking) { const a = asking; asking = null; inp.type = "text"; a.res(null); }
  }
  // ctrl+c while a command runs (the input line is hidden then, so listen on the page)
  addEventListener("keydown", e => { if (busy && !win.hidden && e.ctrlKey && e.key === "c" && !getSelection().toString()) { e.preventDefault(); abort(); } });

  // run clicked command links
  box.addEventListener("click", e => {
    const l = e.target.closest(".cmdlink");
    if (l && !busy && !asking) { inp.value = l.dataset.cmd; submit(); return; }
    if (!getSelection().toString()) inp.focus({ preventScroll: true });
  });
  win.addEventListener("focus", () => { inp.focus({ preventScroll: true }); greet(); });

  function greet(){
    if (S.booted) return; S.booted = true;
    [
      h("o", "NYNEX/OS 9.5  ·  tty2600  ·  9600 baud"),
      h("d", "(c) 1995 nobody. all rights reversed."),
      "",
      `type ${cmd("help")} for commands, or ${cmd("cat readme.txt")} if you're new here.`,
      "",
    ].forEach(l => print(l, true));
  }

  /* ---------- global hotkeys ---------- */
  const typing = el => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  addEventListener("keydown", e => {
    if ((e.key === "`" || e.key === "~") && !typing(e.target) && !e.ctrlKey && !e.metaKey) {
      e.preventDefault(); window.NYNEX && NYNEX.open("terminal");
    }
  });
  $("#startBtn").addEventListener("click", () => window.NYNEX && NYNEX.open("terminal"));

  // konami code anywhere on the page
  const K = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let k = 0;
  addEventListener("keydown", e => {
    k = (e.key === K[k] || e.key.toLowerCase() === K[k]) ? k + 1 : (e.key === K[0] ? 1 : 0);
    if (k === K.length) { k = 0; hackThePlanet(); }
  });

  // other parts of the page (folder icons, buttons) run commands through here
  window.TERM = {
    run(c){
      termOpen();
      if (busy || asking) { print(h("d", `(busy. try "${c}" in a moment.)`), true); return; }
      greet(); inp.value = c; submit();
    }
  };

  // a real screensaver: after a few idle minutes, the numbers take over on their own
  let idleT;
  const IDLE_MS = 3 * 60 * 1000;
  const idle = () => { clearTimeout(idleT); idleT = setTimeout(() => {
    const busyFx = FX.davinci.on || FX.cookie.on || FX.rabbit.on || FX.pong.on || document.querySelector(".dive");
    if (!busyFx && !document.hidden) FX.numbers.start(); else idle();
  }, IDLE_MS); };
  ["pointermove", "pointerdown", "keydown", "wheel", "touchstart", "scroll"].forEach(t => addEventListener(t, idle, { passive: true }));
  idle();

  // the numbers screensaver borrows rows straight out of garbage.dat
  FX.numbers.rows = () => Array.from({ length: ROWS }, (_, i) => garbageRow(i));

  renderFolders(); renderGibson(); renderGarbage();
  prompt();
})();
