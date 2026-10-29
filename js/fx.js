/* ──────────────────────────────────────────────────────────────────────────
   DEVFEST NIAMEY 2026 — fx.js
   Confettis (canvas), toast, console, et les easter eggs « clavier / clic ».
   Rien ici ne dépend du reste : si ce fichier plante, la page reste belle.
   ────────────────────────────────────────────────────────────────────────── */
(() => {
  'use strict';

  const root = document.documentElement;
  const C = window.DEVFEST || {};
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const COLORS = ['#4285F4', '#EA4335', '#FBBC04', '#34A853'];
  const TEA = ['#A3631A', '#D79B00', '#7a4a12', '#23823D', '#C9892B'];
  const GLYPHS = ['{', '}', '</>', ';', '()', '=>', '[]', '//', '&&', '0x1F4'];

  const motionOK = () => !RM.matches && !root.classList.contains('calm');

  /* ── toast ─────────────────────────────────────────────────────────────── */
  let toastTimer = 0;
  function toast(msg, ms = 4200) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('is-on'), ms);
  }

  /* ── confettis ─────────────────────────────────────────────────────────── */
  const cv = document.getElementById('fx');
  const ctx = cv && cv.getContext ? cv.getContext('2d') : null;
  let W = 0, H = 0, DPR = 1, parts = [], raf = 0, last = 0, rainUntil = 0, rainOpts = null;

  function size() {
    if (!cv) return;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  size();
  window.addEventListener('resize', size, { passive: true });

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  function make(x, y, o, vx, vy) {
    const kinds = o.shapes;
    const k = pick(kinds);
    return {
      x, y, vx, vy, k,
      s: o.size ? rnd(o.size[0], o.size[1]) : rnd(7, 15),
      c: pick(o.colors),
      g: k === 'glyph' ? pick(o.glyphs || GLYPHS) : '',
      r: rnd(0, 6.283), vr: rnd(-.22, .22),
      w: rnd(0, 6.283), vw: rnd(.08, .24),
      drag: o.drag || .985, gy: o.gravity == null ? .34 : o.gravity,
      life: rnd(o.life ? o.life[0] : 90, o.life ? o.life[1] : 170),
      a: 1
    };
  }

  function confetti(x, y, opts) {
    if (!ctx || !motionOK()) return;
    const o = Object.assign({
      count: 90, angle: -Math.PI / 2, spread: Math.PI * 1.1, power: [6, 17],
      colors: COLORS, shapes: ['circle', 'rect', 'tri', 'spark', 'glyph']
    }, opts || {});
    const n = Math.min(o.count, 700 - parts.length);
    for (let i = 0; i < n; i++) {
      const a = o.angle + rnd(-o.spread / 2, o.spread / 2);
      const v = rnd(o.power[0], o.power[1]);
      parts.push(make(x, y, o, Math.cos(a) * v, Math.sin(a) * v));
    }
    run();
  }

  function draw(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.c;
    const s = p.s;
    switch (p.k) {
      case 'circle':
        ctx.beginPath(); ctx.arc(0, 0, s * .5, 0, 6.283); ctx.fill(); break;
      case 'rect':
        ctx.scale(1, Math.cos(p.w)); ctx.fillRect(-s * .7, -s * .4, s * 1.4, s * .8); break;
      case 'tri':
        ctx.scale(1, Math.cos(p.w));
        ctx.beginPath(); ctx.moveTo(0, -s * .7); ctx.lineTo(s * .65, s * .5); ctx.lineTo(-s * .65, s * .5); ctx.closePath(); ctx.fill(); break;
      case 'spark': {
        const k = s * .85;
        ctx.beginPath();
        ctx.moveTo(0, -k);
        ctx.quadraticCurveTo(0, 0, k, 0);
        ctx.quadraticCurveTo(0, 0, 0, k);
        ctx.quadraticCurveTo(0, 0, -k, 0);
        ctx.quadraticCurveTo(0, 0, 0, -k);
        ctx.fill(); break;
      }
      case 'leaf':
        ctx.scale(1, Math.cos(p.w) * .6 + .5);
        ctx.beginPath(); ctx.ellipse(0, 0, s * .9, s * .38, 0, 0, 6.283); ctx.fill(); break;
      case 'glyph':
        ctx.font = '700 ' + (s * 2.3) + 'px "JetBrains Mono",ui-monospace,Menlo,monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.g, 0, 0); break;
    }
    ctx.restore();
  }

  function step(now) {
    const dt = Math.min(2.5, (now - last) / 16.667 || 1);
    last = now;
    ctx.clearRect(0, 0, W, H);

    if (rainOpts && now < rainUntil && parts.length < 420) {
      for (let i = 0; i < 2; i++) parts.push(make(rnd(0, W), -30, rainOpts, rnd(-.8, .8), rnd(2, 5)));
    } else if (rainOpts && now >= rainUntil) rainOpts = null;

    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      const d = Math.pow(p.drag, dt);
      p.vx *= d; p.vy = p.vy * d + p.gy * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.r += p.vr * dt; p.w += p.vw * dt;
      p.life -= dt;
      if (p.life < 22) p.a = Math.max(0, p.life / 22);
      if (p.life <= 0 || p.y > H + 70) { parts.splice(i, 1); continue; }
      draw(p);
    }
    if (parts.length || rainOpts) raf = requestAnimationFrame(step);
    else { raf = 0; ctx.clearRect(0, 0, W, H); }
  }
  function run() { if (!raf && ctx) { last = performance.now(); raf = requestAnimationFrame(step); } }

  function rain(opts, ms) {
    if (!ctx || !motionOK()) return;
    rainOpts = Object.assign({ colors: COLORS, shapes: ['glyph'], gravity: .12, drag: .995, size: [8, 16], life: [160, 280] }, opts || {});
    rainUntil = performance.now() + (ms || 5200);
    run();
  }

  function burstFrom(el, opts) {
    if (!el) return;
    const r = el.getBoundingClientRect();
    confetti(r.left + r.width / 2, r.top + r.height / 2, opts);
  }

  /* data-confetti : un clic = une petite fête */
  document.addEventListener('click', (e) => {
    const t = e.target.closest && e.target.closest('[data-confetti]');
    if (!t) return;
    if (e.clientX || e.clientY) confetti(e.clientX, e.clientY);
    else burstFrom(t);
  });

  /* ── easter eggs ───────────────────────────────────────────────────────── */
  function konami() {
    root.classList.add('party');
    confetti(W / 2, H * .55, { count: 160, power: [8, 22], spread: Math.PI * 1.5 });
    rain({ shapes: ['glyph'], glyphs: ['{', '}', '</>', ';', '418', '0x1F4'] }, 6500);
    toast('↑ ↑ ↓ ↓ ← → ← → B A — Mode Festival débloqué. +30 vies. Le thé est offert.', 6000);
    setTimeout(() => root.classList.remove('party'), 7000);
    console.log('%c+30 vies', 'font:700 20px monospace;color:#34A853');
  }

  function tea() {
    root.classList.add('tea');
    rain({ colors: TEA, shapes: ['leaf'], gravity: .09, size: [9, 17], drag: .992, life: [200, 340] }, 4600);
    toast('Premier verre : fort comme un premier commit. Deuxième : doux. Troisième : suave. (Non, pas de café.)', 6200);
    setTimeout(() => root.classList.remove('tea'), 5200);
  }

  function niamey() {
    confetti(W / 2, H * .5, { count: 130, power: [8, 20], spread: Math.PI * 2 });
    toast('Tu as tapé le nom de la ville. Compilation… ✔ 0 erreur, 0 warning, 1 belle journée.', 5200);
    const w = document.querySelector('.wax');
    if (w) { w.classList.add('shine'); setTimeout(() => w.classList.remove('shine'), 2600); }
  }

  /* touches : Konami + mots tapés (hors champs de saisie) */
  const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];
  let kpos = 0, buf = '';
  const typing = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  document.addEventListener('keydown', (e) => {
    if (typing(e.target) || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = (e.key || '').toLowerCase();
    kpos = k === KONAMI[kpos] ? kpos + 1 : (k === KONAMI[0] ? 1 : 0);
    if (kpos === KONAMI.length) { kpos = 0; konami(); }
    if (k.length === 1) {
      buf = (buf + k).slice(-8);
      if (/(tea|the|thé)$/.test(buf)) { buf = ''; tea(); }
      else if (/niamey$/.test(buf)) { buf = ''; niamey(); }
    }
  });

  /* 5 clics sur le logo = mode debug */
  const logo = document.getElementById('logo');
  if (logo) {
    let clicks = [];
    logo.addEventListener('click', () => {
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 2600).concat(now);
      if (clicks.length >= 5) {
        clicks = [];
        const on = root.classList.toggle('debug');
        toast(on ? 'Mode debug activé. Chaque boîte a un contour, comme dans tes devtools. 5 clics pour sortir.' : 'Mode debug désactivé. Retour à la production.', 5200);
        console.log('%cdebug ' + (on ? 'ON' : 'OFF'), 'font:700 14px monospace;color:#EA4335');
      }
    });
  }

  /* le wax : un clic, un proverbe */
  const wax = document.querySelector('.wax');
  if (wax) {
    wax.addEventListener('click', (e) => {
      wax.classList.add('shine'); setTimeout(() => wax.classList.remove('shine'), 2600);
      confetti(e.clientX, e.clientY, { count: 70, colors: ['#FBBC04', '#EA4335', '#4285F4', '#34A853'], shapes: ['circle', 'spark', 'rect'] });
      toast('Le wax, c’est du code imprimé : chaque motif porte un nom, souvent un proverbe. « Les yeux de ma rivale », par exemple.', 6800);
    });
  }

  /* l'avion en papier : déployé en prod, un vendredi */
  const plane = document.querySelector('.hero__plane');
  if (plane) {
    plane.addEventListener('click', () => {
      if (plane.classList.contains('fly')) return;
      plane.classList.add('fly');
      toast('Déployé en production. Un vendredi. Courage.', 4800);
      setTimeout(() => plane.classList.remove('fly'), 3600);
    });
  }

  /* ── console ───────────────────────────────────────────────────────────── */
  const ev = C.event || {};
  try {
    const big = 'font:400 64px/1 Impact,"Arial Narrow Bold",sans-serif;letter-spacing:.02em;';
    console.log(
      '%cDEV%cFEST%c NIAMEY %c2026',
      big + 'color:#4285F4', big + 'color:#EA4335', big + 'color:#FBBC04', big + 'color:#34A853'
    );
    console.log('%cTu ouvres la console : bon réflexe. Les développeur·euses sont les bienvenu·es ici.', 'font:600 14px system-ui;color:#202124');
    console.log('%c→ tape %cdevfest.help()%c pour voir ce qui se cache.', 'font:13px monospace;color:#5f6368', 'font:700 13px monospace;color:#4285F4', 'font:13px monospace;color:#5f6368');
  } catch (e) { /* console absente : tant pis */ }

  window.devfest = {
    ville: ev.city || 'Niamey',
    date: ev.dateLong,
    compile() { console.log('%c✔ compilé en 0,0 s — 0 erreur, 0 warning', 'color:#34A853;font:700 13px monospace'); return 'ça compile.'; },
    help() {
      const a = 'font:700 13px monospace;color:#4285F4', b = 'font:13px monospace;color:#5f6368';
      [
        ['devfest.compile()', 'vérifie que Niamey compile'],
        ['devfest.agenda()', 'le programme, en tableau'],
        ['devfest.speakers()', 'les voix (placeholders)'],
        ['devfest.the()', 'un verre. Puis un autre. Puis un troisième.'],
        ['devfest.billet()', 'ouvre la billetterie'],
        ['devfest.indices()', 'combien d\'easter eggs ? où ?']
      ].forEach(([cmd, txt]) => console.log('%c' + cmd.padEnd(20) + '%c' + txt, a, b));
      return 'bonne chasse.';
    },
    agenda() { console.table((C.agenda || []).map((s) => ({ heure: s.time, titre: s.title, parcours: s.track, salle: s.room }))); return (C.agenda || []).length + ' sessions'; },
    speakers() { console.table((C.speakers || []).map((s) => ({ nom: s.name, rôle: s.role, ville: s.city }))); return (C.speakers || []).length + ' voix'; },
    the() { tea(); return 'Premier verre servi.'; },
    billet() { if (ev.ticketUrl) window.open(ev.ticketUrl, '_blank', 'noopener'); return ev.ticketUrl; },
    indices() {
      console.log('%c11 easter eggs. Indices : la console · ↑↑↓↓←→←→BA · tape « tea » · 5 clics sur le logo · le sablier · les chiffres · le terminal · 418 · humans.txt · le wax · et un avion en papier.', 'font:13px/1.5 monospace;color:#202124');
      return 'bonne chasse.';
    }
  };
  window.DFX = { confetti, burstFrom, rain, toast, konami, tea, niamey, motionOK };
})();
