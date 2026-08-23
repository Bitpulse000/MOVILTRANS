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
     Hero video — don't autoplay motion for viewers who have
     asked their system for reduced motion; show a still frame.
     ----------------------------------------------------- */
  function initHeroVideo() {
    var video = document.querySelector('.hero__video');
    if (!video) return;
    var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      video.removeAttribute('autoplay');
      video.pause();
    }
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
    initHeroVideo();
    initReveal();
  });
})();
