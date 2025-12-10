/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - EASTER EGGS MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Hidden interactions and surprise messages.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMEasterEggs = (function() {
  'use strict';

  // State
  const triggered = {
    hamster: false,
    secretCode: false,
    heroLabel: false,
    eyes: false // V10: Eyes Easter Egg state
  };

  // Secret code sequence
  const secretCode = ['i', 'k', 'b', 'a', 'l'];
  let codeProgress = [];

  // Romantic messages
  const romanticMessages = [
    'Seninle her güne böyle başlamak istiyorum 💕',
    'Sen benim en güzel hediyemsin 💝',
    'Gülüşün güneşim benim ☀️',
    'Seni düşününce kalbim hızlanıyor 💓',
    'Her anımız birbirinden güzel 🌸'
  ];

  // V11: Mobile double-tap detection utility
  const doubleTapHandlers = new WeakMap();

  /**
   * V11: Setup mobile-friendly double-tap detection
   * Works around Safari's dblclick issues on touch devices
   */
  function setupMobileDoubleTap(element, handlerFn) {
    if (!element) return;

    let lastTap = 0;
    const DOUBLE_TAP_THRESHOLD = 300; // ms

    const touchHandler = function(e) {
      const currentTime = Date.now();
      const tapLength = currentTime - lastTap;

      if (tapLength > 0 && tapLength < DOUBLE_TAP_THRESHOLD) {
        // This is a double-tap
        e.preventDefault();
        handlerFn(e);
        lastTap = 0; // Reset to prevent triple-tap triggering
      } else {
        lastTap = currentTime;
      }
    };

    element.addEventListener('touchend', touchHandler, { passive: false });
    
    // Store reference for potential cleanup
    doubleTapHandlers.set(element, touchHandler);
  }

  /**
   * Initialize easter eggs
   */
  function init() {
    setupHamsterEasterEgg();
    setupSecretCodeEasterEgg();
    setupLogoEasterEgg();
    setupInfinityPhotoEasterEgg(); // V9
    setupCurtainEasterEgg();       // V9
    setupEyesEasterEgg();          // V10: Eyes Gate
    
    RMUI.log('Easter eggs V5 (inc V10 Eyes) initialized');
  }

  /**
   * V10: "The Eyes" Easter Egg & Navigation Gate
   * Intercepts navigation until user clicks "gözlerini"
   * 
   * ⚠️ ASSET REQUIREMENT:
   * Please upload the following images to public/images/:
   * - public/images/eye-left-crop.png  (Left eye image, transparent background)
   * - public/images/eye-right-crop.png (Right eye image, transparent background)
   */
  function setupEyesEasterEgg() {
    const triggerWord = document.getElementById('trigger-eyes-egg');
    const deepNextBtn = document.getElementById('btn-deep-next');

    // If elements are missing (e.g. wrong scene loaded), abort safely
    if (!triggerWord || !deepNextBtn) {
        // Fallback: Try to find button by selector if ID missing
        const fallbackBtn = document.querySelector('.rm-scene--deep .rm-scene-next');
        if (!fallbackBtn) return;
        
        // If trigger word missing but button exists, we can't lock it properly without the trigger
        if (!triggerWord) return;
    }

    // 1. Handle Navigation Gate
    const nextBtn = deepNextBtn || document.querySelector('.rm-scene--deep .rm-scene-next');
    
    // Use capture phase to intercept before scene navigation
    nextBtn.addEventListener('click', function(e) {
        if (!triggered.eyes) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation(); // Ensure no other listeners fire
            
            // 1. Shake the button for immediate feedback
            nextBtn.classList.remove('rm-shake-btn');
            void nextBtn.offsetWidth; // Force reflow
            nextBtn.classList.add('rm-shake-btn');
            
            // 2. Show tooltip on the word
            triggerWord.classList.add('show-hint');
            
            // Hide after 3.5 seconds
            setTimeout(() => {
                triggerWord.classList.remove('show-hint');
                nextBtn.classList.remove('rm-shake-btn');
            }, 3500);
            
            RMUI.log('Navigation locked: "Eyes" easter egg not found yet.');
        }
    }, true); 

    // 2. Handle Trigger Click (Mouse + Touch)
    const handleTrigger = (e) => {
        // Prevent ghost clicks on touch devices
        if (e.type === 'touchstart') e.preventDefault(); 
        
        // Play animation every time
        playFlyingEyesAnimation(triggerWord);
        
        if (!triggered.eyes) {
            triggered.eyes = true;
            
            // Visual feedback for unlock
            triggerWord.style.color = '#ff4d6d';
            triggerWord.style.textShadow = '0 0 20px rgba(255, 77, 109, 1)';
            triggerWord.classList.remove('show-hint'); // Hide hint if visible
            triggerWord.classList.add('is-triggered'); // Permanent activated look
            
            // Unlock message
            RMUI.showToast('Gözlerin... Dünyam benim. 🌍✨', 3000);
        }
    };

    triggerWord.addEventListener('click', handleTrigger);
    triggerWord.addEventListener('touchstart', handleTrigger, { passive: false });
  }

  /**
   * "The Magnetic Gaze" Cinematic Animation
   * A 3-Stage Sequence: Swoop -> Fusion -> Release
   */
  function playFlyingEyesAnimation(originEl) {
    // Check reduced motion
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
        if (typeof RMHeartburst !== 'undefined') {
            RMHeartburst.burstFromElement(originEl, 12);
        }
        // Unlock button visual anyway for accessibility
        const nextBtn = document.getElementById('btn-deep-next') || document.querySelector('.rm-scene--deep .rm-scene-next');
        if (nextBtn) nextBtn.classList.add('rm-btn--unlocked');
        return;
    }

    // 1. T=0ms: Setup Environment & Assets
    document.body.classList.add('rm-dim-mode');
    
    // Play Swoop SFX
    if (typeof RMMusic !== 'undefined' && RMMusic.playSFX) {
        RMMusic.playSFX('whoosh'); 
    }

    // Create Overlay Container
    const overlay = document.createElement('div');
    overlay.className = 'rm-eyes-overlay';
    
    // Create Elements
    const eyeLeft = document.createElement('img');
    eyeLeft.src = 'public/images/eye-left-crop.png';
    eyeLeft.className = 'rm-eye-left';
    eyeLeft.style.animation = 'eye-swoop-left 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    
    const eyeRight = document.createElement('img');
    eyeRight.src = 'public/images/eye-right-crop.png';
    eyeRight.className = 'rm-eye-right';
    eyeRight.style.animation = 'eye-swoop-right 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    
    const bloom = document.createElement('div');
    bloom.className = 'rm-eye-bloom';
    
    // Assemble
    overlay.appendChild(bloom);
    overlay.appendChild(eyeLeft);
    overlay.appendChild(eyeRight);
    document.body.appendChild(overlay);

    // 2. T=800ms: Impact & Fusion
    setTimeout(() => {
        // Trigger Bloom
        bloom.style.animation = 'eye-bloom 0.6s ease-out forwards';
        
        // Play Impact SFX
        if (typeof RMMusic !== 'undefined' && RMMusic.playSFX) {
            RMMusic.playSFX('pop');
        }
        
        // Trigger Heartburst
        const dummyCenter = document.createElement('div');
        dummyCenter.style.position = 'fixed';
        dummyCenter.style.left = '50%';
        dummyCenter.style.top = '50%';
        document.body.appendChild(dummyCenter);
        
        if (typeof RMHeartburst !== 'undefined') {
             RMHeartburst.burstFromElement(dummyCenter, 25);
        }
        dummyCenter.remove();
        
        // Mobile Haptic
        if (navigator.vibrate) navigator.vibrate(50);

    }, 800);

    // 3. T=1500ms: Release & Unlock
    setTimeout(() => {
        // Dissolve Eyes
        eyeLeft.style.animation = 'eye-dissolve 0.8s ease-in forwards';
        eyeRight.style.animation = 'eye-dissolve 0.8s ease-in forwards';
        
        // Unlock Visuals
        const nextBtn = document.getElementById('btn-deep-next') || document.querySelector('.rm-scene--deep .rm-scene-next');
        if (nextBtn) {
            nextBtn.classList.add('rm-btn--unlocked');
        }
        
    }, 1500);

    // 4. T=2200ms: Cleanup (Safe)
    setTimeout(() => {
        try {
            document.body.classList.remove('rm-dim-mode');
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
        } catch (e) {
            console.error('Animation cleanup failed:', e);
            // Emergency fallback
            document.body.classList.remove('rm-dim-mode');
        }
    }, 2200);
  }

  /**
   * V9: Infinity Photo Double Click (V11: Mobile-friendly)
   */
  function setupInfinityPhotoEasterEgg() {
      const infinityPhoto = document.getElementById('rm-infinity-photo');
      if (!infinityPhoto) return;
      
      // Reveal hint after delay
      setTimeout(() => {
          const hint = infinityPhoto.querySelector('.rm-hint-icon');
          if (hint) hint.style.opacity = '1';
          infinityPhoto.classList.add('rm-pulse-glow');
      }, 4000);

      // Handler for double-tap/double-click
      const handleInfinityEasterEgg = () => {
          // Bloom Effect
          const bloom = document.createElement('div');
          bloom.className = 'rm-bloom-effect';
          document.body.appendChild(bloom);
          
          setTimeout(() => bloom.classList.add('is-active'), 10);
          
          // Toast Reward
          setTimeout(() => {
             RMUI.showToast('Seninle her şeye varım. 💍', 5000);
             bloom.classList.remove('is-active');
             setTimeout(() => bloom.remove(), 1000);
          }, 800);
          
          // Heartburst
          if (typeof RMHeartburst !== 'undefined') {
              RMHeartburst.burstFromElement(infinityPhoto, 15);
          }
          
          // Haptic feedback on mobile
          if (navigator.vibrate) navigator.vibrate(30);
      };

      // Desktop: dblclick
      infinityPhoto.addEventListener('dblclick', handleInfinityEasterEgg);
      
      // V11: Mobile: custom double-tap detection (Safari-friendly)
      setupMobileDoubleTap(infinityPhoto, handleInfinityEasterEgg);
  }

  /**
   * V9: Curtain Heartbeat
   */
  function setupCurtainEasterEgg() {
      const heart = document.querySelector('.rm-curtain__heart');
      const text = document.querySelector('.rm-curtain__text');
      
      if (!heart || !text) return;
      
      let clicks = 0;
      
      heart.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent falling through
          clicks++;
          
          // Visual feedback
          heart.style.transform = 'scale(1.3)';
          heart.style.color = '#ff4d6d';
          setTimeout(() => {
              heart.style.transform = '';
              heart.style.color = '';
          }, 200);
          
          if (clicks === 3) {
              text.textContent = "Seni Çok Seviyorum İkbal! ❤️";
              text.style.color = "#ffacc8";
              text.style.animation = "rm-pulse-white 1s infinite";
              
              if (typeof RMHeartburst !== 'undefined') {
                  RMHeartburst.burstFromElement(heart, 10);
              }
          }
      });
  }

  /**
   * Hamster double-click easter egg (V11: Mobile-friendly)
   */
  function setupHamsterEasterEgg() {
    const hamsterCard = document.querySelector('.rm-animal-card--primary');
    if (!hamsterCard) return;

    // Handler for double-tap/double-click
    const handleHamsterEasterEgg = () => {
      if (triggered.hamster) return;
      
      triggered.hamster = true;
      
      // Show toast
      RMUI.showToast('Tamam, ilk sen geliyorsun 🐹✨', 3500);
      
      // Heart burst from hamster
      if (typeof RMHeartburst !== 'undefined') {
        RMHeartburst.burstFromElement(hamsterCard, 8);
      }
      
      // Haptic feedback on mobile
      if (navigator.vibrate) navigator.vibrate(30);
      
      // Add special glow effect
      hamsterCard.style.animation = 'rm-special-glow 2s ease-in-out';
      setTimeout(() => {
        hamsterCard.style.animation = 'rm-float-bounce 5s var(--rm-ease-soft) infinite';
        // Reset after some time
        setTimeout(() => {
          triggered.hamster = false;
        }, 30000);
      }, 2000);

      RMUI.log('Hamster easter egg triggered');
    };

    // Desktop: dblclick
    hamsterCard.addEventListener('dblclick', handleHamsterEasterEgg);
    
    // V11: Mobile: custom double-tap detection (Safari-friendly)
    setupMobileDoubleTap(hamsterCard, handleHamsterEasterEgg);
  }

  /**
   * Secret keyboard code easter egg
   */
  function setupSecretCodeEasterEgg() {
    document.addEventListener('keydown', (e) => {
      if (triggered.secretCode) return;
      
      // Add key to progress
      codeProgress.push(e.key.toLowerCase());
      
      // Keep only last N keys
      if (codeProgress.length > secretCode.length) {
        codeProgress.shift();
      }
      
      // Check if code matches
      if (codeProgress.join('') === secretCode.join('')) {
        triggered.secretCode = true;
        
        // Trigger celebration
        triggerSecretCelebration();
        
        // Reset progress
        codeProgress = [];
        
        // Allow re-trigger after delay
        setTimeout(() => {
          triggered.secretCode = false;
        }, 120000);

        RMUI.log('Secret code easter egg triggered');
      }
    });
  }

  /**
   * Logo/label click easter egg
   */
  function setupLogoEasterEgg() {
    const heroLabel = document.querySelector('.rm-hero-label');
    if (!heroLabel) return;

    let clickCount = 0;
    let clickTimer = null;

    heroLabel.addEventListener('click', () => {
      clickCount++;
      
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        if (clickCount >= 5 && !triggered.heroLabel) {
          triggered.heroLabel = true;
          RMUI.showToast('Sen benim en güzel hediyemsin 💝', 4000);
          
          // Add glow to label
          heroLabel.style.animation = 'rm-special-glow 2s ease-in-out';
          setTimeout(() => {
            heroLabel.style.animation = 'rm-label-glow 3s ease-in-out infinite';
          }, 2000);
          
          setTimeout(() => {
            triggered.heroLabel = false;
          }, 60000);
        }
        clickCount = 0;
      }, 2000);
    });
  }

  /**
   * Trigger secret celebration animation
   */
  function triggerSecretCelebration() {
    // Show special message
    RMUI.showToast('🎉 İkbal, seni çok seviyorum! 🎉', 5000);
    
    // Trigger heartburst
    if (typeof RMHeartburst !== 'undefined') {
      setTimeout(() => {
        RMHeartburst.start();
      }, 500);
    }
    
    // Add dramatic page glow
    const glow = document.createElement('div');
    glow.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(ellipse at center, rgba(255, 154, 191, 0.2) 0%, transparent 70%);
      pointer-events: none;
      z-index: 9998;
      opacity: 0;
      transition: opacity 0.5s ease-out;
    `;
    document.body.appendChild(glow);
    
    // Animate glow
    requestAnimationFrame(() => {
      glow.style.opacity = '1';
    });
    
    setTimeout(() => {
      glow.style.opacity = '0';
      setTimeout(() => glow.remove(), 500);
    }, 3500);
  }

  /**
   * Manually trigger an easter egg
   */
  function trigger(name) {
    switch (name) {
      case 'hamster':
        if (!triggered.hamster) {
          const hamsterCard = document.querySelector('.rm-animal-card--primary');
          if (hamsterCard) {
            hamsterCard.dispatchEvent(new Event('dblclick'));
          }
        }
        break;
      case 'secret':
        if (!triggered.secretCode) {
          triggerSecretCelebration();
          triggered.secretCode = true;
        }
        break;
    }
  }

  /**
   * Reset all easter eggs
   */
  function reset() {
    Object.keys(triggered).forEach(key => {
      triggered[key] = false;
    });
    codeProgress = [];
  }

  /**
   * Check if eyes easter egg has been unlocked
   * Used by scenes.js to gate keyboard navigation
   * @returns {boolean}
   */
  function isEyesUnlocked() {
    return triggered.eyes;
  }

  // Public API
  return {
    init,
    trigger,
    reset,
    isEyesUnlocked
  };
})();
