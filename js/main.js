'use strict';

/* =========================================================
   Yurta Housse — main.js
   ========================================================= */

const WA_NUMBER = '77718482157';
const WA_DEFAULT_MSG = 'Здравствуйте! Хочу забронировать юрту.';

/* ---- Utility ---- */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }

/* ---- Language switcher ---- */
(function initLang() {
  const btns = $$('.lang-switcher__btn');
  const isKZ = window.location.pathname.startsWith('/kz') || window.location.pathname.includes('/kz/');

  btns.forEach(btn => {
    const lang = btn.dataset.lang;
    btn.classList.toggle('active', isKZ ? lang === 'kz' : lang === 'ru');

    btn.addEventListener('click', () => {
      if (btn.classList.contains('active')) return;
      localStorage.setItem('yurta_lang', lang);
      if (lang === 'kz') {
        const base = window.location.origin;
        window.location.href = base + '/kz/';
      } else {
        const base = window.location.origin;
        window.location.href = base + '/';
      }
    });
  });
})();

/* ---- Sticky header ---- */
(function initHeader() {
  const header = $('.header');
  if (!header) return;

  function onScroll() {
    header.classList.toggle('scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Burger menu ---- */
(function initBurger() {
  const burger = $('.burger');
  const nav = $('.mobile-nav');
  if (!burger || !nav) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    nav.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    burger.setAttribute('aria-expanded', open);
  });

  /* Close on nav link click */
  $$('.mobile-nav__links a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* Close on outside click */
  document.addEventListener('click', e => {
    if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) {
      burger.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
})();

/* ---- Smooth scroll ---- */
(function initSmoothScroll() {
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();

/* ---- Gallery lightbox ---- */
(function initLightbox() {
  const lb = $('.lightbox');
  if (!lb) return;

  const img = lb.querySelector('.lightbox__img');
  const counter = lb.querySelector('.lightbox__counter');
  const prev = lb.querySelector('.lightbox__prev');
  const next = lb.querySelector('.lightbox__next');
  const close = lb.querySelector('.lightbox__close');

  const items = $$('.gallery__item');
  let current = 0;

  const sources = items.map(item => {
    const i = item.querySelector('img');
    return i ? { src: i.src, alt: i.alt } : null;
  }).filter(Boolean);

  function show(idx) {
    if (!sources.length) return;
    current = (idx + sources.length) % sources.length;
    const s = sources[current];
    img.src = s.src;
    img.alt = s.alt || '';
    counter.textContent = `${current + 1} / ${sources.length}`;
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLb() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  items.forEach((item, i) => item.addEventListener('click', () => show(i)));
  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  close.addEventListener('click', closeLb);
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  /* Touch swipe */
  let touchStartX = 0;
  lb.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) show(dx < 0 ? current + 1 : current - 1);
  });
})();

/* ---- FAQ accordion ---- */
(function initFAQ() {
  $$('.faq__item').forEach(item => {
    const q = item.querySelector('.faq__question');
    if (!q) return;
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      /* Close all */
      $$('.faq__item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
})();

/* ---- Reviews dots / slider ---- */
(function initReviews() {
  const slider = $('.reviews__slider');
  const dots = $$('.reviews__dot');
  if (!slider || !dots.length) return;

  function updateDots() {
    const w = slider.clientWidth;
    const idx = Math.round(slider.scrollLeft / w);
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  slider.addEventListener('scroll', updateDots, { passive: true });
  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      slider.scrollTo({ left: i * slider.clientWidth, behavior: 'smooth' });
    });
  });
  updateDots();
})();

/* ---- Booking form ---- */
(function initForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  function validate() {
    let ok = true;
    const required = form.querySelectorAll('[data-required]');
    required.forEach(field => {
      const err = document.getElementById(field.id + '-err');
      const empty = !field.value.trim();
      field.classList.toggle('error', empty);
      if (err) err.classList.toggle('visible', empty);
      if (empty) ok = false;
    });

    const phone = document.getElementById('f-phone');
    if (phone && phone.value.trim()) {
      const valid = /^[\d\s\+\-\(\)]{7,}$/.test(phone.value.trim());
      const err = document.getElementById('f-phone-err');
      if (!valid) {
        phone.classList.add('error');
        if (err) { err.textContent = 'Введите корректный номер'; err.classList.add('visible'); }
        ok = false;
      }
    }

    return ok;
  }

  form.addEventListener('submit', e => {
    e.preventDefault();

    /* Honeypot */
    const hp = form.querySelector('.form__honeypot input');
    if (hp && hp.value) return;

    if (!validate()) return;

    const name = (document.getElementById('f-name') || {}).value || '';
    const phone = (document.getElementById('f-phone') || {}).value || '';
    const date = (document.getElementById('f-date') || {}).value || '';
    const guests = (document.getElementById('f-guests') || {}).value || '';
    const comment = (document.getElementById('f-comment') || {}).value || '';

    let msg = `Здравствуйте! Хочу забронировать юрту.\nИмя: ${name}\nТелефон: ${phone}`;
    if (date) msg += `\nДата: ${date}`;
    if (guests) msg += `\nГостей: ${guests}`;
    if (comment) msg += `\nКомментарий: ${comment}`;

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener');

    /* Show success */
    const success = form.querySelector('.form__success');
    if (success) {
      success.style.display = 'block';
      form.reset();
      setTimeout(() => { success.style.display = 'none'; }, 6000);
    }

    trackEvent('form_submit');
  });

  /* Live validation clear */
  $$('[data-required]', form).forEach(field => {
    field.addEventListener('input', () => {
      field.classList.remove('error');
      const err = document.getElementById(field.id + '-err');
      if (err) err.classList.remove('visible');
    });
  });
})();

/* ---- Analytics event tracking ---- */
function trackEvent(name, params = {}) {
  /* GA4 */
  if (typeof gtag === 'function') {
    gtag('event', name, params);
  }
  /* Яндекс.Метрика */
  if (typeof ym === 'function') {
    ym(/* МЕТРИКА_ID */ 0, 'reachGoal', name);
  }
}

/* Track all WA / call buttons */
(function initTracking() {
  $$('[data-event]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent(el.dataset.event, { label: el.dataset.label || '' });
    });
  });
})();

/* ---- Scroll reveal ---- */
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();
