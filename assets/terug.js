// Vaste knop terug naar SNX World. Positie per game via data-pos op de script-tag: "tc" (boven midden) of "bl" (linksonder).
(function () {
  var s = document.currentScript, pos = (s && s.dataset.pos) || 'bl';
  // op snxfood.com/world valt de bovenkant achter het websitemenu: dan altijd rechtsonder
  try { if (window.self !== window.top) pos = 'lm'; } catch (e) { pos = 'lm'; }
  var a = document.createElement('a');
  a.href = './'; a.className = 'snx-terug'; a.setAttribute('aria-label', 'Stoppen en terug naar SNX World');
  a.textContent = '‹ SNX World';
  var st = document.createElement('style');
  st.textContent = '.snx-terug{position:fixed;z-index:9990;font:700 13px Poppins,Arial,sans-serif;color:#fff;background:rgba(17,17,17,.78);border:2px solid #fff;border-radius:999px;padding:6px 12px;text-decoration:none;line-height:1;box-shadow:0 3px 10px rgba(0,0,0,.3);-webkit-tap-highlight-color:transparent}' +
    '.snx-terug:hover{background:#ff2625}' +
    (pos === 'lm' ? '.snx-terug{left:0;top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;border-left:2px solid #fff;border-right:0;border-radius:12px 0 0 12px;padding:12px 5px;font-size:11px;letter-spacing:.06em}' : pos === 'tc' ? '.snx-terug{top:max(10px,env(safe-area-inset-top));left:50%;transform:translateX(-50%)}'
                  : '.snx-terug{left:max(10px,env(safe-area-inset-left));bottom:max(10px,env(safe-area-inset-bottom))}');
  document.head.appendChild(st);
  ['pointerdown', 'touchstart', 'mousedown', 'click'].forEach(function (t) {
    a.addEventListener(t, function (e) { e.stopPropagation(); }, { passive: true });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !document.querySelector('.snxr-wrap:not([hidden])')) location.href = './'; });
  (document.body ? document.body.appendChild(a) : addEventListener('DOMContentLoaded', function () { document.body.appendChild(a); }));
})();
