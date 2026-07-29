/**
 * Sigil Forge — engine
 * Deterministic: the same name + intention + style always compiles the same sigil.
 * Visual DNA inherited from Sigilcraft / The First Spark:
 * triangle, waves, infinity, binary, circle, golden angle.
 */
(function (global) {
  const PALETTES = [
    { main: '#26E4D8', accent: '#F3B23A', name: 'CYAN·GOLD' },
    { main: '#6B4DF2', accent: '#26E4D8', name: 'VIOLET·CYAN' },
    { main: '#FF6A3D', accent: '#F3B23A', name: 'EMBER·GOLD' },
    { main: '#26E4D8', accent: '#6B4DF2', name: 'CYAN·VIOLET' },
    { main: '#F3B23A', accent: '#FF6A3D', name: 'GOLD·EMBER' },
  ];

  // FNV-1a hash
  function hashString(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  // Mulberry32 PRNG
  function mulberry32(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /**
   * Classic sigil distillation:
   * statement → letters only → strip vowels → strip repeats.
   * What remains is the compressed "code" of the intention.
   */
  function distill(intention) {
    const letters = (intention || '').toUpperCase().replace(/[^A-Z]/g, '').split('');
    const seen = new Set();
    const out = [];
    for (const ch of letters) {
      if ('AEIOU'.includes(ch)) continue;
      if (seen.has(ch)) continue;
      seen.add(ch);
      out.push(ch);
    }
    return out;
  }

  function seedFor(name, intention, style) {
    return hashString(((name || '') + '::' + (intention || '') + '::' + (style || 'spark')).toLowerCase().trim());
  }

  /* ---------- drawing helpers ---------- */

  function ambientBinary(ctx, rand, W, H, color) {
    ctx.font = '12px monospace';
    ctx.fillStyle = color + '22';
    for (let i = 0; i < 80; i++) {
      ctx.fillText(rand() > 0.5 ? '1' : '0', rand() * W, rand() * H);
    }
  }

  function signature(ctx, seed, pal, W, H, watermark) {
    const sig = seed.toString(2).padStart(32, '0').slice(0, 16);
    const sigId = seed.toString(36).toUpperCase().slice(0, 8);
    ctx.textAlign = 'center';
    ctx.font = 'bold 14px "Space Mono", monospace';
    ctx.fillStyle = pal.main + 'BB';
    ctx.fillText(sig, W / 2, H - 40);
    ctx.font = '10px "Space Mono", monospace';
    ctx.fillStyle = pal.accent + '99';
    ctx.fillText('SIGIL::' + sigId, W / 2, H - 20);
    if (watermark) {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 8);
      ctx.font = 'bold 28px "Space Mono", monospace';
      ctx.fillStyle = '#FFFFFF18';
      ctx.fillText('UNCHARGED · SIGIL FORGE', 0, 0);
      ctx.restore();
    }
    return sigId;
  }

  /* ---------- style: SPARK (TFS core DNA) ---------- */
  function drawSpark(ctx, rand, pal, W, H) {
    const cx = W / 2, cy = H / 2;

    ctx.strokeStyle = pal.main + '44';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, 260, 0, Math.PI * 2); ctx.stroke();

    const sides = 3 + Math.floor(rand() * 6);
    const polyR = 180 + rand() * 40;
    const polyRot = rand() * Math.PI * 2;
    ctx.strokeStyle = pal.accent + '55';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const a = polyRot + (i / sides) * Math.PI * 2;
      const x = cx + Math.cos(a) * polyR, y = cy + Math.sin(a) * polyR;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    const triH = 200, triY = cy - 60;
    ctx.strokeStyle = pal.main; ctx.lineWidth = 4;
    ctx.shadowColor = pal.main; ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(cx, triY - triH / 2);
    ctx.lineTo(cx - triH / 1.8, triY + triH / 2);
    ctx.lineTo(cx + triH / 1.8, triY + triH / 2);
    ctx.closePath(); ctx.stroke();
    ctx.shadowBlur = 0;

    const dotY = triY - 20 + rand() * 40;
    ctx.fillStyle = pal.accent;
    ctx.shadowColor = pal.accent; ctx.shadowBlur = 15;
    ctx.beginPath(); ctx.arc(cx, dotY, 8, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0;

    const waveCount = 2 + Math.floor(rand() * 3);
    ctx.strokeStyle = pal.main; ctx.lineWidth = 2;
    for (let i = 0; i < waveCount; i++) {
      ctx.beginPath();
      ctx.arc(cx, triY + 50 + i * 22, 70 + i * 18, Math.PI, Math.PI * 2);
      ctx.stroke();
    }

    const infY = triY + 140, infR = 30;
    ctx.strokeStyle = pal.main; ctx.lineWidth = 3;
    ctx.shadowColor = pal.main; ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.02) {
      const s = 2 / (3 - Math.cos(2 * t));
      const x = cx + infR * 2 * s * Math.cos(t);
      const y = infY + infR * s * Math.sin(2 * t);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    return { anchorY: triY };
  }

  /* ---------- style: LEY (witch's wheel letter-path) ---------- */
  function drawLey(ctx, rand, pal, W, H, distilled) {
    const cx = W / 2, cy = H / 2 - 20;
    const R = 190;

    ctx.strokeStyle = pal.main + '55';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, R + 26, 0, Math.PI * 2); ctx.stroke();

    // 26 letter stations around the wheel; tick marks
    const pos = {};
    for (let i = 0; i < 26; i++) {
      const a = -Math.PI / 2 + (i / 26) * Math.PI * 2;
      const ch = String.fromCharCode(65 + i);
      pos[ch] = { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, a };
      ctx.strokeStyle = pal.main + '44';
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      ctx.lineTo(cx + Math.cos(a) * (R + 10), cy + Math.sin(a) * (R + 10));
      ctx.stroke();
    }

    // the path through the distilled letters
    if (distilled.length > 1) {
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 3;
      ctx.shadowColor = pal.accent; ctx.shadowBlur = 14;
      ctx.beginPath();
      distilled.forEach((ch, i) => {
        const p = pos[ch];
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // start: circle · end: crossbar (traditional)
      const s = pos[distilled[0]], e = pos[distilled[distilled.length - 1]];
      ctx.strokeStyle = pal.main; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(s.x, s.y, 10, 0, Math.PI * 2); ctx.stroke();
      const prev = pos[distilled[distilled.length - 2]] || s;
      const ang = Math.atan2(e.y - prev.y, e.x - prev.x) + Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(e.x + Math.cos(ang) * 12, e.y + Math.sin(ang) * 12);
      ctx.lineTo(e.x - Math.cos(ang) * 12, e.y - Math.sin(ang) * 12);
      ctx.stroke();

      // node dots
      ctx.fillStyle = pal.main;
      distilled.forEach((ch) => {
        const p = pos[ch];
        ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); ctx.fill();
      });
    }

    // small TFS triangle seal in center
    ctx.strokeStyle = pal.main + '99'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 26);
    ctx.lineTo(cx - 24, cy + 18);
    ctx.lineTo(cx + 24, cy + 18);
    ctx.closePath(); ctx.stroke();
    ctx.fillStyle = pal.accent;
    ctx.beginPath(); ctx.arc(cx, cy + 2, 4, 0, Math.PI * 2); ctx.fill();

    return { anchorY: cy };
  }

  /* ---------- style: STAR (radial burst) ---------- */
  function drawStar(ctx, rand, pal, W, H, distilled) {
    const cx = W / 2, cy = H / 2 - 20;
    const rays = Math.max(distilled.length, 5);

    ctx.strokeStyle = pal.main + '33';
    ctx.beginPath(); ctx.arc(cx, cy, 240, 0, Math.PI * 2); ctx.stroke();

    for (let i = 0; i < rays; i++) {
      const code = distilled[i] ? distilled[i].charCodeAt(0) : 65 + i;
      const a = -Math.PI / 2 + (i / rays) * Math.PI * 2;
      const len = 90 + (code % 26) * 5.5;
      const x = cx + Math.cos(a) * len, y = cy + Math.sin(a) * len;
      ctx.strokeStyle = pal.main;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = pal.main; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = i % 2 === 0 ? pal.accent : pal.main;
      ctx.beginPath(); ctx.arc(x, y, i % 3 === 0 ? 6 : 3.5, 0, Math.PI * 2); ctx.fill();
      // orbit arc per ray
      ctx.strokeStyle = pal.accent + '44';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, len * 0.66, a - 0.4, a + 0.4);
      ctx.stroke();
    }

    // infinity seal at center
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 2.5;
    ctx.shadowColor = pal.accent; ctx.shadowBlur = 10;
    ctx.beginPath();
    for (let t = 0; t <= Math.PI * 2; t += 0.02) {
      const s = 2 / (3 - Math.cos(2 * t));
      const x = cx + 22 * 2 * s * Math.cos(t);
      const y = cy + 22 * s * Math.sin(2 * t);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    return { anchorY: cy };
  }

  /* ---------- intention thread (unique overlay, all styles) ---------- */
  function intentionThread(ctx, pal, W, H, name, intention, anchorY) {
    const cx = W / 2;
    const text = ((name || '') + (intention || '')).toLowerCase().replace(/[^a-z0-9]/g, '');
    if (text.length <= 2) return;
    ctx.strokeStyle = pal.accent + 'AA';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const pts = [];
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);
      const angle = (code * 137.5) * Math.PI / 180; // golden angle
      const radius = 40 + (code % 60);
      const x = cx + Math.cos(angle) * radius;
      const y = anchorY + 20 + Math.sin(angle) * radius * 0.7;
      pts.push([x, y]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    pts.forEach(([x, y], i) => {
      ctx.fillStyle = i === 0 || i === pts.length - 1 ? pal.accent : pal.main;
      ctx.beginPath();
      ctx.arc(x, y, i === 0 || i === pts.length - 1 ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /**
   * Render a sigil. opts: { name, intention, style, watermark }
   * Returns { id, seed, distilled, palette, style }
   */
  function draw(canvas, opts) {
    const style = opts.style || 'spark';
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const seed = seedFor(opts.name, opts.intention, style);
    const rand = mulberry32(seed);
    const pal = PALETTES[Math.floor(rand() * PALETTES.length)];
    const distilled = distill(opts.intention);

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#0B0B0C';
    ctx.fillRect(0, 0, W, H);
    ambientBinary(ctx, rand, W, H, pal.main);

    let layout;
    if (style === 'ley') layout = drawLey(ctx, rand, pal, W, H, distilled);
    else if (style === 'star') layout = drawStar(ctx, rand, pal, W, H, distilled);
    else layout = drawSpark(ctx, rand, pal, W, H);

    intentionThread(ctx, pal, W, H, opts.name, opts.intention, layout.anchorY);
    const id = signature(ctx, seed, pal, W, H, opts.watermark);

    return { id, seed, distilled: distilled.join(''), palette: pal.name, style };
  }

  /* ---------- charging rituals ---------- */

  const METHODS = [
    {
      key: 'breath',
      name: 'Breath of Ignition',
      tool: 'Nothing but your lungs and your eyes.',
      best: 'Fast charges. When you need the sigil live today.',
      steps: [
        'Sit with the sigil at eye level. Let your gaze rest soft on its center.',
        'Breathe in for 4 counts, hold for 4, out for 4. Repeat until the lines start to shimmer at the edges of your focus.',
        'On your final exhale, breathe directly onto the sigil — you are transferring the intention from your body into the glyph.',
        'Look away. The charge is set the moment you stop looking.',
      ],
    },
    {
      key: 'flame',
      name: 'Flame Charge',
      tool: 'One candle. Any color that feels right — trust the pull.',
      best: 'Intentions of transformation, courage, and starting over.',
      steps: [
        'Light the candle and place the sigil (printed or on screen) behind or beside the flame.',
        'Speak your intention aloud once — the exact words you forged with. Only once.',
        'Watch the flame, not the sigil, until the words stop meaning anything and become pure sound in your memory.',
        'Snuff the candle (don’t blow it out — press it out or use a snuffer). Sealed.',
      ],
    },
    {
      key: 'lunar',
      name: 'Lunar Charge',
      tool: 'Moonlight. Full moon strongest; new moon for beginnings.',
      best: 'Long-game intentions. Things that need to grow over a cycle.',
      steps: [
        'On the night of the moon phase that matches your intention, place the sigil where moonlight can reach it — a windowsill counts.',
        'Before you set it down, hold it to your chest for nine slow breaths.',
        'Say: “I leave this in older hands than mine.”',
        'Leave it overnight. Retrieve it before noon and do not explain it to anyone.',
      ],
    },
    {
      key: 'water',
      name: 'Water Rite',
      tool: 'Running water — a shower works perfectly.',
      best: 'Release work, cleansing, unblocking what is stuck.',
      steps: [
        'Memorize the shape of your sigil. Take three slow looks, then close your eyes and redraw it in your mind until it holds steady.',
        'Step into running water. Visualize the sigil glowing on the surface of the water as it moves over you.',
        'Let the water carry the intention into every cell. Stay until the image dissolves on its own.',
        'Step out. Don’t look at the sigil again today.',
      ],
    },
    {
      key: 'kinetic',
      name: 'Kinetic Charge',
      tool: 'Music and a closed door.',
      best: 'Power, confidence, magnetism — anything that needs voltage.',
      steps: [
        'Put the sigil somewhere you can glimpse it while you move.',
        'Play one song that makes your body move without permission. Move — dance, shake, pace, whatever is true.',
        'At the peak of the song, lock eyes with the sigil for one full second. That second is the charge.',
        'When the song ends, stop completely. Stillness seals it.',
      ],
    },
    {
      key: 'release',
      name: 'The Release',
      tool: 'A printed copy and a safe way to destroy it.',
      best: 'The classic. For intentions you need to stop gripping.',
      steps: [
        'Print or hand-copy the sigil onto paper. Physical matters here.',
        'Charge it with any method above — then destroy it. Burn it safely, tear it to confetti, or bury it.',
        'The destruction is the point: you are handing the intention over completely.',
        'Forget it deliberately. Every time it comes to mind, think “sent,” and move on. The forgetting is the final step.',
      ],
    },
  ];

  function ritualFor(seed) {
    const rand = mulberry32(seed ^ 0x51611);
    const method = METHODS[Math.floor(rand() * METHODS.length)];
    const counts = [3, 7, 9, 11][Math.floor(rand() * 4)];
    const window = ['at dawn', 'at dusk', 'at 11:11', 'at midnight', 'when you first wake'][Math.floor(rand() * 5)];
    return { method, counts, window };
  }

  function monthlySeed(email, date) {
    const d = date || new Date();
    const key = (email || 'wanderer').toLowerCase() + '::' +
      d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
    return hashString(key);
  }

  const MONTH_THEMES = [
    'The Threshold', 'The Ember Held', 'The Long Signal', 'The Unlocking',
    'The Quiet Engine', 'The Golden Ratio', 'The Deep Current', 'The High Wire',
    'The Compiler', 'The Harvest Glyph', 'The Veil Thin', 'The Return Spark',
  ];

  function monthlyTheme(date) {
    const d = date || new Date();
    return MONTH_THEMES[d.getMonth()];
  }

  global.SigilEngine = {
    draw, distill, seedFor, ritualFor, monthlySeed, monthlyTheme,
    METHODS, hashString, mulberry32,
  };
})(window);
