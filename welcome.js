/* Siege Line — welcome / getting-started modal (opened by the on-enable capability) */
(function () {
  'use strict';
  var GS = window.GS, h = GS.h, tr = GS.tr;

  GS.mountWelcome = function (t, rootEl) {
    return t.get('board', 'shared', GS.CFG_KEY).then(function (raw) {
      GS.cfg(raw);
      GS.fill(rootEl, [
        h('p', { class: 'lead', text: tr('wel_intro') }),
        h('ol', { class: 'steps' }, [
          h('li', { text: tr('wel_1') }),
          h('li', { text: tr('wel_2') }),
          h('li', { text: tr('wel_3') }),
          GS.demo || GS.APP_KEY ? h('li', { text: tr('wel_4') }) : null
        ]),
        h('div', { class: 'note info', text: tr('wel_data') }),
        h('div', { class: 'foot' }, [
          h('span', { class: 'muted small' }, [
            h('a', { class: 'link', href: './support', target: '_blank', rel: 'noopener', text: tr('support') }), ' · ',
            h('a', { class: 'link', href: './privacy', target: '_blank', rel: 'noopener', text: tr('privacy') })
          ]),
          h('span', { class: 'grow' }),
          h('button', { type: 'button', class: 'primary', text: tr('wel_ok'), onclick: function () { t.closeModal(); } })
        ])
      ]);
    });
  };
})();
