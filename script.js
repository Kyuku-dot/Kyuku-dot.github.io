/**
 * Citra Gama Prameswari - Portfolio Scripts
 * Handles: Theme toggle, Mobile Menu, Active Nav, Portfolio Filters, Lightbox Modal, and Copy/Toast
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. THEME SWITCHER (Dark / Light Mode) ---
  const themeToggleBtn = document.getElementById('theme-toggle-button');
  const sunIcon = document.querySelector('.theme-icon-sun');
  const moonIcon = document.querySelector('.theme-icon-moon');
  const htmlRoot = document.documentElement;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('cgp-theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      showToast(`Tema ${newTheme === 'dark' ? 'Gelap' : 'Terang'} diaktifkan`);
    });
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('cgp-theme', theme);
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    } else {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    }
  }

  // --- 2. MOBILE NAVIGATION MENU ---
  const mobileToggleBtn = document.getElementById('mobile-toggle-btn');
  const navLinksMenu = document.getElementById('nav-links-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (mobileToggleBtn && navLinksMenu) {
    mobileToggleBtn.addEventListener('click', () => {
      const isOpen = navLinksMenu.classList.toggle('mobile-open');
      mobileToggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking any nav item
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navLinksMenu.classList.remove('mobile-open');
        mobileToggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // --- 3. NAVBAR SCROLL EFFECT, SCROLL PROGRESS BAR & ACTIVE LINK OBSERVER ---
  const navbar = document.getElementById('main-navbar');
  const sections = document.querySelectorAll('section[id]');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Update scroll progress bar
    if (scrollProgressBar) {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgressBar.style.width = scrollPercent + '%';
    }

    updateActiveNavLink();
  }, { passive: true });

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute('id');
      const targetNavLink = document.getElementById(`nav-link-${sectionId}`);

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        navLinks.forEach(link => link.classList.remove('active'));
        if (targetNavLink) {
          targetNavLink.classList.add('active');
        }
      }
    });
  }

  // --- 4. PORTFOLIO FILTER TABS ---
  const filterButtons = document.querySelectorAll('.portfolio-tab-btn');
  const projectCards = document.querySelectorAll('.case-study-card');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || (category && category.split(' ').includes(filterValue))) {
          card.style.display = 'grid';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.transition = 'opacity 0.4s ease';
            card.style.opacity = '1';
          }, 30);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // --- 5. INTERACTIVE LIGHTBOX MODAL ---
  const lightboxModal = document.getElementById('image-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img-element');
  const lightboxCaption = document.getElementById('lightbox-caption-text');
  const lightboxCounter = document.getElementById('lightbox-counter-text');
  const lightboxCloseBtn = document.getElementById('lightbox-close-button');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');

  // Build dynamic gallery registry
  let currentGalleryList = [];
  let currentImageIndex = 0;

  function refreshGalleryRegistry() {
    const items = [];
    document.querySelectorAll('[data-lightbox-src]').forEach(elem => {
      // Check if visible / not hidden by category filter
      const card = elem.closest('.case-study-card');
      if (!card || card.style.display !== 'none') {
        items.push({
          src: elem.getAttribute('data-lightbox-src'),
          caption: elem.getAttribute('data-lightbox-title') || 'Pratinjau Karya',
          elem: elem
        });
      }
    });
    return items;
  }

  // Register lightbox trigger elements
  const triggerElements = document.querySelectorAll('[data-lightbox-src], .view-gallery-btn');

  triggerElements.forEach(elem => {
    elem.addEventListener('click', (e) => {
      e.stopPropagation();
      let src = elem.getAttribute('data-lightbox-src');
      let title = elem.getAttribute('data-lightbox-title');

      if (!src && elem.classList.contains('view-gallery-btn')) {
        src = elem.getAttribute('data-trigger-target');
        title = elem.getAttribute('data-caption');
      }

      currentGalleryList = refreshGalleryRegistry();
      const foundIdx = currentGalleryList.findIndex(item => item.src === src);
      currentImageIndex = foundIdx !== -1 ? foundIdx : 0;

      if (src) {
        showLightboxImage(currentImageIndex);
        openLightbox();
      }
    });
  });

  function showLightboxImage(index) {
    if (!currentGalleryList.length) return;
    if (index < 0) index = currentGalleryList.length - 1;
    if (index >= currentGalleryList.length) index = 0;
    currentImageIndex = index;

    const item = currentGalleryList[currentImageIndex];
    if (lightboxImg) lightboxImg.src = item.src;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentImageIndex + 1} / ${currentGalleryList.length}`;
    }
  }

  function openLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.add('active');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => {
      if (lightboxImg) lightboxImg.src = '';
    }, 200);
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentImageIndex - 1);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showLightboxImage(currentImageIndex + 1);
    });
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Keyboard accessibility (ESC, ArrowLeft, ArrowRight)
  window.addEventListener('keydown', (e) => {
    if (!lightboxModal || !lightboxModal.classList.contains('active')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      showLightboxImage(currentImageIndex - 1);
    } else if (e.key === 'ArrowRight') {
      showLightboxImage(currentImageIndex + 1);
    }
  });

  // --- 6. COPY EMAIL & WHATSAPP TO CLIPBOARD ---
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const emailAddress = 'cgama034@gmail.com';

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(emailAddress);
          showToast('Email berhasil disalin ke clipboard!');
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = emailAddress;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast('Email berhasil disalin ke clipboard!');
        }
      } catch (err) {
        showToast('Alamat email: ' + emailAddress);
      }
    });
  }

  const copyWaBtn = document.getElementById('copy-wa-btn');
  const waNumber = '+6285704180083';

  if (copyWaBtn) {
    copyWaBtn.addEventListener('click', async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(waNumber);
          showToast('Nomor WhatsApp berhasil disalin ke clipboard!');
        } else {
          const tempInput = document.createElement('textarea');
          tempInput.value = waNumber;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
          showToast('Nomor WhatsApp berhasil disalin ke clipboard!');
        }
      } catch (err) {
        showToast('Nomor WhatsApp: ' + waNumber);
      }
    });
  }

  // --- 7. CONTACT FORM SUBMISSION TO WHATSAPP ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('form-name');
      const emailInput = document.getElementById('form-email');
      const subjectInput = document.getElementById('form-subject');
      const messageInput = document.getElementById('form-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const subject = subjectInput ? subjectInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!name || !email || !message) {
        showToast('Silakan lengkapi nama, email, dan pesan terlebih dahulu.');
        return;
      }

      // Submit feedback button state
      const submitBtn = document.getElementById('btn-submit-form');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Membuka WhatsApp...</span>`;
      submitBtn.disabled = true;

      // Construct professional WhatsApp message
      let waText = `Halo Citra Gama Prameswari, saya melihat portofolio Anda di website.\n\n`;
      waText += `*Nama:* ${name}\n`;
      waText += `*Email:* ${email}\n`;
      if (subject) {
        waText += `*Kebutuhan:* ${subject}\n`;
      }
      waText += `\n*Isi Pesan:*\n${message}`;

      const waUrl = `https://wa.me/6285704180083?text=${encodeURIComponent(waText)}`;

      setTimeout(() => {
        submitBtn.innerHTML = `<span>Membuka WhatsApp...</span> ✓`;
        showToast(`Mengarahkan pesan Anda ke WhatsApp Citra...`);

        // Open WhatsApp in new tab / app
        window.open(waUrl, '_blank');

        setTimeout(() => {
          contactForm.reset();
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 1500);
      }, 500);
    });
  }

  // --- 8. TOAST NOTIFICATION UTILITY ---
  let toastTimeout;
  function showToast(message) {
    const toast = document.getElementById('app-toast-notice');
    const toastText = document.getElementById('toast-message-text');

    if (!toast || !toastText) return;

    toastText.textContent = message;
    toast.classList.add('show');

    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }

  // --- 9. VIDEO PLAYER BADGE BEHAVIOR ---
  const videoEl = document.getElementById('video-lucky-stick');
  const videoBadge = document.getElementById('video-badge-overlay');

  if (videoEl && videoBadge) {
    // Hide badge while video is playing
    videoEl.addEventListener('play', () => {
      videoBadge.style.opacity = '0';
      videoBadge.style.pointerEvents = 'none';
    });
    // Show badge when video is paused or ends
    videoEl.addEventListener('pause', () => {
      videoBadge.style.opacity = '1';
      videoBadge.style.pointerEvents = 'none';
    });
    videoEl.addEventListener('ended', () => {
      videoBadge.style.opacity = '1';
      videoBadge.style.pointerEvents = 'none';
    });
    // Add smooth transition
    videoBadge.style.transition = 'opacity 0.35s ease';
  }

});

// --- FILM PENDEK VIDEO SWITCHER ---
function switchFilmVideo(num) {
  const wrapper1 = document.getElementById('film-video-1-wrapper');
  const wrapper2 = document.getElementById('film-video-2-wrapper');
  const video1 = document.getElementById('film-video-1');
  const video2 = document.getElementById('film-video-2');
  const tab1 = document.getElementById('film-tab-1');
  const tab2 = document.getElementById('film-tab-2');

  if (!wrapper1 || !wrapper2) return;

  if (num === 1) {
    // Pause the other video before switching
    if (video2 && !video2.paused) video2.pause();
    wrapper1.style.display = 'block';
    wrapper2.style.display = 'none';
    if (tab1) tab1.classList.add('active');
    if (tab2) tab2.classList.remove('active');
  } else {
    // Pause the other video before switching
    if (video1 && !video1.paused) video1.pause();
    wrapper1.style.display = 'none';
    wrapper2.style.display = 'block';
    if (tab1) tab1.classList.remove('active');
    if (tab2) tab2.classList.add('active');
  }
}

