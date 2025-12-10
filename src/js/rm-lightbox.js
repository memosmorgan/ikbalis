/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - LIGHTBOX MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Gallery lightbox engine for viewing photos in the gallery scene.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMLightbox = (function() {
  'use strict';

  // State
  let lightboxEl = null;
  let imageEl = null;
  let captionEl = null;
  let images = [];
  let currentIndex = 0;
  let isOpen = false;

  // Captions for gallery images (Turkish)
  const defaultCaptions = [
    'Bu anı hatırlıyor musun? 💕',
    'Ne kadar güzelsin böyle...',
    'Bu gülüşün var ya... 💗',
    'Gözlerindeki ışık...',
    'Her anın ayrı güzel',
    'Seninle her an özel',
    'Bu bakışın... 🥰',
    'Kalbim seninle',
    'En tatlı anılarımız',
    'Seninle mutluluk',
    'Her fotoğrafta ayrı güzelsin',
    'Gülüşünü seviyorum'
  ];

  /**
   * Initialize lightbox
   */
  function init() {
    // Get or create lightbox element
    lightboxEl = document.querySelector('.rm-lightbox');
    if (!lightboxEl) {
      createLightbox();
    } else {
      setupExistingLightbox();
    }

    // Collect all polaroid images
    collectImages();

    // Set up event listeners
    setupEventListeners();

    RMUI.log('Lightbox V5 initialized with', images.length, 'images');
  }

  /**
   * Create lightbox element
   */
  function createLightbox() {
    lightboxEl = document.createElement('div');
    lightboxEl.className = 'rm-lightbox';
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Fotoğraf galerisi');
    
    lightboxEl.innerHTML = `
      <button class="rm-lightbox__close" aria-label="Kapat">×</button>
      <button class="rm-lightbox__nav rm-lightbox__nav--prev" aria-label="Önceki fotoğraf">‹</button>
      <button class="rm-lightbox__nav rm-lightbox__nav--next" aria-label="Sonraki fotoğraf">›</button>
      <div class="rm-lightbox__content">
        <img class="rm-lightbox__image" src="" alt="Galeri fotoğrafı">
        <p class="rm-lightbox__caption"></p>
      </div>
    `;
    
    document.body.appendChild(lightboxEl);
    
    imageEl = lightboxEl.querySelector('.rm-lightbox__image');
    captionEl = lightboxEl.querySelector('.rm-lightbox__caption');
  }

  /**
   * Setup existing lightbox element
   */
  function setupExistingLightbox() {
    imageEl = lightboxEl.querySelector('.rm-lightbox__image');
    captionEl = lightboxEl.querySelector('.rm-lightbox__caption');
  }

  /**
   * Collect all gallery images
   */
  function collectImages() {
    const polaroids = document.querySelectorAll('.rm-polaroid');
    
    polaroids.forEach((polaroid, index) => {
      const img = polaroid.querySelector('.rm-polaroid__img');
      const caption = polaroid.querySelector('.rm-polaroid__caption');
      
      if (img) {
        images.push({
          src: img.getAttribute('src') || img.getAttribute('data-src'),
          alt: img.getAttribute('alt') || `Fotoğraf ${index + 1}`,
          caption: caption ? caption.textContent : defaultCaptions[index % defaultCaptions.length],
          element: polaroid
        });
      }
    });
  }

  /**
   * Set up event listeners
   */
  function setupEventListeners() {
    // Click on polaroids
    const polaroids = document.querySelectorAll('.rm-polaroid');
    polaroids.forEach((polaroid, index) => {
      polaroid.addEventListener('click', () => open(index));
    });

    // Close button
    const closeBtn = lightboxEl.querySelector('.rm-lightbox__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }

    // Navigation buttons
    const prevBtn = lightboxEl.querySelector('.rm-lightbox__nav--prev');
    const nextBtn = lightboxEl.querySelector('.rm-lightbox__nav--next');
    
    if (prevBtn) prevBtn.addEventListener('click', prev);
    if (nextBtn) nextBtn.addEventListener('click', next);

    // Click on overlay to close
    lightboxEl.addEventListener('click', (e) => {
      if (e.target === lightboxEl) {
        close();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    // Touch swipe support
    setupTouchSwipe();
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboard(e) {
    if (!isOpen) return;

    switch (e.key) {
      case 'Escape':
        close();
        break;
      case 'ArrowLeft':
        e.stopPropagation();
        prev();
        break;
      case 'ArrowRight':
        e.stopPropagation();
        next();
        break;
    }
  }

  /**
   * Set up touch swipe for mobile
   */
  function setupTouchSwipe() {
    let touchStartX = 0;
    let touchEndX = 0;

    lightboxEl.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightboxEl.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeThreshold = 50;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          next();
        } else {
          prev();
        }
      }
    }
  }

  /**
   * Open lightbox at specific index
   */
  function open(index = 0) {
    if (images.length === 0) return;

    currentIndex = index;
    isOpen = true;
    
    updateImage();
    
    lightboxEl.classList.add('is-open');

    RMUI.log('Lightbox opened at index', index);
  }

  /**
   * Close lightbox
   */
  function close() {
    isOpen = false;
    lightboxEl.classList.remove('is-open');

    RMUI.log('Lightbox closed');
  }

  /**
   * Navigate to previous image
   */
  function prev() {
    if (!isOpen || images.length === 0) return;
    
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage();
  }

  /**
   * Navigate to next image
   */
  function next() {
    if (!isOpen || images.length === 0) return;
    
    currentIndex = (currentIndex + 1) % images.length;
    updateImage();
  }

  /**
   * Update displayed image
   */
  function updateImage() {
    const image = images[currentIndex];
    if (!image || !imageEl) return;

    // Fade effect
    imageEl.style.opacity = '0';
    imageEl.style.transform = 'scale(0.95)';
    
    if (captionEl) {
      captionEl.style.opacity = '0';
    }
    
    setTimeout(() => {
      imageEl.src = image.src;
      imageEl.alt = image.alt;
      
      if (captionEl) {
        captionEl.textContent = image.caption;
      }
      
      // Smooth zoom in
      requestAnimationFrame(() => {
        imageEl.style.opacity = '1';
        imageEl.style.transform = 'scale(1)';
        imageEl.style.transition = 'opacity 0.4s ease, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        
        if (captionEl) {
          setTimeout(() => {
            captionEl.style.opacity = '1';
          }, 150);
        }
      });
    }, 150);
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      isOpen,
      currentIndex,
      totalImages: images.length
    };
  }

  // Public API
  return {
    init,
    open,
    close,
    prev,
    next,
    getState
  };
})();
