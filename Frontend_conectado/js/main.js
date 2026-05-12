/* ============================================================
   KAKUAB MARKET — main.js
   ============================================================ */

// ── Navbar scroll ─────────────────────────────────────────
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const current = window.scrollY;
  navbar.classList.toggle('scrolled', current > 40);
  lastScroll = current;
});

// ── Active nav link on scroll ─────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`);
      });
    }
  });
}, { rootMargin: '-40% 0px -50% 0px' });

sections.forEach(sec => observer.observe(sec));

// ── Search bar ────────────────────────────────────────────
let searchOpen = false;
const searchBar = document.getElementById('search-bar');

function toggleSearch() {
  searchOpen = !searchOpen;
  searchBar.style.transform = searchOpen ? 'translateY(0)' : 'translateY(-120%)';
  if (searchOpen) {
    setTimeout(() => document.getElementById('search-input').focus(), 50);
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && searchOpen) toggleSearch();
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
  }
});

// ── Mobile menu ───────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  mobileMenu.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeMobileMenu() {
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// ── Toast notification ────────────────────────────────────
let toastTimer;
function showToast(msg, icon = '✓') {
  const toast = document.getElementById('toast');
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ── Add to cart ───────────────────────────────────────────
let cartCount = 3;

function addToCart(btn, name) {
  // Button animation
  btn.textContent = '✓';
  btn.style.background = 'var(--green-400)';
  setTimeout(() => {
    btn.textContent = '+';
    btn.style.background = '';
  }, 1200);

  cartCount++;
  // Update badge
  const badge = document.querySelector('.cart-badge');
  if (badge) {
    badge.style.setProperty('--count', cartCount);
    // Force repaint for the pseudo-element via data attribute trick
    badge.setAttribute('data-count', cartCount);
  }

  showToast(`${name} adicionado ao carrinho`, '🛒');
}

// ── Wishlist ──────────────────────────────────────────────
function addWishlist(e) {
  const btn = e.currentTarget;
  const isActive = btn.textContent === '❤️';
  btn.textContent = isActive ? '🤍' : '❤️';
  showToast(isActive ? 'Removido dos favoritos' : 'Adicionado aos favoritos', isActive ? '🤍' : '❤️');
}

// ── Category filter ───────────────────────────────────────
function filterProducts(category) {
  const cards = document.querySelectorAll('#products-grid .product-card');
  let visible = 0;

  cards.forEach(card => {
    const match = card.dataset.category === category;
    card.style.transition = 'opacity .3s, transform .3s';
    if (match || category === 'all') {
      card.style.opacity = '1';
      card.style.transform = 'scale(1)';
      card.style.display = '';
      visible++;
    } else {
      card.style.opacity = '0.2';
      card.style.transform = 'scale(0.97)';
    }
  });

  // Scroll to products
  document.getElementById('products').scrollIntoView({ behavior: 'smooth' });

  const labels = {
    organico: 'Orgânicos',
    natural: 'Naturais',
    sustentavel: 'Sustentáveis',
    artesanal: 'Artesanais'
  };
  showToast(`Filtrando: ${labels[category] || category}`, '🔍');
}

// ── Newsletter ────────────────────────────────────────────
function handleNewsletter(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  const email = input.value;
  input.value = '';
  showToast(`${email} inscrito com sucesso!`, '🌿');
}

// ── Scroll reveal ─────────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.product-card, .category-card, .testimonial-card, .why-card, .why-feature').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  revealObserver.observe(el);
});

// ── Smooth anchor links ───────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});