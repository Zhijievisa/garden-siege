/* Siege Line: page bootstrap. Kept in its own file so that no page needs an inline script
   (the Content-Security-Policy allows scripts from this site and Trello's CDN only). */
(function () {
  'use strict';
  var root = document.getElementById('gs-root');
  if (!root || !window.GS) return;
  var mount = GS[root.getAttribute('data-mount')];
  if (typeof mount !== 'function') return;
  var t = GS.getT();
  GS.applyTheme(t);
  mount(t, root);
})();
