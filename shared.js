/* Siege Line — shared logic: interface strings, settings, zones, the board model, DOM helpers, demo data.
 * Where data lives:
 *   board  t.set('board', 'shared', 'cfg', {...})   language, "due soon" window, list → zone mapping
 * Nothing is stored on cards and nothing leaves the browser.
 */
(function (root) {
  'use strict';
  var GS = root.GS = {};
  GS.VERSION = '1.3.4';
  GS.CFG_KEY = 'cfg';
  // The Power-Up's public API key (Power-Up admin → Authorization → Trello Auth). Replay is hidden while this is empty.
  GS.APP_KEY = '8bd2d0ae948399044c39bb325ead5baf';   // public client-side key of this Power-Up (not the secret)
  GS.APP_NAME = 'Siege Line';
  GS.appOpts = function () { return GS.APP_KEY ? { appKey: GS.APP_KEY, appName: GS.APP_NAME } : undefined; };

  /* ---------- interface strings (English + 简体中文) ---------- */
  var STR = { en: {}, zh: {} };
  function add(key, en, zh) { STR.en[key] = en; STR.zh[key] = zh; }

  add('name', 'Siege Line', '防线保卫战');
  add('btn_map', 'Battle map', '战况图');
  add('title_map', 'Siege Line — battle map', '防线保卫战 · 战况图');
  add('title_set', 'Siege Line settings', '防线保卫战 · 设置');
  add('title_wel', 'Welcome to Siege Line', '欢迎使用防线保卫战');

  add('z_g', 'At the walls', '兵临城下');
  add('z_t', 'Shelling', '炮击中');
  add('z_a', 'Advancing', '逼近中');
  add('z_m', 'Midfield', '中场');
  add('z_d', 'Camped', '扎营');
  add('z_e', 'Inbound', '刚空降');
  add('z_b', 'Truce', '停火等结果');
  add('z_c', 'Spoils', '战利品');
  add('z_x', 'Hidden', '不显示');
  add('zd_g', 'Closest to headquarters: work on these first', '离指挥部最近：最先处理');
  add('zd_t', 'Someone is waiting on you and has opened fire', '对方在等你回应，已经开火');
  add('zd_a', 'Queued and getting closer', '已排队，正在靠近');
  add('zd_m', 'In progress, some way off', '进行中，还有一段距离');
  add('zd_d', 'On hold: camped, not attacking for now', '搁置中：原地扎营，暂时不进攻');
  add('zd_e', 'Leads and ideas just parachuting in', '线索和想法，刚刚空降');
  add('zd_b', 'Your part is done: white flag up, waiting for an outcome', '你这边已做完：举白旗，等结果');
  add('zd_c', 'Finished work with money still to collect', '已完成，还有钱要收');
  add('zd_x', 'Left off the map', '不画在图上');

  add('st_field', 'Enemy units on the field', '场上敌军');
  add('st_gate', 'At the walls', '兵临城下');
  add('st_throw', 'Shelling us', '正在炮击');
  add('st_soon', 'Front lines due in {0} days', '前两线 {0} 天内到期');
  add('st_soon_1', 'Front lines due in 1 day', '前两线 1 天内到期');
  add('st_over', 'Overdue on the field', '场上已逾期');
  add('st_bub', 'Awaiting outcome', '等结果');
  add('st_coin', 'Spoils to collect', '待收战利品');
  add('st_ung', 'Unguarded', '无人防守');

  add('lg_types', 'Unit types (first label)', '兵种（按第一个标签）');
  add('lg_more', '{0} and {1} more', '{0} 等 {1} 个标签');
  add('lg_other', 'Other labels', '其他标签');
  add('lg_none', 'No label', '无标签');
  add('lg_soon', 'Due soon', '即将到期');
  add('lg_over', 'Overdue', '已逾期');
  add('lg_pips', 'Dots under a unit = guns firing at it', '下方圆点 = 正在开火的火炮');
  add('lg_ung', 'Dashed ring = nobody assigned', '虚线圈 = 无人负责');
  add('lg_click', 'Click a unit to open its card. Click a gun or a type to highlight.', '点敌军打开卡片；点火炮或兵种可高亮。');

  add('tb_title', 'Firepower', '火力分配');
  add('tb_sub', 'Cards per member in each zone. A card can have several members.', '每位成员在各区域名下的卡片数；一张卡可有多位成员。');
  add('tb_gun', 'Gun', '火炮');
  add('tb_total', 'Total', '合计');
  add('front', 'front {0}', '前线 {0}');

  add('tip_list', 'List', '所在列');
  add('tip_labels', 'Labels', '标签');
  add('tip_plants', 'Guns', '火炮');
  add('tip_due', 'Due', '到期');
  add('tip_none', 'nobody', '无人');
  add('refresh', 'Refresh', '刷新');
  add('zones_btn', 'Set up zones', '设置区域');
  add('empty', 'No cards to show. Add cards to the board, or map your lists to zones.', '没有可显示的卡片。请在看板上添加卡片，或把列对应到区域。');
  add('guessed', 'Zones were guessed from your list names. Open "Set up zones" to choose them yourself.', '区域是按列名猜的。点"设置区域"可以自己指定。');
  add('demo', 'Demo mode: fictional board. Inside Trello this shows your own board.', '演示模式：虚构看板。在 Trello 里会显示你自己的看板。');
  add('load_err', 'Could not read the board. Close this window and try again.', '读取看板失败。请关闭窗口后重试。');

  add('rp_btn', 'Replay', '回放');
  add('rp_exit', 'Back to now', '回到现在');
  add('rp_play', 'Play', '播放');
  add('rp_pause', 'Pause', '暂停');
  add('rp_range', 'Period', '时间段');
  add('rp_d7', 'Last 7 days', '最近 7 天');
  add('rp_d30', 'Last 30 days', '最近 30 天');
  add('rp_d90', 'Last 90 days', '最近 90 天');
  add('rp_speed', 'Speed', '速度');
  add('rp_pos', 'Position in time', '时间位置');
  add('rp_loading', 'Reading the board history… {0} events', '正在读取看板历史… {0} 条');
  add('rp_none', 'No cards were created, moved or archived in this period.', '这段时间内没有卡片被新建、移动或归档。');
  add('rp_trunc', 'This board has a long history; the replay starts at {0}.', '这块看板的历史很长，回放从 {0} 开始。');
  add('rp_step', '+{0} arrived · {1} moved · {2} destroyed', '+{0} 出现 · {1} 移动 · {2} 被消灭');
  add('rp_kill', '{0} destroyed {1}', '{0} 消灭了 {1}');
  add('rp_kill_actor', '{0} destroyed {1} (nobody assigned; credited to whoever moved it)', '{0} 消灭了 {1}（无人负责，记给移动卡片的人）');
  add('rp_kill_unknown', 'Destroyed, gunner unknown: {0}', '被消灭（不知道是谁）：{0}');
  add('rp_more', '…and {0} more', '…另有 {0} 条');
  add('rp_score', 'Medals so far', '奖章榜');
  add('rp_top', 'Top gun', '头号大炮');
  add('medals_n', '{0} medals', '{0} 枚奖章');
  add('medals_n_1', '{0} medal', '{0} 枚奖章');
  add('rp_score_none', 'no medals yet', '还没有人获得奖章');
  add('rp_score_tip', '{0} medals, one for each unit destroyed; {1} of them shared', '{0} 枚奖章，每消灭一个敌人得一枚；其中 {1} 枚是合力');
  add('tb_kills', 'Medals', '奖章');
  add('tip_killed', 'Destroyed by', '消灭者');
  add('rp_quiet', 'Nothing moved', '没有变化');
  add('rp_gone', 'off the map', '离场');
  add('rp_new', 'new', '新出现');
  add('rp_note', 'A unit is destroyed when its card leaves the field: to Truce, Spoils, a hidden list or the archive. Each unit destroyed earns one medal for every member assigned to the card; if nobody is assigned, the medal goes to whoever moved it. The gun with the most medals wears the crown. Labels and members are shown as they are today.', '卡片离开战场（进入停火、战利品、隐藏的列，或被归档）即算被消灭。每消灭一个敌人，卡片上的每位负责成员各得一枚奖章；无人负责时，奖章给移动卡片的人。奖章最多的大炮戴皇冠。标签和成员按今天的状态显示。');
  add('rp_err', 'Could not read the board history. Try again, or reconnect in Settings.', '读取看板历史失败。请重试，或在设置里重新授权。');
  add('au_title', 'Allow Siege Line to read this board\'s history', '允许防线保卫战读取本看板的历史');
  add('au_body', 'Replay rebuilds past positions from Trello\'s activity history (cards created, moved and archived). Trello will ask you to allow read-only access for your account. Siege Line reads only this board\'s history, in your browser, and sends it nowhere.', '回放要用 Trello 的活动记录（卡片新建、移动、归档）来还原过去的位置。Trello 会请你为自己的账号授予只读权限。防线保卫战只在你的浏览器里读取本看板的历史，不会发送到任何地方。');
  add('au_ok', 'Allow read access', '授予只读权限');
  add('au_denied', 'Access was not granted. Replay stays off; the battle map works without it.', '没有获得授权。回放不可用，战况图本身不受影响。');
  add('au_done', 'Connected. You can close this window.', '已授权，可以关闭这个窗口。');
  add('au_state', 'History access for replay', '回放所需的历史读取权限');
  add('au_on', 'Connected for your account', '你的账号已授权');
  add('au_off', 'Not connected', '未授权');
  add('au_disconnect', 'Disconnect', '取消授权');
  add('title_auth', 'Siege Line — history access', '防线保卫战 · 历史读取授权');

  add('set_lang', 'Language', '语言');
  add('set_auto', 'Automatic', '自动');
  add('set_soon', 'Flag cards due within (days)', '到期提醒窗口（天）');
  add('set_zones', 'Which zone is each list?', '每一列对应哪个区域？');
  add('set_zones_hint', 'Zones run from headquarters outwards. Lists you have not set are guessed from their names.', '区域由近到远排列。没有设置的列按列名猜测。');
  add('set_suggest', 'Use suggestions', '恢复建议值');
  add('set_save', 'Save', '保存');
  add('set_saved', 'Saved', '已保存');
  add('set_ro', 'Only board members who can edit the board can change these settings.', '只有可编辑看板的成员才能修改设置。');
  add('set_big', 'Too many lists to store. Hide some lists you do not need.', '列太多，超出存储上限。请把不需要的列设为不显示。');
  add('cancel', 'Cancel', '取消');
  add('privacy', 'Privacy', '隐私政策');
  add('support', 'Help & support', '帮助与支持');

  add('wel_intro', 'Siege Line turns this board into a battle map. Every card is an enemy unit advancing on your headquarters, and every board member is a gun defending it.', '防线保卫战把这块看板画成一张战况图：每张卡片是一支向指挥部推进的敌军，每位看板成员是一门守卫的火炮。');
  add('wel_1', 'Click "Battle map" at the top of the board (it may sit inside the board\'s Power-Ups menu).', '点看板顶部的"战况图"（也可能收在看板的 Power-Ups 菜单里）。');
  add('wel_2', 'Open "Set up zones" and say which list is at the gate, which is on hold, and so on. Until you do, zones are guessed from list names.', '打开"设置区域"，指定哪一列在门口、哪一列搁置等。没设置之前按列名猜测。');
  add('wel_3', 'A unit\'s kind, colour and badge come from the card\'s first label: tanks, jets, helicopters, infantry and more. The dots under it are the members assigned to the card.', '敌军的兵种、颜色和番号牌来自卡片的第一个标签：坦克、战机、直升机、步兵等。下方的圆点是卡片上的成员。');
  add('wel_4', 'Click "Replay" to watch the last weeks play back. The first time, Trello asks you to allow read-only access to the board\'s history.', '点"回放"可以把过去几周重新播放一遍。第一次使用时 Trello 会请你授予看板历史的只读权限。');
  add('wel_data', 'Siege Line only reads this board in your browser. It saves your zone choices on the board and nothing else. No account, no server, no tracking.', '防线保卫战只在你的浏览器里读取本看板，除了区域设置外不保存任何内容。无需账号，没有服务器，不做追踪。');
  add('wel_ok', 'Got it', '知道了');

  GS.lang = 'en';
  GS.detectLang = function () {
    var l = String(root.locale || (root.navigator && root.navigator.language) || 'en').toLowerCase();
    return l.indexOf('zh') === 0 ? 'zh' : 'en';
  };
  GS.tr = function (key) {
    var args = Array.prototype.slice.call(arguments, 1);
    var table = STR[GS.lang] || STR.en;
    var s = (args.length && Number(args[0]) === 1 && table[key + '_1'] !== undefined) ? table[key + '_1'] : table[key];
    if (s === undefined) s = STR.en[key] !== undefined ? STR.en[key] : key;
    return s.replace(/\{(\d+)\}/g, function (m, i) { return args[i] !== undefined ? String(args[i]) : ''; });
  };

  /* ---------- zones ---------- */
  // Field zones run from the house outwards; "b" and "c" sit below the field; "x" is left off the map.
  GS.FIELD = ['g', 't', 'a', 'm', 'd', 'e'];
  GS.FRONT = ['g', 't', 'a', 'm'];
  GS.ZONES = ['g', 't', 'a', 'm', 'd', 'e', 'b', 'c', 'x'];

  // English keywords are matched as whole words; Chinese keywords anywhere in the name.
  var GUESS = [
    ['x', /\b(done|complete|completed|closed|archive|archived|shipped|released)\b|已完成|已经完成|归档|已结束|已放弃/i],
    ['c', /\b(invoice|invoices|invoicing|payment|payments|paid|billing|commission|receivable|receivables|collect)\b|结算|佣金|收款|欠款|发票|开票|付款/i],
    ['b', /\b(submitted|lodged|awaiting|in review|pending)\b|等待.*结果|等结果|已递交|已经递交|审核中|待审批/i],
    ['t', /\b(blocked|request|requests|requested|feedback|waiting on us|needs reply|needs response)\b|补材料|要求|待回复/i],
    ['g', /\b(today|urgent|now|priority|asap|doing|this week)\b|今天|今日|优先|紧急|马上|本周/i],
    ['d', /\b(on hold|hold|paused|parked|snoozed|someday|later|deferred|icebox)\b|延迟|搁置|暂停|没有满足|还没到|以后/i],
    ['e', /\b(lead|leads|prospect|prospects|inbox|idea|ideas|backlog|incoming|wishlist)\b|潜在|线索|想法|新客户/i],
    ['a', /\b(next|to do|todo|ready|queued|queue|up next)\b|等待处理|待处理|待办|准备/i],
    ['m', /\b(in progress|progress|wip|working|ongoing)\b|半成品|进行中|处理中/i]
  ];
  // Guess a zone from the list's name; with no keyword match, earlier lists are nearer the house.
  GS.guessZone = function (name, index, total) {
    var n = String(name || '');
    for (var i = 0; i < GUESS.length; i++) if (GUESS[i][1].test(n)) return GUESS[i][0];
    return index < Math.max(1, Math.ceil(total / 2)) ? 'a' : 'm';
  };

  GS.cfg = function (raw) {
    var c = raw && typeof raw === 'object' ? raw : {};
    var out = { v: 1, lang: (c.lang === 'en' || c.lang === 'zh') ? c.lang : null, soon: 7, z: {} };
    var soon = Number(c.soon);
    if (soon >= 0 && soon <= 60) out.soon = Math.round(soon);
    if (c.z && typeof c.z === 'object') Object.keys(c.z).forEach(function (id) {
      if (GS.ZONES.indexOf(c.z[id]) !== -1) out.z[id] = c.z[id];
    });
    GS.lang = out.lang || GS.detectLang();
    return out;
  };
  GS.zoneOfList = function (cfg, list, index, total) {
    return cfg.z[list.id] || GS.guessZone(list.name, index, total);
  };
  GS.SIZE_LIMIT = 4000; // Trello allows 4096 characters per scope/visibility pair
  GS.sizeOf = function (v) { return JSON.stringify(v).length; };

  /* ---------- colours ---------- */
  GS.INK = '#26232B';
  GS.TYPE_COLORS = ['#E8892B', '#1F9E9A', '#EE8FAE', '#8E6BBF', '#EFC93D', '#4A86D9', '#A9744F', '#C8453B', '#7DB548'];
  // The most common first labels each become their own kind of unit, in this order; other labels are supply trucks.
  GS.KINDS = ['tank', 'jet', 'heli', 'infantry', 'apc', 'bomber', 'drone', 'rocket', 'jeep'];
  GS.OTHER_COLOR = '#A7A39A';
  GS.NONE_COLOR = '#D5D2C9';
  GS.PLANT_COLORS = ['#1F3A5F', '#C2185B', '#1B8A5A', '#7E57C2', '#F28C28', '#0E7490', '#8D4E24', '#B5179E', '#4F6D00', '#5B5B66'];
  var TRELLO = { green: '#4BCE97', yellow: '#F5CD47', orange: '#FEA362', red: '#F87168', purple: '#9F8FEF', blue: '#579DFF', sky: '#6CC3E0', lime: '#94C748', pink: '#E774BB', black: '#8590A2' };
  GS.trelloColor = function (c) { return c ? TRELLO[String(c).split('_')[0]] || null : null; };
  GS.darken = function (hex, f) {
    f = f === undefined ? 0.68 : f;
    var n = parseInt(hex.slice(1), 16);
    var r = Math.round(((n >> 16) & 255) * f), g = Math.round(((n >> 8) & 255) * f), b = Math.round((n & 255) * f);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
  };

  // Badge text for a label: a 3–4 digit number if the name has one, otherwise its first letters.
  GS.badgeOf = function (label) {
    var name = String((label && label.name) || '').trim();
    if (!name) return label && label.color ? String(label.color).charAt(0).toUpperCase() : '?';
    var m = name.match(/(^|[^\d])(\d{3,4})(?!\d)/);
    if (m) return m[2];
    if (/[㐀-鿿]/.test(name.charAt(0))) return name.charAt(0);
    var words = name.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (words.length >= 2) return (words[0].charAt(0) + words[1].charAt(0) + (words[2] ? words[2].charAt(0) : '')).toUpperCase();
    return name.slice(0, 3).toUpperCase();
  };

  // Labels that share a number ("482 General", "482 DAMA") or a first word ("Bug: UI", "Bug: API") are one type,
  // so a board with many label variants still gets a handful of unit kinds.
  GS.typeKey = function (label) {
    var name = String((label && label.name) || '').trim();
    if (!name) return { key: 'color:' + String((label && label.color) || 'none'), group: null };
    var m = name.match(/(^|[^\d])(\d{3,4})(?!\d)/);
    if (m) return { key: 'n:' + m[2], group: null };
    var cjk = name.match(/^[\u3400-\u9fff]+/);
    if (cjk) return { key: 'w:' + cjk[0], group: cjk[0] };
    var word = name.match(/^[A-Za-z0-9]+/);
    return word ? { key: 'w:' + word[0].toLowerCase(), group: null } : { key: 'l:' + name.toLowerCase(), group: null };
  };

  /* ---------- the board model ---------- */
  // lists: [{id,name}], cards: [{id,name,idList,labels,members,due,dueComplete}] as returned by t.lists / t.cards.
  // `fixed` (optional) is an earlier model: its types and members keep their colours, order and badges, so a
  // replay frame looks the same as the live map.
  GS.buildModel = function (lists, cards, cfg, now, fixed) {
    now = now || Date.now();
    var zoneOf = {}, listName = {}, listsIn = {};
    GS.ZONES.forEach(function (z) { listsIn[z] = []; });
    (lists || []).forEach(function (l, i) {
      var z = GS.zoneOfList(cfg, l, i, lists.length);
      zoneOf[l.id] = z; listName[l.id] = l.name; listsIn[z].push(l.name);
    });

    var typeMap = {}, memberMap = {}, zones = {}, all = [];
    GS.ZONES.forEach(function (z) { zones[z] = []; });
    if (fixed) {
      fixed.types.forEach(function (t) { typeMap[t.key] = { key: t.key, name: t.name, tcolor: t.tcolor, badge: t.badge, count: 0, rank: t.rank, top: t.top, color: t.color, kind: t.kind, variants: t.variants }; });
      fixed.members.forEach(function (m) { memberMap[m.id] = { id: m.id, name: m.name, counts: {}, total: 0, front: 0, color: m.color, design: m.design, short: m.short }; });
    }
    (cards || []).forEach(function (c) {
      var z = zoneOf[c.idList];
      if (!z || z === 'x') return;
      var labels = (c.labels || []).filter(Boolean), first = labels[0];
      var tk = first ? GS.typeKey(first) : null, key = tk ? tk.key : '';
      if (first && !typeMap[key]) typeMap[key] = { key: key, name: first.name || first.color || '', group: tk.group, tcolor: GS.trelloColor(first.color), badge: GS.badgeOf(first), count: 0, names: {} };
      if (first) {
        typeMap[key].count++;
        if (typeMap[key].names) { var ln = first.name || first.color || ''; typeMap[key].names[ln] = (typeMap[key].names[ln] || 0) + 1; }
      }
      var state = '';
      if (c.due && !c.dueComplete) {
        var days = (new Date(c.due).getTime() - now) / 86400000;
        if (!isNaN(days)) state = days < 0 ? 'over' : (days <= cfg.soon ? 'soon' : '');
      }
      var members = (c.members || []).filter(Boolean).map(function (m) {
        if (!memberMap[m.id]) memberMap[m.id] = { id: m.id, name: String(m.fullName || m.username || m.initials || '?').trim(), counts: {}, total: 0, front: 0 };
        var mm = memberMap[m.id];
        mm.counts[z] = (mm.counts[z] || 0) + 1; mm.total++;
        if (GS.FRONT.indexOf(z) !== -1) mm.front++;
        return m.id;
      });
      var card = { id: c.id, name: String(c.name || ''), zone: z, list: listName[c.idList] || '', type: key, labels: labels.map(function (l) { return l.name || l.color || ''; }).filter(Boolean), members: members, due: c.due && !c.dueComplete ? c.due : null, state: state, ghost: !!c.ghost };
      zones[z].push(card); all.push(card);
    });

    // Types: most common first. Use Trello's own label colours only if the top types are told apart by them.
    var types = Object.keys(typeMap).map(function (k) { return typeMap[k]; });
    // name each type after its most common label; a type made of several labels remembers them all
    types.forEach(function (t) {
      if (!t.names) return;
      var all = Object.keys(t.names).sort(function (a, b) { return t.names[b] - t.names[a] || (a < b ? -1 : 1); });
      if (!all.length) return;
      t.variants = all;
      t.badge = GS.badgeOf({ name: all[0] });
      t.name = all.length > 1 && t.group ? t.group : all[0];
    });
    if (fixed) {
      types.sort(function (a, b) { return (a.rank === undefined ? 1e6 : a.rank) - (b.rank === undefined ? 1e6 : b.rank); });
      types.forEach(function (t, i) { if (t.rank === undefined) { t.rank = 1e5 + i; t.top = false; t.color = GS.OTHER_COLOR; t.kind = 'truck'; } });
    } else {
      types.sort(function (a, b) { return b.count - a.count || (a.name < b.name ? -1 : 1); });
      var top = types.slice(0, GS.TYPE_COLORS.length), seen = {}, distinct = true;
      top.forEach(function (t) { if (!t.tcolor || seen[t.tcolor]) distinct = false; seen[t.tcolor] = 1; });
      types.forEach(function (t, i) {
        t.rank = i;
        t.top = i < GS.TYPE_COLORS.length;
        t.color = t.top ? (distinct ? t.tcolor : GS.TYPE_COLORS[i]) : GS.OTHER_COLOR;
        t.kind = t.top ? GS.KINDS[i % GS.KINDS.length] : 'truck';
      });
    }
    var typeOf = {}; types.forEach(function (t) { typeOf[t.key] = t; });
    var order = function (c) { return c.type ? typeOf[c.type].rank : 1e6; };
    GS.ZONES.forEach(function (z) { zones[z].sort(function (a, b) { return order(a) - order(b) || (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)); }); });

    var members = Object.keys(memberMap).map(function (k) { return memberMap[k]; });
    if (fixed) {
      var pos = {}; fixed.members.forEach(function (m, i) { pos[m.id] = i; });
      members.sort(function (a, b) { return (pos[a.id] === undefined ? 1e6 : pos[a.id]) - (pos[b.id] === undefined ? 1e6 : pos[b.id]); });
      members.forEach(function (m, i) { if (!m.color) { m.color = GS.PLANT_COLORS[i % GS.PLANT_COLORS.length]; m.design = i % 5; m.short = m.name.split(/\s+/)[0].slice(0, 9); } });
    } else {
      members.sort(function (a, b) { return b.front - a.front || b.total - a.total || (a.name < b.name ? -1 : 1); });
      members.forEach(function (m, i) { m.color = GS.PLANT_COLORS[i % GS.PLANT_COLORS.length]; m.design = i % 5; m.short = m.name.split(/\s+/)[0].slice(0, 9); });
    }
    var memberOf = {}; members.forEach(function (m) { memberOf[m.id] = m; });

    var unguarded = { counts: {}, total: 0 };
    // a card that no longer exists has no known members, so it is not counted as unguarded
    all.forEach(function (c) { if (!c.members.length && !c.ghost) { unguarded.counts[c.zone] = (unguarded.counts[c.zone] || 0) + 1; unguarded.total++; } });
    var count = function (zs, test) { var n = 0; zs.forEach(function (z) { zones[z].forEach(function (c) { if (!test || test(c)) n++; }); }); return n; };
    var stats = {
      field: count(GS.FIELD), gate: zones.g.length, throwers: zones.t.length,
      soon: count(['g', 't'], function (c) { return c.state === 'soon'; }),
      over: count(GS.FIELD, function (c) { return c.state === 'over'; }),
      bubbled: zones.b.length, coins: zones.c.length,
      unguarded: count(GS.FIELD, function (c) { return !c.members.length && !c.ghost; }),
      noLabel: count(GS.ZONES.slice(0, 8), function (c) { return !c.type; }),
      other: types.filter(function (t) { return !t.top; }).reduce(function (s, t) { return s + t.count; }, 0)
    };
    return { zones: zones, zoneOf: zoneOf, listsIn: listsIn, types: types, typeOf: typeOf, members: members, memberOf: memberOf, unguarded: unguarded, stats: stats, total: all.length, guessed: Object.keys(cfg.z).length === 0 };
  };

  /* ---------- board history (replay) ---------- */
  // Only the kinds of activity that put a card on the board, move it between lists, or take it off.
  GS.HISTORY_FILTER = 'createCard,copyCard,convertToCardFromCheckItem,emailCard,moveCardToBoard,moveCardFromBoard,updateCard:idList,updateCard:closed,deleteCard';
  GS.MAX_PAGES = 10; // 1000 events per page
  GS.MAX_GHOSTS = 300; // archived cards whose labels and members replay looks up
  // Prefer the Authorization header so the token never appears in a URL; fall back to query parameters
  // if the browser refuses the header.
  GS._get = function (token, url) {
    return fetch(url, { headers: { Authorization: 'OAuth oauth_consumer_key="' + GS.APP_KEY + '", oauth_token="' + token + '"' } })
      .catch(function () { return fetch(url + '&key=' + encodeURIComponent(GS.APP_KEY) + '&token=' + encodeURIComponent(token)); });
  };

  // Read-only access to the member's Trello token. The token is kept by Trello in the member's private
  // Power-Up data; a copy stays in memory for this window because browsers may block the stored one.
  GS.auth = function (t) {
    if (GS.demo) {
      return {
        ok: true,
        token: function () { return Promise.resolve(GS._token || null); },
        authorize: function () { GS._token = 'demo'; return Promise.resolve('demo'); },
        clear: function () { GS._token = null; return Promise.resolve(); }
      };
    }
    var api = null;
    try { api = GS.APP_KEY ? t.getRestApi() : null; } catch (e) { api = null; }
    return {
      ok: !!api,
      token: function () {
        if (GS._token) return Promise.resolve(GS._token);
        if (!api) return Promise.resolve(null);
        return Promise.resolve().then(function () { return api.getToken(); })
          .then(function (tok) { GS._token = tok || null; return GS._token; })
          .catch(function () { return null; });
      },
      // Must be called directly from a click handler, or the browser blocks Trello's consent window.
      authorize: function () {
        return api.authorize({ scope: 'read', expiration: 'never' }).then(function (tok) { GS._token = tok || null; return GS._token; });
      },
      clear: function () {
        GS._token = null;
        return api ? Promise.resolve().then(function () { return api.clearToken(); }).catch(function () {}) : Promise.resolve();
      }
    };
  };

  // Fetch the board's card activity since `sinceMs`, newest first. Resolves { actions, truncated }.
  GS.fetchActions = function (t, sinceMs, onProgress) {
    if (GS.demo) return Promise.resolve({ actions: GS.demoActions(sinceMs), truncated: false });
    var board = (t.getContext() || {}).board;
    return GS.auth(t).token().then(function (token) {
      if (!token || !board) { var e0 = new Error('unauthorized'); e0.code = 401; throw e0; }
      var all = [], before = null, pages = 0;
      var base = 'https://api.trello.com/1/boards/' + encodeURIComponent(board) + '/actions?filter=' + encodeURIComponent(GS.HISTORY_FILTER) +
        '&limit=1000&fields=type,date,data&memberCreator=true&memberCreator_fields=fullName,username&member=false&since=' + encodeURIComponent(new Date(sinceMs).toISOString());
      function get(url) { return GS._get(token, url); }
      function page() {
        return get(base + (before ? '&before=' + encodeURIComponent(before) : '')).then(function (r) {
          if (r.status === 401) { var e = new Error('unauthorized'); e.code = 401; throw e; }
          if (!r.ok) throw new Error('http-' + r.status);
          return r.json();
        }).then(function (list) {
          list = Array.isArray(list) ? list : [];
          all = all.concat(list); pages++;
          if (onProgress) onProgress(all.length);
          if (list.length < 1000) return { actions: all, truncated: false };
          if (pages >= GS.MAX_PAGES) return { actions: all, truncated: true };
          before = list[list.length - 1].id;
          return page();
        });
      }
      return page();
    });
  };

  // Labels and members of cards that are no longer open on the board (archived), so replay can draw them and
  // credit whoever was assigned. Resolves { cardId: { labels, members } }; cards that cannot be read are left out.
  GS.fetchCards = function (t, ids) {
    ids = (ids || []).slice(0, GS.MAX_GHOSTS);
    if (!ids.length) return Promise.resolve({});
    if (GS.demo) return Promise.resolve(GS.demoGhosts(ids));
    return GS.auth(t).token().then(function (token) {
      var out = {}, groups = [];
      if (!token) return out;
      for (var i = 0; i < ids.length; i += 10) groups.push(ids.slice(i, i + 10));   // Trello's batch limit
      function next() {
        var g = groups.shift();
        if (!g) return out;
        var urls = g.map(function (id) { return encodeURIComponent('/cards/' + id + '?fields=labels&members=true&member_fields=fullName'); }).join(',');
        return GS._get(token, 'https://api.trello.com/1/batch?urls=' + urls)
          .then(function (r) { return r.ok ? r.json() : []; })
          .then(function (list) {
            (Array.isArray(list) ? list : []).forEach(function (item) {
              var c = item && item['200'];
              if (c && c.id) out[c.id] = { labels: c.labels || [], members: c.members || [] };
            });
            return next();
          })
          .catch(function () { return next(); });   // replay still plays without these details
      }
      return next();
    }).catch(function () { return {}; });
  };

  // Work backwards from today's cards through the activity (newest first) to find where every card was at the
  // start, and return the same activity as forward events. A list of null means "not on the board".
  GS.buildHistory = function (cards, actions) {
    var state = {}, names = {}, events = [];
    (cards || []).forEach(function (c) { state[c.id] = c.idList; names[c.id] = String(c.name || ''); });
    (actions || []).forEach(function (a) {
      var d = a.data || {}, card = d.card;
      if (!card || !card.id) return;
      var id = card.id, when = new Date(a.date).getTime();
      if (isNaN(when)) return;
      if (card.name && !names[id]) names[id] = String(card.name);
      var after = state[id] === undefined ? null : state[id], from, to;
      switch (a.type) {
        case 'updateCard':
          if (d.listBefore && d.listAfter) { from = d.listBefore.id; to = d.listAfter.id; }
          else if (card.closed === true) { from = d.list ? d.list.id : after; to = null; }
          else if (card.closed === false && d.old && d.old.closed === true) { from = null; to = d.list ? d.list.id : after; }
          else return;
          break;
        case 'deleteCard': from = null; to = null; break;            // a card is archived before it can be deleted
        case 'moveCardFromBoard': from = d.list ? d.list.id : after; to = null; break;
        case 'createCard': case 'copyCard': case 'convertToCardFromCheckItem': case 'emailCard': case 'moveCardToBoard':
          from = null; to = d.list ? d.list.id : after; break;
        default: return;
      }
      state[id] = from;
      var mc = a.memberCreator;
      if (from !== to) events.push({ t: when, id: id, from: from, to: to, by: mc && mc.id ? { id: mc.id, name: String(mc.fullName || mc.username || '?').trim() } : null });
    });
    events.reverse();
    return { initial: state, events: events, names: names };
  };

  /* ---------- DOM helpers ---------- */
  GS.h = function (tag, attrs, kids) {
    var el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === 'class') el.className = v;
      else if (k === 'text') el.textContent = v;
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
      else if (k === 'value') el.value = v;
      else if (k === 'style') el.style.cssText = v;   // CSSOM, so a strict style-src allows it
      else if (v === true) el.setAttribute(k, '');
      else el.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  };
  GS.fill = function (el, kids) {
    while (el.firstChild) el.removeChild(el.firstChild);
    (kids || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  };
  GS.esc = function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };
  GS.canEdit = function (t) {
    try {
      if (typeof t.isMemberSignedIn === 'function' && !t.isMemberSignedIn()) return false;
      var p = (t.getContext() || {}).permissions;
      if (p && p.board && p.board !== 'write') return false;
    } catch (e) { /* if the context is unavailable assume editable; a failed save shows an error */ }
    return true;
  };
  GS.applyTheme = function (t) {
    try {
      var ctx = t.getContext ? t.getContext() : null;
      var set = function (theme) { document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light'); };
      if (ctx && ctx.initialTheme) set(ctx.initialTheme);
      if (typeof t.subscribeToThemeChanges === 'function') t.subscribeToThemeChanges(set);
    } catch (e) { /* stay on the light theme if the theme API is unavailable */ }
  };

  /* ---------- Trello or demo ---------- */
  GS.demo = false;
  GS.inTrello = function () {
    return !!(root.TrelloPowerUp && root.location && root.location.hash && root.location.hash.length > 1);
  };
  GS.getT = function () {
    if (GS.inTrello()) return root.TrelloPowerUp.iframe(GS.appOpts());
    GS.demo = true;
    return GS.mockT();
  };

  var mock = null;
  // A fictional project board, generated the same way every time, so the pages can be opened outside Trello.
  GS.mockT = function () {
    if (mock) return mock;
    var seed = 20261117;
    var rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
    var zh = GS.detectLang() === 'zh';
    var L = zh
      ? [['l1', '今天优先', 9], ['l2', '客户要求补充', 7], ['l3', '待处理', 14], ['l4', '进行中', 16], ['l5', '搁置', 12], ['l6', '潜在线索', 5], ['l7', '已提交等结果', 9], ['l8', '待开票', 11], ['l9', '已完成', 6]]
      : [['l1', 'Today', 9], ['l2', 'Client requests', 7], ['l3', 'Up next', 14], ['l4', 'In progress', 16], ['l5', 'On hold', 12], ['l6', 'Leads', 5], ['l7', 'Submitted, awaiting result', 9], ['l8', 'To invoice', 11], ['l9', 'Done', 6]];
    var labels = (zh
      ? [['设计', 'purple'], ['开发', 'blue'], ['缺陷', 'red'], ['调研', 'green'], ['运营', 'orange'], ['法务 101', 'yellow'], ['市场', 'pink']]
      : [['Design', 'purple'], ['Build', 'blue'], ['Bug', 'red'], ['Research', 'green'], ['Ops', 'orange'], ['Legal 101', 'yellow'], ['Marketing', 'pink']])
      .map(function (x, i) { return { id: 'lb' + i, name: x[0], color: x[1] }; });
    var people = ['Avery', 'Blake', 'Casey', 'Devon', 'Ellis'].map(function (n, i) { return { id: 'm' + i, fullName: n + ' (demo)', username: n.toLowerCase(), initials: n.charAt(0) }; });
    var nouns = zh ? ['首页改版', '报价单', '合同模板', '数据迁移', '客户回访', '月度报告', '登录问题', '供应商评估', '培训材料', '发布清单'] : ['Homepage refresh', 'Quote', 'Contract template', 'Data migration', 'Client follow-up', 'Monthly report', 'Login issue', 'Vendor review', 'Training pack', 'Release checklist'];
    var cards = [], n = 0, now = Date.now();
    L.forEach(function (l) {
      for (var i = 0; i < l[2]; i++) {
        n++;
        var lab = rnd() < 0.9 ? [pick(labels)] : [];
        if (lab.length && rnd() < 0.3) lab.push(pick(labels));
        var mem = rnd() < 0.88 ? [pick(people)] : [];
        if (mem.length && rnd() < 0.35) { var extra = pick(people); if (extra.id !== mem[0].id) mem.push(extra); }
        var due = null, r = rnd();
        if (l[0] === 'l1' || l[0] === 'l2') due = r < 0.55 ? now + (rnd() * 6 + 0.5) * 86400000 : (r < 0.65 ? now - 2 * 86400000 : (r < 0.85 ? now + 20 * 86400000 : null));
        else if (r < 0.3) due = now + (rnd() * 40 + 3) * 86400000;
        cards.push({ id: 'c' + n, name: pick(nouns) + ' #' + (100 + n), idList: l[0], labels: lab, members: mem, due: due ? new Date(due).toISOString() : null, dueComplete: false, shortLink: 'demo' + n });
      }
    });
    GS._demo = { lists: L, cards: cards, people: people, labels: labels };
    // In demo mode history access is already granted, unless the page is opened with ?auth=0.
    GS._token = /[?&]auth=0\b/.test(root.location.search || '') ? null : 'demo';
    var store = { board: {} }, renderers = [];
    var clone = function (v) { return v === undefined ? v : JSON.parse(JSON.stringify(v)); };
    mock = {
      get: function (scope, vis, key, def) { var v = store.board[key]; return Promise.resolve(v === undefined ? def : clone(v)); },
      set: function (scope, vis, key, value) { store.board[key] = clone(value); renderers.forEach(function (fn) { setTimeout(fn, 0); }); return Promise.resolve(); },
      lists: function () { return Promise.resolve(L.map(function (l) { return { id: l[0], name: l[1] }; })); },
      cards: function () { return Promise.resolve(clone(cards)); },
      getContext: function () { return { board: 'demo', permissions: { board: 'write' } }; },
      isMemberSignedIn: function () { return true; },
      render: function (fn) { renderers.push(fn); return fn(); },
      sizeTo: function () { return Promise.resolve(); },
      showCard: function () { return Promise.resolve(); },
      closeModal: function () { return Promise.resolve(); },
      closePopup: function () { return Promise.resolve(); },
      signUrl: function (u) { return u; }
    };
    return mock;
  };

  // A made-up history that ends exactly at the demo board's present state.
  GS.demoActions = function (sinceMs) {
    GS.mockT();
    var seed = 77, rnd = function () { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
    var prev = { l1: 'l4', l2: 'l4', l5: 'l4', l4: 'l3', l3: 'l6', l7: 'l1', l8: 'l7', l9: 'l8', l6: null };
    var names = {}; GS._demo.lists.forEach(function (l) { names[l[0]] = l[1]; });
    var now = Date.now(), DAY = 86400000, out = [], n = 0;
    function act(type, when, data) {
      n++;
      var who = GS._demo.people[n % GS._demo.people.length];
      out.push({ id: 'a' + n, type: type, date: new Date(when).toISOString(), data: data, memberCreator: { id: who.id, fullName: who.fullName, username: who.username } });
    }
    function chain(card, cur, when, stay) {
      // walk back along the pipeline from the list the card is in at `when`
      var cardRef = { id: card.id, name: card.name }, list = cur, t = when;
      while (prev[list] && rnd() < stay) {
        t -= (0.5 + rnd() * 14) * DAY;
        act('updateCard', t, { card: cardRef, listBefore: { id: prev[list], name: names[prev[list]] }, listAfter: { id: list, name: names[list] }, old: { idList: prev[list] } });
        list = prev[list];
      }
      t -= (0.5 + rnd() * 20) * DAY;
      act('createCard', t, { card: cardRef, list: { id: list, name: names[list] } });
    }
    GS._demo.cards.forEach(function (c) { chain(c, c.idList, now, 0.72); });
    for (var g = 0; g < 14; g++) {
      var ghost = { id: 'g' + g, name: (GS.detectLang() === 'zh' ? '已归档事项 #' : 'Archived job #') + (900 + g) };
      var end = now - (1 + rnd() * 40) * DAY, last = ['l8', 'l7', 'l1', 'l4'][g % 4];
      act('updateCard', end, { card: { id: ghost.id, name: ghost.name, closed: true }, list: { id: last, name: names[last] }, old: { closed: false } });
      chain(ghost, last, end, 0.85);
    }
    return out.filter(function (a) { return new Date(a.date).getTime() >= sinceMs; })
      .sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : 0); });
  };
  // Made-up labels and members for the demo's archived cards: some solo, some joint, some unassigned.
  GS.demoGhosts = function (ids) {
    GS.mockT();
    var out = {}, P = GS._demo.people, L = GS._demo.labels;
    (ids || []).forEach(function (id) {
      var n = Number(String(id).slice(1));
      if (String(id).charAt(0) !== 'g' || isNaN(n)) return;
      var members = n % 5 === 4 ? [] : [P[n % P.length]];
      if (members.length && n % 3 === 0) members.push(P[(n + 2) % P.length]);
      out[id] = { labels: [L[n % L.length]], members: members };
    });
    return out;
  };
})(window);
