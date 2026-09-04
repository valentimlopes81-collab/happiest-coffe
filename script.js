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

// Infinite gallery columns: same duplication trick, but vertical
// (translateY -50%), so each tetris column loops seamlessly too.
document.querySelectorAll('.gallery-col').forEach((col) => {
  const items = Array.from(col.children);
  items.forEach((item) => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    col.appendChild(clone);
  });
});

// Hours card: highlight today and compute "open now" from the
// listed ranges, using Lisbon time regardless of the visitor's own.
const hoursList = document.getElementById('hoursList');
if (hoursList) {
  const lisbonNow = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Lisbon' }));
  const today = lisbonNow.getDay();
  const minutesNow = lisbonNow.getHours() * 60 + lisbonNow.getMinutes();
  let isOpen = false;

  hoursList.querySelectorAll('li').forEach((li) => {
    if (Number(li.dataset.day) !== today) return;
    li.classList.add('is-today');
    const range = li.children[1].textContent.match(/(\d{2}):(\d{2}).*?(\d{2}):(\d{2})/);
    if (range) {
      const start = Number(range[1]) * 60 + Number(range[2]);
      const end = Number(range[3]) * 60 + Number(range[4]);
      isOpen = minutesNow >= start && minutesNow < end;
    }
  });

  const openStatus = document.getElementById('openStatus');
  const openStatusText = document.getElementById('openStatusText');
  if (openStatus && openStatusText) {
    openStatus.classList.toggle('is-closed', !isOpen);
    openStatusText.textContent = isOpen ? 'Aberto agora' : 'Fechado agora';
  }
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
