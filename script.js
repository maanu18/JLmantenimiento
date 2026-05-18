const phoneNumber = '34608681863';
const form = document.getElementById('presupuestoForm');
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const backToTop = document.querySelector('.back-to-top');
const year = document.getElementById('year');
const lightbox = document.getElementById('lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxCaption = lightbox?.querySelector('p');
const lightboxClose = lightbox?.querySelector('.lightbox-close');

const fields = ['nombre', 'telefono', 'zona', 'servicio', 'mensaje'];
const storageKey = 'jl_presupuesto_form';

if (year) year.textContent = new Date().getFullYear();

function closeMenu() {
  document.body.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}

menuToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
});

nav?.addEventListener('click', (event) => {
  if (event.target.matches('a')) closeMenu();
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeMenu();
    closeLightbox();
  }
});

function getFormData() {
  return fields.reduce((data, field) => {
    const element = document.getElementById(field);
    data[field] = element ? element.value.trim() : '';
    return data;
  }, {});
}

function saveForm() {
  if (!form) return;
  localStorage.setItem(storageKey, JSON.stringify(getFormData()));
}

function loadForm() {
  const savedData = localStorage.getItem(storageKey);
  if (!savedData) return;

  try {
    const data = JSON.parse(savedData);
    fields.forEach((field) => {
      const element = document.getElementById(field);
      if (element && data[field]) element.value = data[field];
    });
  } catch (error) {
    localStorage.removeItem(storageKey);
  }
}

function buildWhatsAppMessage(data) {
  return `Hola, soy ${data.nombre}.\nQuiero solicitar presupuesto con JL Mantenimiento Integral.\n\nTeléfono: ${data.telefono}\nZona / localidad: ${data.zona || 'No indicada'}\nServicio: ${data.servicio}\nDetalles: ${data.mensaje || 'Sin detalles adicionales'}\n\nGracias.`;
}

loadForm();
form?.addEventListener('input', saveForm);

form?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = getFormData();
  saveForm();

  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(buildWhatsAppMessage(data))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
});

document.querySelectorAll('.quick-service').forEach((button) => {
  button.addEventListener('click', () => {
    const service = button.dataset.service;
    const select = document.getElementById('servicio');
    const message = document.getElementById('mensaje');

    if (select && service) select.value = service;
    if (message && !message.value.trim()) {
      message.value = `Hola, quiero información sobre ${service}.`;
    }

    saveForm();
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const delay = Number(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('is-visible'), delay);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.16 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
}

function updateBackToTop() {
  if (window.scrollY > 520) {
    backToTop?.classList.add('is-visible');
  } else {
    backToTop?.classList.remove('is-visible');
  }
}

function updateActiveNavLink() {
  const sections = [...document.querySelectorAll('section[id]')];
  const current = sections
    .filter((section) => section.getBoundingClientRect().top <= 140)
    .pop();

  navLinks.forEach((link) => {
    const isActive = current && link.getAttribute('href') === `#${current.id}`;
    link.classList.toggle('is-active', Boolean(isActive));
  });
}

window.addEventListener('scroll', () => {
  updateBackToTop();
  updateActiveNavLink();
}, { passive: true });

updateBackToTop();
updateActiveNavLink();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function openLightbox(src, caption, alt) {
  if (!lightbox || !lightboxImage || !lightboxCaption || !src) return;
  lightboxImage.src = src;
  lightboxImage.alt = alt || caption || 'Imagen del trabajo realizado';
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.classList.add('lightbox-open');
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('lightbox-open');
  setTimeout(() => {
    if (!lightbox.classList.contains('is-open')) lightboxImage.src = '';
  }, 180);
}

document.querySelectorAll('.gallery-item, .image-button').forEach((button) => {
  button.addEventListener('click', () => {
    const image = button.querySelector('img');
    openLightbox(button.dataset.full, button.dataset.caption, image?.alt);
  });
});

lightboxClose?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.querySelectorAll('img').forEach((image) => {
  image.addEventListener('error', () => {
    image.classList.add('image-missing');
    image.alt = image.alt || 'Imagen no encontrada';
  });
});
