/* AUTOTRIX — Plain JavaScript. No dependencies or build step required. */
'use strict';

// Optional: add your own same-origin form API URL to enable direct submission.
// The default prepares an email for the visitor to review and send themselves.
const FORM_ENDPOINT = '';
const BUSINESS_EMAIL = 'autotrixgraphics@gmail.com';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('js');

/* 1. Header and mobile menu */
const header = document.getElementById('header');
const menuButton = document.querySelector('.menu-toggle');
const menu = document.getElementById('main-nav');
function closeMenu() {
  menu.classList.remove('is-open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
}
menuButton.addEventListener('click', function () {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('is-open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', function (event) {
  if (!header.contains(event.target)) closeMenu();
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape' && menu.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);

/* 2. Hero carousel: crossfade, autoplay, navigation and swipe */
const hero = document.querySelector('.hero');
const slides = [...document.querySelectorAll('.hero-slide')];
const slideButtons = [...document.querySelectorAll('[data-go-slide]')];
const pauseButton = document.getElementById('pause-slider');
const progress = document.querySelector('.slide-progress');
let currentSlide = 0;
let slideTimer;
let userPaused = reduceMotion.matches;
let pointerOverHero = false;
let heroHasFocus = false;
let touchStartX = 0;
let touchStartY = 0;

function stopAutoplay() {
  window.clearTimeout(slideTimer);
  progress.classList.remove('running');
}
function scheduleAutoplay() {
  stopAutoplay();
  if (userPaused || pointerOverHero || heroHasFocus || document.hidden) return;
  // Restart the CSS progress bar in sync with the next slide.
  void progress.offsetWidth;
  progress.classList.add('running');
  slideTimer = window.setTimeout(() => showSlide(currentSlide + 1, false), 7000);
}
function showSlide(index, announce = true) {
  currentSlide = (index + slides.length) % slides.length;
  slides.forEach(function (slide, i) {
    const active = i === currentSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
    slide.inert = !active;
    slideButtons[i].classList.toggle('is-active', active);
    slideButtons[i].setAttribute('aria-pressed', String(active));
  });
  if (announce) document.getElementById('slide-status').textContent = slides[currentSlide].getAttribute('aria-label');
  scheduleAutoplay();
}
document.getElementById('prev-slide').addEventListener('click', () => showSlide(currentSlide - 1));
document.getElementById('next-slide').addEventListener('click', () => showSlide(currentSlide + 1));
slideButtons.forEach(button => button.addEventListener('click', () => showSlide(Number(button.dataset.goSlide))));
function updatePauseButton() {
  pauseButton.textContent = '';
  pauseButton.classList.toggle('is-paused', userPaused);
  pauseButton.setAttribute('aria-label', userPaused ? 'Play slideshow' : 'Pause slideshow');
  pauseButton.setAttribute('aria-pressed', String(userPaused));
}
pauseButton.addEventListener('click', function () {
  userPaused = !userPaused;
  updatePauseButton();
  scheduleAutoplay();
});
hero.addEventListener('mouseenter', function () { pointerOverHero = true; stopAutoplay(); });
hero.addEventListener('mouseleave', function () { pointerOverHero = false; scheduleAutoplay(); });
hero.addEventListener('focusin', function () { heroHasFocus = true; stopAutoplay(); });
hero.addEventListener('focusout', function (event) {
  heroHasFocus = hero.contains(event.relatedTarget);
  scheduleAutoplay();
});
hero.addEventListener('keydown', function (event) {
  if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
    event.preventDefault();
    showSlide(currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
  }
});
hero.addEventListener('touchstart', function (event) {
  touchStartX = event.changedTouches[0].clientX;
  touchStartY = event.changedTouches[0].clientY;
  stopAutoplay();
}, { passive: true });
hero.addEventListener('touchend', function (event) {
  const dx = event.changedTouches[0].clientX - touchStartX;
  const dy = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) showSlide(currentSlide + (dx < 0 ? 1 : -1));
  else scheduleAutoplay();
}, { passive: true });
document.addEventListener('visibilitychange', scheduleAutoplay);
reduceMotion.addEventListener('change', function () {
  userPaused = reduceMotion.matches;
  updatePauseButton();
  scheduleAutoplay();
});
updatePauseButton();
scheduleAutoplay();

/* 3. Scroll animation: animate once, with small staggered delays */
const revealElements = document.querySelectorAll('.reveal');
document.querySelectorAll('.tinting-cards, .benefit-list, .services-grid, .gallery-grid, .process-steps').forEach(function (group) {
  [...group.children].forEach((child, i) => child.style.setProperty('--delay', (i % 3) * 85 + 'ms'));
});
if ('IntersectionObserver' in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  revealElements.forEach(element => revealObserver.observe(element));
} else revealElements.forEach(element => element.classList.add('is-visible'));

/* 4. Sticky header appearance, active navigation and back to top */
const backToTop = document.querySelector('.back-to-top');
let scrollQueued = false;
const navLinks = [...document.querySelectorAll('.main-nav .nav-link')];
const navSections = navLinks.map(link => document.querySelector(link.getAttribute('href')));
function updateScrollState() {
  header.classList.toggle('scrolled', window.scrollY > 20);
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollAmount = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
  document.getElementById('scroll-progress').style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollAmount)) + ')';
  backToTop.classList.toggle('visible', window.scrollY > 700);
  let activeIndex = 0;
  navSections.forEach((section, i) => { if (section.getBoundingClientRect().top < 180) activeIndex = i; });
  navLinks.forEach((link, i) => {
    link.classList.toggle('active', i === activeIndex);
    if (i === activeIndex) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  scrollQueued = false;
}
window.addEventListener('scroll', function () {
  if (!scrollQueued) { scrollQueued = true; window.requestAnimationFrame(updateScrollState); }
}, { passive: true });
backToTop.addEventListener('click', function () {
  window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'instant' : 'smooth' });
  document.querySelector('.brand').focus({ preventScroll: true });
});
updateScrollState();
document.getElementById('year').textContent = new Date().getFullYear();

/* 5. Service information and quote preselection */
const serviceData = {
  vehicle: { title: 'Vehicle Window Tinting', text: 'A little less glare. A little more comfort. Explore window film options that suit your vehicle and the way you drive.', items: ['Cars, SUVs and vans', 'Film choices for comfort, privacy and appearance', 'Careful installation and aftercare guidance'], note: 'Film performance varies. We will discuss suitable options and applicable vehicle tint requirements with you.' },
  building: { title: 'Building Window Tinting', text: 'Make the light work for your space. Window film can help manage heat and glare in homes, offices and storefronts.', items: ['Residential and commercial windows', 'Options for solar control and privacy', 'Film selection based on your glass and your goals'], note: 'Privacy depends on film and lighting. Heat reduction and any cooling savings vary by building and installation.' },
  storefront: { title: 'Storefront Signage', text: 'Give people a reason to look your way. Create a welcoming, recognizable presence for your business.', items: ['Custom business identification', 'Exterior storefront signs and lettering', 'Design, production and installation planning'] },
  graphics: { title: 'Vehicle Graphics', text: 'Put your business in motion with commercial vehicle graphics designed around your brand.', items: ['Business logos and vehicle lettering', 'Commercial vehicle wraps', 'Branding for work trucks, vans and fleets'], note: 'We no longer offer full color-change vehicle wraps.' },
  banners: { title: 'Custom Banners', text: 'A clear message with room to make an impact. Create custom banners for events, promotions and business announcements.', items: ['Event and promotional banners', 'Custom sizing and artwork', 'Indoor and outdoor material options'] },
  decals: { title: 'Custom Decals', text: 'Bring your identity to the details with custom vinyl graphics and logo decals.', items: ['Custom-cut vinyl and lettering', 'Logo and promotional decals', 'Artwork, size and surface guidance'] },
  realtor: { title: 'Realtor Signs', text: 'Help buyers find your next listing with clear, recognizable real estate signs.', items: ['For-sale and property signs', 'Custom agent and brokerage branding', 'Sign formats suited to your location'] },
  wall: { title: 'Wall & Window Graphics', text: 'Turn walls and windows into an extension of your business with creative, custom graphics.', items: ['Business branding for glass and walls', 'Store window lettering and graphics', 'Artwork and surface preparation guidance'] },
  interior: { title: 'Interior & Exterior Signs', text: 'Create a consistent identity from the street to the reception area with custom signs for your business.', items: ['Indoor business identification', 'Outdoor business signs', 'Materials and installation suited to the setting'] },
  directional: { title: 'Directional Signs', text: 'Make every destination easier to find. Clear wayfinding helps visitors feel welcome and get where they need to go.', items: ['Building and facility wayfinding', 'Visitor and event directions', 'Custom layouts and brand styling'] },
  roadside: { title: 'Roadside Signs', text: 'Help people find your business with signs designed for visibility in their surroundings.', items: ['Business identification and advertising', 'Site-specific layouts', 'Production and installation planning'] },
  promotional: { title: 'Promotional Signs', text: 'Let your next offer, launch or campaign take center stage with custom promotional signage.', items: ['Sales and event advertising', 'Campaign and political signage', 'Custom messaging, formats and sizes'] },
  signshop: { title: 'Custom Sign Shop', text: 'Have an idea that does not fit a category? Let us help you find the right custom sign or graphics solution.', items: ['A conversation about your idea and goals', 'Custom design and material planning', 'Production and installation support'] }
};
const serviceDialog = document.getElementById('service-dialog');
const serviceSelect = document.getElementById('service');
function selectService(name) {
  if ([...serviceSelect.options].some(option => option.value === name)) serviceSelect.value = name;
}
document.querySelectorAll('[data-service]').forEach(link => link.addEventListener('click', () => selectService(link.dataset.service)));
document.querySelectorAll('[data-detail]').forEach(function (button) {
  button.addEventListener('click', function () {
    const service = serviceData[button.dataset.detail];
    document.getElementById('detail-title').textContent = service.title;
    document.getElementById('detail-description').textContent = service.text;
    const list = document.getElementById('detail-list');
    list.replaceChildren();
    service.items.forEach(function (text) { const li = document.createElement('li'); li.textContent = text; list.appendChild(li); });
    document.getElementById('detail-note').textContent = service.note || 'Tell us about your project, location and preferred timing for a personalized quote.';
    document.getElementById('detail-quote').dataset.service = service.title;
    serviceDialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.getElementById('detail-quote').addEventListener('click', function (event) {
  selectService(event.currentTarget.dataset.service);
  serviceDialog.close();
});

/* 6. Gallery filters and image lightbox */
const projects = [...document.querySelectorAll('.project')];
document.querySelectorAll('[data-filter]').forEach(function (button) {
  button.addEventListener('click', function () {
    document.querySelectorAll('[data-filter]').forEach(function (item) {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    let visible = 0;
    projects.forEach(function (project) {
      project.hidden = button.dataset.filter !== 'all' && project.dataset.category !== button.dataset.filter;
      if (!project.hidden) { visible++; project.classList.add('is-visible'); }
    });
    document.getElementById('gallery-status').textContent = 'Showing ' + visible + ' projects.';
  });
});
const lightbox = document.getElementById('lightbox');
projects.forEach(function (project) {
  project.addEventListener('click', function () {
    const image = document.getElementById('lightbox-image');
    image.src = project.dataset.image;
    image.alt = project.querySelector('img').alt;
    document.getElementById('lightbox-caption').textContent = project.dataset.caption;
    lightbox.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelectorAll('dialog').forEach(function (dialog) {
  dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', function (event) {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
});

/* 7. FAQ: keep one answer expanded at a time. Native details works without JS. */
const questions = [...document.querySelectorAll('.faq-list details')];
questions.forEach(function (question) {
  question.addEventListener('toggle', function () {
    if (question.open) questions.forEach(other => { if (other !== question) other.open = false; });
  });
});

/* 8. Quote form. Never display a sent message without a successful API response. */
const quoteForm = document.getElementById('quote-form');
const formResult = document.getElementById('form-result');
function showFormResult(text, isError = false) {
  formResult.replaceChildren();
  const paragraph = document.createElement('p');
  paragraph.textContent = text;
  formResult.appendChild(paragraph);
  formResult.classList.toggle('error', isError);
  formResult.hidden = false;
}
quoteForm.addEventListener('input', function () { formResult.hidden = true; });
quoteForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  if (!quoteForm.reportValidity()) return;
  const data = new FormData(quoteForm);
  if (data.get('company_website')) return;
  const name = String(data.get('name')).trim();
  const message = String(data.get('message')).trim();
  if (!name || message.length < 10) {
    showFormResult('Please enter your name and at least 10 characters about your project.', true);
    return;
  }
  const payload = { name, email: String(data.get('email')).trim(), phone: String(data.get('phone')).trim(), service: String(data.get('service')), message };
  if (FORM_ENDPOINT) {
    const submitButton = quoteForm.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(FORM_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error('Unable to submit');
      showFormResult('Thank you. Your quote request has been received. The Autotrix team will be in touch.');
      quoteForm.reset();
    } catch (error) {
      showFormResult('Your request could not be sent. Please try again or email ' + BUSINESS_EMAIL + '.', true);
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
    return;
  }
  const subject = 'Quote request — ' + payload.service;
  const body = 'Hello Autotrix,\n\nI would like a quote for ' + payload.service + '.\n\nName: ' + payload.name + '\nEmail: ' + payload.email + '\nPhone: ' + (payload.phone || 'Not provided') + '\n\nProject details:\n' + payload.message + '\n\nThank you.';
  showFormResult('Your email draft is ready. Open it below, review the details and send it from your email app. Your request has not been sent yet.');
  const emailLink = document.createElement('a');
  emailLink.href = 'mailto:' + BUSINESS_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  emailLink.textContent = 'Open email draft →';
  formResult.appendChild(emailLink);
});


/* 9. Premium visual enhancements (progress, a gentle spotlight and process-line reveal).
   These are enhancements only; no essential interaction depends on them. */
if (!reduceMotion.matches && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.service-card, .tint-card').forEach(function (card) {
    card.addEventListener('pointermove', function (event) {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', (event.clientX - bounds.left) + 'px');
      card.style.setProperty('--spot-y', (event.clientY - bounds.top) + 'px');
    }, { passive: true });
  });
}

const processRow = document.querySelector('.process-steps');
if (processRow && 'IntersectionObserver' in window && !reduceMotion.matches) {
  const processObserver = new IntersectionObserver(function (entries, observer) {
    if (entries[0].isIntersecting) {
      processRow.classList.add('is-in-view');
      observer.disconnect();
    }
  }, { threshold: 0.25 });
  processObserver.observe(processRow);
}
