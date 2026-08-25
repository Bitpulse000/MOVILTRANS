/* =========================================================
   MOVILTRANS LOGISTIC — Landing page behavior
   No frameworks, no dependencies, no tracking/backend.
   ========================================================= */
(function () {
  'use strict';

  document.documentElement.classList.remove('js-disabled');

  /* -----------------------------------------------------
     PENDING CONTACT DATA
     Fill these in once the real accounts/number exist.
     Nothing here is invented — every value starts empty
     and every [data-*-cta] element degrades to a visibly
     inert, non-navigating control until it is filled in.
     ----------------------------------------------------- */

  // WhatsApp number in international format, digits only, no '+'.
  // Example: '573001234567'. Leave empty until confirmed.
  var WHATSAPP_NUMBER = '573104493541';
  var WHATSAPP_MESSAGE = 'Hola, quiero solicitar una cotización de transporte de carga con MOVILTRANS LOGISTIC.';

  // Social links (Facebook, Instagram, LinkedIn, TikTok) are added
  // manually in index.html's href="#" once the accounts exist —
  // no wiring needed here.

  function buildWhatsAppLink() {
    if (!WHATSAPP_NUMBER) return null;
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(WHATSAPP_MESSAGE);
  }

  function wireInertOrLive(el, url, pendingLabel) {
    if (url) {
      el.href = url;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.removeAttribute('aria-disabled');
      el.removeAttribute('title');
      // Google Ads conversion tracking: report the click, then open
      // WhatsApp ourselves (gtag_report_conversion's own callback does
      // this) so the tag has a chance to fire before navigation.
      el.addEventListener('click', function (e) {
        if (typeof gtag_report_conversion === 'function') {
          e.preventDefault();
          gtag_report_conversion(url);
        }
      });
    } else {
      el.href = '#';
      el.setAttribute('aria-disabled', 'true');
      el.title = pendingLabel;
      el.addEventListener('click', function (e) { e.preventDefault(); });
    }
  }

  function wireWhatsAppCtas() {
    var link = buildWhatsAppLink();
    var els = document.querySelectorAll('[data-whatsapp-cta]');
    for (var i = 0; i < els.length; i++) {
      wireInertOrLive(els[i], link, 'Número de WhatsApp pendiente de configurar');
    }
  }

  /* -----------------------------------------------------
     "Rastrea tu envío" widget — the guide-number field stays
     enabled so it feels real, but submitting it does nothing
     yet: no backend, no redirect, no tracking logic.
     ----------------------------------------------------- */
  function wireTrackingPlaceholder() {
    var forms = document.querySelectorAll('[data-track-form]');
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener('submit', function (e) { e.preventDefault(); });
    }
  }

  /* -----------------------------------------------------
     Mobile menu
     ----------------------------------------------------- */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    function closeMenu() {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('is-open');
      // Closed links must not be reachable by keyboard or announced by
      // screen readers — height:0 + overflow:hidden alone doesn't do that.
      menu.setAttribute('inert', '');
    }
    function openMenu() {
      toggle.setAttribute('aria-expanded', 'true');
      menu.classList.add('is-open');
      menu.removeAttribute('inert');
    }

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) closeMenu(); else openMenu();
    });

    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= 1180) closeMenu();
    });
  }

  /* -----------------------------------------------------
     Hero videos — neither .hero__bg-video (assets/fondo_bodega.mp4,
     3.7MB) nor .hero__video (assets/video_entrada.mp4, 12MB!) ships a
     <source> in the markup, so main.js has to attach one before either
     can play.

     .hero__bg-video stays gated: it keeps its `poster`/CSS-background
     still image on narrow/mobile viewports, reduced-motion, and
     metered or slow connections, and only gets a <source> when none of
     those apply.

     .hero__video (video_entrada.mp4) is exempt from all of that by
     request — it always gets a <source> and always plays, including on
     narrow/mobile viewports and slow/metered connections.
     ----------------------------------------------------- */
  function canAffordHeroVideo() {
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var isNarrow = window.innerWidth < 761;
    var conn = navigator.connection || navigator.webkitConnection || navigator.mozConnection;
    var isConstrained = conn && (conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ''));
    return !prefersReduced && !isNarrow && !isConstrained;
  }

  // pauseOffscreen: stop decoding while the video has scrolled out of
  // view (used for the full-bleed background video; the small hero
  // visual panel is short enough that it's basically always in view
  // together with the rest of the hero, so it just plays continuously).
  function attachHeroVideoSource(video, pauseOffscreen) {
    if (!video) return;
    var src = video.getAttribute('data-src');
    if (!src) return;
    var source = document.createElement('source');
    source.src = src;
    source.type = 'video/mp4';
    video.appendChild(source);
    video.load();

    if (pauseOffscreen && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            video.play().catch(function () {});
          } else {
            video.pause();
          }
        });
      }, { threshold: 0.1 });
      io.observe(video);
    } else {
      video.play().catch(function () {});
    }
  }

  function initHeroVideos() {
    // .hero__video (video_entrada.mp4) always plays, no exceptions.
    attachHeroVideoSource(document.querySelector('.hero__video'), false);

    if (!canAffordHeroVideo()) return; // keep .hero__bg-video's CSS background image
    attachHeroVideoSource(document.querySelector('.hero__bg-video'), true);
  }

  /* -----------------------------------------------------
     Header scroll shadow
     ----------------------------------------------------- */
  function initHeaderScrollState() {
    var header = document.querySelector('.site-header');
    if (!header) return;
    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* -----------------------------------------------------
     Reveal-on-scroll
     ----------------------------------------------------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    els.forEach(function (el) { io.observe(el); });
  }

  document.addEventListener('DOMContentLoaded', function () {
    wireWhatsAppCtas();
    wireTrackingPlaceholder();
    initMobileMenu();
    initHeaderScrollState();
    initHeroVideos();
    initReveal();
  });
})();
