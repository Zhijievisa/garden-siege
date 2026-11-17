/* Garden Siege — settings: language, the "due soon" window, and which zone each list belongs to.
 * Used twice: in the Power-Up settings popup (settings.html) and inline inside the battle map.
 */
(function () {
  'use strict';
  var GS = window.GS, h = GS.h, tr = GS.tr;

  GS.mountSettings = function (t, rootEl, opts) {
    opts = opts || {};
    function resize() { if (!opts.inline) { try { t.sizeTo('#' + rootEl.id); } catch (e) { /* demo mode */ } } }

    var auth = GS.auth(t);
    return Promise.all([t.get('board', 'shared', GS.CFG_KEY), t.lists('id', 'name'), auth.token()]).then(function (r) {
      var cfg = GS.cfg(r[0]), lists = r[1] || [], canEdit = GS.canEdit(t), connected = !!r[2];
      var note = h('div', { class: 'note err', hidden: true });
      var langSel = h('select', { id: 'gs-lang', disabled: !canEdit }, [
        h('option', { value: '', text: tr('set_auto') }), h('option', { value: 'en', text: 'English' }), h('option', { value: 'zh', text: '简体中文' })
      ]);
      langSel.value = cfg.lang || '';
      var soonInp = h('input', { id: 'gs-soon', type: 'number', min: '0', max: '60', step: '1', value: String(cfg.soon), disabled: !canEdit });

      var selects = {};
      var rows = lists.map(function (l, i) {
        var sel = h('select', { id: 'gs-z-' + i, 'aria-label': l.name, disabled: !canEdit }, GS.ZONES.map(function (z) {
          return h('option', { value: z, text: tr('z_' + z) + ' — ' + tr('zd_' + z) });
        }));
        sel.value = GS.zoneOfList(cfg, l, i, lists.length);
        selects[l.id] = sel;
        return h('div', { class: 'zrow' }, [h('label', { for: 'gs-z-' + i, text: l.name }), sel]);
      });

      function suggest() {
        lists.forEach(function (l, i) { selects[l.id].value = GS.guessZone(l.name, i, lists.length); });
      }
      function save() {
        var soon = Math.round(Number(soonInp.value));
        var next = { v: 1, soon: soon >= 0 && soon <= 60 ? soon : 7, z: {} };
        if (langSel.value) next.lang = langSel.value;
        lists.forEach(function (l) { next.z[l.id] = selects[l.id].value; });
        if (GS.sizeOf(next) > GS.SIZE_LIMIT) { note.textContent = tr('set_big'); note.hidden = false; resize(); return null; }
        return t.set('board', 'shared', GS.CFG_KEY, next).then(function () {
          if (opts.onSaved) return opts.onSaved();
          return t.closePopup();
        }).catch(function () { note.textContent = tr('load_err'); note.hidden = false; resize(); });
      }

      GS.fill(rootEl, [
        canEdit ? null : h('div', { class: 'note info', text: tr('set_ro') }),
        h('div', { class: 'fields' }, [
          h('div', { class: 'field' }, [h('label', { for: 'gs-lang', text: tr('set_lang') }), langSel]),
          h('div', { class: 'field' }, [h('label', { for: 'gs-soon', text: tr('set_soon') }), soonInp])
        ]),
        h('h2', { text: tr('set_zones') }),
        h('p', { class: 'muted small', text: tr('set_zones_hint') }),
        h('div', { class: 'zlist' }, rows),
        // History access belongs to the person, not the board, so anyone can disconnect their own.
        (auth.ok || GS.demo) && !opts.inline ? h('div', { class: 'conn' }, [
          h('span', null, [h('span', { class: 'muted small', text: tr('au_state') + ': ' }), connected ? tr('au_on') : tr('au_off')]),
          h('span', { class: 'grow' }),
          connected ? h('button', { type: 'button', id: 'gs-disconnect', text: tr('au_disconnect'), onclick: function () {
            auth.clear().then(function () { return GS.mountSettings(t, rootEl, opts); });
          } }) : null
        ]) : null,
        note,
        h('div', { class: 'foot' }, [
          h('span', { class: 'muted small' }, [
            h('a', { class: 'link', href: './support.html', target: '_blank', rel: 'noopener', text: tr('support') }), ' · ',
            h('a', { class: 'link', href: './privacy.html', target: '_blank', rel: 'noopener', text: tr('privacy') })
          ]),
          h('span', { class: 'grow' }),
          canEdit ? h('button', { type: 'button', text: tr('set_suggest'), onclick: suggest }) : null,
          opts.onCancel ? h('button', { type: 'button', text: tr('cancel'), onclick: opts.onCancel }) : null,
          canEdit ? h('button', { type: 'button', class: 'primary', text: tr('set_save'), onclick: save }) : null
        ])
      ]);
      resize();
    });
  };
})();
