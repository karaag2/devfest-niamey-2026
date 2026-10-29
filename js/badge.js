/* ──────────────────────────────────────────────────────────────────────────
   DEVFEST NIAMEY 2026 — badge.js
   Générateur de badge : un prénom, une couleur, une image PNG à partager.
   Dessiné entièrement au canvas (aucune image externe : le PNG reste exportable
   même ouvert en file://).
   ────────────────────────────────────────────────────────────────────────── */
(() => {
  'use strict';

  const cv = document.getElementById('badge-canvas');
  const nameIn = document.getElementById('badge-name');
  const colorsBox = document.getElementById('badge-colors');
  const dl = document.getElementById('badge-dl');
  const msg = document.getElementById('badge-msg');
  if (!cv || !nameIn || !colorsBox || !dl) return;

  const C = window.DEVFEST || {};
  const ev = C.event || {};
  const ctx = cv.getContext('2d');
  const W = cv.width, H = cv.height;
  const INK = '#202124', PAPER = '#F7F3E7';
  const COLORS = [
    { id: 'yellow', label: 'Jaune', hex: '#FBBC04' },
    { id: 'blue', label: 'Bleu', hex: '#4285F4' },
    { id: 'red', label: 'Rouge', hex: '#EA4335' },
    { id: 'green', label: 'Vert', hex: '#34A853' }
  ];
  const OTHERS = (hex) => COLORS.map((c) => c.hex).filter((h) => h !== hex);
  let color = COLORS[0];

  /* sélecteur de couleur : vrais boutons radio */
  COLORS.forEach((c, i) => {
    const input = document.createElement('input');
    input.type = 'radio'; input.name = 'badge-color'; input.value = c.id;
    input.setAttribute('aria-label', c.label);
    input.checked = i === 0;
    input.addEventListener('change', () => { color = c; schedule(); });
    const dot = document.createElement('span');
    dot.style.setProperty('--c', c.hex);
    const label = document.createElement('label');
    label.className = 'sw';
    label.title = c.label;
    label.append(input, dot);
    colorsBox.append(label);
  });

  const rr = (x, y, w, h, r) => {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else ctx.rect(x, y, w, h);
  };
  const spaced = (px) => { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; };

  function fit(text, maxW, start, family, min) {
    let s = start;
    ctx.font = '400 ' + s + 'px ' + family;
    while (ctx.measureText(text).width > maxW && s > (min || 60)) {
      s -= 4;
      ctx.font = '400 ' + s + 'px ' + family;
    }
    return s;
  }

  function draw() {
    const raw = nameIn.value.trim();
    const name = (raw || 'Ton prénom').toUpperCase();
    const bg = color.hex, others = OTHERS(bg);

    ctx.clearRect(0, 0, W, H);
    spaced(0);
    ctx.textBaseline = 'alphabetic';

    /* fond + formes qui dépassent derrière la carte */
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = others[0]; ctx.beginPath(); ctx.arc(980, 120, 150, 0, 6.283); ctx.fill();
    ctx.save(); ctx.translate(90, 1230); ctx.rotate(-0.35); ctx.fillStyle = others[1]; ctx.fillRect(-120, -90, 240, 180); ctx.restore();
    ctx.fillStyle = others[2]; ctx.beginPath(); ctx.moveTo(1010, 1180); ctx.lineTo(1100, 1330); ctx.lineTo(920, 1330); ctx.closePath(); ctx.fill();

    /* grain léger */
    ctx.fillStyle = 'rgba(32,33,36,.05)';
    for (let i = 0; i < 2600; i++) ctx.fillRect((i * 7919) % W, (i * 104729) % H, 2, 2);

    /* carte papier, ombre dure */
    ctx.fillStyle = INK; rr(86, 106, 940, 1170, 38); ctx.fill();
    ctx.fillStyle = PAPER; rr(70, 90, 940, 1170, 38); ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = INK; rr(70, 90, 940, 1170, 38); ctx.stroke();

    /* fente de lanyard */
    ctx.fillStyle = INK; rr(440, 130, 200, 40, 20); ctx.fill();

    /* en-tête */
    ctx.textAlign = 'center';
    ctx.fillStyle = INK;
    ctx.font = '700 30px "JetBrains Mono",ui-monospace,monospace';
    spaced(7);
    ctx.fillText('GDG NIAMEY PRÉSENTE', W / 2, 232);
    spaced(0);

    /* DEVFEST sur un surligneur */
    ctx.save();
    ctx.translate(W / 2, 430); ctx.rotate(-0.025);
    ctx.fillStyle = bg; rr(-400, -150, 800, 215, 6); ctx.fill();
    ctx.lineWidth = 6; ctx.strokeStyle = INK; rr(-400, -150, 800, 215, 6); ctx.stroke();
    ctx.fillStyle = INK;
    ctx.font = '400 250px Anton,Impact,sans-serif';
    ctx.fillText('DEVFEST', 0, 52);
    ctx.restore();

    /* Niamey 2026 en italique */
    ctx.fillStyle = INK;
    ctx.font = 'italic 400 128px "Instrument Serif",Georgia,serif';
    ctx.fillText('Niamey 2026', W / 2, 640);

    /* bloc prénom */
    ctx.fillStyle = bg; ctx.fillRect(70, 700, 940, 340);
    ctx.fillStyle = INK; ctx.fillRect(70, 696, 940, 8); ctx.fillRect(70, 1036, 940, 8);
    ctx.font = '700 28px "JetBrains Mono",ui-monospace,monospace';
    spaced(7); ctx.fillText('JE SERAI LÀ', W / 2, 760); spaced(0);
    const fam = 'Anton,Impact,sans-serif';
    const size = fit(name, 840, 270, fam, 90);
    ctx.font = '400 ' + size + 'px ' + fam;
    ctx.globalAlpha = raw ? 1 : 0.35;
    ctx.fillText(name, W / 2, 770 + (270 + size) / 2 - 20);
    ctx.globalAlpha = 1;

    /* pied de badge */
    ctx.fillStyle = INK;
    ctx.font = '400 74px Anton,Impact,sans-serif';
    ctx.fillText('12 DÉCEMBRE 2026', W / 2, 1136);
    ctx.font = '600 28px "JetBrains Mono",ui-monospace,monospace';
    spaced(4);
    ctx.fillText(((ev.venue || 'Palais des Congrès') + ' · ' + (ev.city || 'Niamey')).toUpperCase(), W / 2, 1190);
    spaced(0);

    /* fil Google */
    const seg = 940 / 4;
    ['#4285F4', '#EA4335', '#FBBC04', '#34A853'].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(70 + i * seg, 1226, seg, 34); });
    ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.strokeRect(70, 1226, 940, 34);

    cv.setAttribute('aria-label', 'Aperçu de ton badge : ' + (raw || 'prénom à saisir') + ', couleur ' + color.label.toLowerCase() + '.');
  }

  let raf = 0;
  function schedule() { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); }
  nameIn.addEventListener('input', schedule);

  /* les polices du canvas doivent être chargées avant de dessiner */
  draw();
  if (document.fonts && document.fonts.load) {
    Promise.all([
      document.fonts.load('400 100px Anton'),
      document.fonts.load('italic 400 100px "Instrument Serif"'),
      document.fonts.load('700 30px "JetBrains Mono"')
    ]).then(schedule, schedule);
    if (document.fonts.ready) document.fonts.ready.then(schedule);
  }

  /* téléchargement */
  const say = (t) => { msg.textContent = t; };
  dl.addEventListener('click', () => {
    const raw = nameIn.value.trim();
    if (!raw) {
      say('Écris d’abord ton prénom, juste au-dessus.');
      nameIn.focus();
      return;
    }
    draw();
    const slug = raw.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'badge';
    const file = 'badge-devfest-niamey-2026-' + slug + '.png';
    const save = (href) => {
      const a = document.createElement('a');
      a.href = href; a.download = file;
      document.body.append(a); a.click(); a.remove();
      say('Badge enregistré. Poste-le avec #DevFestNiamey — on veut te voir.');
      if (window.DFX) window.DFX.burstFrom(dl, { count: 80 });
    };
    try {
      if (cv.toBlob) {
        cv.toBlob((blob) => {
          if (!blob) { say('Ton navigateur refuse l’export. Fais une capture d’écran de l’aperçu, ça marche aussi.'); return; }
          const url = URL.createObjectURL(blob);
          save(url);
          setTimeout(() => URL.revokeObjectURL(url), 4000);
        }, 'image/png');
      } else save(cv.toDataURL('image/png'));
    } catch (err) {
      say('Ton navigateur refuse l’export. Fais une capture d’écran de l’aperçu, ça marche aussi.');
    }
  });
})();
