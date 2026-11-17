/* Garden Siege — iframe connector (loaded by index.html, runs only in Trello's hidden iframe) */
(function () {
  'use strict';
  var GS = window.GS, tr = GS.tr;
  var BASE = window.location.href.split('#')[0].split('?')[0].replace(/[^\/]*$/, '');
  var ICON_GRAY = BASE + 'icon.svg';
  var ICON_WHITE = BASE + 'icon-white.svg';

  // Reads the board settings first so button and window titles come out in the board's language.
  function withCfg(t) {
    return t.get('board', 'shared', GS.CFG_KEY).then(function (raw) { return GS.cfg(raw); });
  }

  function openMap(t) {
    return t.modal({ url: './battle.html', title: tr('title_map'), fullscreen: true, accentColor: '#20302A' });
  }

  window.TrelloPowerUp.initialize({
    'board-buttons': function (t) {
      return withCfg(t).then(function () {
        return [{ icon: { dark: ICON_WHITE, light: ICON_GRAY }, text: tr('btn_map'), callback: openMap }];
      });
    },

    // Shown once, right after someone enables the Power-Up on a board.
    'on-enable': function (t) {
      return withCfg(t).then(function () {
        return t.modal({ url: './welcome.html', title: tr('title_wel'), height: 440, fullscreen: false });
      });
    },

    'show-settings': function (t) {
      return withCfg(t).then(function () {
        return t.popup({ title: tr('title_set'), url: './settings.html', height: 560 });
      });
    },

    // Replay is the only feature that needs the member's permission (read-only access to board history).
    'authorization-status': function (t) {
      return GS.auth(t).token().then(function (tok) { return { authorized: !!tok }; });
    },

    'show-authorization': function (t) {
      return withCfg(t).then(function () {
        return t.popup({ title: tr('title_auth'), url: './authorize.html', height: 230 });
      });
    }
  }, GS.appOpts());
})();
