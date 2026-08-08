/* ============================================================
   PORTFOLIO — interactions
   ------------------------------------------------------------
   01. Theme toggle (dark/light) with localStorage persistence
   02. Typing effect (rotates roles in the hero)
   03. Navbar: scrolled state, mobile menu, active-link spy
   04. Intersection Observer: reveal animations + skill bars
   05. Portfolio filtering
   06. Footer year
   ============================================================ */
'use strict';

/* ============================================================
   01. THEME TOGGLE (sliding switch)
   ------------------------------------------------------------
   The switch is a <label> wrapping a hidden checkbox. The
   checkbox's :checked state drives the thumb position (CSS);
   here we sync it with the <html data-theme> attribute and
   persist the choice in localStorage. Falls back to a
   "prefers-color-scheme" guess on first visit.
   ============================================================ */
(() => {
  const root = document.documentElement;
  const toggleInput = document.getElementById('theme-toggle'); // the checkbox

  if (!toggleInput) return;

  const saved = localStorage.getItem('theme');
  const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  const isLight = saved === 'light' || (!saved && systemPrefersLight);

  root.setAttribute('data-theme', isLight ? 'light' : 'dark');
  toggleInput.checked = isLight; // checked = light theme

  toggleInput.addEventListener('change', () => {
    const next = toggleInput.checked ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
})();


/* ============================================================
   02. TYPING EFFECT (hero)
   ------------------------------------------------------------
   Types and deletes a list of roles, cycling forever.
   Toggle `typedCursor` to enable/disable the caret.
   ============================================================ */
(() => {
  const roles = ['Hardware Engineer', 'Software Developer'];
  const typedEl = document.getElementById('typed-role');
  const typedCursor = true; // set false to remove the caret

  if (!typedEl) return;

  const TYPE_MS = 80;   // ms per character typed
  const DELETE_MS = 40; // ms per character deleted
  const HOLD_MS = 1700; // pause after a full word

  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const current = roles[roleIndex];

    if (!deleting) {
      charIndex++;
      typedEl.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        deleting = true;
        setTimeout(tick, HOLD_MS);
        return;
      }
    } else {
      charIndex--;
      typedEl.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        setTimeout(tick, 450);
        return;
      }
    }

    setTimeout(tick, deleting ? DELETE_MS : TYPE_MS);
  }

  if (typedCursor) typedEl.insertAdjacentHTML('afterend', '');
  tick();
})();


/* ============================================================
   03. NAVBAR
   ------------------------------------------------------------
   a) Adds a bottom border once the page is scrolled.
   b) Mobile burger: opens/closes the slide-down menu and
      closes it when a link is clicked.
   c) Scroll spy: highlights the section currently in view.
   ============================================================ */
(() => {
  const navbar = document.getElementById('navbar');
  const burger = document.getElementById('nav-burger');
  const navLinks = document.getElementById('nav-links');
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = [...document.querySelectorAll('main section[id]')];

  // a) scrolled state
  const onScroll = () => navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // b) mobile menu (hamburger)
  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };

  burger.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));

  // Close the menu when a link is clicked or the viewport widens
  links.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 721px)').addEventListener('change', (e) => {
    if (e.matches) setMenu(false);
  });

  // c) scroll spy — sections and the links that point at them
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => spy.observe(section));
})();


/* ============================================================
   04. REVEAL ON SCROLL + SKILL BARS
   ------------------------------------------------------------
   Elements with .reveal fade/slide in once. Skill-bar
   containers (.skills__col) get .in-view, which animates
   the bar width to its inline --pct value.
   ============================================================ */
(() => {
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // animate once, then stop watching
      });
    },
    { threshold: 0.12 }
  );

  revealEls.forEach((el, i) => {
    // Stagger siblings within a section slightly
    el.style.setProperty('--reveal-delay', `${Math.min(i % 6, 5) * 70}ms`);
    revealObserver.observe(el);
  });
})();


/* ============================================================
   05. PORTFOLIO FILTER
   ------------------------------------------------------------
   Buttons [All] [Hardware/CAD] [Software/Automation] toggle
   card visibility with a pop-in animation and update the
   visible project count.
   ============================================================ */
(() => {
  const buttons = [...document.querySelectorAll('.filter-btn')];
  const cards = [...document.querySelectorAll('.project-card')];
  const countEl = document.getElementById('project-count');

  function updateCount(n) {
    countEl.textContent = `// ${String(n).padStart(2, '0')} project${n === 1 ? '' : 's'} visible`;
  }

  function applyFilter(filter) {
    let visible = 0;

    cards.forEach((card) => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        visible++;
        // Re-trigger the pop-in animation on every filter change
        card.classList.remove('is-appearing');
        void card.offsetWidth; // force reflow so the animation restarts
        card.classList.add('is-appearing');
      }
    });

    updateCount(visible);
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
      applyFilter(btn.dataset.filter);
    });
  });

  applyFilter('all');
})();


/* ============================================================
   06. FOOTER YEAR
   ============================================================ */
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
