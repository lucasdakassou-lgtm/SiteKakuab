/* =============================================
   KAKUAB MARKET - Shared JavaScript
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ========== PASSWORD TOGGLE ==========
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('.material-icons-outlined');

      if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'visibility';
      } else {
        input.type = 'password';
        icon.textContent = 'visibility_off';
      }
    });
  });

  // ========== MOBILE NAV TOGGLE ==========
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      }
    });
  }

  // ========== NAVBAR SCROLL EFFECT ==========
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  // ========== CAROUSEL ==========
  const carouselTrack = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');

  if (carouselTrack && prevBtn && nextBtn) {
    const scrollAmount = 240;

    nextBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
      carouselTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Touch/drag support for carousel
    let isDown = false;
    let startX;
    let scrollLeft;

    carouselTrack.addEventListener('mousedown', (e) => {
      isDown = true;
      carouselTrack.style.cursor = 'grabbing';
      startX = e.pageX - carouselTrack.offsetLeft;
      scrollLeft = carouselTrack.scrollLeft;
    });

    carouselTrack.addEventListener('mouseleave', () => {
      isDown = false;
      carouselTrack.style.cursor = 'grab';
    });

    carouselTrack.addEventListener('mouseup', () => {
      isDown = false;
      carouselTrack.style.cursor = 'grab';
    });

    carouselTrack.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carouselTrack.offsetLeft;
      const walk = (x - startX) * 2;
      carouselTrack.scrollLeft = scrollLeft - walk;
    });

    carouselTrack.style.cursor = 'grab';
  }

  // ========== NEWSLETTER FORM ==========
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = newsletterForm.querySelector('input[type="email"]');
      if (emailInput && emailInput.value) {
        // Show success feedback
        const btn = newsletterForm.querySelector('button');
        const originalText = btn.textContent;
        btn.textContent = '✓ INSCRITO!';
        btn.style.background = 'var(--green-200)';
        btn.style.color = 'var(--green-900)';
        emailInput.value = '';

        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.style.color = '';
        }, 3000);
      }
    });
  }

  // ========== LOGIN FORM ==========
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = document.getElementById('loginUser');
      const pass = document.getElementById('loginPassword');

      if (user.value && pass.value) {
        // Redirect to home page
        window.location.href = 'index.html';
      }
    });
  }

  // ========== CADASTRO FORM ==========
  const cadastroForm = document.getElementById('cadastroForm');
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('registerPassword');
      const confirm = document.getElementById('confirmPassword');

      if (password.value !== confirm.value) {
        confirm.style.border = '2px solid #e53935';
        confirm.parentElement.style.borderColor = '#e53935';

        setTimeout(() => {
          confirm.parentElement.style.borderColor = '';
        }, 3000);
        return;
      }

      // Redirect to login on success
      window.location.href = 'login.html';
    });
  }

  // ========== SCROLL ANIMATIONS (Intersection Observer) ==========
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe cards and sections for scroll animations
  const animateElements = document.querySelectorAll(
    '.category-card, .product-card, .why-card, .carousel-card'
  );

  animateElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s ease-out ${index * 0.08}s`;
    observer.observe(el);
  });

  // ========== ADD TO CART FEEDBACK ==========
  const addToCartBtns = document.querySelectorAll('.product-btn');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const originalText = btn.textContent;
      btn.textContent = '✓ Adicionado!';
      btn.style.background = 'var(--green-800)';

      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 2000);
    });
  });

});
