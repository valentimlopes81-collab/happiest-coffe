const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

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

// Hero carousel: fade between slides with arrows, dots and autoplay.
const heroCarousel = document.getElementById('heroCarousel');
if (heroCarousel) {
  const slides = Array.from(heroCarousel.querySelectorAll('.hero-slide'));
  const dots = Array.from(heroCarousel.querySelectorAll('.hero-dot'));
  const prevBtn = document.getElementById('heroPrev');
  const nextBtn = document.getElementById('heroNext');
  let index = 0;
  let timer = null;
  const INTERVAL = 6000;

  const show = (next) => {
    index = (next + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => {
      const active = i === index;
      d.classList.toggle('is-active', active);
      d.setAttribute('aria-selected', String(active));
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => show(index + 1), INTERVAL);
  };
  const stop = () => { if (timer) window.clearInterval(timer); timer = null; };

  nextBtn.addEventListener('click', () => { show(index + 1); start(); });
  prevBtn.addEventListener('click', () => { show(index - 1); start(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { show(i); start(); }));

  heroCarousel.addEventListener('mouseenter', stop);
  heroCarousel.addEventListener('mouseleave', start);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) start();
}

// Loja: fade the product photo in once it loads; keep the labelled
// placeholder visible until a real file exists at the referenced path.
document.querySelectorAll('.product-media').forEach((media) => {
  const img = media.querySelector('.product-img');
  if (!img) return;
  const reveal = () => media.classList.add('is-loaded');
  if (img.getAttribute('src')) {
    if (img.complete && img.naturalWidth > 0) reveal();
    else img.addEventListener('load', reveal);
  }
});

// Loja: product detail popup + a simple, static cart simulation.
const shopSection = document.querySelector('.shop');
if (shopSection) {
  const euro = (n) => n.toFixed(2).replace('.', ',') + ' €';

  /* ---------- Detail popup ---------- */
  const modal = document.getElementById('productModal');
  const pm = {
    cat: document.getElementById('pmCat'),
    title: document.getElementById('pmTitle'),
    price: document.getElementById('pmPrice'),
    desc: document.getElementById('pmDesc'),
    img: document.getElementById('pmImg'),
    imgWrap: document.querySelector('.product-modal-media'),
    ph: document.getElementById('pmPh'),
    buy: document.getElementById('pmBuy'),
  };
  let activeCard = null;
  let lastFocus = null;

  const readCard = (card) => ({
    name: card.dataset.name,
    price: parseFloat(card.dataset.price),
    cat: card.dataset.cat,
    desc: card.dataset.desc,
    img: card.querySelector('.product-img'),
  });

  const openModal = (card) => {
    activeCard = card;
    const data = readCard(card);
    pm.cat.textContent = data.cat;
    pm.title.textContent = data.name;
    pm.price.textContent = euro(data.price);
    pm.desc.textContent = data.desc;

    // Mirror the product photo (or its placeholder) into the popup.
    pm.imgWrap.classList.remove('is-loaded');
    pm.ph.innerHTML = '';
    const svg = card.querySelector('.product-media-ph svg');
    if (svg) pm.ph.appendChild(svg.cloneNode(true));
    const src = data.img ? data.img.getAttribute('src') : '';
    if (src && data.img.complete && data.img.naturalWidth > 0) {
      pm.img.src = src;
      pm.img.alt = data.name;
      pm.imgWrap.classList.add('is-loaded');
    } else {
      pm.img.removeAttribute('src');
      pm.img.alt = '';
    }

    lastFocus = document.activeElement;
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
    pm.buy.focus();
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(() => { modal.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll('.product-media[data-open]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.closest('.product-card')));
  });
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
  pm.buy.addEventListener('click', () => {
    if (activeCard) addToCart(readCard(activeCard));
    closeModal();
    openCart();
  });

  /* ---------- Cart ---------- */
  const drawer = document.getElementById('cartDrawer');
  const fab = document.getElementById('cartFab');
  const countEl = document.getElementById('cartCount');
  const itemsEl = document.getElementById('cartItems');
  const emptyEl = document.getElementById('cartEmpty');
  const footEl = document.getElementById('cartFoot');
  const totalEl = document.getElementById('cartTotal');
  const checkout = document.getElementById('cartCheckout');
  const cart = [];

  const addToCart = ({ name, price }) => {
    const line = cart.find((i) => i.name === name);
    if (line) line.qty += 1;
    else cart.push({ name, price, qty: 1 });
    renderCart();
  };

  const renderCart = () => {
    itemsEl.innerHTML = '';
    let total = 0;
    let units = 0;
    cart.forEach((item, i) => {
      total += item.price * item.qty;
      units += item.qty;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML =
        '<div class="cart-item-info">' +
          '<span class="cart-item-name"></span>' +
          '<span class="cart-item-unit"></span>' +
        '</div>' +
        '<div class="cart-qty">' +
          '<button type="button" aria-label="Remover uma unidade">–</button>' +
          '<span></span>' +
          '<button type="button" aria-label="Adicionar uma unidade">+</button>' +
        '</div>' +
        '<span class="cart-item-line"></span>';
      row.querySelector('.cart-item-name').textContent = item.name;
      row.querySelector('.cart-item-unit').textContent = euro(item.price) + ' / un';
      row.querySelector('.cart-qty span').textContent = item.qty;
      row.querySelector('.cart-item-line').textContent = euro(item.price * item.qty);
      const [minus, plus] = row.querySelectorAll('.cart-qty button');
      minus.addEventListener('click', () => {
        item.qty -= 1;
        if (item.qty <= 0) cart.splice(i, 1);
        renderCart();
      });
      plus.addEventListener('click', () => { item.qty += 1; renderCart(); });
      itemsEl.appendChild(row);
    });

    const has = cart.length > 0;
    emptyEl.hidden = has;
    footEl.hidden = !has;
    totalEl.textContent = euro(total);
    countEl.textContent = units;
    countEl.hidden = units === 0;

    const existing = footEl.querySelector('.cart-confirm');
    if (existing) existing.remove();
  };

  const openCart = () => {
    drawer.hidden = false;
    requestAnimationFrame(() => drawer.classList.add('is-open'));
    document.body.style.overflow = 'hidden';
  };
  const closeCart = () => {
    drawer.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(() => { drawer.hidden = true; }, 320);
  };

  fab.addEventListener('click', openCart);
  drawer.querySelectorAll('[data-cart-close]').forEach((el) => el.addEventListener('click', closeCart));

  document.querySelectorAll('.product-card [data-buy]').forEach((btn) => {
    btn.addEventListener('click', () => {
      addToCart(readCard(btn.closest('.product-card')));
      openCart();
    });
  });

  checkout.addEventListener('click', () => {
    if (!cart.length) return;
    if (footEl.querySelector('.cart-confirm')) return;
    const msg = document.createElement('p');
    msg.className = 'cart-confirm';
    msg.textContent = 'Obrigado! Este é um carrinho de demonstração — em breve poderás finalizar aqui a tua compra.';
    footEl.appendChild(msg);
  });

  /* ---------- Shared: close on Esc ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!modal.hidden) closeModal();
    else if (!drawer.hidden) closeCart();
  });
}
