/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - CORE MODULE (V6 CINEMATIC)
 * ═══════════════════════════════════════════════════════════════════════════
 * Global initialization, configuration, and utility functions.
 * Version 6.0 - Cinematic Scene-Based Romantic Mini-Movie
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMUI = (function() {
  'use strict';

  // Configuration
  const config = {
    reducedMotion: false,
    initialized: false,
    debug: false,
    version: '6.0'
  };

  // State
  const state = {
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTouch: 'ontouchstart' in window,
    currentScene: 'hero'
  };

  /**
   * Detect if user prefers reduced motion
   */
  function detectReducedMotion() {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    config.reducedMotion = mediaQuery.matches;
    
    mediaQuery.addEventListener('change', (e) => {
      config.reducedMotion = e.matches;
      document.documentElement.classList.toggle('rm-reduced-motion', e.matches);
      log('Reduced motion preference changed:', e.matches);
    });
    
    document.documentElement.classList.toggle('rm-reduced-motion', config.reducedMotion);
  }

  /**
   * Update viewport state
   */
  function updateViewportState() {
    state.viewportWidth = window.innerWidth;
    state.viewportHeight = window.innerHeight;
    state.isMobile = window.innerWidth < 768;
    
    document.documentElement.style.setProperty('--rm-vh', `${window.innerHeight * 0.01}px`);
  }

  /**
   * Throttle function for performance
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Debounce function for performance
   */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /**
   * Console logging helper (only in debug mode)
   */
  function log(...args) {
    if (config.debug) {
      console.log('[RMUI V6]', ...args);
    }
  }

  /**
   * Generate random number in range
   */
  function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Get random item from array
   */
  function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Linear interpolation
   */
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  /**
   * Clamp value between min and max
   */
  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Map value from one range to another
   */
  function mapRange(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  /**
   * Wait for a specified time (Promise-based)
   */
  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Animate a sequence of callbacks with delays
   */
  async function animateSequence(sequence) {
    for (const { callback, delay } of sequence) {
      await wait(delay);
      callback();
    }
  }

  /**
   * V7: Setup Heartbeat Cursor Follower
   */
  function setupCursorFollower() {
    const cursor = document.createElement('div');
    cursor.className = 'rm-cursor-follower';
    document.body.appendChild(cursor);
    
    let mouseX = -100, mouseY = -100;
    let cursorX = -100, cursorY = -100;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Hover effect
      const target = e.target;
      if (target.tagName === 'BUTTON' || target.closest('button') || target.closest('.rm-polaroid') || target.closest('.rm-envelope')) {
        cursor.classList.add('is-hovering');
      } else {
        cursor.classList.remove('is-hovering');
      }
    });
    
    function animate() {
      // Smooth follow
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`; // Centering fix
      
      requestAnimationFrame(animate);
    }
    
    animate();
  }

  /**
   * V8: Initialize Curtain Raiser
   */
  function initCurtain() {
    const curtain = document.getElementById('rm-curtain');
    const startBtn = document.getElementById('rm-curtain-start');
    
    if (!curtain || !startBtn) return;
    
    startBtn.addEventListener('click', () => {
      // 1. Play Music (User Interaction Required)
      if (typeof RMMusic !== 'undefined') {
        RMMusic.play();
      }
      
      // 2. Fade Out Curtain
      curtain.classList.add('is-hidden');
      
      // 3. Trigger Hero Entrance explicitly (if needed)
      // The hero scene is already active in HTML, but this ensures focus
      
      // 4. Remove after transition
      setTimeout(() => {
        curtain.style.display = 'none';
      }, 1500);
    });
  }

  /**
   * V8: Magnetic Buttons (Desktop Only)
   */
  function setupMagneticButtons() {
    const buttons = document.querySelectorAll('.rm-btn');
    
    buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        // Magnetic pull intensity
        const pull = 0.4;
        
        btn.style.transform = `translate(${x * pull}px, ${y * pull}px) scale(1.05)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /**
   * Initialize all RMUI modules
   */
  function init() {
    if (config.initialized) {
      log('RMUI already initialized');
      return;
    }

    log('Initializing RMUI V6 Cinematic...');

    // Detect preferences
    detectReducedMotion();
    updateViewportState();

    // Add resize listener
    window.addEventListener('resize', debounce(updateViewportState, 150));
    
    // V7: Cursor Follower
    if (!state.isMobile && !state.isTouch) {
      setupCursorFollower();
      setupMagneticButtons(); // V8: Magnetic Buttons
    }

    // V8: Curtain Raiser
    initCurtain();

    // V6: Initialize scenes module first (core of V6)
    if (typeof RMScenes !== 'undefined') {
      RMScenes.init();
      log('RMScenes initialized');
    }

    // V6: Initialize animals timeline after scenes
    if (typeof RMAnimalsTimeline !== 'undefined') {
      RMAnimalsTimeline.init();
      log('RMAnimalsTimeline initialized');
    }

    // Initialize other modules
    if (typeof RMReveal !== 'undefined') {
      RMReveal.init();
      log('RMReveal initialized');
    }

    if (typeof RMMusic !== 'undefined') {
      RMMusic.init();
      log('RMMusic initialized');
    }

    if (typeof RMLightbox !== 'undefined') {
      RMLightbox.init();
      log('RMLightbox initialized');
    }

    // RMCarousel removed: replaced by RMAnimalsTimeline

    if (typeof RMHeartburst !== 'undefined') {
      RMHeartburst.init();
      log('RMHeartburst initialized');
    }

    if (typeof RMParallax !== 'undefined') {
      RMParallax.init();
      log('RMParallax initialized');
    }

    if (typeof RMEasterEggs !== 'undefined') {
      RMEasterEggs.init();
      log('RMEasterEggs initialized');
    }

    config.initialized = true;
    log('RMUI V6 initialization complete');

    // Dispatch custom event
    document.dispatchEvent(new CustomEvent('rmui:ready', {
      detail: { version: config.version }
    }));
  }

  /**
   * Show toast notification
   */
  function showToast(message, duration = 3000) {
    // Remove existing toast if any
    const existingToast = document.querySelector('.rm-toast:not(.rm-toast--local)');
    if (existingToast) {
      existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'rm-toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger reflow and show
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    // Hide and remove after duration
    setTimeout(() => {
      toast.classList.remove('is-visible');
      setTimeout(() => toast.remove(), 400);
    }, duration);

    return toast;
  }

  /**
   * Create element with classes
   */
  function createElement(tag, classes = [], attributes = {}) {
    const el = document.createElement(tag);
    if (classes.length) {
      el.classList.add(...classes);
    }
    Object.entries(attributes).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
    return el;
  }

  // Public API
  return {
    init,
    config,
    state,
    showToast,
    throttle,
    debounce,
    log,
    randomInRange,
    randomFromArray,
    lerp,
    clamp,
    mapRange,
    createElement,
    wait,
    animateSequence
  };
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  RMUI.init();
});
