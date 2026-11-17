/* Garden Siege — the battle map (opened in a modal by the board button).
 * Cards are zombies, placed by the zone their list belongs to; members are plants; labels decide the zombie type.
 * Everything is drawn in the browser from t.lists() and t.cards(); nothing is written except the settings.
 */
(function () {
  'use strict';
  var GS = window.GS, h = GS.h, tr = GS.tr, esc = GS.esc, INK = GS.INK;

  var CW = 66, CH = 72, TOP = 166;          // zombie cell at scale 1, and where the first row starts
  var DW = 50, DH = 57;                     // dozing zombies are drawn at 0.8
  var EH = 96;                              // emerging zombies need room for their mound
  var MINW = { g: 196, t: 196, a: 196, m: 196, d: 196, e: 180 };
  var GROUND = { g: '#C9E0AB', t: '#B6D296', a: '#C9E0AB', m: '#B6D296', d: '#A9C9C0', e: '#9A8468' };

  function jit(i, k) { var v = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return Math.round((v - Math.floor(v)) * 6 - 3); }
  function cut(s, max) { // shorten a string to about `max` Latin-letter widths (CJK counts double)
    var w = 0, out = '';
    for (var i = 0; i < s.length; i++) {
      w += /[⺀-￿]/.test(s.charAt(i)) ? 1.9 : 1;
      if (w > max) return out.replace(/[\s·,，、]+$/, '') + '…';
      out += s.charAt(i);
    }
    return out;
  }

  /* ---------- drawing: zombies ---------- */
  var LIMBS = {
    walk: 'M16 46v10M28 46v10M12 30H1M12 37H1',
    thrower: 'M16 46v10M28 46v10M12 34H1M31 28L37 6',
    sleep: 'M16 46v10M28 46v10M10 30v13M34 30v13',
    bubble: 'M16 46v10M28 46v10M10 30v13M34 30v13',
    emerge: 'M12 30L2 18M32 30L42 18'
  };
  function zombie(i, card, model, x, y, s, mode) {
    var type = card.type ? model.typeOf[card.type] : null;
    var col = type ? type.color : GS.NONE_COLOR, d = GS.darken(col);
    var g = ['<g class="z" data-c="' + i + '"><g transform="translate(' + x + ' ' + y + ')' + (s !== 1 ? ' scale(' + s + ')' : '') + '">'];
    if (mode === 'bubble') g.push('<ellipse cx="22" cy="30" rx="23.5" ry="35" fill="#CDEBFA" fill-opacity="0.5" stroke="#7FC1E6" stroke-width="1.5"/>');
    if (!card.members.length && !card.ghost) g.push('<ellipse cx="22" cy="57" rx="22" ry="6" fill="none" stroke="#D21F3C" stroke-width="2" stroke-dasharray="4 3"/>');
    g.push('<path d="' + LIMBS[mode] + '" stroke="' + d + '" stroke-width="5" stroke-linecap="round" fill="none"/>');
    g.push('<rect x="10" y="24" width="24" height="24" rx="5" fill="' + d + '"/>');
    g.push('<circle cx="22" cy="14" r="12.5" fill="' + col + '" stroke="' + INK + '" stroke-width="2"/>');
    if (mode === 'sleep') {
      g.push('<path d="M14 14h6M24 14h6" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" fill="none"/>');
      g.push('<text x="35" y="5" font-size="13" font-weight="700" fill="#34507A">z</text>');
    } else {
      g.push('<path d="M17.5 13h0.01M26.5 13h0.01" stroke="#FFFFFF" stroke-width="7.5" stroke-linecap="round"/>');
      g.push('<path d="M16.3 13.4h0.01M25.3 13.4h0.01" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>');
      g.push('<path d="M16 21l2-2 2 2 2-2 2 2 2-2 2 2" stroke="' + INK + '" stroke-width="1.4" fill="none"/>');
    }
    if (mode === 'thrower') g.push('<path d="M29-9h15v13h-15zM32-5h9M32-1h9" transform="rotate(14 36 -2)" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.3"/>');
    if (mode === 'emerge') g.push('<ellipse cx="22" cy="55" rx="26" ry="11" fill="#7B6650" stroke="' + INK + '" stroke-width="1.5"/>');
    g.push('<rect x="8" y="28" width="28" height="14" rx="3" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.2"/>');
    if (type) {
      var b = type.badge;
      g.push('<text x="22" y="39" font-size="' + (b.length > 3 ? 8.5 : 10.5) + '" font-weight="700" text-anchor="middle" fill="' + INK + '">' + esc(b) + '</text>');
    }
    if (card.state) {
      g.push('<path d="' + (mode === 'thrower' ? 'M3 22V2l11 5-11 5' : 'M41 22V2l-11 5 11 5') + '" fill="' + (card.state === 'over' ? '#D21F3C' : '#F26A1B') + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>');
    }
    var n = card.members.length, py = mode === 'emerge' ? 70 : 62;
    card.members.slice(0, 5).forEach(function (id, k) {
      var m = model.memberOf[id];
      g.push('<circle cx="' + (22 + (k - (Math.min(n, 5) - 1) / 2) * 8.5).toFixed(1) + '" cy="' + py + '" r="3.6" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/>');
    });
    g.push('</g></g>');
    return g.join('');
  }

  /* ---------- drawing: plants (five original designs) ---------- */
  function eyes(pts) {
    return pts.map(function (p) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.6" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1"/><circle cx="' + (p[0] + 1.4) + '" cy="' + p[1] + '" r="2.1" fill="' + INK + '"/>';
    }).join('');
  }
  var POT = '<path d="M34 82h52l-7 28H41z" fill="#B5633C" stroke="' + INK + '" stroke-width="2" stroke-linejoin="round"/><rect x="30" y="74" width="60" height="10" rx="3" fill="#C9764A" stroke="' + INK + '" stroke-width="2"/>';
  var ART = [
    // pine bonsai
    '<path d="M60 76q-5-18 8-28q8-8 0-20" stroke="#6B4A2B" stroke-width="7" fill="none" stroke-linecap="round"/><ellipse cx="38" cy="46" rx="24" ry="13" fill="#2F6B4F" stroke="' + INK + '" stroke-width="2"/><ellipse cx="82" cy="52" rx="22" ry="12" fill="#2F6B4F" stroke="' + INK + '" stroke-width="2"/><ellipse cx="62" cy="22" rx="30" ry="16" fill="#3B8262" stroke="' + INK + '" stroke-width="2"/>' + eyes([[54, 22], [70, 22]]),
    // rose
    '<path d="M60 76V46" stroke="#2F6B4F" stroke-width="5"/><ellipse cx="44" cy="62" rx="13" ry="6" transform="rotate(-25 44 62)" fill="#3E8E41" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="76" cy="62" rx="13" ry="6" transform="rotate(25 76 62)" fill="#3E8E41" stroke="' + INK + '" stroke-width="1.8"/><circle cx="60" cy="28" r="24" fill="#D81B60" stroke="' + INK + '" stroke-width="2"/><path d="M44 16q16-14 32 0M40 34q20 22 40 0" stroke="#8E0E3C" stroke-width="2.2" fill="none"/>' + eyes([[52, 28], [68, 28]]),
    // bamboo
    '<rect x="40" y="18" width="10" height="58" fill="#8BC34A" stroke="' + INK + '" stroke-width="1.8"/><rect x="54" y="4" width="16" height="72" fill="#9CCC65" stroke="' + INK + '" stroke-width="1.8"/><rect x="74" y="24" width="10" height="52" fill="#8BC34A" stroke="' + INK + '" stroke-width="1.8"/><path d="M40 38h10M40 58h10M54 44h16M54 62h16M74 46h10M74 62h10M50 26q-16-8-22 4q14 4 22-4M84 34q16-8 22 4q-14 4-22-4" stroke="' + INK + '" stroke-width="1.6" fill="#7CB342"/>' + eyes([[58, 22], [67, 22]]),
    // lavender
    '<path d="M60 76L38 34M60 76V26M60 76L82 34" stroke="#5B8C5A" stroke-width="3.2" fill="none"/><ellipse cx="36" cy="26" rx="8" ry="17" transform="rotate(-18 36 26)" fill="#9575CD" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="84" cy="26" rx="8" ry="17" transform="rotate(18 84 26)" fill="#9575CD" stroke="' + INK + '" stroke-width="1.8"/><ellipse cx="60" cy="20" rx="12" ry="20" fill="#7E57C2" stroke="' + INK + '" stroke-width="2"/>' + eyes([[55, 18], [65, 18]]),
    // kumquat tree
    '<path d="M60 76V56" stroke="#6B4A2B" stroke-width="7"/><circle cx="60" cy="34" r="29" fill="#3E8E41" stroke="' + INK + '" stroke-width="2"/>' + [[40, 24], [80, 26], [46, 50], [74, 50], [60, 12]].map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="5.2" fill="#F28C28" stroke="' + INK + '" stroke-width="1.2"/>'; }).join('') + eyes([[52, 34], [68, 34]])
  ];
  function plant(m, x, y) {
    var label = m.short + ' · ' + tr('front', m.front);
    return '<g class="p" data-m="' + esc(m.id) + '" tabindex="0" role="button" aria-label="' + esc(m.name + ', ' + tr('front', m.front)) + '" transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="0" y="-4" width="124" height="146" fill="#FFFFFF" fill-opacity="0"/>' + ART[m.design] + POT +
      '<circle cx="104" cy="40" r="5.5" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/><circle cx="116" cy="35" r="4.4" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/>' +
      '<rect class="tag" x="2" y="114" width="118" height="23" rx="11.5" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.5"/>' +
      '<text x="61" y="130.5" font-size="12.5" font-weight="700" text-anchor="middle" fill="#FFFFFF">' + esc(cut(label, 17)) + '</text></g>';
  }

  /* ---------- the scene ---------- */
  // opts.caps (zone → card count) sizes the map for the busiest moment of a replay so it does not jump between
  // frames; opts.plantIds keeps the same plants in the same pots.
  function scene(model, opts) {
    opts = opts || {};
    var zones = model.zones, caps = opts.caps || {};
    var size = function (z) { return Math.max(zones[z].length, caps[z] || 0); };
    var shown = GS.FIELD.filter(function (z) { return z === 'g' || model.listsIn[z].length; });
    var plants = opts.plantIds
      ? opts.plantIds.map(function (id) { return model.memberOf[id]; }).filter(Boolean)
      : model.members.filter(function (m) { return GS.FIELD.some(function (z) { return m.counts[z]; }); });
    var R, H, perCol, pCols, leftW, W, widths, rowsD, rowsE;
    for (R = 7; R <= 60; R++) {
      H = TOP + R * CH + 30;
      perCol = Math.max(1, Math.floor((H - 160) / 128));
      pCols = plants.length ? Math.ceil(plants.length / perCol) : 0;
      leftW = 204 + pCols * 130 + 14;
      rowsD = Math.floor(R * CH / DH); rowsE = Math.floor(R * CH / EH);
      widths = shown.map(function (z) {
        var n = size(z), cols, w;
        if (z === 'd') { cols = Math.ceil(n / rowsD) || 1; w = cols * DW + 26; }
        else if (z === 'e') { cols = Math.ceil(n / rowsE) || 1; w = cols * CW + 26; }
        else { cols = Math.ceil(n / R) || 1; w = cols * CW + 26; }
        return Math.max(MINW[z], w);
      });
      W = leftW + widths.reduce(function (a, b) { return a + b; }, 0);
      if (W <= 2.1 * H) break;
    }

    var S = [], cards = [], plantPos = {};
    function put(card, x, y, s, mode) {
      cards.push({ card: card, x: x + 22 * s, y: y + 26 * s });
      return zombie(cards.length - 1, card, model, x, y, s, mode);
    }

    // ground
    S.push('<rect x="0" y="0" width="' + W + '" height="66" fill="#DCEAF0"/>');
    S.push('<rect x="0" y="66" width="' + W + '" height="' + (H - 66) + '" fill="#BFD9A0"/>');
    var zx = {}, x0 = leftW;
    shown.forEach(function (z, i) {
      zx[z] = { x: x0, w: widths[i] };
      S.push('<rect x="' + x0 + '" y="66" width="' + widths[i] + '" height="' + (H - 66) + '" fill="' + GROUND[z] + '"/>');
      x0 += widths[i];
    });

    // things being thrown at the house
    if (zx.t && zones.t.length) {
      var tx = zx.t.x + zx.t.w / 2;
      [[-50, -70], [0, -110], [50, -40]].forEach(function (a) {
        S.push('<path d="M' + (tx + a[0]) + ' 150Q' + Math.round((tx + a[0] + 120) / 2) + ' ' + a[1] + ' 120 150" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="7 6" stroke-opacity="0.55"/>');
      });
      [[0.78, 26, -12], [0.56, 22, 8], [0.36, 34, -6], [0.9, 44, 16]].slice(0, Math.min(4, zones.t.length)).forEach(function (p) {
        S.push('<g transform="translate(' + Math.round(120 + (tx - 120) * p[0]) + ' ' + p[1] + ') rotate(' + p[2] + ')"><rect x="-13" y="-10" width="26" height="20" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.5"/><path d="M-8-4h16M-8 1h16M-8 6h9" stroke="' + INK + '" stroke-width="1.3"/></g>');
      });
    }

    // the house
    S.push('<path d="M14 210h176v' + (H - 250) + 'H14z" fill="#EADFC8" stroke="' + INK + '" stroke-width="3"/>');
    S.push('<path d="M0 214L102 84l102 130z" fill="#B5533C" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>');
    [250, 400].forEach(function (wy) {
      if (wy + 70 > H - 230) return;
      [36, 112].forEach(function (wx) {
        S.push('<rect x="' + wx + '" y="' + wy + '" width="56" height="70" fill="#F7D774" stroke="' + INK + '" stroke-width="2.5"/><path d="M' + (wx + 28) + ' ' + wy + 'v70M' + wx + ' ' + (wy + 35) + 'h56" stroke="' + INK + '" stroke-width="2"/>');
      });
    });
    S.push('<rect x="66" y="' + (H - 190) + '" width="72" height="150" fill="#6B4A2B" stroke="' + INK + '" stroke-width="2.5"/><circle cx="126" cy="' + (H - 110) + '" r="4" fill="#F5C542"/>');
    S.push('<path d="M200 150V' + (H - 8) + '" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="3 13" stroke-linecap="round"/>');

    // zone signs
    shown.forEach(function (z) {
      var w = zx[z].w - 16, sub = model.listsIn[z].join(' · ');
      S.push('<g transform="translate(' + (zx[z].x + 8) + ' 76)"><title>' + esc(tr('zd_' + z) + (sub ? ' — ' + sub : '')) + '</title>' +
        '<rect width="' + w + '" height="62" rx="5" fill="#6B4A2B" stroke="' + INK + '" stroke-width="2"/>' +
        '<text x="11" y="27" font-size="20" font-weight="700" fill="#FFFFFF">' + esc(cut(tr('z_' + z), (w - 64) / 10.5)) + '</text>' +
        '<text x="' + (w - 11) + '" y="29" font-size="25" font-weight="700" text-anchor="end" fill="#F7D774">' + zones[z].length + '</text>' +
        '<text x="11" y="49" font-size="12" fill="#F3E9D6">' + esc(cut(sub, (w - 22) / 6.4)) + '</text></g>');
    });

    // zombies on the field
    shown.forEach(function (z) {
      var L = zones[z], bx = zx[z].x + 13;
      L.forEach(function (card, i) {
        var col, row;
        if (z === 'd') { col = Math.floor(i / rowsD); row = i % rowsD; S.push(put(card, bx + col * DW + jit(i, 1), TOP - 6 + row * DH + jit(i, 2), 0.8, 'sleep')); }
        else if (z === 'e') { col = Math.floor(i / rowsE); row = i % rowsE; S.push(put(card, bx + col * CW + 6, TOP + 20 + row * EH, 0.9, 'emerge')); }
        else { col = Math.floor(i / R); row = i % R; S.push(put(card, bx + col * CW + jit(i, 1), TOP + row * CH + (col % 2 ? 6 : 0) + jit(i, 2), 1, z === 't' ? 'thrower' : 'walk')); }
      });
    });

    // plants
    var spacing = Math.min(150, (H - 160) / perCol);
    plants.forEach(function (m, i) {
      var col = Math.floor(i / perCol), row = i % perCol;
      var px = 206 + col * 130, py = 152 + row * spacing;
      plantPos[m.id] = { x: px + 112, y: py + 38 };
      S.push(plant(m, px, py));
    });

    // below the field: cards awaiting an outcome, and money to collect
    var hasB = model.listsIn.b.length > 0, hasC = model.listsIn.c.length > 0, total = H;
    if (hasB || hasC) {
      var wb = hasB ? (hasC ? Math.round(W * 0.6) : W) : 0, wc = W - wb;
      var perB = Math.max(1, Math.floor((wb - 36) / 42)), rowsB = Math.ceil(size('b') / perB);
      var perC = Math.max(1, Math.floor((wc - 36) / 24)), rowsC = Math.ceil(size('c') / perC);
      var sh = 58 + Math.max(hasB ? Math.max(1, rowsB) * 98 : 0, hasC ? Math.max(1, rowsC) * 24 + 12 : 0) + 10;
      S.push('<rect x="0" y="' + H + '" width="' + W + '" height="' + sh + '" fill="#20302A"/>');
      if (hasB) {
        S.push('<text x="18" y="' + (H + 30) + '" font-size="19" font-weight="700" fill="#F7D774">' + esc(tr('z_b')) + ' ' + zones.b.length + '</text>');
        S.push('<text x="18" y="' + (H + 48) + '" font-size="12" fill="#C9D3C4">' + esc(cut(tr('zd_b') + ' — ' + model.listsIn.b.join(' · '), (wb - 36) / 6.4)) + '</text>');
        zones.b.forEach(function (card, i) { S.push(put(card, 20 + (i % perB) * 42, H + 66 + Math.floor(i / perB) * 98, 0.8, 'bubble')); });
      }
      if (hasC) {
        S.push('<text x="' + (wb + 18) + '" y="' + (H + 30) + '" font-size="19" font-weight="700" fill="#F7D774">' + esc(tr('z_c')) + ' ' + zones.c.length + '</text>');
        S.push('<text x="' + (wb + 18) + '" y="' + (H + 48) + '" font-size="12" fill="#C9D3C4">' + esc(cut(tr('zd_c') + ' — ' + model.listsIn.c.join(' · '), (wc - 36) / 6.4)) + '</text>');
        zones.c.forEach(function (card, i) {
          var cx = wb + 28 + (i % perC) * 24, cy = H + 74 + Math.floor(i / perC) * 24;
          cards.push({ card: card, x: cx, y: cy });
          S.push('<g class="z" data-c="' + (cards.length - 1) + '"><circle cx="' + cx + '" cy="' + cy + '" r="9.5" fill="#F5C542" stroke="#8A6A12" stroke-width="1.6"/><path d="M' + (cx - 3) + ' ' + cy + 'h6" stroke="#8A6A12" stroke-width="1.6" stroke-linecap="round"/></g>');
        });
      }
      total = H + sh;
    }
    S.push('<g id="gs-lines"></g>');
    return { html: S.join(''), W: W, H: total, cards: cards, plantPos: plantPos, shown: shown, plantIds: plants.map(function (m) { return m.id; }) };
  }

  /* ---------- the page ---------- */
  var DAY = 86400000;
  var STILL = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  GS.mountBattle = function (t, rootEl) {
    var cfg = null, lists = [], rawCards = [], live = null;      // the board as it is now
    var view = null, sc = null, hl = null;                       // what is on screen
    var svg = null, tip = null, stage = null, tilesBox = null, tableBox = null, panel = null;
    var panelOpen = false, authOpen = false, notice = null;
    var rp = null, rpUi = null, timer = null;                    // replay state, its controls, the play timer

    function fmtDate(ms, withTime) {
      var o = { year: 'numeric', month: 'short', day: 'numeric' };
      if (withTime) { o.hour = '2-digit'; o.minute = '2-digit'; }
      try { return new Date(ms).toLocaleString(GS.lang === 'zh' ? 'zh-CN' : undefined, o); }
      catch (e) { return new Date(ms).toISOString().slice(0, withTime ? 16 : 10); }
    }

    /* ----- highlighting ----- */
    function applyHighlight() {
      if (!svg) return;
      var lines = svg.querySelector('#gs-lines');
      if (lines) lines.innerHTML = '';
      Array.prototype.forEach.call(rootEl.querySelectorAll('.chip'), function (el) {
        el.setAttribute('aria-pressed', hl && hl.kind === 'type' && el.getAttribute('data-t') === hl.id ? 'true' : 'false');
      });
      Array.prototype.forEach.call(svg.querySelectorAll('.p'), function (el) {
        el.classList.toggle('on', !!(hl && hl.kind === 'member' && el.getAttribute('data-m') === hl.id));
      });
      var nodes = svg.querySelectorAll('.z');
      if (!hl) { svg.classList.remove('hl'); return; }
      svg.classList.add('hl');
      var from = hl.kind === 'member' ? sc.plantPos[hl.id] : null, color = from ? view.memberOf[hl.id].color : null, out = [];
      Array.prototype.forEach.call(nodes, function (n) {
        var item = sc.cards[Number(n.getAttribute('data-c'))], c = item.card, on;
        if (hl.kind === 'member') on = c.members.indexOf(hl.id) !== -1;
        else if (hl.id === '__none') on = !c.type;
        else if (hl.id === '__other') on = !!c.type && !view.typeOf[c.type].top;
        else on = c.type === hl.id;
        n.classList.toggle('on', on);
        if (on && from && GS.FIELD.indexOf(c.zone) !== -1) out.push('<path d="M' + from.x + ' ' + from.y + 'L' + item.x.toFixed(0) + ' ' + item.y.toFixed(0) + '" stroke="' + color + '" stroke-width="2" stroke-opacity="0.55" stroke-dasharray="2 7" stroke-linecap="round"/>');
      });
      if (lines) lines.innerHTML = out.join('');
    }
    function toggle(kind, id) {
      hl = (hl && hl.kind === kind && hl.id === id) ? null : { kind: kind, id: id };
      applyHighlight();
    }

    /* ----- tooltip ----- */
    function showTip(item, ev) {
      var c = item.card, rows = [];
      rows.push(h('div', { class: 'tip-name', text: c.name }));
      rows.push(h('div', { class: 'tip-row' }, [h('span', { text: tr('tip_list') }), c.list]));
      if (c.labels.length) rows.push(h('div', { class: 'tip-row' }, [h('span', { text: tr('tip_labels') }), c.labels.join(', ')]));
      rows.push(h('div', { class: 'tip-row' }, [h('span', { text: tr('tip_plants') }), c.members.length ? c.members.map(function (id) { return view.memberOf[id].name; }).join(', ') : tr('tip_none')]));
      if (c.due) rows.push(h('div', { class: 'tip-row' + (c.state ? ' ' + c.state : '') }, [h('span', { text: tr('tip_due') }), fmtDate(new Date(c.due).getTime())]));
      GS.fill(tip, rows);
      tip.hidden = false;
      var box = stage.getBoundingClientRect(), x = ev.clientX - box.left + 14, y = ev.clientY - box.top + 14;
      if (x + tip.offsetWidth > box.width - 4) x = Math.max(4, ev.clientX - box.left - tip.offsetWidth - 14);
      if (y + tip.offsetHeight > box.height - 4) y = Math.max(4, ev.clientY - box.top - tip.offsetHeight - 14);
      tip.style.left = x + 'px'; tip.style.top = y + 'px';
    }

    /* ----- pieces that change with every frame ----- */
    function tile(n, label, cls) { return h('div', { class: 'tile' + (cls ? ' ' + cls : '') }, [h('div', { class: 'v', text: String(n) }), h('div', { class: 'k', text: label })]); }
    function fillTiles() {
      var s = view.stats;
      GS.fill(tilesBox, [
        tile(s.field, tr('st_field')),
        tile(s.gate, tr('st_gate'), s.gate ? 'hot' : ''),
        tile(s.throwers, tr('st_throw'), s.throwers ? 'hot' : ''),
        rp ? null : tile(s.soon, tr('st_soon', cfg.soon), s.soon ? 'hot' : ''),
        rp ? null : tile(s.over, tr('st_over'), s.over ? 'late' : ''),
        tile(s.unguarded, tr('st_ung'), s.unguarded ? 'late' : ''),
        view.listsIn.b.length ? tile(s.bubbled, tr('st_bub')) : null,
        view.listsIn.c.length ? tile(s.coins, tr('st_coin')) : null
      ]);
    }
    function fillTable() {
      var cols = sc.shown.concat(view.listsIn.b.length ? ['b'] : [], view.listsIn.c.length ? ['c'] : []);
      var head = h('tr', null, [h('th', { text: tr('tb_plant') })].concat(cols.map(function (z) { return h('th', { class: 'num', text: tr('z_' + z) }); }), [h('th', { class: 'num', text: tr('tb_total') })]));
      var line = function (label, color, counts, tot, cls) {
        return h('tr', { class: cls || '' }, [h('td', null, [color ? h('i', { class: 'dot', style: 'background:' + color }) : h('i', { class: 'dot ring' }), label])].concat(
          cols.map(function (z) { var v = counts[z] || 0; return h('td', { class: 'num' + (v ? '' : ' zero'), text: v ? String(v) : '–' }); }),
          [h('td', { class: 'num strong', text: String(tot) })]));
      };
      var body = view.members.map(function (m) { return line(m.name, m.color, m.counts, m.total); });
      if (view.unguarded.total) body.push(line(tr('st_ung'), null, view.unguarded.counts, view.unguarded.total, 'ung'));
      GS.fill(tableBox, [
        h('h2', { text: tr('tb_title') }), h('p', { class: 'muted small', text: tr('tb_sub') }),
        h('div', { class: 'scroll' }, [h('table', null, [h('thead', null, [head]), h('tbody', null, body)])])
      ]);
    }
    // Draw `view` into the stage. With `animate`, cards glide from where they were in the previous frame.
    function paint(animate, ms) {
      var old = {};
      if (animate && sc) sc.cards.forEach(function (it) { old[it.card.id] = it; });
      sc = scene(view, rp ? { caps: rp.caps, plantIds: rp.plantIds } : null);
      svg.setAttribute('viewBox', '0 0 ' + sc.W + ' ' + sc.H);
      svg.innerHTML = sc.html;
      if (animate && !STILL && svg.animate) {
        Array.prototype.forEach.call(svg.querySelectorAll('.z'), function (n) {
          var it = sc.cards[Number(n.getAttribute('data-c'))], was = old[it.card.id];
          if (!was) { n.animate([{ opacity: 0, transform: 'translate(0px, 18px)' }, { opacity: 1, transform: 'translate(0px, 0px)' }], { duration: ms, easing: 'ease-out' }); return; }
          var dx = was.x - it.x, dy = was.y - it.y;
          if (Math.abs(dx) + Math.abs(dy) < 1) return;
          n.animate([{ transform: 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px)' }, { transform: 'translate(0px, 0px)' }], { duration: ms, easing: 'ease-in-out' });
        });
      }
      applyHighlight();
    }

    /* ----- replay ----- */
    function stopTimer() { if (timer) { clearTimeout(timer); timer = null; } }
    function stateAt(k) {
      // card → list at frame k, rebuilt from the start so the slider can jump anywhere
      var st = {}, id, T = rp.times[k], ev = rp.hist.events;
      for (id in rp.hist.initial) st[id] = rp.hist.initial[id];
      for (var i = 0; i < ev.length && ev[i].t <= T; i++) st[ev[i].id] = ev[i].to;
      return st;
    }
    function modelAt(k) {
      var st = stateAt(k), cards = [], id, base;
      for (id in st) {
        if (!st[id]) continue;
        base = rp.byId[id];
        cards.push({ id: id, name: rp.hist.names[id] || '', idList: st[id], labels: base ? base.labels : [], members: base ? base.members : [], due: null, dueComplete: true, ghost: !base });
      }
      return GS.buildModel(lists, cards, cfg, rp.times[k], live);
    }
    function stepSummary(k) {
      var from = k ? rp.times[k - 1] : -Infinity, to = rp.times[k], zoneOf = live.zoneOf;
      var arrived = 0, moved = 0, left = 0, lines = [];
      var z = function (list) { var v = list ? zoneOf[list] : null; return v && v !== 'x' ? v : null; };
      rp.hist.events.forEach(function (e) {
        if (e.t <= from || e.t > to) return;
        var a = z(e.from), b = z(e.to);
        if (a === b) return;
        if (!a) arrived++; else if (!b) left++; else moved++;
        if (lines.length < 4) lines.push((rp.hist.names[e.id] || '?') + ': ' + (a ? tr('z_' + a) : tr('rp_new')) + ' → ' + (b ? tr('z_' + b) : tr('rp_gone')));
      });
      return { text: arrived + moved + left ? tr('rp_step', arrived, moved, left) : tr('rp_quiet'), lines: lines };
    }
    function showFrame(k, animate) {
      rp.k = Math.max(0, Math.min(rp.times.length - 1, k));
      view = modelAt(rp.k);
      var ms = Math.round(rp.frameMs * 0.85);
      paint(animate, ms);
      fillTiles(); fillTable();
      if (rpUi) {
        rpUi.slider.value = String(rp.k);
        rpUi.slider.setAttribute('aria-valuetext', fmtDate(rp.times[rp.k], rp.stepMs < DAY));
        rpUi.when.textContent = fmtDate(rp.times[rp.k], rp.stepMs < DAY);
        var sum = stepSummary(rp.k);
        rpUi.step.textContent = sum.text;
        GS.fill(rpUi.log, sum.lines.map(function (l) { return h('div', { text: l }); }));
        rpUi.play.textContent = rp.playing ? tr('rp_pause') : tr('rp_play');
      }
    }
    function tick() {
      stopTimer();
      if (!rp || !rp.playing) return;
      if (rp.k >= rp.times.length - 1) { rp.playing = false; showFrame(rp.k, false); return; }
      showFrame(rp.k + 1, true);
      timer = setTimeout(tick, rp.frameMs);
    }
    function setPlaying(on) {
      if (!rp) return;
      if (on && rp.k >= rp.times.length - 1) showFrame(0, false);
      rp.playing = on;
      if (rpUi) rpUi.play.textContent = on ? tr('rp_pause') : tr('rp_play');
      stopTimer();
      if (on) timer = setTimeout(tick, 350);
    }
    function startReplay(days) {
      stopTimer();
      var now = Date.now(), since = now - days * DAY;
      notice = { cls: 'info', text: tr('rp_loading', 0) }; authOpen = false; draw();
      return GS.fetchActions(t, since, function (n) {
        var el = rootEl.querySelector('#gs-notice'); if (el) el.textContent = tr('rp_loading', n);
      }).then(function (res) {
        var hist = GS.buildHistory(rawCards, res.actions), start = since;
        if (res.truncated && res.actions.length) start = new Date(res.actions[res.actions.length - 1].date).getTime();
        var stepMs = (now - start) <= 8 * DAY ? DAY / 4 : DAY, times = [];
        for (var T = start; T < now; T += stepMs) times.push(T);
        times.push(now);
        var byId = {}; rawCards.forEach(function (c) { byId[c.id] = c; });
        rp = { days: days, hist: hist, times: times, stepMs: stepMs, k: 0, playing: false, speed: rp ? rp.speed : 1, byId: byId, caps: {}, plantIds: null, truncatedAt: res.truncated ? start : null, empty: !hist.events.length };
        rp.frameMs = 800 / rp.speed;
        // size the map for the busiest moment, and keep every plant that ever had a card on the field
        var seen = {};
        for (var k = 0; k < times.length; k++) {
          var m = modelAt(k);
          GS.ZONES.forEach(function (z) { rp.caps[z] = Math.max(rp.caps[z] || 0, m.zones[z].length); });
          m.members.forEach(function (mem) { if (GS.FIELD.some(function (z) { return mem.counts[z]; })) seen[mem.id] = 1; });
        }
        rp.plantIds = live.members.map(function (mem) { return mem.id; }).filter(function (id) { return seen[id]; });
        notice = rp.empty ? { cls: 'info', text: tr('rp_none') } : (rp.truncatedAt ? { cls: 'info', text: tr('rp_trunc', fmtDate(rp.truncatedAt)) } : null);
        view = modelAt(0); draw();
        if (!rp.empty) setPlaying(true);
      }).catch(function (e) {
        rp = null; view = live;
        if (e && e.code === 401) { GS.auth(t).clear(); notice = null; authOpen = true; }
        else notice = { cls: 'err', text: tr('rp_err') };
        draw();
      });
    }
    function exitReplay() { stopTimer(); rp = null; rpUi = null; notice = null; view = live; draw(); }
    function clickReplay() {
      if (rp) { exitReplay(); return; }
      GS.auth(t).token().then(function (tok) {
        if (tok) return startReplay(30);
        authOpen = !authOpen; panelOpen = false; draw();
      });
    }
    function authPanel() {
      var auth = GS.auth(t), msg = h('div', { class: 'note err', hidden: true });
      return h('div', { class: 'panel' }, [
        h('h2', { text: tr('au_title') }), h('p', { text: tr('au_body') }), msg,
        h('div', { class: 'foot' }, [
          h('span', { class: 'muted small' }, [h('a', { class: 'link', href: './privacy.html', target: '_blank', rel: 'noopener', text: tr('privacy') })]),
          h('span', { class: 'grow' }),
          h('button', { type: 'button', text: tr('cancel'), onclick: function () { authOpen = false; draw(); } }),
          // authorize() is called straight from the click so the browser allows Trello's consent window
          h('button', { type: 'button', class: 'primary', text: tr('au_ok'), onclick: function () {
            auth.authorize().then(function (tok) {
              if (tok) return startReplay(30);
              msg.textContent = tr('au_denied'); msg.hidden = false;
            }).catch(function () { msg.textContent = tr('au_denied'); msg.hidden = false; });
          } })
        ])
      ]);
    }
    function replayBar() {
      var opt = function (v, text) { return h('option', { value: String(v), text: text }); };
      var range = h('select', { id: 'gs-rp-range', 'aria-label': tr('rp_range'), onchange: function () { startReplay(Number(range.value)); } }, [opt(7, tr('rp_d7')), opt(30, tr('rp_d30')), opt(90, tr('rp_d90'))]);
      range.value = String(rp.days);
      var speed = h('select', { id: 'gs-rp-speed', 'aria-label': tr('rp_speed'), onchange: function () { rp.speed = Number(speed.value); rp.frameMs = 800 / rp.speed; } }, [opt(0.5, '0.5×'), opt(1, '1×'), opt(2, '2×'), opt(4, '4×')]);
      speed.value = String(rp.speed);
      var play = h('button', { type: 'button', class: 'primary', id: 'gs-rp-play', text: tr('rp_play'), onclick: function () { setPlaying(!rp.playing); } });
      var slider = h('input', { type: 'range', id: 'gs-rp-pos', min: '0', max: String(rp.times.length - 1), step: '1', value: String(rp.k), 'aria-label': tr('rp_pos'),
        oninput: function () { setPlaying(false); showFrame(Number(slider.value), false); } });
      var when = h('div', { class: 'rp-when' }), step = h('div', { class: 'rp-step' }), log = h('div', { class: 'rp-log muted small' });
      rpUi = { play: play, slider: slider, when: when, step: step, log: log };
      if (rp.empty) { play.disabled = true; slider.disabled = true; }
      return h('div', { class: 'panel replay' }, [
        h('div', { class: 'rp-row' }, [play, slider, when]),
        h('div', { class: 'rp-row' }, [range, speed, step, h('span', { class: 'grow' })]),
        log,
        h('p', { class: 'muted small rp-note', text: tr('rp_note') })
      ]);
    }

    /* ----- the whole page ----- */
    function draw() {
      var kids = [], canReplay = GS.demo || GS.auth(t).ok;
      rpUi = null;
      if (GS.demo) kids.push(h('div', { class: 'note warn', text: tr('demo') }));

      tilesBox = h('div', { class: 'tiles' });
      kids.push(h('div', { class: 'bar-top' }, [
        tilesBox,
        h('div', { class: 'actions' }, [
          canReplay && live.total ? h('button', { type: 'button', id: 'gs-replay', class: rp ? 'primary' : '', text: rp ? tr('rp_exit') : tr('rp_btn'), onclick: clickReplay }) : null,
          rp ? null : h('button', { type: 'button', id: 'gs-refresh', text: tr('refresh'), onclick: function () { load(); } }),
          rp ? null : h('button', { type: 'button', id: 'gs-zones', class: panelOpen ? 'primary' : '', text: tr('zones_btn'), onclick: function () { panelOpen = !panelOpen; authOpen = false; draw(); } })
        ])
      ]));

      panel = h('div', { class: 'panel', id: 'gs-panel' });
      if (panelOpen && !rp) kids.push(panel);
      if (authOpen && !rp) kids.push(authPanel());
      if (notice) kids.push(h('div', { class: 'note ' + notice.cls, id: 'gs-notice', text: notice.text }));
      if (rp) kids.push(replayBar());
      if (live.guessed && !panelOpen && !rp) kids.push(h('div', { class: 'note info', text: tr('guessed') }));

      tableBox = h('div', { class: 'fire' });
      if (!live.total) {
        kids.push(h('div', { class: 'note info', text: tr('empty') }));
        svg = null; sc = null;
      } else {
        var s = live.stats;
        var chips = live.types.filter(function (x) { return x.top; }).map(function (x) {
          return h('button', { class: 'chip', type: 'button', 'data-t': x.key, 'aria-pressed': 'false', onclick: function () { toggle('type', x.key); } },
            [h('i', { style: 'background:' + x.color }), h('span', { text: (x.badge !== x.name ? x.badge + ' · ' : '') + cut(x.name || '?', 26) }), h('b', { text: String(x.count) })]);
        });
        var extra = function (id, color, text, n) {
          return h('button', { class: 'chip', type: 'button', 'data-t': id, 'aria-pressed': 'false', onclick: function () { toggle('type', id); } }, [h('i', { style: 'background:' + color }), h('span', { text: text }), h('b', { text: String(n) })]);
        };
        if (s.other) chips.push(extra('__other', GS.OTHER_COLOR, tr('lg_other'), s.other));
        if (s.noLabel || rp) chips.push(extra('__none', GS.NONE_COLOR, tr('lg_none'), s.noLabel));
        kids.push(h('div', { class: 'legend' }, [h('span', { class: 'legend-title', text: tr('lg_types') })].concat(chips)));
        kids.push(h('div', { class: 'legend marks' }, [
          rp ? null : h('span', { class: 'mk soon', text: tr('lg_soon') }), rp ? null : h('span', { class: 'mk over', text: tr('lg_over') }),
          h('span', { class: 'mk pips', text: tr('lg_pips') }), h('span', { class: 'mk ung', text: tr('lg_ung') }),
          h('span', { class: 'muted', text: tr('lg_click') })
        ]));

        stage = h('div', { class: 'stage' });
        var holder = document.createElement('div');
        holder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" role="img" aria-label="' + esc(tr('title_map')) + '"></svg>';
        svg = holder.firstChild;
        tip = h('div', { class: 'tip', hidden: true });
        stage.appendChild(svg); stage.appendChild(tip);
        svg.addEventListener('mousemove', function (ev) {
          var z = ev.target.closest ? ev.target.closest('.z') : null;
          if (!z) { tip.hidden = true; return; }
          showTip(sc.cards[Number(z.getAttribute('data-c'))], ev);
        });
        svg.addEventListener('mouseleave', function () { tip.hidden = true; });
        svg.addEventListener('click', function (ev) {
          var p = ev.target.closest ? ev.target.closest('.p') : null;
          if (p) { toggle('member', p.getAttribute('data-m')); return; }
          var z = ev.target.closest ? ev.target.closest('.z') : null;
          if (z) {
            var card = sc.cards[Number(z.getAttribute('data-c'))].card;
            if (!rp || rp.byId[card.id]) { try { t.showCard(card.id); } catch (e) { /* demo mode */ } }
            return;
          }
          if (hl) { hl = null; applyHighlight(); }
        });
        svg.addEventListener('keydown', function (ev) {
          var p = ev.target.closest ? ev.target.closest('.p') : null;
          if (p && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); toggle('member', p.getAttribute('data-m')); }
        });
        kids.push(stage);
        kids.push(tableBox);
      }
      GS.fill(rootEl, kids);
      if (panelOpen && !rp && GS.mountSettings) {
        GS.mountSettings(t, panel, { inline: true, onSaved: function () { panelOpen = false; load(); }, onCancel: function () { panelOpen = false; draw(); } });
      }
      if (hl && ((hl.kind === 'member' && !live.memberOf[hl.id]) || (hl.kind === 'type' && hl.id.indexOf('__') !== 0 && !live.typeOf[hl.id]))) hl = null;
      fillTiles();
      if (svg) {
        sc = null;
        if (rp) showFrame(rp.k, false); else { paint(false, 0); fillTable(); }
      }
    }

    function load() {
      return Promise.all([
        t.get('board', 'shared', GS.CFG_KEY),
        t.lists('id', 'name'),
        t.cards('id', 'name', 'idList', 'labels', 'members', 'due', 'dueComplete')
      ]).then(function (r) {
        cfg = GS.cfg(r[0]); lists = r[1] || []; rawCards = r[2] || [];
        live = GS.buildModel(lists, rawCards, cfg, Date.now());
        stopTimer(); rp = null; view = live;
        draw();
      }).catch(function () {
        GS.fill(rootEl, [h('div', { class: 'note err', text: tr('load_err') })]);
      });
    }
    // Trello calls this again whenever board data changes; do not redraw under someone editing zones or watching a replay.
    return t.render(function () { return (panelOpen || rp || authOpen) && live ? null : load(); });
  };
})();
