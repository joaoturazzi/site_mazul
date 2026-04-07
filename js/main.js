/* ============================================
   MAZUL — main.js (Clean Rewrite)
   All elements visible by default.
   GSAP only enhances — never hides.
   ============================================ */
(function () {
  'use strict';

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Suppress ResizeObserver warnings */
  window.addEventListener('error', function (e) {
    if (e.message && e.message.indexOf('ResizeObserver') !== -1) e.stopImmediatePropagation();
  });

  /* Helpers */
  function $(id) { return document.getElementById(id); }
  function $$(sel) { return document.querySelectorAll(sel); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }
  var G = typeof gsap !== 'undefined';
  var ST = G && typeof ScrollTrigger !== 'undefined';

  /* ── Smooth scroll ── */
  var NAV_H = 90;
  $$('a[href^="#"]').forEach(function (a) {
    on(a, 'click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var t = document.querySelector(href);
      if (!t) return;
      e.preventDefault();
      var top = t.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      /* Close mobile menu */
      var mob = $('nav-mobile');
      if (mob) mob.classList.remove('open');
    });
  });

  /* ── Mobile menu ── */
  on($('hamburger'), 'click', function () { var m = $('nav-mobile'); if (m) m.classList.add('open'); });
  on($('closeMenu'), 'click', function () { var m = $('nav-mobile'); if (m) m.classList.remove('open'); });
  $$('.mobile-link').forEach(function (l) {
    on(l, 'click', function () { var m = $('nav-mobile'); if (m) m.classList.remove('open'); });
  });

  /* ── Scroll handler (no GSAP dependency) ── */
  var scrollRAF = false;
  var statsTriggered = {};
  var statTargets = { s1: 200, s2: 87, s3: 3, s4: 48 };

  function onScroll() {
    var sy = window.scrollY;
    var dh = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var pct = sy / dh;

    /* Progress bar */
    var pb = $('progress-bar');
    if (pb) pb.style.width = Math.min(pct * 100, 100).toFixed(1) + '%';

    /* Nav scroll state */
    var nav = $('nav');
    if (nav) nav.classList.toggle('scrolled', sy > 40);
    if (nav) nav.classList.toggle('on', sy > 40);

    /* Back to top */
    var btt = $('back-top');
    if (btt) {
      var show = sy > 400;
      btt.style.opacity = show ? '1' : '0';
      btt.style.pointerEvents = show ? 'auto' : 'none';
    }

    /* WA button */
    var wa = $('wa-btn');
    if (wa && pct > 0.25) wa.classList.add('visible');

    /* Mobile CTA bar */
    var mbar = $('mobile-cta-bar');
    if (mbar) {
      var cta = $('contato');
      var ctaTop = cta ? cta.getBoundingClientRect().top : 9999;
      mbar.classList.toggle('visible', sy > 200 && ctaTop > window.innerHeight * 0.8);
    }

    /* Nav active section */
    var sections = [
      { id: 'o-que-fazemos', href: '#o-que-fazemos' },
      { id: 'comparativo', href: '#comparativo' },
      { id: 'verticais', href: '#verticais' },
      { id: 'como-funciona', href: '#como-funciona' },
    ];
    var midY = window.innerHeight * 0.55;
    var activeHref = null;
    sections.forEach(function (s) {
      var el = $(s.id);
      if (!el) return;
      var r = el.getBoundingClientRect();
      if (r.top <= midY && r.bottom >= midY) activeHref = s.href;
    });
    $$('.nav-links a').forEach(function (l) {
      l.classList.toggle('nav-active', activeHref !== null && l.getAttribute('href') === activeHref);
    });

    /* Stats counters — trigger once */
    Object.keys(statTargets).forEach(function (id) {
      if (statsTriggered[id]) return;
      var el = $(id);
      if (!el) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
        statsTriggered[id] = true;
        animateCounter(el, statTargets[id]);
      }
    });

    scrollRAF = false;
  }

  window.addEventListener('scroll', function () {
    if (!scrollRAF) { scrollRAF = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ── Counter ── */
  function animateCounter(el, target) {
    if (reduced) { el.textContent = target.toLocaleString('pt-BR'); return; }
    var start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / 1800, 1);
      var ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(ease * target).toLocaleString('pt-BR');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ── Back to top ── */
  on($('back-top'), 'click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ── WA button — show after 10s fallback ── */
  setTimeout(function () { var w = $('wa-btn'); if (w) w.classList.add('visible'); }, 10000);

  /* ── FAQ Accordion (CSS max-height, no GSAP) ── */
  $$('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var icon = item.querySelector('.faq-icon');
    if (!q) return;
    q.setAttribute('role', 'button');
    q.setAttribute('tabindex', '0');
    q.setAttribute('aria-expanded', 'false');

    function toggle() {
      var isOpen = item.classList.contains('open');
      $$('.faq-item.open').forEach(function (i) {
        i.classList.remove('open');
        var ic = i.querySelector('.faq-icon');
        var qi = i.querySelector('.faq-q');
        if (ic) ic.textContent = '+';
        if (qi) qi.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        if (icon) icon.textContent = '\u00d7';
        q.setAttribute('aria-expanded', 'true');
      }
    }
    on(q, 'click', toggle);
    on(q, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
  });

  /* ── Form ── */
  (function () {
    var form = $('cta-form'), btn = $('cta-submit'), input = $('cta-email');
    var succ = $('cta-success'), trust = $('cta-trust'), waLink = $('cta-wa-link');
    var errEl = $('email-error');
    if (!btn || !input) return;
    var done = false;
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    on(input, 'input', function () {
      input.style.borderColor = '';
      if (errEl) errEl.style.display = 'none';
    });

    function submit() {
      if (done) return;
      var val = input.value.trim();
      if (!regex.test(val)) {
        input.style.borderColor = '#FF5050';
        if (errEl) { errEl.textContent = 'Email inválido.'; errEl.style.display = 'block'; }
        input.focus();
        return;
      }
      done = true;
      btn.textContent = 'Enviando...';
      btn.disabled = true;
      btn.style.opacity = '.65';
      setTimeout(function () {
        if (form) form.style.display = 'none';
        if (trust) trust.style.display = 'none';
        if (waLink) waLink.style.display = 'none';
        if (succ) { succ.classList.add('visible'); succ.style.display = 'flex'; }
      }, 800);
    }
    on(btn, 'click', submit);
    on(input, 'keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  })();

  /* ── LGPD ── */
  (function () {
    var banner = $('lgpd-banner');
    if (!banner) return;
    banner.style.display = 'none';
    try { if (localStorage.getItem('mazul_consent')) return; } catch (e) { return; }
    setTimeout(function () {
      banner.style.display = '';
      banner.classList.add('visible');
    }, 2000);
    function dismiss(v) {
      try { localStorage.setItem('mazul_consent', v); } catch (e) {}
      banner.classList.remove('visible');
      setTimeout(function () { banner.style.display = 'none'; }, 500);
    }
    on($('lgpd-accept'), 'click', function () { dismiss('all'); });
    on($('lgpd-reject'), 'click', function () { dismiss('essential'); });
  })();

  /* ── Agent Canvas live ── */
  (function () {
    var countEl = document.querySelector('[data-live-count]');
    if (countEl) {
      var n = parseInt(countEl.textContent.replace(/\D/g, ''), 10) || 12;
      function tick() {
        setTimeout(function () {
          if (!countEl.isConnected) return;
          n += 1;
          countEl.textContent = n;
          tick();
        }, 8000 + Math.random() * 12000);
      }
      tick();
    }
    var activeItem = document.querySelector('.ac-log-item.active');
    if (activeItem) {
      var msgs = [
        'Gerando análise de inadimplência Q2...',
        'Conciliando 234 NFs do período...',
        'Alerta: fatura vencida detectada...',
        'Briefing semanal em preparação...',
        'Monitorando fluxo de caixa...',
      ];
      var mi = 0;
      var textNode = null;
      activeItem.childNodes.forEach(function (nd) {
        if (nd.nodeType === 3 && nd.textContent.trim().length > 5) textNode = nd;
      });
      if (textNode) {
        setInterval(function () {
          if (!activeItem.isConnected) return;
          mi = (mi + 1) % msgs.length;
          textNode.textContent = '\n                  ' + msgs[mi];
        }, 4200);
      }
    }
  })();

  /* ── Fade-up (IntersectionObserver — no GSAP needed) ── */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.05, rootMargin: '50px 0px -30px 0px' });
    $$('.fade-up').forEach(function (el) { io.observe(el); });
  } else {
    $$('.fade-up').forEach(function (el) { el.classList.add('vis'); });
  }

  /* ── Mobile blur reduction ── */
  if (window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) {
    $$('.liquid-glass').forEach(function (el) {
      el.style.backdropFilter = 'blur(8px)';
      el.style.webkitBackdropFilter = 'blur(8px)';
    });
  }

  /* ═══════════════════════════════════════════
     GSAP ANIMATIONS (progressive enhancement)
     Everything works without this section.
     GSAP only adds motion — never hides content.
     ═══════════════════════════════════════════ */
  window.addEventListener('load', function () {
    if (!G || !ST || reduced) return;
    gsap.registerPlugin(ScrollTrigger);

    /* Hero entrance — uses gsap.set + gsap.to (never gsap.from) */
    gsap.set(['#hero-badge', '#hero-sub', '#hero-actions', '#hero-stats', '#hero-scroll'], { opacity: 0, y: 16 });
    gsap.set('.hero-title .line', { opacity: 0, yPercent: 100 });
    gsap.set('.hero-accent-line', { width: 0 });

    var heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });
    heroTL
      .to('#hero-badge', { opacity: 1, y: 0, duration: 0.5, delay: 0.15 })
      .to('.hero-title .line', { opacity: 1, yPercent: 0, stagger: 0.1, duration: 0.85 }, '-=0.2')
      .to('.hero-accent-line', { width: 56, opacity: 0.8, duration: 0.5 }, '-=0.4')
      .to('#hero-sub', { opacity: 1, y: 0, duration: 0.6 }, '-=0.3')
      .to('#hero-actions', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to('#hero-stats', { opacity: 1, y: 0, duration: 0.5 }, '-=0.2')
      .to('#hero-scroll', { opacity: 1, y: 0, duration: 0.4 }, '-=0.1');

    /* Safety: force visible after 3s if timeline stalls */
    setTimeout(function () {
      ['#hero-badge', '#hero-sub', '#hero-actions', '#hero-stats', '#hero-scroll'].forEach(function (s) {
        var el = document.querySelector(s);
        if (el && parseFloat(getComputedStyle(el).opacity) < 0.5) {
          gsap.set(el, { opacity: 1, y: 0, clearProps: 'all' });
        }
      });
      $$('.hero-title .line').forEach(function (l) {
        if (parseFloat(getComputedStyle(l).opacity) < 0.5) {
          gsap.set(l, { opacity: 1, yPercent: 0, clearProps: 'all' });
        }
      });
    }, 3000);

    /* Hero parallax */
    var heroImg = $('hero-img');
    if (heroImg) {
      gsap.to(heroImg, { y: '-15%', ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
      });
    }

    /* Feature blocks — fromTo (safe: explicit start AND end) */
    $$('.fb').forEach(function (fb) {
      var content = fb.querySelector('.fb-content');
      var mockup = fb.querySelector('.fb-mockup');
      var isEven = fb.classList.contains('even');

      if (content) {
        gsap.fromTo(content,
          { opacity: 0, x: isEven ? 40 : -40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: fb, start: 'top 85%', once: true }
          });
      }
      if (mockup) {
        gsap.fromTo(mockup,
          { opacity: 0, x: isEven ? -40 : 40 },
          { opacity: 1, x: 0, duration: 0.9, delay: 0.15, ease: 'power2.out',
            scrollTrigger: { trigger: fb, start: 'top 85%', once: true }
          });
      }
    });

    /* Parallax on bg images */
    $$('.parallax-img').forEach(function (img) {
      var parent = img.closest('.fb') || img.closest('.cta-section') || img.parentElement;
      gsap.to(img, { y: '-12%', ease: 'none',
        scrollTrigger: { trigger: parent, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* Section reveals — all use fromTo */
    var reveals = [
      { sel: '.vc', trigger: '.vert-grid', stagger: 0.06 },
      { sel: '.arch-card', trigger: '.arch-grid', stagger: 0.12 },
      { sel: '.integ-badge', trigger: '.integ-marquee-wrap', stagger: 0 },
      { sel: '.test-card', trigger: '.test-grid', stagger: 0.15 },
      { sel: '.stat-card', trigger: '.stats-grid', stagger: 0.08 },
      { sel: '.step', trigger: '.steps-grid', stagger: 0.1 },
    ];
    reveals.forEach(function (r) {
      var els = $$(r.sel);
      if (!els.length) return;
      gsap.fromTo(els,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: r.stagger, ease: 'power2.out',
          scrollTrigger: { trigger: r.trigger || els[0], start: 'top 85%', once: true }
        });
    });

    /* Stat labels */
    gsap.fromTo('.stat-label',
      { opacity: 0, y: 8 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out', delay: 0.8,
        scrollTrigger: { trigger: '.stats-section', start: 'top 80%', once: true }
      });

    /* CTA reveal */
    gsap.fromTo('.cta-content',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
        scrollTrigger: { trigger: '.cta-section', start: 'top 75%', once: true }
      });

    /* Refresh ScrollTrigger after everything loads */
    ScrollTrigger.refresh();
    setTimeout(function () { ScrollTrigger.refresh(); }, 500);
  });

})();
