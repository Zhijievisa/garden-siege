/* Siege Line — history access popup (opened by the show-authorization capability) */
(function () {
  'use strict';
  var GS = window.GS, h = GS.h, tr = GS.tr;

  GS.mountAuthorize = function (t, rootEl) {
    function resize() { try { t.sizeTo('#' + rootEl.id); } catch (e) { /* demo mode */ } }
    return t.get('board', 'shared', GS.CFG_KEY).then(function (raw) {
      GS.cfg(raw);
      var auth = GS.auth(t), msg = h('div', { class: 'note info', hidden: true });
      var say = function (cls, text) { msg.className = 'note ' + cls; msg.textContent = text; msg.hidden = false; resize(); };
      GS.fill(rootEl, [
        h('p', { text: tr('au_body') }),
        msg,
        h('div', { class: 'foot' }, [
          h('span', { class: 'muted small' }, [h('a', { class: 'link', href: './privacy.html', target: '_blank', rel: 'noopener', text: tr('privacy') })]),
          h('span', { class: 'grow' }),
          // authorize() is called straight from the click so the browser allows Trello's consent window
          h('button', { type: 'button', class: 'primary', id: 'gs-allow', text: tr('au_ok'), disabled: !auth.ok, onclick: function () {
            auth.authorize().then(function (tok) {
              if (!tok) { say('err', tr('au_denied')); return null; }
              say('info', tr('au_done'));
              return t.closePopup();
            }).catch(function () { say('err', tr('au_denied')); });
          } })
        ])
      ]);
      resize();
    });
  };
})();
