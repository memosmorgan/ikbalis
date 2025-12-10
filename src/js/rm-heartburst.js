/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - HEARTBURST MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Heart confetti burst engine for the scene-based romantic storybook.
 * Triggered on closing scene and via "Tekrar kalp yağsın" button.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMHeartburst = (function() {
  'use strict';

  // V11: Detect mobile for performance tuning
  const isMobile = window.matchMedia('(max-width: 767px)').matches;

  // Configuration
  const config = {
    heartCount: isMobile ? 14 : 25, // V11: Reduced count on mobile
    heartCountReduced: isMobile ? 5 : 8, // V11: Even less for reduced motion
    hearts: ['💕', '💗', '💖', '💝', '💓', '🩷', '❤️', '💜', '🤍'],
    minDuration: 3500,
    maxDuration: 5500,
    minSize: isMobile ? 16 : 18, // V11: Slightly smaller on mobile
    maxSize: isMobile ? 30 : 36,
    driftRange: isMobile ? 70 : 100, // V11: Less drift on mobile
    staggerInterval: isMobile ? 100 : 80 // V11: Slower stagger on mobile
  };

  // State
  let layerEl = null;
  let activeHearts = [];

  /**
   * Initialize heartburst
   */
  function init() {
    // Get or create heartburst layer
    layerEl = document.querySelector('.rm-heartburst-layer');
    if (!layerEl) {
      createLayer();
    }

    // Set up heartburst button
    setupHeartburstButton();

    // Listen for scene changes to auto-trigger
    document.addEventListener('rmui:scenechange', handleSceneChange);

    RMUI.log('Heartburst V5 initialized');
  }

  /**
   * Create heartburst layer
   */
  function createLayer() {
    layerEl = document.createElement('div');
    layerEl.className = 'rm-heartburst-layer';
    layerEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(layerEl);
  }

  /**
   * Set up heartburst button
   */
  function setupHeartburstButton() {
    const heartburstBtn = document.querySelector('.rm-btn--heartburst');
    if (!heartburstBtn) return;

    heartburstBtn.addEventListener('click', () => {
      start();
      
      // Add ripple effect
      addButtonRipple(heartburstBtn);
      
      // Show toast
      RMUI.showToast('Mutlu yıllar, tatlışım! 💕', 3000);
    });
  }

  /**
   * Handle scene change - auto-trigger on closing scene
   */
  function handleSceneChange(e) {
    if (e.detail.scene === 'closing') {
      // Delay heartburst for dramatic effect
      setTimeout(() => {
        start();
      }, 1500);
    }
  }

  /**
   * Add ripple effect to button
   */
  function addButtonRipple(button) {
    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      background: rgba(255, 255, 255, 0.3);
      border-radius: inherit;
      animation: rm-btn-ripple 0.6s ease-out forwards;
      pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  /**
   * Start heartburst animation
   */
  function start() {
    if (!layerEl) return;

    // Clear existing hearts
    clear();

    // Determine heart count based on motion preference
    const count = RMUI.config.reducedMotion 
      ? config.heartCountReduced 
      : config.heartCount;

    RMUI.log('Starting heartburst with', count, 'hearts');

    // Create hearts with staggered timing
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createHeart(i, count);
      }, i * config.staggerInterval);
    }
  }

  /**
   * Create a single heart particle
   */
  function createHeart(index, total) {
    const heart = document.createElement('span');
    heart.className = 'rm-heart-particle';
    
    // Random heart emoji
    heart.textContent = RMUI.randomFromArray(config.hearts);
    
    // Better distribution across screen
    const startX = 5 + (index / total) * 90 + RMUI.randomInRange(-10, 10);
    heart.style.left = `${RMUI.clamp(startX, 5, 95)}%`;
    heart.style.top = '-40px';
    
    // Random size
    const size = RMUI.randomInRange(config.minSize, config.maxSize);
    heart.style.fontSize = `${size}px`;
    
    // Random duration
    const duration = RMUI.randomInRange(config.minDuration, config.maxDuration);
    heart.style.animationDuration = `${duration}ms`;
    
    // Enhanced horizontal drift
    const drift = RMUI.randomInRange(-config.driftRange, config.driftRange);
    heart.style.setProperty('--drift', `${drift}px`);
    
    // Random start delay
    const startDelay = RMUI.randomInRange(0, 150);
    heart.style.animationDelay = `${startDelay}ms`;
    
    // Add to layer
    layerEl.appendChild(heart);
    activeHearts.push(heart);
    
    // Remove after animation
    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
        const idx = activeHearts.indexOf(heart);
        if (idx > -1) activeHearts.splice(idx, 1);
      }
    }, duration + startDelay + 200);
  }

  /**
   * Create mini heart burst from specific element
   * V7: Added mode parameter for 'fountain' effect
   */
  function burstFromElement(element, count = 5, mode = 'burst') {
    if (!element || RMUI.config.reducedMotion) return;

    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // For fountain, start from bottom
    const startY = mode === 'fountain' ? rect.bottom - 20 : rect.top + rect.height / 2;
    const centerY = mode === 'fountain' ? rect.bottom - 20 : rect.top + rect.height / 2;

    for (let i = 0; i < count; i++) {
      const heart = document.createElement('span');
      heart.textContent = RMUI.randomFromArray(['💕', '💗', '🩷', '💖']);
      
      const animName = mode === 'fountain' ? 'rm-heart-fountain' : 'rm-mini-heart-burst';
      const duration = mode === 'fountain' ? 1.5 + Math.random() : 0.8;
      
      heart.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${startY}px;
        font-size: ${12 + Math.random() * 10}px;
        pointer-events: none;
        z-index: 9999;
        animation: ${animName} ${duration}s ease-out forwards;
        --burst-x: ${(Math.random() - 0.5) * (mode === 'fountain' ? 80 : 120)}px;
        --burst-y: ${mode === 'fountain' ? -150 - Math.random() * 100 : -40 - Math.random() * 60}px;
      `;
      
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), duration * 1000);
    }
  }

  /**
   * Clear all hearts
   */
  function clear() {
    if (layerEl) {
      layerEl.innerHTML = '';
    }
    activeHearts = [];
  }

  /**
   * Reset state
   */
  function reset() {
    clear();
  }

  // Public API
  return {
    init,
    start,
    burstFromElement,
    clear,
    reset
  };
})();
