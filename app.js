(() => {
  'use strict';

  const stage = document.getElementById('stage');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const listEl = document.getElementById('test-list');
  const brightnessInput = document.getElementById('brightness');
  const brightnessValue = document.getElementById('brightness-value');
  const speedInput = document.getElementById('speed');
  const speedValue = document.getElementById('speed-value');
  const colorInput = document.getElementById('custom-color');
  const nameEl = document.getElementById('current-name');
  const toastEl = document.getElementById('toast');
  const autoBtn = document.getElementById('auto');

  const state = {
    index: 0,
    customColor: '#ff8800',
    brightness: 1,
    speed: 1,
    t0: performance.now(),
  };

  const view = { W: 1, H: 1, dpr: 1 };
  const TESTS = [];

  function add(group, name, draw, opts = {}) {
    TESTS.push({ group, name, draw, ...opts });
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  function fill(v, color) {
    v.ctx.fillStyle = color;
    v.ctx.fillRect(0, 0, v.W, v.H);
  }

  function solid(color) {
    return (v) => fill(v, color);
  }

  function centerCross(v, size, gap) {
    const { ctx: c, W, H } = v;
    const cx = Math.round(W / 2) + 0.5;
    const cy = Math.round(H / 2) + 0.5;
    c.strokeStyle = '#fff';
    c.lineWidth = Math.max(1, Math.round(Math.min(W, H) / 500));
    c.beginPath();
    c.moveTo(cx - size, cy); c.lineTo(cx - gap, cy);
    c.moveTo(cx + gap, cy); c.lineTo(cx + size, cy);
    c.moveTo(cx, cy - size); c.lineTo(cx, cy - gap);
    c.moveTo(cx, cy + gap); c.lineTo(cx, cy + size);
    c.stroke();
    c.beginPath();
    c.arc(cx, cy, gap * 0.65, 0, Math.PI * 2);
    c.stroke();
  }

  function fitRect(W, H, aspect) {
    let w = W, h = W / aspect;
    if (h > H) { h = H; w = h * aspect; }
    return { x: (W - w) / 2, y: (H - h) / 2, w, h };
  }

  /* ------------------------------------------------------------------ */
  /* Couleurs                                                            */
  /* ------------------------------------------------------------------ */

  const COLORS = [
    ['Rouge', '#ff0000'],
    ['Vert', '#00ff00'],
    ['Bleu', '#0000ff'],
    ['Blanc', '#ffffff'],
    ['Noir', '#000000'],
    ['Cyan', '#00ffff'],
    ['Magenta', '#ff00ff'],
    ['Jaune', '#ffff00'],
    ['Gris 50 %', '#808080'],
    ['Gris 25 %', '#404040'],
    ['Gris 75 %', '#bfbfbf'],
  ];

  COLORS.forEach(([name, hex]) => {
    add('Couleurs', name, solid(hex), { swatch: hex });
  });

  add('Couleurs', 'Couleur libre', (v) => fill(v, state.customColor));

  /* ------------------------------------------------------------------ */
  /* Géométrie                                                           */
  /* ------------------------------------------------------------------ */

  add('Mires de géométrie', 'Grille', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const step = 40;
    const ox = (W / 2) % step;
    const oy = (H / 2) % step;
    c.lineWidth = 1;

    c.strokeStyle = 'rgba(255,255,255,0.22)';
    c.beginPath();
    for (let x = ox; x <= W; x += step) { c.moveTo(Math.round(x) + 0.5, 0); c.lineTo(Math.round(x) + 0.5, H); }
    for (let y = oy; y <= H; y += step) { c.moveTo(0, Math.round(y) + 0.5); c.lineTo(W, Math.round(y) + 0.5); }
    c.stroke();

    c.strokeStyle = '#fff';
    c.beginPath();
    for (let x = ox; x <= W; x += step * 5) { c.moveTo(Math.round(x) + 0.5, 0); c.lineTo(Math.round(x) + 0.5, H); }
    for (let y = oy; y <= H; y += step * 5) { c.moveTo(0, Math.round(y) + 0.5); c.lineTo(W, Math.round(y) + 0.5); }
    c.stroke();

    centerCross(v, Math.min(W, H) * 0.16, 18);
  }, { swatch: 'linear-gradient(90deg,#fff 0 1px,#000 1px 8px), linear-gradient(#fff 0 1px,#000 1px 8px)' });

  add('Mires de géométrie', 'Damier', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const n = 12;
    const cell = Math.max(8, Math.min(W, H) / n);
    const cols = Math.ceil(W / cell) + 1;
    const rows = Math.ceil(H / cell) + 1;
    c.fillStyle = '#fff';
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < cols; i++) {
        if ((r + i) % 2 === 0) c.fillRect(i * cell, r * cell, cell, cell);
      }
    }
  }, { swatch: 'linear-gradient(45deg,#fff 25%,#000 25% 75%,#fff 75%)' });

  add('Mires de géométrie', 'Damier fin', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const n = 36;
    const cell = Math.max(2, Math.min(W, H) / n);
    const cols = Math.ceil(W / cell) + 1;
    const rows = Math.ceil(H / cell) + 1;
    c.fillStyle = '#fff';
    for (let r = 0; r < rows; r++) {
      for (let i = 0; i < cols; i++) {
        if ((r + i) % 2 === 0) c.fillRect(i * cell, r * cell, cell, cell);
      }
    }
  }, { swatch: 'repeating-conic-gradient(#fff 0 25%,#000 0 50%) 0 0/6px 6px' });

  add('Mires de géométrie', 'Cercles concentriques', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const cx = W / 2, cy = H / 2;
    const maxR = Math.hypot(W, H) / 2;
    const step = Math.max(10, Math.min(W, H) / 22);
    c.lineWidth = Math.max(1, step / 9);
    c.strokeStyle = '#fff';
    for (let r = step; r < maxR; r += step) {
      c.beginPath();
      c.arc(cx, cy, r, 0, Math.PI * 2);
      c.stroke();
    }
    c.beginPath();
    c.arc(cx, cy, maxR, 0, Math.PI * 2);
    c.stroke();
    centerCross(v, Math.min(W, H) * 0.2, 10);
  }, { swatch: 'radial-gradient(circle,#000 0 20%,#fff 20% 30%,#000 30% 40%,#fff 40% 50%,#000 50%)' });

  add('Mires de géométrie', 'Cadre 16:9', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const r = fitRect(W, H, 16 / 9);
    c.strokeStyle = '#fff';
    c.lineWidth = Math.max(2, Math.min(W, H) / 260);
    c.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);

    c.lineWidth = 1;
    c.setLineDash([8, 8]);
    c.strokeStyle = 'rgba(255,255,255,0.65)';
    c.strokeRect(r.x + r.w * 0.05, r.y + r.h * 0.05, r.w * 0.9, r.h * 0.9);
    c.setLineDash([]);
    centerCross(v, Math.min(r.w, r.h) * 0.2, 16);
  }, { swatch: 'linear-gradient(#fff 0 2px,#000 2px 100%)' });

  add('Mires de géométrie', 'Mire SMPTE', (v) => {
    const { ctx: c, W, H } = v;
    const top = Math.round(H * 0.66);
    const mid = Math.round(H * 0.08);
    const w7 = W / 7;

    const topCols = ['#bfbfbf', '#bfbf00', '#00bfbf', '#00bf00', '#bf00bf', '#bf0000', '#0000bf'];
    topCols.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * w7, 0, w7 + 1, top); });

    const midCols = ['#0000bf', '#131313', '#bf00bf', '#131313', '#00bfbf', '#131313', '#bfbfbf'];
    midCols.forEach((col, i) => { c.fillStyle = col; c.fillRect(i * w7, top, w7 + 1, mid); });

    const by = top + mid;
    const bh = H - by;
    // -I / +Q / pluge blocks
    c.fillStyle = '#00214c';
    c.fillRect(0, by, w7 * 1.25, bh);
    c.fillStyle = '#ffffff';
    c.fillRect(w7 * 1.25, by, w7 * 1.25, bh);
    c.fillStyle = '#32006a';
    c.fillRect(w7 * 2.5, by, w7 * 1.25, bh);
    c.fillStyle = '#131313';
    c.fillRect(w7 * 3.75, by, w7 * 0.75, bh);

    const pluge = ['#0a0a0a', '#131313', '#1c1c1c', '#0f0f0f'];
    const pw = (w7 * 2.5) / 4;
    pluge.forEach((col, i) => { c.fillStyle = col; c.fillRect(w7 * 4.5 + i * pw, by, pw + 1, bh); });

    c.fillStyle = '#000000';
    c.fillRect(w7 * 4.5 + pw * 4, by, w7 * 2.5 - pw * 4, bh);
  }, { swatch: 'linear-gradient(90deg,#bfbfbf,#bfbf00,#00bfbf,#00bf00,#bf00bf,#bf0000,#0000bf)' });

  /* ------------------------------------------------------------------ */
  /* Niveaux de gris                                                     */
  /* ------------------------------------------------------------------ */

  add('Niveaux de gris', 'Échelle 16 marches', (v) => {
    const { ctx: c, W, H } = v;
    const steps = 16;
    const w = W / steps;
    for (let i = 0; i < steps; i++) {
      const g = Math.round((i / (steps - 1)) * 255);
      c.fillStyle = `rgb(${g},${g},${g})`;
      c.fillRect(i * w, 0, w + 1, H);
    }
  }, { swatch: 'linear-gradient(90deg,#000 0 25%,#555 25% 50%,#aaa 50% 75%,#fff 75%)' });

  add('Niveaux de gris', 'Rampe de dégradé', (v) => {
    const { ctx: c, W, H } = v;
    const g = c.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#000');
    g.addColorStop(1, '#fff');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }, { swatch: 'linear-gradient(90deg,#000,#fff)' });

  add('Niveaux de gris', 'Rampe RGB', (v) => {
    const { ctx: c, W, H } = v;
    const h3 = H / 3;
    const bands = [['#000', '#f00'], ['#000', '#0f0'], ['#000', '#00f']];
    bands.forEach((pair, i) => {
      const g = c.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, pair[0]);
      g.addColorStop(1, pair[1]);
      c.fillStyle = g;
      c.fillRect(0, i * h3, W, h3 + 1);
    });
  }, { swatch: 'linear-gradient(90deg,#f00,#0f0,#00f)' });

  add('Niveaux de gris', 'Dégradé radial', (v) => {
    const { ctx: c, W, H } = v;
    const r = Math.hypot(W, H) / 2;
    const g = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, r);
    g.addColorStop(0, '#fff');
    g.addColorStop(1, '#000');
    c.fillStyle = g;
    c.fillRect(0, 0, W, H);
  }, { swatch: 'radial-gradient(circle,#fff,#000)' });

  add('Niveaux de gris', 'Contraste noir/blanc', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const w = W / 8;
    c.fillStyle = '#fff';
    for (let i = 0; i < 8; i += 2) c.fillRect(i * w, 0, w, H);
  }, { swatch: 'linear-gradient(90deg,#fff 0 50%,#000 50% 100%)' });

  /* ------------------------------------------------------------------ */
  /* Résolution & netteté                                                */
  /* ------------------------------------------------------------------ */

  add('Résolution & netteté', 'Étoile de Siemens', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    const cx = W / 2, cy = H / 2;
    const R = Math.min(W, H) * 0.46;
    const N = 36;
    const stepA = (Math.PI * 2) / N;
    c.fillStyle = '#fff';
    for (let i = 0; i < N; i += 2) {
      c.beginPath();
      c.moveTo(cx, cy);
      c.arc(cx, cy, R, i * stepA - Math.PI / 2, (i + 1) * stepA - Math.PI / 2);
      c.closePath();
      c.fill();
    }
    c.beginPath();
    c.arc(cx, cy, R, 0, Math.PI * 2);
    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.stroke();
  }, { swatch: 'conic-gradient(#fff 0 5deg,#000 5deg 10deg,#fff 10deg 15deg,#000 15deg 20deg)' });

  add('Résolution & netteté', 'Balayage de fréquence', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    c.fillStyle = '#fff';
    for (let x = 0; x < W; x++) {
      const u = x / W;
      const period = 64 * Math.pow(2 / 64, u);
      const phase = Math.sin((x * Math.PI * 2) / period);
      if (phase > 0) c.fillRect(x, 0, 1, H);
    }
  }, { swatch: 'repeating-linear-gradient(90deg,#fff 0 1px,#000 1px 4px)' });

  add('Résolution & netteté', 'Lignes 1 px verticales', (v) => {
    const { ctx: c, canvas: cv } = v;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#fff';
    for (let x = 0; x < cv.width; x += 2) c.fillRect(x, 0, 1, cv.height);
    c.restore();
  }, { swatch: 'repeating-linear-gradient(90deg,#fff 0 2px,#000 2px 4px)' });

  add('Résolution & netteté', 'Lignes 1 px horizontales', (v) => {
    const { ctx: c, canvas: cv } = v;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#000';
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#fff';
    for (let y = 0; y < cv.height; y += 2) c.fillRect(0, y, cv.width, 1);
    c.restore();
  }, { swatch: 'repeating-linear-gradient(#fff 0 2px,#000 2px 4px)' });

  add('Résolution & netteté', 'Damier 1 px', (v) => {
    const { ctx: c, canvas: cv } = v;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.fillStyle = '#fff';
    c.fillRect(0, 0, cv.width, cv.height);
    c.fillStyle = '#000';
    for (let y = 0; y < cv.height; y += 2) {
      for (let x = (y / 2) % 2 ? 0 : 1; x < cv.width; x += 2) c.fillRect(x, y, 1, 1);
    }
    c.restore();
  }, { swatch: 'repeating-conic-gradient(#fff 0 25%,#000 0 50%) 0 0/4px 4px' });

  add('Résolution & netteté', 'Texte de netteté', (v) => {
    const { ctx: c, W, H } = v;
    fill(v, '#000');
    c.fillStyle = '#fff';
    c.textBaseline = 'top';
    const sample = 'ABCDEFGHIJKLM 0123456789';
    const small = 'La netteté se juge sur les contours fins. lorem ipsum 1234567890 abcdefghijkl';
    const base = Math.min(W, H);
    const sizes = [base * 0.075, base * 0.05, base * 0.034, base * 0.024, base * 0.017, base * 0.012, base * 0.008];
    let y = H * 0.08;
    for (const s of sizes) {
      c.font = `600 ${Math.max(6, s)}px "Segoe UI", system-ui, sans-serif`;
      c.fillText(s > base * 0.02 ? sample : small, W * 0.06, y);
      y += s * 1.7;
    }
    c.lineWidth = 1;
    c.strokeStyle = 'rgba(255,255,255,0.5)';
    c.strokeRect(W * 0.05, H * 0.06, W * 0.9, H * 0.88);
  }, { swatch: 'linear-gradient(#fff 0 3px,#000 3px 6px,#555 6px 9px,#000 9px 12px)' });

  /* ------------------------------------------------------------------ */
  /* Mouvement & rémanence                                               */
  /* ------------------------------------------------------------------ */

  add('Mouvement & rémanence', 'Barre défilante', (v) => {
    const { ctx: c, W, H, t, speed } = v;
    fill(v, '#000');
    const barW = W * 0.1;
    const span = W + barW * 2;
    const x = ((t * speed * 180) % span) - barW;
    c.fillStyle = '#fff';
    c.fillRect(x, 0, barW, H);
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillRect(((x + span * 0.5) % span) - barW, 0, barW * 0.35, H);
  }, { animated: true, swatch: 'linear-gradient(90deg,#000 0 25%,#fff 25% 50%,#000 50%)' });

  add('Mouvement & rémanence', 'Balle rebondissante', (v) => {
    const { ctx: c, W, H, t, speed } = v;
    fill(v, '#000');
    const r = Math.min(W, H) * 0.08;
    const ping = (p) => {
      const u = ((t * speed) / p) % 1;
      return u < 0.5 ? u * 2 : 2 - u * 2;
    };
    const x = r + ping(2.1) * (W - 2 * r);
    const y = r + ping(1.37) * (H - 2 * r);
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }, { animated: true, swatch: 'radial-gradient(circle at 30% 30%,#fff,#000)' });

  add('Mouvement & rémanence', 'Scintillement', (v) => {
    const { t, speed } = v;
    const on = Math.floor(t * 4 * speed) % 2 === 0;
    fill(v, on ? '#ffffff' : '#000000');
  }, { animated: true, swatch: 'linear-gradient(180deg,#fff 0 50%,#000 50%)' });

  add('Mouvement & rémanence', 'Damier défilant', (v) => {
    const { ctx: c, W, H, t, speed } = v;
    fill(v, '#000');
    const cell = Math.max(12, Math.min(W, H) / 12);
    const off = (t * speed * 90) % (cell * 2);
    c.fillStyle = '#fff';
    const cols = Math.ceil(W / cell) + 3;
    const rows = Math.ceil(H / cell) + 3;
    for (let r = -1; r < rows; r++) {
      for (let i = -1; i < cols; i++) {
        if ((r + i) % 2 === 0) c.fillRect(i * cell + off, r * cell, cell, cell);
      }
    }
  }, { animated: true, swatch: 'linear-gradient(45deg,#fff 25%,#000 25% 75%,#fff 75%)' });

  /* ------------------------------------------------------------------ */
  /* Diagnostic                                                          */
  /* ------------------------------------------------------------------ */

  const PIXEL_COLORS = ['#ffffff', '#ff0000', '#00ff00', '#0000ff', '#000000', '#00ffff', '#ff00ff', '#ffff00'];

  add('Diagnostic', 'Test pixels morts', (v) => {
    const { t } = v;
    const i = Math.floor(t / 1.2) % PIXEL_COLORS.length;
    fill(v, PIXEL_COLORS[i]);
  }, { animated: true, swatch: 'conic-gradient(#f00,#0f0,#00f,#fff,#000,#f00)' });

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */

  let needsDraw = true;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    view.W = Math.max(1, rect.width);
    view.H = Math.max(1, rect.height);
    view.dpr = dpr;
    canvas.width = Math.round(view.W * dpr);
    canvas.height = Math.round(view.H * dpr);
    canvas.style.width = view.W + 'px';
    canvas.style.height = view.H + 'px';
    needsDraw = true;
  }

  function render(now) {
    const test = TESTS[state.index];
    if (!test) return;
    ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    ctx.globalAlpha = 1;
    test.draw({
      ctx,
      canvas,
      W: view.W,
      H: view.H,
      dpr: view.dpr,
      t: (now - state.t0) / 1000,
      speed: state.speed,
    });
  }

  function tick(now) {
    requestAnimationFrame(tick);
    const test = TESTS[state.index];
    if (!test) return;
    if (test.animated || needsDraw) {
      needsDraw = false;
      render(now);
    }
  }

  /* ------------------------------------------------------------------ */
  /* UI                                                                  */
  /* ------------------------------------------------------------------ */

  const buttons = [];

  function buildList() {
    let currentGroup = null;
    TESTS.forEach((test, i) => {
      if (test.group !== currentGroup) {
        currentGroup = test.group;
        const h = document.createElement('div');
        h.className = 'group-title';
        h.textContent = currentGroup;
        listEl.appendChild(h);
      }
      const btn = document.createElement('button');
      btn.className = 'test-btn';
      btn.type = 'button';
      btn.dataset.index = String(i);

      const sw = document.createElement('span');
      sw.className = 'swatch';
      sw.style.background = typeof test.swatch === 'string'
        ? test.swatch
        : 'linear-gradient(135deg,#555,#bbb)';
      btn.appendChild(sw);

      const label = document.createElement('span');
      label.textContent = test.name;
      btn.appendChild(label);

      btn.addEventListener('click', () => select(i, { user: true }));
      listEl.appendChild(btn);
      buttons.push(btn);
    });
  }

  let toastTimer = null;

  function showToast(text) {
    toastEl.textContent = text;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1300);
  }

  function select(index, opts = {}) {
    const n = TESTS.length;
    state.index = ((index % n) + n) % n;
    const test = TESTS[state.index];

    buttons.forEach((b, i) => b.classList.toggle('active', i === state.index));
    const active = buttons[state.index];
    if (active && opts.user) active.scrollIntoView({ block: 'nearest' });

    nameEl.textContent = test.name;
    if (document.body.classList.contains('ui-hidden')) showToast(test.name);

    if (opts.user) stopAuto();
    needsDraw = true;
  }

  function step(delta) {
    select(state.index + delta, { user: false });
  }

  /* Auto-cycle over the solid colours */
  const colorIndices = TESTS
    .map((t, i) => (t.group === 'Couleurs' ? i : -1))
    .filter((i) => i >= 0);
  let autoTimer = null;

  function startAuto() {
    stopAuto();
    autoBtn.classList.add('on');
    let pos = Math.max(0, colorIndices.indexOf(state.index));
    select(colorIndices[pos], { user: false });
    autoTimer = setInterval(() => {
      pos = (pos + 1) % colorIndices.length;
      select(colorIndices[pos], { user: false });
    }, 2000);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    autoBtn.classList.remove('on');
  }

  function toggleAuto() {
    if (autoTimer) stopAuto();
    else startAuto();
  }

  function toggleFullscreen() {
    // Dans l'AppImage, on pilote le plein écran de la fenêtre elle-même.
    if (window.desktop?.toggleFullscreen) {
      window.desktop.toggleFullscreen();
      return;
    }
    if (!document.fullscreenElement) {
      stage.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }

  function togglePanel() {
    document.body.classList.toggle('ui-hidden');
    requestAnimationFrame(resize);
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                              */
  /* ------------------------------------------------------------------ */

  document.getElementById('next').addEventListener('click', () => step(1));
  document.getElementById('prev').addEventListener('click', () => step(-1));
  document.getElementById('fullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('hide').addEventListener('click', togglePanel);
  document.getElementById('restore').addEventListener('click', togglePanel);
  autoBtn.addEventListener('click', toggleAuto);

  const quitBtn = document.getElementById('quit');
  quitBtn.addEventListener('click', () => {
    if (window.desktop?.quit) window.desktop.quit();
    else window.close();
  });
  // Pas de fenêtre à fermer hors application de bureau.
  if (!window.desktop?.quit) quitBtn.style.display = 'none';

  brightnessInput.addEventListener('input', () => {
    const pct = Number(brightnessInput.value);
    state.brightness = pct / 100;
    brightnessValue.textContent = pct + ' %';
    canvas.style.opacity = String(state.brightness);
  });

  speedInput.addEventListener('input', () => {
    const v = Number(speedInput.value) / 100;
    state.speed = v;
    speedValue.textContent = v.toFixed(1) + '×';
    needsDraw = true;
  });

  colorInput.addEventListener('input', () => {
    state.customColor = colorInput.value;
    const sw = buttons[COLORS.length]?.querySelector('.swatch');
    if (sw) sw.style.background = colorInput.value;
    needsDraw = true;
  });

  window.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement) return;
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ') {
      e.preventDefault();
      step(1);
    } else if (k === 'ArrowLeft' || k === 'ArrowUp') {
      e.preventDefault();
      step(-1);
    } else if (k === 'f' || k === 'F') {
      toggleFullscreen();
    } else if (k === 'h' || k === 'H') {
      togglePanel();
    } else if (k === 'b' || k === 'B') {
      select(TESTS.findIndex((t) => t.name === 'Noir'), { user: false });
    } else if (k === 'Escape') {
      stopAuto();
    }
  });

  window.addEventListener('resize', resize);
  document.addEventListener('fullscreenchange', () => {
    requestAnimationFrame(resize);
  });

  buildList();
  select(0);
  resize();
  requestAnimationFrame(tick);
})();
