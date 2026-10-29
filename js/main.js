/* ──────────────────────────────────────────────────────────────────────────
   DEVFEST NIAMEY 2026 — main.js
   Rend la page à partir de window.DEVFEST (js/config.js), puis la fait vivre :
   révélations, compte à rebours, filtres, vidéos paresseuses, bords déchirés.
   Aucune dépendance. Tout contenu passe par textContent (jamais innerHTML).
   ────────────────────────────────────────────────────────────────────────── */
(() => {
  'use strict';

  const C = window.DEVFEST;
  if (!C) { console.error('DevFest : js/config.js est introuvable.'); return; }
  const FX = window.DFX || {};
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const safe = (fn) => { try { return fn(); } catch (e) { return undefined; } };
  const toast = (m, ms) => FX.toast && FX.toast(m, ms);

  const RM = window.matchMedia('(prefers-reduced-motion: reduce)');
  const MQ_M = window.matchMedia('(max-width: 820px)');
  const MQ_T = window.matchMedia('(max-width: 900px)');
  const conn = navigator.connection || {};
  const lite = !!(conn.saveData || /(^|-)2g$/.test(conn.effectiveType || ''));

  const ev = C.event;
  const get = (path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), C);
  const COLOR = { blue: 'var(--blue)', red: 'var(--red)', yellow: 'var(--yellow)', green: 'var(--green)' };
  const byId = (arr) => Object.fromEntries((arr || []).map((x) => [x.id, x]));
  const TRACK = byId(C.tracks), SPK = byId(C.speakers), GLASS = byId(C.glasses), AUD = byId(C.audiences);
  const AUD_COLOR = { student: 'var(--blue)', curious: 'var(--yellow)', pro: 'var(--green)' };
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const SVGNS = 'http://www.w3.org/2000/svg';

  /* mini-helper DOM : h('div', {class:'x', text:'…'}, enfants…) */
  function h(tag, props, ...kids) {
    const n = document.createElement(tag);
    for (const k in props || {}) {
      const v = props[k];
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'style') n.style.cssText = v;
      else n.setAttribute(k, v === true ? '' : v);
    }
    kids.flat().forEach((c) => { if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  }
  function icon(id, size, cls) {
    const s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('class', cls || 'ic');
    if (size) { s.setAttribute('width', size); s.setAttribute('height', size); }
    s.setAttribute('aria-hidden', 'true');
    const u = document.createElementNS(SVGNS, 'use');
    u.setAttribute('href', '#' + id);
    s.append(u);
    return s;
  }

  /* ═══════════ 0 · liaisons de config (data-cfg*) ═══════════ */
  $$('[data-cfg]').forEach((n) => { const v = get(n.dataset.cfg); if (v != null) n.textContent = v; });
  $$('[data-cfg-href]').forEach((n) => { const v = get(n.dataset.cfgHref); if (v) n.href = v; });
  $$('[data-cfg-mail]').forEach((n) => { const v = get(n.dataset.cfgMail); if (v) { n.href = 'mailto:' + v; n.textContent = v; } });

  /* JSON-LD synchronisé avec la config */
  safe(() => {
    const ld = $('#ld-event');
    const j = JSON.parse(ld.textContent);
    j.name = ev.name; j.startDate = ev.dateISO; j.endDate = ev.endISO;
    j.location.name = ev.venue; j.location.address.addressLocality = ev.city;
    j.organizer.name = ev.organizer;
    if (ev.ticketUrl) j.offers = { '@type': 'Offer', url: ev.ticketUrl, availability: 'https://schema.org/InStock' };
    ld.textContent = JSON.stringify(j);
  });

  /* ═══════════ 1 · mouvement : animations en marche / en pause ═══════════ */
  let motion = !RM.matches && !lite;
  const storedMotion = safe(() => localStorage.getItem('df-motion'));
  if (storedMotion === '1') motion = true; else if (storedMotion === '0') motion = false;

  const calmBtn = $('#calm');
  function setMotion(on, persist) {
    motion = on;
    root.classList.toggle('calm', !on);
    if (calmBtn) {
      calmBtn.setAttribute('aria-pressed', String(!on));
      calmBtn.setAttribute('aria-label', on ? 'Mettre les animations en pause' : 'Relancer les animations');
    }
    if (persist) safe(() => localStorage.setItem('df-motion', on ? '1' : '0'));
    if (on) { resumeVideos(); startTyped(); } else pauseVideos();
    if (persist) toast(on ? 'Animations relancées.' : 'Animations en pause. Les vidéos s’arrêtent, la page reste là.', 2600);
  }
  if (calmBtn) calmBtn.addEventListener('click', () => setMotion(!motion, true));

  /* ═══════════ 2 · bandes défilantes ═══════════ */
  function renderBands() {
    const sets = [
      C.tracks.map((t) => t.name),
      [ev.dateLong, ev.venue, ev.city, C.stats[0].value + C.stats[0].suffix + ' ' + C.stats[0].label, C.stats[1].value + ' ' + C.stats[1].label, 'GDG ' + ev.city]
    ];
    $$('[data-band]').forEach((track, i) => {
      const words = sets[i] || sets[0];
      const half = () => {
        const f = document.createDocumentFragment();
        for (let r = 0; r < 2; r++) words.forEach((w) => { f.append(h('span', { text: w }), icon('i-star', null, 'star')); });
        return f;
      };
      track.append(half(), half());
    });
  }

  /* ═══════════ 3 · titres : mots qui montent, manifeste qui s'allume ═══════════ */
  function splitWords(node, idx) {
    Array.from(node.childNodes).forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/([ \t\n\r]+)/).forEach((tok) => {
          if (!tok) return;
          if (/^[ \t\n\r]+$/.test(tok)) frag.append(document.createTextNode(' '));
          else frag.append(h('span', { class: 'w' }, h('span', { class: 'wi', style: '--i:' + (idx.n++) }, tok)));
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR') splitWords(ch, idx);
    });
  }
  function lightify(node) {
    Array.from(node.childNodes).forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/([ \t\n\r]+)/).forEach((tok) => {
          if (!tok) return;
          frag.append(/^[ \t\n\r]+$/.test(tok) ? document.createTextNode(' ') : h('span', { class: 'wd', text: tok }));
        });
        ch.replaceWith(frag);
      } else if (ch.nodeType === 1) lightify(ch);
    });
  }
  $$('[data-words]').forEach((n) => (n.classList.contains('why__big') ? lightify(n) : splitWords(n, { n: 0 })));
  const manifesto = $('.why__big');
  const wds = $$('.why__big .wd');

  /* révélations à l'entrée dans l'écran */
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    : null;
  $$('.rv').forEach((n) => {
    const sibs = Array.from(n.parentElement.children).filter((c) => c.classList.contains('rv'));
    n.style.setProperty('--d', Math.max(0, sibs.indexOf(n)) * 90 + 'ms');
  });
  $$('.rv, [data-words]').forEach((n) => (io ? io.observe(n) : n.classList.add('in')));

  /* ═══════════ 4 · qui es-tu ? (profils) ═══════════ */
  function radios(box, items, onPick) {
    const btns = items.map((it) => h('button', {
      class: 'chip', type: 'button', role: 'radio', 'aria-checked': 'false', tabindex: '-1',
      'data-id': it.id, style: it.color ? '--c:' + it.color : null
    }, it.dot ? h('i', { class: 'dot', style: '--c:' + it.dot }) : null, it.label));
    box.append(...btns);
    btns.forEach((b) => b.addEventListener('click', () => onPick(b.dataset.id)));
    box.addEventListener('keydown', (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      let n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % btns.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + btns.length) % btns.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = btns.length - 1;
      if (n >= 0) { e.preventDefault(); btns[n].focus(); btns[n].click(); }
    });
    return {
      set(id) {
        let any = false;
        btns.forEach((b) => {
          const on = b.dataset.id === id;
          any = any || on;
          b.setAttribute('aria-checked', String(on));
          b.tabIndex = on ? 0 : -1;
        });
        if (!any) btns[0].tabIndex = 0;
      }
    };
  }

  const state = { aud: '', track: '' };
  const whoBox = $('#who-chips');
  const whoOut = $('#who-out');
  const whoRadios = radios(whoBox, C.audiences.map((a) => ({ id: a.id, label: a.label, color: AUD_COLOR[a.id] })), (id) => setAud(id));

  function renderWho() {
    if (!state.aud) {
      whoOut.style.removeProperty('--c');
      whoOut.replaceChildren(
        h('h4', { text: 'Dis-nous qui tu es.' }),
        h('p', { text: 'Choisis un profil : on adapte le programme à ta curiosité, sans te demander ton CV.' })
      );
      return;
    }
    const a = AUD[state.aud];
    whoOut.style.setProperty('--c', AUD_COLOR[a.id]);
    const mine = C.agenda.filter((s) => s.kind !== 'pause' && s.for.includes(a.id));
    const perTrack = {};
    mine.forEach((s) => { perTrack[s.track] = (perTrack[s.track] || 0) + 1; });
    const top = Object.entries(perTrack).sort((x, y) => y[1] - x[1]).slice(0, 3);
    whoOut.replaceChildren(
      h('h4', { text: a.pitch }),
      h('p', { text: a.text }),
      h('div', { class: 'who__tags' }, top.map(([id, n]) => h('span', { class: 'chip', style: '--c:' + COLOR[TRACK[id].color] },
        h('i', { class: 'dot' }), TRACK[id].name + ' · ' + n + (n > 1 ? ' sessions' : ' session')))),
      h('a', { class: 'who__go', href: '#programme' }, 'Voir le programme qui va avec', icon('i-arrow', 18))
    );
  }

  /* ═══════════ 5 · parcours ═══════════ */
  const SHAPE = { blue: 'blob-blue-01', red: 'blob-red-02', yellow: 'blob-yellow-01', green: 'blob-green-04' };
  const ART = {
    brace: { src: 'media/cutouts/B02_blue-brace.webp', alt: '', style: '' },
    plane: { src: 'media/cutouts/B03_paper-plane.webp', alt: '', style: 'mix-blend-mode:multiply;' },
    man: { src: 'media/cutouts/B06_man-walking.webp', alt: '', style: '' },
    sprout: { src: 'media/img/A07_phone-growing-sprout_paper-green-bg_4x3.webp', print: true, ar: '4/3', tilt: -3 },
    calabash: { src: 'media/img/A04_calabash-fiber-stars_charcoal-bg_1x1.webp', print: true, ar: '1/1', tilt: 2.5 }
  };
  const tracksList = $('#tracks-list');
  const tracksStage = $('#tracks-stage');

  function learnList(t) { return h('ul', { class: 'stage__learn' }, t.learn.map((l) => h('li', { text: l }))); }
  function artEl(t, mini) {
    const a = ART[t.cutout || t.image];
    if (!a) return null;
    const img = h('img', { src: a.src, alt: '', loading: 'lazy', decoding: 'async', style: a.style || null });
    if (a.print) return h('div', { class: 'print', style: '--ar:' + a.ar + ';transform:rotate(' + a.tilt + 'deg)' }, img);
    return mini ? h('div', { class: 'mini' }, img) : img;
  }
  function activateTrack(id, toggle) {
    $$('.track', tracksList).forEach((li) => {
      const on = li.dataset.id === id && !(toggle && li.classList.contains('is-active'));
      li.classList.toggle('is-active', on);
      $('.track__btn', li).setAttribute('aria-expanded', String(on));
    });
    const active = $('.track.is-active', tracksList);
    $$('.stage', tracksStage).forEach((s) => s.classList.toggle('is-active', !!active && s.dataset.id === active.dataset.id));
    if (active && MQ_T.matches) {
      const inner = $('.track__inner', active);
      if (!$('.mini, .print', inner)) { const m = artEl(TRACK[active.dataset.id], true); if (m) inner.append(m); }
    }
  }
  function renderTracks() {
    C.tracks.forEach((t, i) => {
      const inner = h('div', { class: 'track__inner' }, h('p', { text: t.line }), learnList(t));
      const li = h('li', { class: 'track', 'data-id': t.id, 'data-c': t.color },
        h('button', { class: 'track__btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'trk-' + t.id },
          h('span', { class: 'track__n mono', text: String(i + 1).padStart(2, '0') }),
          h('span', { class: 'track__name', text: t.name }),
          h('span', { class: 'track__arrow' }, icon('i-arrow', '55%'))),
        h('div', { class: 'track__more', id: 'trk-' + t.id }, inner));
      tracksList.append(li);
      tracksStage.append(h('div', { class: 'stage', 'data-id': t.id },
        h('img', { class: 'stage__shape', src: 'media/shapes/' + SHAPE[t.color] + '.webp', alt: '', loading: 'lazy' }),
        h('div', { class: 'stage__art' }, artEl(t)),
        h('div', { class: 'stage__note' }, h('b', { text: t.name }), h('p', { text: t.line }), learnList(t))));
      const btn = $('.track__btn', li);
      btn.addEventListener('click', () => activateTrack(t.id, MQ_T.matches));
      li.addEventListener('pointerenter', (e) => { if (!MQ_T.matches && e.pointerType === 'mouse') activateTrack(t.id, false); });
      btn.addEventListener('focus', () => { if (!MQ_T.matches) activateTrack(t.id, false); });
    });
    if (!MQ_T.matches) activateTrack(C.tracks[0].id, false);
    MQ_T.addEventListener('change', () => { if (!MQ_T.matches && !$('.track.is-active', tracksList)) activateTrack(C.tracks[0].id, false); });
  }

  /* ═══════════ 6 · programme ═══════════ */
  const agendaEl = $('#agenda');
  const sessions = [];
  const countEl = h('p', { class: 'pf__count mono', 'aria-live': 'polite' });
  let pfAud, pfTrack;

  function renderAgenda() {
    const glasses = {};
    C.glasses.forEach((g) => {
      const m = /^(\d+)\s*(.*)$/.exec(g.n) || [null, g.n, ''];
      const lvl = { g1: 88, g2: 56, g3: 28 }[g.id] || 50;
      const list = h('ul', { class: 'sessions' });
      glasses[g.id] = { sec: h('section', { class: 'glass', 'data-g': g.id, 'aria-label': g.n + ' — ' + g.name },
        h('div', { class: 'glass__head' },
          h('span', { class: 'glass__n display', 'aria-hidden': 'true' }, m[1], h('small', { text: m[2] })),
          h('h3', { class: 'glass__name', text: g.name }),
          h('p', { class: 'glass__time mono', text: g.from + ' – ' + g.to }),
          h('p', { class: 'glass__taste', text: g.taste }),
          h('div', { class: 'glass__level', style: '--lvl:' + lvl + '%', 'aria-hidden': 'true' })),
        list), list };
      agendaEl.append(glasses[g.id].sec);
    });

    C.agenda.forEach((s, i) => {
      const t = TRACK[s.track];
      const spk = s.speaker ? SPK[s.speaker] : null;
      const expandable = !!(s.desc || spk);
      const meta = h('span', { class: 'session__meta' },
        h('span', { class: 'tag', style: '--c:' + COLOR[t.color] }, h('i'), t.name),
        h('span', { class: 'tag', text: s.kind }),
        s.room ? h('span', { class: 'tag', text: s.room }) : null,
        spk ? h('span', { class: 'tag', text: spk.name }) : null,
        h('span', { class: 'session__foryou' }, icon('i-star', 10), 'Pour toi'));
      const head = [
        h('span', { class: 'session__time display', text: s.time }),
        h('span', { class: 'session__title', text: s.title }),
        expandable ? h('span', { class: 'session__plus', 'aria-hidden': 'true' }, icon('i-plus', 16)) : null,
        meta
      ];
      const li = h('li', { class: 'session' + (expandable ? '' : ' session--static'), 'data-for': s.for.join(' '), 'data-track': s.track, 'data-open': 'false' });
      if (expandable) {
        const more = h('div', { class: 'session__more', id: 'ses-' + i, inert: '' },
          h('div', null, h('div', { class: 'session__body' },
            s.desc ? h('p', { text: s.desc }) : null,
            spk ? h('p', { class: 'session__who', text: 'Avec ' + spk.name + ' — ' + spk.role + ', ' + spk.org }) : null)));
        const btn = h('button', { class: 'session__btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'ses-' + i }, head);
        btn.addEventListener('click', () => {
          const open = li.dataset.open !== 'true';
          li.dataset.open = String(open);
          btn.setAttribute('aria-expanded', String(open));
          more.inert = !open;
        });
        li.append(btn, more);
      } else {
        li.append(h('div', { class: 'session__btn' }, head));
      }
      glasses[s.glass].list.append(li);
      sessions.push({ li, s, glass: glasses[s.glass].sec });
    });
    agendaEl.after(h('p', { class: 'agenda__empty serif', text: 'Aucune session pour ce parcours… pour l’instant.', hidden: '' }));

    const filters = $('.prog__filters');
    pfAud = radios($('#pf-aud'), [{ id: '', label: 'Tout le monde' }].concat(C.audiences.map((a) => ({ id: a.id, label: a.label, color: AUD_COLOR[a.id] }))), (id) => setAud(id));
    pfTrack = radios($('#pf-track'), [{ id: '', label: 'Tous' }].concat(C.tracks.map((t) => ({ id: t.id, label: t.name, dot: COLOR[t.color] }))), (id) => setTrack(id));
    $('#pf-aud').setAttribute('role', 'radiogroup'); $('#pf-aud').setAttribute('aria-label', 'Je suis');
    $('#pf-track').setAttribute('role', 'radiogroup'); $('#pf-track').setAttribute('aria-label', 'Parcours');
    filters.append(countEl);
    pfAud.set(''); pfTrack.set('');
    applyFilters();
  }

  function applyFilters() {
    let shown = 0, mine = 0;
    sessions.forEach(({ li, s }) => {
      const hide = !!state.track && (s.track !== state.track || s.kind === 'pause' || !s.speaker);
      li.hidden = hide;
      if (!hide) { shown++; if (state.aud && s.kind !== 'pause' && s.for.includes(state.aud)) mine++; }
    });
    $$('.glass', agendaEl).forEach((g) => { g.hidden = !$$('.session:not([hidden])', g).length; });
    const empty = $('.agenda__empty');
    if (empty) empty.hidden = shown > 0;
    countEl.textContent = state.aud
      ? mine + (mine > 1 ? ' sessions pensées pour toi' : ' session pensée pour toi') + ' · les autres restent visibles, en retrait.'
      : shown + (shown > 1 ? ' sessions' : ' session') + (state.track ? ' dans ce parcours.' : ' sur la journée.');
  }
  function setAud(id) {
    state.aud = id || '';
    whoRadios.set(state.aud);
    if (pfAud) pfAud.set(state.aud);
    agendaEl.dataset.aud = state.aud;
    renderWho();
    applyFilters();
  }
  function setTrack(id) {
    state.track = id || '';
    pfTrack.set(state.track);
    applyFilters();
  }

  /* ═══════════ 7 · les voix ═══════════ */
  const lineup = $('#lineup');
  const vcard = $('#vcard');
  vcard.removeAttribute('aria-live');
  function showVoice(sp, pin) {
    const t = TRACK[sp.track];
    const slot = C.agenda.find((s) => s.speaker === sp.id);
    const ini = sp.name.split(/\s+/).slice(0, 2).map((w) => w[0]).join('');
    vcard.style.setProperty('--c', COLOR[t.color]);
    vcard.replaceChildren(
      h('div', { class: 'vcard__mono', 'aria-hidden': 'true', text: ini }),
      h('div', null,
        h('h3', { text: sp.name }),
        h('p', { text: sp.role + ' · ' + sp.org }),
        h('p', { text: sp.city + ' — parcours ' + t.name }),
        slot ? h('span', { class: 'mono', text: slot.time + ' · ' + slot.title + (slot.room ? ' · ' + slot.room : '') }) : null));
    if (pin) $$('button', lineup).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === sp.id)));
  }
  function renderVoices() {
    C.speakers.forEach((sp) => {
      const b = h('button', { type: 'button', 'aria-pressed': 'false', 'data-id': sp.id, text: sp.name });
      b.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') showVoice(sp, false); });
      b.addEventListener('focus', () => showVoice(sp, false));
      b.addEventListener('click', () => showVoice(sp, true));
      lineup.append(h('li', { class: sp.headliner ? 'is-head' : null }, b, icon('i-star', null, 'star')));
    });
    const more = $('#lineup-more');
    if (more) {
      more.textContent = '+ ' + C.speakersMore + ' autres voix à annoncer';
      more.append(h('span', { class: 'caret', 'aria-hidden': 'true', text: '_' }));
    }
    const first = C.speakers.find((s) => s.headliner) || C.speakers[0];
    showVoice(first, false);
  }

  /* ═══════════ 8 · chiffres ═══════════ */
  const statsEl = $('#stats');
  const BASES = ['dec', 'bin', 'hex'];
  const STAT_MSG = {
    bin: 'En binaire, ce chiffre fait 0b111110100. Les machines comptent comme ça.',
    hex: '500 = 0x1F4. Comme #4285F4, mais un peu moins bleu.',
    dec: 'Retour au décimal. Humain·e, bienvenue.'
  };
  let baseIdx = 0;
  const shownVals = C.stats.map(() => 0);
  const fmtNum = (v, i) => {
    const n = Math.round(v), base = BASES[baseIdx];
    if (base === 'bin') return '0b' + n.toString(2);
    if (base === 'hex') return '0x' + n.toString(16).toUpperCase();
    return n + (n >= C.stats[i].value ? C.stats[i].suffix : '');
  };
  function paintStats() { $$('.stat__v', statsEl).forEach((e, i) => { e.textContent = fmtNum(shownVals[i], i); }); statsEl.dataset.fmt = BASES[baseIdx]; }
  function renderStats() {
    C.stats.forEach((s, i) => {
      const btn = h('button', { class: 'stat__btn', type: 'button', 'aria-label': s.value + s.suffix + ' ' + s.label + '. ' + s.note + '. Activer pour changer la base de numération.' },
        h('span', { class: 'stat__v display', text: '0' }),
        h('span', { class: 'stat__l', text: s.label }),
        h('span', { class: 'stat__n mono', text: s.note }));
      btn.addEventListener('click', () => {
        baseIdx = (baseIdx + 1) % BASES.length;
        shownVals.forEach((_, k) => { shownVals[k] = C.stats[k].value; });
        paintStats();
        toast(STAT_MSG[BASES[baseIdx]], 4600);
      });
      statsEl.append(h('li', { class: 'stat' }, btn));
    });
    statsEl.after(h('p', { class: 'stats__hint mono', 'aria-hidden': 'true', text: '↑ clique un chiffre : il parle plusieurs bases' }));
    paintStats();
    const run = () => {
      if (!motion) { C.stats.forEach((s, i) => { shownVals[i] = s.value; }); paintStats(); return; }
      const t0 = performance.now(), D = 1700;
      (function tick(now) {
        const k = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - k, 3);
        C.stats.forEach((s, i) => { shownVals[i] = s.value * e; });
        paintStats();
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    };
    if (io) {
      const so = new IntersectionObserver((es) => { if (es[0].isIntersecting) { so.disconnect(); run(); } }, { threshold: 0.35 });
      so.observe(statsEl);
    } else run();
  }

  /* ═══════════ 9 · sablier : compte à rebours ═══════════ */
  const clock = $('#clock');
  const hint = $('#clock-hint');
  const srClock = $('#clock-sr');
  const CF = ['dec', 'bin', 'hex'];
  const HINTS = [
    '↑ clique sur le chrono, il a plusieurs langages',
    '↑ binaire. Les machines comptent comme ça.',
    '↑ hexadécimal. Les designers aussi (#4285F4).',
    '↑ retour en décimal. Humain·e.'
  ];
  let cfi = 0, lastMin = -1;
  const target = new Date(ev.dateISO).getTime();
  const PAD = { dec: [2, 2, 2, 2], bin: [6, 5, 6, 6], hex: [2, 2, 2, 2] };
  function fmtUnit(n, i) {
    const f = CF[cfi];
    const s = n.toString(f === 'bin' ? 2 : f === 'hex' ? 16 : 10).toUpperCase();
    return s.padStart(PAD[f][i], '0');
  }
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const s = Math.floor(diff / 1000);
    const v = [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
    ['d', 'h', 'm', 's'].forEach((u, i) => { const e = $('[data-u="' + u + '"]', clock); if (e) e.textContent = fmtUnit(v[i], i); });
    clock.dataset.fmt = CF[cfi];
    const min = Math.floor(s / 60);
    if (min !== lastMin) {
      lastMin = min;
      srClock.textContent = diff > 0
        ? 'Il reste ' + v[0] + ' jours, ' + v[1] + ' heures et ' + v[2] + ' minutes avant le DevFest Niamey.'
        : 'Le DevFest Niamey a commencé. Ou fini. Dans les deux cas : merci.';
    }
    if (diff === 0 && cfi === 0) hint.textContent = 'C’est aujourd’hui. Ou c’était hier. Dans les deux cas : merci d’être venu·e.';
  }
  function setupClock() {
    tick();
    setInterval(tick, 1000);
    clock.addEventListener('click', () => {
      cfi = (cfi + 1) % CF.length;
      hint.textContent = HINTS[cfi === 0 ? 3 : cfi];
      tick();
    });
    const icsBtn = $('#ics');
    if (icsBtn) icsBtn.addEventListener('click', downloadIcs);
  }
  function downloadIcs() {
    const stamp = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const esc = (t) => String(t).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
    const lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//GDG Niamey//DevFest Niamey 2026//FR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:devfest-niamey-2026@gdgniamey', 'DTSTAMP:' + stamp(new Date().toISOString()),
      'DTSTART:' + stamp(ev.dateISO), 'DTEND:' + stamp(ev.endISO || ev.dateISO),
      'SUMMARY:' + esc(ev.name), 'LOCATION:' + esc(ev.venue + ', ' + ev.city + ', ' + ev.country),
      'DESCRIPTION:' + esc('Accueil dès ' + ev.doors + '. Web, Mobile & Flutter, Cloud, IA & Gemini, Carrière & Communauté.\nBillets : ' + ev.ticketUrl),
      'URL:' + esc(ev.ticketUrl),
      'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Demain : DevFest Niamey', 'END:VALARM',
      'END:VEVENT', 'END:VCALENDAR'
    ];
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const a = h('a', { href: URL.createObjectURL(blob), download: 'devfest-niamey-2026.ics' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    toast('Rendez-vous ajouté : samedi 12 décembre, avec une alerte la veille.', 4200);
  }

  /* ═══════════ 10 · FAQ, partenaires, pied de page ═══════════ */
  function renderFaq() {
    const box = $('#faq-list');
    C.faq.forEach((f) => {
      const a = h('div', { class: 'faq__a' }, h('p', { text: f.a }));
      if (/418/.test(f.a)) a.firstChild.append(' ', h('a', { href: '418.html', class: 'linkish', text: 'Voir la page 418' }));
      box.append(h('details', { name: 'faq' },
        h('summary', null, h('span', { text: f.q }), h('span', { class: 'plus', 'aria-hidden': 'true' }, icon('i-plus', 18))),
        a));
    });
  }
  function renderPartners() {
    const box = $('#partners');
    const note = $('#partners-note');
    if (note) { if (C.partnersNote) note.textContent = C.partnersNote; else note.remove(); }
    C.partners.forEach((p) => box.append(h('li', { class: 'partner' }, h('small', { class: 'mono', text: p.tier }), h('b', { text: p.name }))));
  }
  function renderSocials() {
    const box = $('#socials');
    C.socials.forEach((s) => box.append(h('li', null, h('a', { href: s.url, target: '_blank', rel: 'noopener', text: s.name }))));
  }

  /* ═══════════ 11 · bords déchirés ═══════════ */
  function tears() {
    const probe = h('div', { style: 'position:absolute;visibility:hidden;width:var(--edge);height:1px' });
    document.body.append(probe);
    const edge = probe.getBoundingClientRect().width || 40;
    probe.remove();
    $$('.tear').forEach((sec, si) => {
      let seed = 1337 + si * 7919;
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      const steps = 72;
      const pts = ['0 0', '100% 0'];
      let y = rand();
      for (let i = steps; i >= 0; i--) {
        y = Math.min(1, Math.max(0, y + (rand() - 0.5) * 0.6));
        const off = Math.round((y * 0.78 + rand() * 0.22) * edge);
        pts.push((i / steps * 100).toFixed(2) + '% calc(100% - ' + off + 'px)');
      }
      sec.style.clipPath = 'polygon(' + pts.join(',') + ')';
    });
  }

  /* ═══════════ 12 · vidéos : paresseuses, légères, respectueuses ═══════════ */
  const V = {
    V01: { slug: 'open-head-ideas', img: { '16x9': 'A01_open-head-ideas_paper-bg_16x9', '9x16': 'A01_open-head-ideas_paper-bg_9x16' } },
    V02: { slug: 'teapot-pouring-light', img: { '16x9': 'A03_teapot-pouring-light_paper-green-bg_16x9' } },
    V03: { slug: 'agadez-cross-microchip', img: {} },
    V04: { slug: 'curly-braces-crowd', img: { '16x9': 'A05_curly-braces-crowd_paper-bg_16x9', '9x16': 'A05_curly-braces-crowd_paper-bg_9x16' } },
    V05: { slug: 'golden-ticket-hand', img: { '16x9': 'A09_golden-ticket-hand_blue-bg_16x9' } },
    V06: { slug: 'calabash-fiber-stars', img: { '16x9': 'A04_calabash-fiber-stars_charcoal-bg_16x9' } }
  };
  const fmt = () => (MQ_M.matches ? '9x16' : '16x9');
  const vSrc = (code) => 'media/video/' + code + '_' + V[code].slug + '_' + fmt() + '.mp4';
  const vPoster = (code) => {
    const img = V[code].img[fmt()];
    return img ? 'media/img/' + img + '.webp' : 'media/video/' + code + '_' + V[code].slug + '_' + fmt() + '.poster.webp';
  };

  const frames = [];
  function mountFrame(box) {
    const code = box.dataset.vid;
    if (!V[code]) return;
    const poster = h('img', { alt: '', decoding: 'async', loading: 'lazy', src: vPoster(code) });
    box.prepend(poster);
    frames.push({ box, code, poster, video: null, vis: false });
  }
  function startFrame(f) {
    if (!motion || !f.vis) return;
    if (!f.video) {
      const v = h('video', { muted: '', loop: '', playsinline: '', preload: 'none', 'aria-hidden': 'true', tabindex: '-1', src: vSrc(f.code) });
      v.muted = true; v.defaultMuted = true;
      v.addEventListener('playing', () => f.box.classList.add('is-live'), { once: true });
      f.box.append(v);
      f.video = v;
    }
    const p = f.video.play();
    if (p && p.catch) p.catch(() => { /* autoplay refusé : l'affiche reste, c'est très bien */ });
  }
  function stopFrame(f) { if (f.video) f.video.pause(); }

  const vio = 'IntersectionObserver' in window
    ? new IntersectionObserver((es) => es.forEach((e) => {
      const f = frames.find((x) => x.box === e.target);
      if (!f) return;
      f.vis = e.isIntersecting;
      if (f.vis) startFrame(f); else stopFrame(f);
    }), { threshold: 0.2, rootMargin: '120px 0px' })
    : null;

  /* héros : une seule vidéo, chargée après l'événement load */
  const hero = $('#accueil');
  const hv = $('#hero-video');
  let heroVis = true, heroReady = false;
  function heroStart() {
    if (!hv || !heroReady || !heroVis || !motion) return;
    const f = fmt();
    if (hv.dataset.f !== f) {
      hero.classList.remove('is-live');
      hv.dataset.f = f;
      hv.muted = true; hv.defaultMuted = true;
      hv.src = vSrc('V01');
      hv.load();
    }
    const p = hv.play();
    if (p && p.catch) p.catch(() => {});
  }
  if (hv) hv.addEventListener('playing', () => hero.classList.add('is-live'));

  function pauseVideos() { frames.forEach(stopFrame); if (hv) hv.pause(); }
  function resumeVideos() { frames.forEach(startFrame); heroStart(); }

  MQ_M.addEventListener('change', () => {
    frames.forEach((f) => {
      f.poster.src = vPoster(f.code);
      if (f.video) { f.video.remove(); f.video = null; f.box.classList.remove('is-live'); }
      startFrame(f);
    });
    heroStart();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseVideos(); else if (motion) resumeVideos(); });

  function setupVideos() {
    $$('.vframe[data-vid]').forEach(mountFrame);
    frames.forEach((f) => (vio ? vio.observe(f.box) : null));
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver((es) => { heroVis = es[0].isIntersecting; if (heroVis) heroStart(); else if (hv) hv.pause(); }, { threshold: 0.05 }).observe(hero);
    }
    const ready = () => { heroReady = true; heroStart(); };
    if (document.readyState === 'complete') setTimeout(ready, 300);
    else window.addEventListener('load', () => setTimeout(ready, 400), { once: true });
  }

  /* ═══════════ 13 · héros : le verbe qui change ═══════════ */
  const typed = $('#typed');
  const VERBS = ['ça compile', 'ça déploie', 'ça démarre', 'ça décolle', 'ça rayonne', 'ça se lance', 'ça compile'];
  let typedOn = false, typedRun = false;
  function startTyped() {
    if (!typed || typedRun || RM.matches || !motion) return;
    typedRun = true;
    let vi = 0, txt = typed.textContent;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    (async function loop() {
      await sleep(3600);
      while (typedRun) {
        if (!motion || document.hidden || !typedOn) { await sleep(600); if (!motion) { typedRun = false; return; } continue; }
        vi = (vi + 1) % VERBS.length;
        const next = VERBS[vi];
        for (let i = txt.length; i > 2; i--) { typed.textContent = txt.slice(0, i - 1); await sleep(38); }
        txt = typed.textContent;
        for (let i = txt.length; i < next.length; i++) { txt = next.slice(0, i + 1); typed.textContent = txt; await sleep(72); }
        txt = next; typed.textContent = next;
        await sleep(2600);
      }
    })();
  }
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => { typedOn = es[0].isIntersecting; }, { threshold: 0.3 }).observe(hero);
  } else typedOn = true;

  /* ═══════════ 14 · barre, sommaire, défilement ═══════════ */
  const bar = $('#bar');
  const progress = $('.progress');
  const menuBtn = $('#menu-btn');
  const toc = $('#toc');
  const sticky = $('#sticky-cta');
  const heritageMedia = $('.heritage__media');
  let tocOpen = false, lastY = 0, ticking = false, ctaBlocked = false;

  toc.hidden = false;
  function setToc(open, refocus) {
    tocOpen = open;
    toc.classList.toggle('is-open', open);
    document.body.classList.toggle('toc-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    const lab = $('.menu-btn__t', menuBtn);
    if (lab) lab.textContent = open ? 'Fermer' : 'Sommaire';
    ['#main', '#footer', '#sticky-cta'].forEach((sel) => { const n = $(sel); if (n) n.inert = open; });
    if (open) { bar.classList.remove('is-hidden'); setTimeout(() => { const a = $('.toc__list a', toc); if (a) a.focus({ preventScroll: true }); }, 120); }
    else if (refocus) menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => setToc(!tocOpen, true));
  toc.addEventListener('click', (e) => { if (e.target.closest('a')) setToc(false, false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && tocOpen) setToc(false, true); });

  const top = $('#top');
  if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: motion ? 'smooth' : 'auto' }));
  const egg418 = $('#egg-418');
  if (egg418) egg418.addEventListener('click', () => { window.location.assign('418.html'); });

  const depthEls = $$('[data-depth]').map((el) => ({ el, depth: parseFloat(el.dataset.depth) || 0, ty: 0 }));
  function frame() {
    ticking = false;
    const y = window.scrollY, vh = window.innerHeight;
    const max = root.scrollHeight - vh;
    progress.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : '0');

    const dy = y - lastY;
    if (Math.abs(dy) > 6) {
      if (!tocOpen) {
        if (dy > 0 && y > 360 && !bar.contains(document.activeElement)) bar.classList.add('is-hidden');
        else if (dy < 0) bar.classList.remove('is-hidden');
      }
      lastY = y;
    }
    if (y < 200) bar.classList.remove('is-hidden');

    if (sticky) sticky.classList.toggle('is-on', y > vh * 0.85 && !ctaBlocked && !tocOpen);

    if (manifesto && wds.length) {
      const r = manifesto.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.84 - r.top) / (r.height + vh * 0.3)));
      const n = Math.round(p * wds.length * 1.1);
      for (let i = 0; i < wds.length; i++) wds[i].classList.toggle('on', i < n);
    }

    depthEls.forEach((d) => {
      if (!motion) { if (d.ty) { d.el.style.translate = ''; d.ty = 0; } return; }
      const r = d.el.getBoundingClientRect();
      if (r.bottom < -400 || r.top > vh + 400) return;
      const center = r.top + r.height / 2 - d.ty;
      d.ty = Math.max(-170, Math.min(170, (vh / 2 - center) * d.depth));
      d.el.style.translate = '0 ' + d.ty.toFixed(1) + 'px';
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { onScroll(); clearTimeout(tears.t); tears.t = setTimeout(tears, 180); }, { passive: true });

  if ('IntersectionObserver' in window) {
    const blockers = new Set();
    const bo = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) blockers.add(e.target); else blockers.delete(e.target); });
      ctaBlocked = blockers.size > 0;
      onScroll();
    });
    [$('#billet'), $('#footer')].forEach((n) => n && bo.observe(n));
  }

  /* inclinaison de la croix d'Agadez (souris uniquement) */
  if (heritageMedia && window.matchMedia('(hover:hover) and (pointer:fine)').matches) {
    const fr = $('.vframe', heritageMedia);
    heritageMedia.addEventListener('pointermove', (e) => {
      if (!motion) return;
      const r = heritageMedia.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      fr.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
      fr.style.setProperty('--rx', (-y * 7).toFixed(2) + 'deg');
    });
    heritageMedia.addEventListener('pointerleave', () => { fr.style.setProperty('--ry', '0deg'); fr.style.setProperty('--rx', '0deg'); });
  }

  /* ═══════════ démarrage ═══════════ */
  renderBands();
  renderTracks();
  renderAgenda();
  setAud('');
  renderVoices();
  renderStats();
  setupClock();
  renderFaq();
  renderPartners();
  renderSocials();
  tears();
  setMotion(motion, false);
  setupVideos();
  startTyped();
  frame();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { tears(); onScroll(); });
})();
