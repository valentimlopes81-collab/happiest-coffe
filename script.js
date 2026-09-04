document.getElementById('year').textContent = new Date().getFullYear();

const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
  const isOpen = navMobile.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navMobile.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navMobile.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Infinite carousel: duplicate the slide set once so the looping
// CSS animation (translateX -50%) has a seamless second half.
const carouselTrack = document.getElementById('carouselTrack');
if (carouselTrack) {
  const slides = Array.from(carouselTrack.children);
  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    carouselTrack.appendChild(clone);
  });
}

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
