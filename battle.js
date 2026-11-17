/* Siege Line — the battle map (opened in a modal by the board button).
 * Cards are enemy units, placed by the zone their list belongs to; members are the defending guns; a card's
 * first label decides what kind of unit it is.
 * Everything is drawn in the browser from t.lists() and t.cards(); nothing is written except the settings.
 */
(function () {
  'use strict';
  var GS = window.GS, h = GS.h, tr = GS.tr, esc = GS.esc, INK = GS.INK;

  var CW = 66, CH = 72, TOP = 166;          // unit cell at scale 1, and where the first row starts
  var DW = 50, DH = 57;                     // camped units are drawn at 0.8
  var EH = 96;                              // units dropping in need room for their parachute
  var MINW = { g: 210, t: 200, a: 200, m: 200, d: 200, e: 190 };
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

  /* ---------- drawing: enemy units (original artwork; every unit faces the headquarters on the left) ---------- */
  var OUT = ' stroke="' + INK + '" stroke-width="1.6" stroke-linejoin="round"';
  function wheels(pts, r, hub) {
    return pts.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + r + '" fill="' + INK + '"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r * 0.36).toFixed(1) + '" fill="' + hub + '"/>'; }).join('');
  }
  var GLASS = '#CDEBFA';
  var KIND = {
    tank: function (c, d) {
      return '<rect x="3" y="20" width="38" height="9" rx="4.5" fill="' + d + '"' + OUT + '/><path d="M9 24.5h0.01M16 24.5h0.01M23 24.5h0.01M30 24.5h0.01M36 24.5h0.01" stroke="' + INK + '" stroke-width="3.2" stroke-linecap="round"/>' +
        '<path d="M7 20l4-7h22l4 7z" fill="' + c + '"' + OUT + '/><rect x="16" y="6" width="14" height="8" rx="2" fill="' + c + '"' + OUT + '/><path d="M16 10H1" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>';
    },
    jet: function (c, d) {
      return '<path d="M17 15l12 10h5l-7-11z" fill="' + d + '"' + OUT + '/><path d="M2 15q10-6 28-5l12-5-2 9-10 3q-16 2-28-2z" fill="' + c + '"' + OUT + '/><path d="M9 12.5q3-2.5 7-2v3z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1"/>';
    },
    heli: function (c, d) {
      return '<path d="M3 5h32M19 5v4" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M27 12l15-3v3l-14 5z" fill="' + d + '"' + OUT + '/><circle cx="42" cy="10" r="3.2" fill="none"' + OUT + '/>' +
        '<ellipse cx="17" cy="15" rx="12" ry="7" fill="' + c + '"' + OUT + '/><path d="M6 15q1-5 8-6v6z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1"/>' +
        '<path d="M8 25h19M12 21.5v3.5M22 21.5v3.5M5 19l-4 1.5" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" fill="none"/>';
    },
    infantry: function (c, d) {
      return '<path d="M18 24v6M26 24v6" stroke="' + d + '" stroke-width="4" stroke-linecap="round"/><rect x="15" y="13" width="14" height="12" rx="3" fill="' + c + '"' + OUT + '/>' +
        '<circle cx="22" cy="8.5" r="5.5" fill="' + d + '"' + OUT + '/><path d="M15 8.5a7 7 0 0 1 14 0h2v2H13v-2z" fill="' + c + '"' + OUT + '/><path d="M3 16l19 3" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>';
    },
    apc: function (c, d) {
      return '<path d="M4 22l3-10h23l8 4v6z" fill="' + c + '"' + OUT + '/><rect x="14" y="6" width="10" height="6" rx="1.5" fill="' + d + '"' + OUT + '/><path d="M14 9H5" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round"/>' + wheels([[12, 24], [31, 24]], 4.8, d);
    },
    bomber: function (c, d) {
      return '<path d="M1 14q5-5 19-5h18l5-6v11l-7 4H12q-8 0-11-4z" fill="' + c + '"' + OUT + '/><ellipse cx="22" cy="17" rx="12" ry="3.2" fill="' + d + '"' + OUT + '/>' +
        '<circle cx="15" cy="19.5" r="2.6" fill="' + INK + '"/><circle cx="28" cy="19.5" r="2.6" fill="' + INK + '"/><ellipse cx="22" cy="26.5" rx="3.6" ry="1.8" fill="' + INK + '"/><path d="M5 12.5q3-2 7-2v3z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1"/>';
    },
    drone: function (c, d) {
      return '<path d="M15 14L8 10M29 14l7-4M17 19l-2 6M27 19l2 6" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><ellipse cx="8" cy="8.5" rx="7" ry="2.2" fill="#FFFFFF" fill-opacity="0.6"' + OUT + '/><ellipse cx="36" cy="8.5" rx="7" ry="2.2" fill="#FFFFFF" fill-opacity="0.6"' + OUT + '/>' +
        '<rect x="14" y="11" width="16" height="9" rx="3.5" fill="' + c + '"' + OUT + '/><circle cx="22" cy="22" r="2.8" fill="' + d + '"' + OUT + '/>';
    },
    rocket: function (c, d) {
      return '<rect x="15" y="19" width="26" height="5" fill="' + d + '"' + OUT + '/><path d="M3 24v-8l5-4h7v12z" fill="' + c + '"' + OUT + '/><path d="M16 17L37 5l4 6-21 11z" fill="' + c + '"' + OUT + '/><path d="M24 12.5l3.5 5.5M30 9l3.5 5.5" stroke="' + INK + '" stroke-width="1"/>' + wheels([[9, 25], [24, 25], [35, 25]], 3.9, d);
    },
    jeep: function (c, d) {
      return '<path d="M21 10L10 5" stroke="' + INK + '" stroke-width="2.4" stroke-linecap="round"/><path d="M3 23v-7h9l3-6h11l2 6h13v7z" fill="' + c + '"' + OUT + '/><path d="M17 11h8l1 4H15z" fill="' + GLASS + '" stroke="' + INK + '" stroke-width="1"/>' + wheels([[11, 24], [33, 24]], 4.8, d);
    },
    truck: function (c, d) {
      return '<path d="M17 23V11q11-5 23 0v12z" fill="' + c + '"' + OUT + '/><path d="M3 23v-8l5-4h7v12z" fill="' + d + '"' + OUT + '/>' + wheels([[9, 25], [24, 25], [35, 25]], 3.9, d);
    }
  };
  // A unit on its own, for the legend.
  GS.unitIcon = function (kind, color) {
    return '<svg viewBox="-3 0 50 31" aria-hidden="true">' + (KIND[kind] || KIND.infantry)(color, GS.darken(color)) + '</svg>';
  };

  // walk: advancing · thrower: firing at us · sleep: camped · emerge: just dropped in · bubble: white flag up
  function unit(i, card, model, x, y, s, mode) {
    var type = card.type ? model.typeOf[card.type] : null;
    var col = type ? type.color : GS.NONE_COLOR, d = GS.darken(col), kind = type ? type.kind : 'infantry';
    var g = ['<g class="z" data-c="' + i + '"><g transform="translate(' + x + ' ' + y + ')' + (s !== 1 ? ' scale(' + s + ')' : '') + '">'];
    g.push('<rect x="-2" y="-2" width="48" height="60" fill="#FFFFFF" fill-opacity="0"/>');   // easier to hover
    if (mode === 'emerge') g.push('<path d="M3-3Q22-27 41-3z" fill="#F3F0E6"' + OUT + '/><path d="M3-3l13 9M41-3L28 6M22-15V4" stroke="' + INK + '" stroke-width="1" fill="none"/>');
    if (!card.members.length && !card.ghost) g.push('<ellipse cx="22" cy="39" rx="22" ry="11.5" fill="none" stroke="#D21F3C" stroke-width="2" stroke-dasharray="4 3"/>');
    g.push((mode === 'sleep' ? '<g opacity="0.7">' : '<g>') + (KIND[kind] || KIND.infantry)(col, d) + '</g>');
    if (mode === 'sleep') g.push('<text x="36" y="4" font-size="13" font-weight="700" fill="#34507A">z</text>');
    if (mode === 'thrower') g.push('<path d="M0 11l-8-4 5 4-6 2 6 2-4 5 7-5z" fill="#FFB020" stroke="' + INK + '" stroke-width="1" stroke-linejoin="round"/>');
    if (mode === 'bubble') g.push('<path d="M40 30V5" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/><path d="M40 5H28v8h12z" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>');
    g.push('<rect x="8" y="32" width="28" height="14" rx="3" fill="#FFFFFF" stroke="' + INK + '" stroke-width="1.2"/>');
    if (type) {
      var b = type.badge;
      g.push('<text x="22" y="43" font-size="' + (b.length > 3 ? 8.5 : 10.5) + '" font-weight="700" text-anchor="middle" fill="' + INK + '">' + esc(b) + '</text>');
    }
    if (card.state) {
      g.push('<path d="' + (mode === 'bubble' ? 'M4 30V14l9 4-9 4' : 'M41 30V14l-9 4 9 4') + '" fill="' + (card.state === 'over' ? '#D21F3C' : '#F26A1B') + '" stroke="' + INK + '" stroke-width="1.2" stroke-linejoin="round"/>');
    }
    var n = Math.min(card.members.length, 5);
    card.members.slice(0, 5).forEach(function (id, k) {
      var m = model.memberOf[id];
      g.push('<circle cx="' + (22 + (k - (n - 1) / 2) * 8.5).toFixed(1) + '" cy="53" r="3.6" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/>');
    });
    g.push('</g></g>');
    return g.join('');
  }

  /* ---------- drawing: the defenders' guns (five original designs, pointing at the enemy) ---------- */
  var STEEL = '#4A5A52', STEEL2 = '#33413B', OLIVE = '#5F6E4B', WOOD = '#6B4A2B';
  var BAGS = [[22, 96], [48, 96], [74, 96], [35, 85], [61, 85]].map(function (p) {
    return '<rect x="' + p[0] + '" y="' + p[1] + '" width="26" height="12" rx="6" fill="#CDB98F"' + OUT + '/>';
  }).join('');
  function spokes(cx, cy, r) {
    return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="2"/><path d="M' + (cx - r) + ' ' + cy + 'h' + (2 * r) + 'M' + cx + ' ' + (cy - r) + 'v' + (2 * r) + '" stroke="' + INK + '" stroke-width="1.4"/><circle cx="' + cx + '" cy="' + cy + '" r="3" fill="' + INK + '"/>';
  }
  var ART = [
    // field cannon
    '<path d="M46 72L22 86" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/><path d="M42 57l58-27 4 9-56 29z" fill="' + STEEL + '"' + OUT + '/><circle cx="45" cy="63" r="9" fill="' + STEEL2 + '"' + OUT + '/>' + spokes(54, 72, 15),
    // howitzer with gun shield
    '<path d="M46 60l38-40 10 9-36 42z" fill="' + OLIVE + '"' + OUT + '/><path d="M52 40l24 22-7 7-24-22z" fill="#8A9A72"' + OUT + '/>' + spokes(50, 74, 13),
    // twin anti-aircraft gun
    '<path d="M60 80L40 94M60 80l20 14M60 80V66" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><path d="M50 60l38-46 4 4-36 46z" fill="' + STEEL2 + '"' + OUT + '/><path d="M59 66l38-46 4 4-36 46z" fill="' + STEEL + '"' + OUT + '/><circle cx="58" cy="68" r="10" fill="' + STEEL + '"' + OUT + '/><circle cx="46" cy="50" r="6" fill="none"' + OUT + '/>',
    // mortar
    '<ellipse cx="50" cy="84" rx="17" ry="5" fill="' + STEEL2 + '"' + OUT + '/><path d="M72 40l16 44M72 40l24 38" stroke="' + INK + '" stroke-width="2.6" stroke-linecap="round" fill="none"/><path d="M46 82l24-56 10 4-22 56z" fill="' + STEEL + '"' + OUT + '/><ellipse cx="84" cy="18" rx="5" ry="3" transform="rotate(-66 84 18)" fill="' + INK + '"/>',
    // rocket battery
    '<path d="M40 68l48-30 11 17-48 30z" fill="' + OLIVE + '"' + OUT + '/><path d="M52 61l10 16M64 53l10 16M76 46l10 16" stroke="' + INK + '" stroke-width="1.2"/><path d="M88 38l11 17" stroke="' + INK + '" stroke-width="4" stroke-linecap="round"/><rect x="50" y="76" width="24" height="9" fill="' + STEEL2 + '"' + OUT + '/>' + wheels([[48, 86], [76, 86]], 6.5, '#8A9A72')
  ];
  // A medal: two ribbon tails and a gold disc. Drawn at 0,0; about 26 wide and 34 tall.
  var MEDAL = '<path d="M-9-17h7l3 9h-7z" fill="#C8453B"' + OUT + '/><path d="M9-17h-7l-3 9h7z" fill="#2F5DA8"' + OUT + '/><circle r="12" cy="3" fill="#F5C542" stroke="#8A6A12" stroke-width="2"/><circle r="8.2" cy="3" fill="none" stroke="#FFF3C4" stroke-width="1.4"/>';
  var CROWN = '<path d="M-15 8V-6l8 7 7-11 7 11 8-7V8z" fill="#F5C542" stroke="#8A6A12" stroke-width="2" stroke-linejoin="round"/><circle cx="-15" cy="-7" r="2.4" fill="#C8453B"/><circle cy="-11" r="2.4" fill="#C8453B"/><circle cx="15" cy="-7" r="2.4" fill="#C8453B"/>';
  GS.medalIcon = function () { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-14 -19 28 36" width="14" height="18" aria-hidden="true">' + MEDAL + '</svg>'; };
  GS.crownIcon = function () { return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-19 -15 38 26" width="19" height="13" aria-hidden="true">' + CROWN + '</svg>'; };

  function gun(m, x, y, medals, top) {
    var label = m.short + ' · ' + tr('front', m.front);
    var extra = '';
    if (medals) {
      extra += '<g class="medal" transform="translate(102 84) scale(1.3)">' + MEDAL + '<text y="7.5" font-size="' + (medals > 99 ? 9.5 : 12) + '" font-weight="700" text-anchor="middle" fill="#3B2A05">' + (medals > 999 ? '999+' : medals) + '</text></g>';
      if (top) extra += '<g class="crown" transform="translate(62 6)">' + CROWN + '</g>';
    }
    return '<g class="p' + (top && medals ? ' top' : '') + '" data-m="' + esc(m.id) + '" tabindex="0" role="button" aria-label="' + esc(m.name + ', ' + tr('front', m.front) + (medals ? ', ' + tr('medals_n', medals) : '')) + '" transform="translate(' + x + ' ' + y + ')">' +
      '<rect x="0" y="-4" width="124" height="146" fill="#FFFFFF" fill-opacity="0"/>' +
      // the crew's pennant carries the member's colour
      '<path d="M26 96V26" stroke="' + INK + '" stroke-width="2" stroke-linecap="round"/><path d="M26 27h20l-6 7 6 7H26z" fill="' + m.color + '"' + OUT + '/>' +
      ART[m.design] + BAGS +
      '<circle cx="106" cy="34" r="5" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/><circle cx="117" cy="28" r="3.8" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.3"/>' +
      '<rect class="tag" x="2" y="114" width="118" height="23" rx="11.5" fill="' + m.color + '" stroke="#FFFFFF" stroke-width="1.5"/>' +
      '<text x="61" y="130.5" font-size="12.5" font-weight="700" text-anchor="middle" fill="#FFFFFF">' + esc(cut(label, 17)) + '</text>' + extra + '</g>';
  }

  /* ---------- the scene ---------- */
  // opts.caps (zone → card count) sizes the map for the busiest moment of a replay so it does not jump between
  // frames; opts.plantIds keeps the same guns in the same emplacements.
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
      return unit(cards.length - 1, card, model, x, y, s, mode);
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

    // incoming fire from the units that are shelling headquarters
    if (zx.t && zones.t.length) {
      var tx = zx.t.x + zx.t.w / 2;
      [[-50, -70], [0, -110], [50, -40]].forEach(function (a) {
        S.push('<path d="M' + (tx + a[0]) + ' 150Q' + Math.round((tx + a[0] + 120) / 2) + ' ' + a[1] + ' 120 150" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-dasharray="7 6" stroke-opacity="0.55"/>');
      });
      [[0.78, 26, -8], [0.56, 22, -2], [0.36, 34, 10], [0.9, 44, -18]].slice(0, Math.min(4, zones.t.length)).forEach(function (p) {
        S.push('<g transform="translate(' + Math.round(120 + (tx - 120) * p[0]) + ' ' + p[1] + ') rotate(' + p[2] + ')"><path d="M-12 0q6-6 16-6h6v12h-6q-10 0-16-6z" fill="#F3F0E6"' + OUT + '/><path d="M10-6l6-4v20l-6-4z" fill="#C8453B"' + OUT + '/></g>');
      });
    }

    // headquarters: a small fort with a flag
    var wallTop = 200, wallH = H - wallTop - 40;
    S.push('<path d="M102 178V92" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><path d="M102 94h48l-11 13 11 13h-48z" fill="#C8453B"' + OUT + '/>');
    [14, 53, 92, 131, 170].forEach(function (bx) { S.push('<rect x="' + bx + '" y="' + (wallTop - 22) + '" width="20" height="24" fill="#D9D2C3" stroke="' + INK + '" stroke-width="3"/>'); });
    S.push('<rect x="14" y="' + wallTop + '" width="176" height="' + wallH + '" fill="#D9D2C3" stroke="' + INK + '" stroke-width="3"/>');
    for (var by = wallTop + 40; by < wallTop + wallH - 20; by += 40) S.push('<path d="M14 ' + by + 'h176" stroke="' + INK + '" stroke-width="1" stroke-opacity="0.25"/>');
    [wallTop + 56, wallTop + 176].forEach(function (wy) {
      if (wy + 40 > H - 220) return;
      [44, 96, 148].forEach(function (wx) { S.push('<rect x="' + wx + '" y="' + wy + '" width="12" height="40" rx="6" fill="' + INK + '"/>'); });
    });
    S.push('<path d="M64 ' + (H - 40) + 'v-96a38 38 0 0 1 76 0v96z" fill="' + WOOD + '" stroke="' + INK + '" stroke-width="3"/><path d="M102 ' + (H - 172) + 'v132" stroke="' + INK + '" stroke-width="2"/>');
    S.push('<path d="M200 150V' + (H - 8) + '" stroke="#FFFFFF" stroke-width="5" stroke-dasharray="3 13" stroke-linecap="round"/>');

    // zone signs
    shown.forEach(function (z) {
      var w = zx[z].w - 16, sub = model.listsIn[z].join(' · ');
      S.push('<g transform="translate(' + (zx[z].x + 8) + ' 76)"><title>' + esc(tr('zd_' + z) + (sub ? ' — ' + sub : '')) + '</title>' +
        '<rect width="' + w + '" height="62" rx="5" fill="#6B4A2B" stroke="' + INK + '" stroke-width="2"/>' +
        '<text x="11" y="27" font-size="20" font-weight="700" fill="#FFFFFF">' + esc(cut(tr('z_' + z), (w - 58) / 9.8)) + '</text>' +
        '<text x="' + (w - 11) + '" y="29" font-size="25" font-weight="700" text-anchor="end" fill="#F7D774">' + zones[z].length + '</text>' +
        '<text x="11" y="49" font-size="12" fill="#F3E9D6">' + esc(cut(sub, (w - 22) / 6.4)) + '</text></g>');
    });

    // enemy units on the field
    shown.forEach(function (z) {
      var L = zones[z], bx = zx[z].x + 13;
      L.forEach(function (card, i) {
        var col, row;
        if (z === 'd') { col = Math.floor(i / rowsD); row = i % rowsD; S.push(put(card, bx + col * DW + jit(i, 1), TOP - 6 + row * DH + jit(i, 2), 0.8, 'sleep')); }
        else if (z === 'e') { col = Math.floor(i / rowsE); row = i % rowsE; S.push(put(card, bx + col * CW + 6, TOP + 20 + row * EH, 0.9, 'emerge')); }
        else { col = Math.floor(i / R); row = i % R; S.push(put(card, bx + col * CW + jit(i, 1), TOP + row * CH + (col % 2 ? 6 : 0) + jit(i, 2), 1, z === 't' ? 'thrower' : 'walk')); }
      });
    });

    // the defenders' guns
    var spacing = Math.min(150, (H - 160) / perCol);
    plants.forEach(function (m, i) {
      var col = Math.floor(i / perCol), row = i % perCol;
      var px = 206 + col * 130, py = 152 + row * spacing;
      plantPos[m.id] = { x: px + 110, y: py + 32 };
      S.push(gun(m, px, py, opts.medals ? opts.medals[m.id] || 0 : 0, !!(opts.top && opts.top[m.id])));
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
    S.push('<g id="gs-lines"></g><g id="gs-fx"></g>');
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
    var lastOld = {};                                            // where each card was drawn in the previous frame
    var FORT = { x: 150, y: 106 };                               // shots by someone without a gun on the map leave from the flag

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
      if (rp && GS.FIELD.indexOf(c.zone) === -1) {
        var kx = lastKill(c.id, rp.times[rp.k]);
        if (kx && kx.by.length) rows.push(h('div', { class: 'tip-row' }, [h('span', { text: tr('tip_killed') }), namesOf(kx.by) + ' · ' + fmtDate(kx.t)]));
      }
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
      var score = rp ? scoreAt(rp.k) : null;
      var head = h('tr', null, [h('th', { text: tr('tb_gun') })].concat(cols.map(function (z) { return h('th', { class: 'num', text: tr('z_' + z) }); }), [h('th', { class: 'num', text: tr('tb_total') })],
        score ? [h('th', { class: 'num', text: tr('tb_kills') })] : []));
      var line = function (label, color, counts, tot, cls, kills) {
        return h('tr', { class: cls || '' }, [h('td', null, [color ? h('i', { class: 'dot', style: 'background:' + color }) : h('i', { class: 'dot ring' }), label])].concat(
          cols.map(function (z) { var v = counts[z] || 0; return h('td', { class: 'num' + (v ? '' : ' zero'), text: v ? String(v) : '–' }); }),
          [h('td', { class: 'num strong', text: String(tot) })],
          score ? [h('td', { class: 'num strong' + (kills ? '' : ' zero'), text: kills ? String(kills) : '–' })] : []));
      };
      var body = view.members.map(function (m) { return line(m.name, m.color, m.counts, m.total, '', score && score[m.id] ? score[m.id].n : 0); });
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
      lastOld = old;
      var medals = null, top = null;
      if (rp && rp.kills) {
        var sAt = scoreAt(rp.k), best = 0, mid;
        medals = {}; top = {};
        for (mid in sAt) { medals[mid] = sAt[mid].n; if (sAt[mid].n > best) best = sAt[mid].n; }
        for (mid in sAt) if (best && sAt[mid].n === best) top[mid] = true;
      }
      sc = scene(view, rp ? { caps: rp.caps, plantIds: rp.plantIds, medals: medals, top: top } : null);
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
        base = rp.byId[id] || rp.ghost[id];
        cards.push({ id: id, name: rp.hist.names[id] || '', idList: st[id], labels: base ? base.labels : [], members: base ? base.members : [], due: null, dueComplete: true, ghost: !base });
      }
      return GS.buildModel(lists, cards, cfg, rp.times[k], live);
    }
    // A unit is destroyed when its card leaves the field (to Truce, Spoils, a hidden list, or off the board).
    // Credit goes to the members assigned to the card; if nobody is assigned, to whoever moved it.
    function onField(list) { return !!list && GS.FIELD.indexOf(live.zoneOf[list]) !== -1; }
    function buildKills() {
      var kills = [], people = {};
      rp.hist.events.forEach(function (e) {
        if (!onField(e.from) || onField(e.to)) return;
        var base = rp.byId[e.id] || rp.ghost[e.id], by = [], via = '';
        ((base && base.members) || []).forEach(function (m) {
          if (!m || !m.id || by.indexOf(m.id) !== -1) return;
          by.push(m.id);
          if (!people[m.id]) people[m.id] = String(m.fullName || m.username || m.initials || '?').trim();
        });
        if (!by.length && e.by && e.by.id) { by = [e.by.id]; via = 'actor'; if (!people[e.by.id]) people[e.by.id] = e.by.name; }
        kills.push({ t: e.t, id: e.id, by: by, via: via });
      });
      rp.kills = kills; rp.people = people;
    }
    function shortName(id) {
      var m = live.memberOf[id];
      return m ? m.short : String(rp.people[id] || '?').split(/\s+/)[0].slice(0, 12);
    }
    function namesOf(ids) { return ids.map(shortName).join(' + '); }
    function colorOf(id) { var m = (view && view.memberOf[id]) || live.memberOf[id]; return m && m.color ? m.color : '#5E6C84'; }
    function lastKill(id, T) {
      var found = null;
      rp.kills.forEach(function (x) { if (x.id === id && x.t <= T) found = x; });
      return found;
    }
    function scoreAt(k) {
      var T = rp.times[k], s = {};
      rp.kills.forEach(function (x) {
        if (x.t > T) return;
        x.by.forEach(function (id) { var r = s[id] || (s[id] = { id: id, n: 0, joint: 0 }); r.n++; if (x.by.length > 1) r.joint++; });
      });
      return s;
    }
    // The shot itself: a tracer from each credited gun to where the unit stood, a burst, and the gunners' names.
    function fireFx(k, ms) {
      var layer = svg && svg.querySelector('#gs-fx');
      if (!layer || !sc) return;
      var from = k ? rp.times[k - 1] : -Infinity, to = rp.times[k], out = [], shown = 0;
      rp.kills.forEach(function (x) {
        if (x.t <= from || x.t > to) return;
        var at = lastOld[x.id];
        if (!at || shown >= 14) return;
        shown++;
        var X = Math.round(at.x), Y = Math.round(at.y);
        x.by.forEach(function (id) {
          var p = sc.plantPos[id] || FORT;
          out.push('<path d="M' + p.x + ' ' + p.y + 'L' + X + ' ' + Y + '" fill="none" stroke="' + colorOf(id) + '" stroke-width="3.5" stroke-linecap="round"/>');
        });
        out.push('<g transform="translate(' + X + ' ' + Y + ')"><path d="M0-24L6-9 21-13 12 0 21 13 6 9 0 24-6 9-21 13-12 0-21-13-6-9z" fill="#F5C542" stroke="#C8453B" stroke-width="2.5" stroke-linejoin="round"/><circle r="6" fill="#FFF3C4"/></g>');
        if (shown <= 8 && x.by.length) out.push('<text x="' + X + '" y="' + (Y - 30) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#1F2A24" stroke="#FFFFFF" stroke-width="4" stroke-linejoin="round" paint-order="stroke">' + esc(namesOf(x.by)) + '</text>');
      });
      if (!out.length) return;
      layer.innerHTML = out.join('');
      if (!STILL && layer.animate) layer.animate([{ opacity: 1 }, { opacity: 1, offset: 0.65 }, { opacity: 0 }], { duration: Math.max(500, ms), fill: 'forwards' });
    }
    function stepSummary(k) {
      var from = k ? rp.times[k - 1] : -Infinity, to = rp.times[k], zoneOf = live.zoneOf;
      var arrived = 0, moved = 0, lines = [];
      var kills = rp.kills.filter(function (x) { return x.t > from && x.t <= to; });
      rp.hist.events.forEach(function (e) {
        if (e.t <= from || e.t > to) return;
        var a = onField(e.from), b = onField(e.to);
        if (!b) return;                                   // leaving the field is a kill, listed separately
        if (a && zoneOf[e.from] === zoneOf[e.to]) return;
        if (!a) arrived++; else moved++;
        if (lines.length < 3) lines.push((rp.hist.names[e.id] || '?') + ': ' + (a ? tr('z_' + zoneOf[e.from]) : tr('rp_new')) + ' → ' + tr('z_' + zoneOf[e.to]));
      });
      return { text: arrived + moved + kills.length ? tr('rp_step', arrived, moved, kills.length) : tr('rp_quiet'), kills: kills, lines: lines };
    }
    function killLine(x) {
      var name = rp.hist.names[x.id] || '?';
      var text = !x.by.length ? tr('rp_kill_unknown', name) : tr(x.via === 'actor' ? 'rp_kill_actor' : 'rp_kill', namesOf(x.by), name);
      return h('div', { class: 'rp-kill' }, x.by.map(function (id) { return h('i', { class: 'dot', style: 'background:' + colorOf(id) }); }).concat([h('span', { text: text })]));
    }
    function fillScore() {
      if (!rpUi) return;
      var s = scoreAt(rp.k), rows = Object.keys(s).map(function (id) { return s[id]; });
      rows.sort(function (a, b) { return b.n - a.n || (shortName(a.id) < shortName(b.id) ? -1 : 1); });
      var best = rows.length ? rows[0].n : 0;
      var ico = function (html) { var el = h('span', { class: 'ico' }); el.innerHTML = html; return el; };
      GS.fill(rpUi.score, [ico(GS.medalIcon()), h('span', { class: 'legend-title', text: tr('rp_score') })].concat(rows.length
        ? rows.map(function (r) {
          var lead = r.n === best;
          return h('span', { class: 'score' + (lead ? ' top' : ''), title: (lead ? tr('rp_top') + ' · ' : '') + tr('rp_score_tip', r.n, r.joint) },
            [lead ? ico(GS.crownIcon()) : null, h('i', { class: 'dot', style: 'background:' + colorOf(r.id) }), h('span', { text: shortName(r.id) }), h('b', { text: String(r.n) })]);
        })
        : [h('span', { class: 'muted', text: tr('rp_score_none') })]));
    }
    function showFrame(k, animate) {
      rp.k = Math.max(0, Math.min(rp.times.length - 1, k));
      view = modelAt(rp.k);
      var ms = Math.round(rp.frameMs * 0.85);
      paint(animate, ms);
      if (animate) fireFx(rp.k, ms);
      fillTiles(); fillTable();
      if (rpUi) {
        rpUi.slider.value = String(rp.k);
        rpUi.slider.setAttribute('aria-valuetext', fmtDate(rp.times[rp.k], rp.stepMs < DAY));
        rpUi.when.textContent = fmtDate(rp.times[rp.k], rp.stepMs < DAY);
        var sum = stepSummary(rp.k);
        rpUi.step.textContent = sum.text;
        var shownKills = sum.kills.slice(0, 6);
        GS.fill(rpUi.log, shownKills.map(killLine)
          .concat(sum.kills.length > shownKills.length ? [h('div', { text: tr('rp_more', sum.kills.length - shownKills.length) })] : [])
          .concat(sum.lines.map(function (l) { return h('div', { text: l }); })));
        fillScore();
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
        // cards that are no longer open on the board: fetch their labels and members, most recent first
        var gone = [], seenGone = {};
        for (var gi = hist.events.length - 1; gi >= 0; gi--) {
          var gid = hist.events[gi].id;
          if (!byId[gid] && !seenGone[gid]) { seenGone[gid] = 1; gone.push(gid); }
        }
        return GS.fetchCards(t, gone).then(function (ghost) {
        rp = { days: days, hist: hist, times: times, stepMs: stepMs, k: 0, playing: false, speed: rp ? rp.speed : 1, byId: byId, ghost: ghost || {}, caps: {}, plantIds: null, truncatedAt: res.truncated ? start : null, empty: !hist.events.length };
        rp.frameMs = 800 / rp.speed;
        buildKills();
        // size the map for the busiest moment, and keep every gun that ever had a card on the field
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
        });
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
          h('span', { class: 'muted small' }, [h('a', { class: 'link', href: './privacy', target: '_blank', rel: 'noopener', text: tr('privacy') })]),
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
      var when = h('div', { class: 'rp-when' }), step = h('div', { class: 'rp-step' }), log = h('div', { class: 'rp-log small' });
      var scoreBox = h('div', { class: 'rp-score', id: 'gs-rp-score' });
      rpUi = { play: play, slider: slider, when: when, step: step, log: log, score: scoreBox };
      if (rp.empty) { play.disabled = true; slider.disabled = true; }
      return h('div', { class: 'panel replay' }, [
        h('div', { class: 'rp-row' }, [play, slider, when]),
        h('div', { class: 'rp-row' }, [range, speed, step, h('span', { class: 'grow' })]),
        scoreBox,
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
        var icon = function (kind, color) { var el = h('span', { class: 'ico' }); el.innerHTML = GS.unitIcon(kind, color); return el; };
        var chips = live.types.filter(function (x) { return x.top; }).map(function (x) {
          var many = x.variants && x.variants.length > 1;
          return h('button', { class: 'chip', type: 'button', 'data-t': x.key, 'aria-pressed': 'false', title: many ? x.variants.join(', ') : null, onclick: function () { toggle('type', x.key); } },
            [icon(x.kind, x.color), h('span', { text: (x.badge !== x.name ? x.badge + ' · ' : '') + (many ? tr('lg_more', cut(x.name || '?', 22), x.variants.length - 1) : cut(x.name || '?', 26)) }), h('b', { text: String(x.count) })]);
        });
        var extra = function (id, color, text, n) {
          return h('button', { class: 'chip', type: 'button', 'data-t': id, 'aria-pressed': 'false', onclick: function () { toggle('type', id); } }, [icon(id === '__other' ? 'truck' : 'infantry', color), h('span', { text: text }), h('b', { text: String(n) })]);
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
