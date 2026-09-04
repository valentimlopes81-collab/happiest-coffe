document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
  nav.classList.toggle('open');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

// Photo placeholders: show a labeled placeholder until a real image
// is added at the referenced path in assets/images/**.
document.querySelectorAll('.photo-slot .photo').forEach((img) => {
  const slot = img.closest('.photo-slot');
  const markEmpty = () => slot.classList.add('is-empty');
  if (!img.getAttribute('src')) {
    markEmpty();
    return;
  }
  img.addEventListener('error', markEmpty);
  if (img.complete && img.naturalWidth === 0) markEmpty();
});
