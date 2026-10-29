/* ──────────────────────────────────────────────────────────────────────────
   DEVFEST NIAMEY 2026 — terminal.js
   Le petit terminal de la section « code ». Tape « aide ».
   ────────────────────────────────────────────────────────────────────────── */
(() => {
  'use strict';

  const C = window.DEVFEST;
  const FX = window.DFX || {};
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form');
  const input = document.getElementById('term-in');
  const chips = document.getElementById('term-chips');
  const box = document.getElementById('term');
  if (!C || !out || !form || !input) return;

  const ev = C.event;
  const TRACK = Object.fromEntries(C.tracks.map((t) => [t.id, t]));
  const SPK = Object.fromEntries(C.speakers.map((s) => [s.id, s]));

  /* ── sortie ── */
  function print(text, cls) {
    const ln = document.createElement('span');
    ln.className = 'ln' + (cls ? ' ' + cls : '');
    ln.textContent = text;
    out.append(ln);
    out.scrollTop = out.scrollHeight;
    return ln;
  }
  function printLink(label, url) {
    const ln = document.createElement('span');
    ln.className = 'ln';
    const a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener'; a.textContent = label;
    ln.append(a);
    out.append(ln);
    out.scrollTop = out.scrollHeight;
  }
  const blank = () => print('');
  const lines = (arr, cls) => arr.forEach((l) => print(l, cls));

  /* ── commandes ── */
  const HUMANS = [
    '/* TEAM */',
    'Organisation : GDG Niamey — des bénévoles, du thé, des tableurs.',
    'Site         : Niamey, Niger',
    '',
    '/* THANKS */',
    'Les mentors, les speakers, les étudiant·es qui posent des questions',
    'et la personne qui a ramené les verres. Merci.',
    '',
    '/* SITE */',
    'Standards : HTML, CSS, JavaScript. Sans framework. Avec amour.',
    'Contenu   : js/config.js (tout y est, modifiable en 2 minutes)'
  ];

  const CMDS = {
    aide() {
      print('Commandes disponibles :', 'y');
      [
        ['programme', 'la journée, heure par heure'],
        ['speakers', 'les voix annoncées (placeholders)'],
        ['billet', 'le lien pour réserver ta place'],
        ['date', 'compte à rebours + timestamp Unix'],
        ['the', 'sert un verre'],
        ['ls', 'liste les fichiers'],
        ['cat <fichier>', 'lit un fichier'],
        ['wax', 'imprime un motif'],
        ['git log', 'l’histoire de cette page'],
        ['clear', 'efface l’écran']
      ].forEach(([c, d]) => print('  ' + c.padEnd(15) + d));
      print('Il y a d’autres commandes. Les curieux·ses les trouveront.', 'd');
    },
    help() { CMDS.aide(); },

    programme() {
      print(ev.dateLong + ' — ' + ev.venue + ', ' + ev.city, 'y');
      C.glasses.forEach((g) => {
        blank();
        print(g.n.toUpperCase() + ' · ' + g.name + '  (' + g.from + ' – ' + g.to + ')', 'b');
        C.agenda.filter((s) => s.glass === g.id).forEach((s) => {
          print('  ' + s.time + '  ' + s.title + (s.speaker ? '  — ' + SPK[s.speaker].name : ''));
        });
      });
    },
    agenda() { CMDS.programme(); },

    speakers() {
      print(C.speakers.length + ' voix annoncées sur ' + (C.speakers.length + C.speakersMore) + ' (données de démonstration) :', 'y');
      C.speakers.forEach((s) => print('  ' + s.name.padEnd(22) + s.role + ' · ' + s.org, s.headliner ? 'g' : ''));
      print('  + ' + C.speakersMore + ' autres à annoncer', 'd');
    },
    voix() { CMDS.speakers(); },

    billet() {
      print('Les places sont limitées. Voici le lien :', 'y');
      printLink(ev.ticketUrl, ev.ticketUrl);
      if (FX.confetti) FX.burstFrom(box, { count: 60 });
    },
    ticket() { CMDS.billet(); },

    date() {
      const now = Date.now(), t = new Date(ev.dateISO).getTime();
      const d = Math.floor((t - now) / 86400000);
      print('maintenant  : ' + new Date(now).toISOString());
      print('unix        : ' + Math.floor(now / 1000));
      print('événement   : ' + ev.dateISO + '  (unix ' + Math.floor(t / 1000) + ')');
      print(d > 0 ? 'il reste ' + d + ' jour' + (d > 1 ? 's' : '') + ' avant le premier thé.' : 'c’est maintenant, ou c’était hier. Merci d’être venu·e.', 'g');
    },

    the() {
      lines([
        '        ) )',
        '       ( (',
        '     .-------.',
        '    /  418    \\__',
        '   |  théière   __)',
        '    \\         /',
        '     \'-------\''
      ], 'y');
      print('Premier verre : fort, comme un premier commit.');
      print('Deuxième : doux, comme une review approuvée.');
      print('Troisième : suave, comme un déploiement un vendredi. (Ne le faites pas.)');
      if (FX.tea) FX.tea();
    },
    tea() { CMDS.the(); },
    thé() { CMDS.the(); },

    niamey() {
      print('> compiling niamey …', 'd');
      print('✔ 0 erreur · 0 warning · 1 belle journée le ' + ev.dateShort, 'g');
      if (FX.niamey) FX.niamey();
    },

    ls() {
      print('agenda/   speakers/   humans.txt   secret.txt   418.html', 'b');
    },
    cat(arg) {
      const f = (arg || '').trim();
      if (!f) return print('cat : il manque un fichier. Essaie « cat humans.txt ».', 'r');
      if (f === 'humans.txt') return lines(HUMANS);
      if (f === 'secret.txt') return print('Permission refusée. Mais tu as bon goût. Cherche plutôt du côté du logo.', 'r');
      if (f === '418.html') return print('<h1>I’m a teapot</h1>  (ouvre-la pour de vrai : /418.html)', 'y');
      print('cat : ' + f + ' : fichier introuvable', 'r');
    },

    wax() {
      lines([
        '(o)(o)(o)(o)(o)(o)(o)(o)',
        ' /\\/\\/\\/\\/\\/\\/\\/\\/\\/\\/\\',
        '{ }{ }{ }{ }{ }{ }{ }{ }',
        ' \\/\\/\\/\\/\\/\\/\\/\\/\\/\\/',
        '<><><><><><><><><><><><>'
      ], 'y');
      print('Le wax est un code imprimé. Chaque motif a un nom.', 'd');
      if (FX.confetti) FX.burstFrom(box, { count: 50, shapes: ['circle', 'spark'] });
    },

    whoami() { print('un·e futur·e participant·e du DevFest Niamey. Bienvenue.', 'g'); },
    pwd() { print('/niger/niamey/palais-des-congres'); },
    hello() { print('Salam ! (Bonjour, en haoussa.) Tape « aide ».', 'g'); },
    bonjour() { CMDS.hello(); },
    salut() { CMDS.hello(); },
    merci() { print('De rien. À samedi.', 'g'); },
    '418'() { print('418 I’m a teapot — le serveur refuse de préparer le café, mais sert volontiers le thé.', 'y'); },
    konami() { print('↑ ↑ ↓ ↓ ← → ← → B A  (hors d’un champ de saisie, évidemment).', 'd'); },
    exit() { print('Impossible de quitter DevFest. En revanche, tu peux scroller.', 'y'); },
    ping(arg) {
      const h = (arg || 'niamey').trim() || 'niamey';
      print('PING ' + h + ' : 64 octets — temps=12 ms — ttl=cool', 'g');
    },
    echo(arg) { print(arg || ''); },
    clear() { out.replaceChildren(); },

    sudo(arg) {
      if (/sandwich/.test(arg || '')) return print('D’accord. (Il y aura aussi du thé.)', 'g');
      print('devfest n’est pas dans le fichier sudoers. Cet incident sera signalé… au thé.', 'r');
    },
    git(arg) {
      if (!/^log/.test((arg || '').trim())) return print('git : essaie « git log ».', 'd');
      lines([
        'a3f1c2e  ça compile.                                   (aujourd’hui)',
        '9b07d44  ajout du thé (3 verres, pas un de moins)',
        '5c21e90  fix: 418 n’est pas un bug, c’est une théière',
        '77ad1b3  feat: Niamey',
        '0000001  initial commit — « et si on faisait un DevFest ? »'
      ], 'y');
    },
    rm(arg) {
      if (/-rf?\s*\/|-fr\s*\//.test(arg || '')) return print('Bien essayé. Le serveur est une théière : il n’a rien à supprimer.', 'r');
      print('rm : opération non permise (par le thé).', 'r');
    }
  };
  const NAMES = Object.keys(CMDS).filter((k) => !/^\d/.test(k)).sort();

  function run(raw) {
    const line = raw.trim();
    const p = document.createElement('span');
    p.className = 'ln';
    p.innerHTML = '<span class="g">devfest</span>@<span class="b">niamey</span>:~$ ';
    p.append(document.createTextNode(line));
    out.append(p);
    if (!line) return;
    const [cmd, ...rest] = line.split(/\s+/);
    const fn = CMDS[cmd.toLowerCase()];
    if (fn) fn(rest.join(' '));
    else print(cmd + ' : commande introuvable. Tape « aide ».', 'r');
    out.scrollTop = out.scrollHeight;
  }

  /* ── saisie : historique + complétion ── */
  const history = [];
  let hi = 0;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    if (v.trim()) { history.push(v); hi = history.length; }
    input.value = '';
    run(v);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (!history.length) return;
      e.preventDefault(); hi = Math.max(0, hi - 1); input.value = history[hi] || '';
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); hi = Math.min(history.length, hi + 1); input.value = history[hi] || '';
    } else if (e.key === 'Tab') {
      const v = input.value.trim();
      if (!v || v.includes(' ')) return;
      const hits = NAMES.filter((n) => n.startsWith(v.toLowerCase()));
      if (hits.length === 1) { e.preventDefault(); input.value = hits[0] + ' '; }
      else if (hits.length > 1) { e.preventDefault(); print(hits.join('   '), 'd'); }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); CMDS.clear();
    }
  });
  box.addEventListener('click', (e) => { if (!e.target.closest('a, button') && !window.getSelection().toString()) input.focus({ preventScroll: true }); });

  ['aide', 'programme', 'speakers', 'the', 'billet', 'clear'].forEach((c) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = c;
    b.addEventListener('click', () => { run(c); });
    chips.append(b);
  });

  /* ── démarrage ── */
  lines([
    'DevFest Niamey 2026 — terminal v' + ev.dateISO.slice(0, 10).replace(/-/g, '.'),
    'Bienvenue. Tu lis le code, on aime ça.'
  ], 'y');
  print('Tape « aide » pour commencer — ou clique une suggestion en dessous.', 'd');
})();
