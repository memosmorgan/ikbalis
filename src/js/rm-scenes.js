/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - SCENE NAVIGATION ENGINE (V7 CINEMATIC POLISH)
 * ═══════════════════════════════════════════════════════════════════════════
 * Scene-based navigation system for the cinematic romantic mini-movie.
 * Enhanced timing, per-scene entrances, and integration with animals timeline.
 * V7: Animals button waits for timeline complete, deeper fly-in timing
 * Version 7.0 - Cinematic Polish Pass
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMScenes = (function() {
  'use strict';

  // Scene order and configuration
  const sceneOrder = ['hero', 'love', 'gallery', 'deep', 'animals', 'closing', 'letter'];
  
  const sceneModes = {
    hero: 'hero',
    love: 'love',
    gallery: 'gallery',
    deep: 'deep',
    animals: 'animals',
    closing: 'closing',
    letter: 'letter'
  };

  // State
  let currentSceneIndex = 0;
  let isTransitioning = false;
  let sceneElements = {};
  let shellEl = null;
  let initialized = false;

  // V7 Enhanced Timing Configuration
  const timing = {
    sceneTransition: 900,
    elementRevealBase: 350,
    flyInStagger: 230,           // V7: Increased from 180 for more readable stagger
    flyInDuration: 1250,         // V7: Increased from 1100 for deeper feel
    buttonAppearBuffer: 1500,
    animalTimelineDelay: 600,
    letterShimmerDelay: 800,
    heroEntranceDuration: 1150   // V7: New timing for hero entrance
  };

  /**
   * Initialize scenes system
   */
  function init() {
    if (initialized) return;

    RMUI.log('Initializing Scene Navigation Engine V7 Cinematic...');

    // Get shell element
    shellEl = document.querySelector('.rm-shell');
    if (!shellEl) {
      RMUI.log('Shell element not found');
      return;
    }

    // Collect all scene elements
    sceneOrder.forEach(sceneName => {
      const sceneEl = document.querySelector(`[data-scene="${sceneName}"]`);
      if (sceneEl) {
        sceneElements[sceneName] = sceneEl;
      }
    });

    // Set initial scene mode
    setSceneMode('hero');

    // Setup navigation buttons
    setupNavigationButtons();

    // Setup keyboard navigation
    setupKeyboardNavigation();

    // V7: Setup animals complete listener for button timing
    setupAnimalsCompleteListener();

    // Start with hero scene
    activateScene('hero', true);

    // V9: Night Mode Personalization
    const hours = new Date().getHours();
    if (hours >= 22 || hours < 5) {
        const heroTitle = document.querySelector('.rm-hero-title');
        if (heroTitle) {
            heroTitle.textContent = "Bu gece yıldızlar bile senin için parlıyor...";
        }
        
        // Change hearts to stars if possible (optional tweak to parallax)
        if (typeof RMParallax !== 'undefined') {
             // Assuming RMParallax has a way to update config or we can just let it be
        }
    }

    initialized = true;
    RMUI.log('Scene Navigation Engine V7 initialized');

    // Dispatch ready event
    document.dispatchEvent(new CustomEvent('rmui:scenes-ready', {
      detail: { currentScene: 'hero' }
    }));
  }

  /**
   * Setup all navigation buttons
   */
  function setupNavigationButtons() {
    // "Devam et" buttons
    const nextButtons = document.querySelectorAll('.rm-scene-next');
    nextButtons.forEach(btn => {
      btn.addEventListener('click', handleNextClick);
    });

    // Restart button
    const restartBtn = document.querySelector('.rm-scene-restart');
    if (restartBtn) {
      restartBtn.addEventListener('click', handleRestart);
    }
  }

  /**
   * V7: Setup listener for animals timeline complete event
   * Button only appears after the full show ends
   */
  function setupAnimalsCompleteListener() {
    document.addEventListener('rmui:animals-complete', function() {
      const animalsScene = sceneElements.animals;
      if (!animalsScene) return;

      const nextBtn = animalsScene.querySelector('.rm-scene-next');
      if (nextBtn && !nextBtn.classList.contains('is-visible')) {
        // Small delay for smooth appearance after the celebration message
        setTimeout(() => {
          nextBtn.classList.add('is-visible');
        }, 800);
      }

      RMUI.log('Animals timeline complete, showing continue button');
    });
  }

  /**
   * Handle "Devam et" button click
   */
  function handleNextClick(e) {
    if (isTransitioning) return;

    const targetScene = e.currentTarget.dataset.target;
    if (targetScene && sceneElements[targetScene]) {
      goToScene(targetScene);
    } else {
      // Go to next scene in order
      nextScene();
    }
  }

  /**
   * Handle restart button click
   */
  function handleRestart() {
    if (isTransitioning) return;
    
    // Reset animals timeline if it exists
    if (typeof RMAnimalsTimeline !== 'undefined') {
      RMAnimalsTimeline.reset();
    }
    
    goToScene('hero');
  }

  /**
   * Setup keyboard navigation
   */
  function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      if (isTransitioning) return;

      switch (e.key) {
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          // CRIT-02: Block navigation from deep scene if eyes gate not unlocked
          if (currentSceneIndex === 3 && typeof RMEasterEggs !== 'undefined' && !RMEasterEggs.isEyesUnlocked()) {
            showEyesGateHint();
            return;
          }
          nextScene();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevScene();
          break;
        case 'Home':
          e.preventDefault();
          goToScene('hero');
          break;
        case 'End':
          e.preventDefault();
          // CRIT-02: Block skip to letter if on or before deep scene and eyes not unlocked
          if (currentSceneIndex <= 3 && typeof RMEasterEggs !== 'undefined' && !RMEasterEggs.isEyesUnlocked()) {
            showEyesGateHint();
            return;
          }
          goToScene('letter');
          break;
      }
    });
  }

  /**
   * CRIT-02: Show visual hint when eyes gate blocks navigation
   */
  function showEyesGateHint() {
    const deepScene = sceneElements.deep;
    if (!deepScene) return;

    // Shake the next button
    const nextBtn = deepScene.querySelector('.rm-scene-next');
    if (nextBtn) {
      nextBtn.classList.remove('rm-shake-btn');
      void nextBtn.offsetWidth; // Force reflow
      nextBtn.classList.add('rm-shake-btn');
      setTimeout(() => nextBtn.classList.remove('rm-shake-btn'), 500);
    }

    // Highlight the trigger word
    const triggerWord = document.getElementById('trigger-eyes-egg');
    if (triggerWord) {
      triggerWord.classList.add('show-hint');
      setTimeout(() => triggerWord.classList.remove('show-hint'), 3500);
    }

    RMUI.log('Keyboard navigation blocked: Eyes gate not unlocked');
  }

  /**
   * Go to next scene
   */
  function nextScene() {
    if (currentSceneIndex < sceneOrder.length - 1) {
      const nextSceneName = sceneOrder[currentSceneIndex + 1];
      goToScene(nextSceneName);
    }
  }

  /**
   * Go to previous scene
   */
  function prevScene() {
    if (currentSceneIndex > 0) {
      const prevSceneName = sceneOrder[currentSceneIndex - 1];
      goToScene(prevSceneName);
    }
  }

  /**
   * Go to specific scene
   */
  function goToScene(sceneName) {
    const targetIndex = sceneOrder.indexOf(sceneName);
    if (targetIndex === -1 || targetIndex === currentSceneIndex) return;
    if (isTransitioning) return;

    isTransitioning = true;

    const currentScene = sceneOrder[currentSceneIndex];
    const currentEl = sceneElements[currentScene];
    const targetEl = sceneElements[sceneName];

    if (!targetEl) {
      isTransitioning = false;
      return;
    }

    RMUI.log(`Scene transition: ${currentScene} → ${sceneName}`);

    // V7: Play transition SFX
    if (typeof RMMusic !== 'undefined') {
      RMMusic.playSFX('whoosh');
    }

    // Update scene mode (background)
    setSceneMode(sceneModes[sceneName]);

    // Hide current scene
    if (currentEl) {
      currentEl.classList.add('is-leaving');
      currentEl.classList.remove('is-active');

      // Reset scene elements visibility
      resetSceneElements(currentEl);
      
      // Reset animals timeline when leaving animals scene
      if (currentScene === 'animals' && typeof RMAnimalsTimeline !== 'undefined') {
        RMAnimalsTimeline.reset();
      }
      
      // CRIT-04: Clean up deep scene listeners when leaving
      if (currentScene === 'deep') {
        cleanupDeepSceneEffects();
      }
    }

    // Show new scene after transition
    setTimeout(() => {
      if (currentEl) {
        currentEl.classList.remove('is-leaving');
      }

      // Activate new scene
      activateScene(sceneName);

      currentSceneIndex = targetIndex;
      isTransitioning = false;

      // Dispatch scene change event
      document.dispatchEvent(new CustomEvent('rmui:scenechange', {
        detail: { 
          scene: sceneName, 
          index: targetIndex,
          mode: sceneModes[sceneName]
        }
      }));

    }, timing.sceneTransition);
  }

  /**
   * Activate a scene and reveal its elements
   */
  function activateScene(sceneName, isInitial = false) {
    const sceneEl = sceneElements[sceneName];
    if (!sceneEl) return;

    // Add active class with scene-specific entrance
    sceneEl.classList.add('is-entering', 'is-active');

    // Remove entering class after animation
    setTimeout(() => {
      sceneEl.classList.remove('is-entering');
    }, timing.sceneTransition);

    // Reveal scene elements with stagger
    revealSceneElements(sceneEl, sceneName, isInitial);

    // Trigger scene-specific effects
    triggerSceneEffects(sceneName);
  }

  /**
   * Reveal elements within a scene with stagger
   * V7: Special handling for animals scene - button waits for timeline complete
   */
  function revealSceneElements(sceneEl, sceneName, isInitial = false) {
    const elements = sceneEl.querySelectorAll('.rm-scene-element:not(.rm-scene-next):not(.rm-scene-restart)');
    const baseDelay = isInitial ? 300 : 150;
    let maxDelay = 0;

    elements.forEach((el) => {
      const delay = parseInt(el.dataset.delay || 0) + baseDelay;
      maxDelay = Math.max(maxDelay, delay);

      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);
    });

    // Handle waiting text and button visibility with V7 timing
    const waitingText = sceneEl.querySelector('.rm-scene__waiting');
    const nextButton = sceneEl.querySelector('.rm-scene-next');
    const restartButton = sceneEl.querySelector('.rm-scene-restart');

    // V7: Animals scene button is controlled by rmui:animals-complete event
    const isAnimalsScene = sceneName === 'animals';
    // V7: Gallery scene button is controlled by manual timing in triggerGalleryFlyIn
    const isGalleryScene = sceneName === 'gallery';

    // Calculate button appear time: after all content + buffer
    const buttonDelay = maxDelay + timing.buttonAppearBuffer;

    if (waitingText && nextButton && !isAnimalsScene && !isGalleryScene) {
      // Show waiting text after content
      setTimeout(() => {
        waitingText.classList.add('is-visible');
      }, maxDelay + 400);

      // Then hide waiting and show button
      setTimeout(() => {
        waitingText.classList.add('is-hidden');
        waitingText.classList.remove('is-visible');
        nextButton.classList.add('is-visible');
      }, buttonDelay);
    } else if (nextButton && !isAnimalsScene && !isGalleryScene) {
      // No waiting text, just show button after delay (skip for animals & gallery)
      setTimeout(() => {
        nextButton.classList.add('is-visible');
      }, buttonDelay);
    }

    // V7: For animals scene, the button is shown via the rmui:animals-complete event listener
    // We don't auto-show the button based on timing

    // Handle restart button (letter scene)
    if (restartButton) {
      setTimeout(() => {
        restartButton.classList.add('is-visible');
      }, buttonDelay + 300);
    }
  }

  /**
   * Reset scene elements visibility
   */
  function resetSceneElements(sceneEl) {
    const elements = sceneEl.querySelectorAll('.rm-scene-element');
    elements.forEach(el => {
      el.classList.remove('is-visible');
    });

    // Reset fly items
    const flyItems = sceneEl.querySelectorAll('.rm-fly-item');
    flyItems.forEach(item => {
      item.classList.remove('is-flying', 'is-visible', 'is-floating');
    });

    // Reset waiting text
    const waitingText = sceneEl.querySelector('.rm-scene__waiting');
    if (waitingText) {
      waitingText.classList.remove('is-visible', 'is-hidden');
    }

    // V7: Reset photo stack cascade items
    const photoItems = sceneEl.querySelectorAll('.rm-photo-stack__item');
    photoItems.forEach(item => {
      item.classList.remove('is-visible');
    });

    // CRIT-03: Clean up gallery flashback interval
    if (sceneEl._flashbackInterval) {
      clearInterval(sceneEl._flashbackInterval);
      sceneEl._flashbackInterval = null;
    }

    // V12: Clean up gallery scroll indicator
    if (sceneEl._scrollHintHandler) {
      sceneEl.removeEventListener('scroll', sceneEl._scrollHintHandler);
      sceneEl._scrollHintHandler = null;
    }
    if (sceneEl._scrollIndicator) {
      sceneEl._scrollIndicator.remove();
      sceneEl._scrollIndicator = null;
    }
    // Reset scroll hint visibility for next visit
    sceneEl.classList.remove('scroll-hint-hidden');
  }

  /**
   * Trigger scene-specific effects
   */
  function triggerSceneEffects(sceneName) {
    switch (sceneName) {
      case 'gallery':
        triggerGalleryFlyIn();
        break;
      case 'love':
        triggerLoveSceneEffects();
        break;
      case 'deep':
        triggerDeepSceneEffects();
        break;
      case 'animals':
        triggerAnimalsTimeline();
        break;
      case 'closing':
        triggerClosingEffects();
        break;
      case 'letter':
        triggerLetterEffects();
        break;
    }
  }

  /**
   * V7: Gallery scene - trigger cinematic 3D fly-in animation with deeper timing
   * V11: Added mobile scroll hint auto-hide
   */
  function triggerGalleryFlyIn() {
    const galleryScene = sceneElements.gallery;
    if (!galleryScene) return;

    const flyItems = galleryScene.querySelectorAll('.rm-fly-item');

    flyItems.forEach((item) => {
      const delay = parseInt(item.dataset.flyDelay || 0);

      setTimeout(() => {
        item.classList.add('is-flying');
        
        // After animation ends, mark as visible
        setTimeout(() => {
          item.classList.remove('is-flying');
          item.classList.add('is-visible');
          
          // V7: Add floating state with random delay
          // Negative delay to start mid-animation so they don't sync up
          item.style.animationDelay = `${Math.random() * -6}s`; 
          item.classList.add('is-floating');
        }, timing.flyInDuration);
      }, delay);
    });
    
    // V7: Start Flashback Glitch Loop
    startGalleryFlashbackLoop(galleryScene);
    
    // V11: Mobile scroll hint - hide when user scrolls
    setupGalleryScrollHint(galleryScene);
    
    // V7: Handle Button Appearance Manually (UX-02)
    // Last item delay (2930) + fly duration (1250) + buffer (300) = ~4480ms
    const totalDuration = 2930 + timing.flyInDuration + 300;
    
    setTimeout(() => {
        // Dispatch completion event
        document.dispatchEvent(new CustomEvent('rmui:gallery-complete'));
        
        // Show button
        const nextBtn = galleryScene.querySelector('.rm-scene-next');
        if (nextBtn) {
            nextBtn.classList.add('is-visible');
        }
        
        // V11: Hide scroll hint when button appears
        galleryScene.classList.add('scroll-hint-hidden');
    }, totalDuration);
  }

  /**
   * V12: Setup gallery scroll indicator on mobile
   * Creates a visible bounce arrow that disappears when user scrolls
   */
  function setupGalleryScrollHint(galleryScene) {
    // Only on mobile
    if (window.matchMedia('(min-width: 768px)').matches) return;
    
    // Create scroll indicator element if it doesn't exist
    let indicator = galleryScene.querySelector('.rm-gallery-scroll-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'rm-gallery-scroll-indicator';
      indicator.innerHTML = `
        <span class="rm-gallery-scroll-indicator__text">Kaydır</span>
        <span class="rm-gallery-scroll-indicator__arrow">↓</span>
      `;
      indicator.setAttribute('aria-hidden', 'true');
      // Append to the scene, not the content (so it stays fixed)
      galleryScene.appendChild(indicator);
    }
    
    let hasScrolled = false;
    
    const handleScroll = () => {
      if (!hasScrolled && galleryScene.scrollTop > 30) {
        hasScrolled = true;
        galleryScene.classList.add('scroll-hint-hidden');
        // Remove listener after triggering
        galleryScene.removeEventListener('scroll', handleScroll);
      }
    };
    
    galleryScene.addEventListener('scroll', handleScroll, { passive: true });
    
    // Store cleanup reference
    galleryScene._scrollHintHandler = handleScroll;
    galleryScene._scrollIndicator = indicator;
  }

  /**
   * V7: Flashback Glitch Effect
   * Rarely (once every 10s), one photo flashes bright white
   */
  function startGalleryFlashbackLoop(sceneEl) {
    // Clear any existing interval
    if (sceneEl._flashbackInterval) clearInterval(sceneEl._flashbackInterval);
    
    sceneEl._flashbackInterval = setInterval(() => {
      // Only if scene is active
      if (!sceneEl.classList.contains('is-active')) return;
      
      const photos = sceneEl.querySelectorAll('.rm-polaroid__img');
      if (photos.length === 0) return;
      
      const randomPhoto = photos[Math.floor(Math.random() * photos.length)];
      
      randomPhoto.classList.add('rm-flashback');
      setTimeout(() => {
        randomPhoto.classList.remove('rm-flashback');
      }, 300);
      
    }, 10000); // Every 10 seconds
  }

  /**
   * V7: Love scene effects - Photo cascade properly wired
   */
  function triggerLoveSceneEffects() {
    const loveScene = sceneElements.love;
    if (!loveScene) return;

    // V7: Photo stack cascade with proper timing
    const backPhoto = loveScene.querySelector('.rm-photo-stack__item--back');
    const frontPhoto = loveScene.querySelector('.rm-photo-stack__item--front');

    if (backPhoto) {
      setTimeout(() => {
        backPhoto.classList.add('is-visible');
      }, 500);
    }

    if (frontPhoto) {
      setTimeout(() => {
        frontPhoto.classList.add('is-visible');
      }, 700);
    }
  }

  /**
   * V7: Deep Feelings Scene Effects
   * Idle Whisper, Hold to Feel
   * CRIT-04: Store references for cleanup
   */
  function triggerDeepSceneEffects() {
    const deepScene = sceneElements.deep;
    if (!deepScene) return;

    // CRIT-04: Clean up any existing listeners first
    cleanupDeepSceneEffects();
    
    // Idle Whisper
    const whisperEl = deepScene.querySelector('.rm-idle-whisper');
    if (whisperEl) {
      whisperEl.textContent = "Seni şu an yanımda hissediyorum...";
      
      // CRIT-04: Store idleTimer on scene element for cleanup
      const resetIdle = () => {
        whisperEl.classList.remove('is-visible');
        clearTimeout(deepScene._idleTimer);
        deepScene._idleTimer = setTimeout(() => {
           if (deepScene.classList.contains('is-active')) {
             whisperEl.classList.add('is-visible');
           }
        }, 8000); // 8 seconds
      };
      
      // CRIT-04: Store reference to resetIdle for cleanup
      deepScene._resetIdleHandler = resetIdle;
      
      document.addEventListener('mousemove', resetIdle);
      document.addEventListener('click', resetIdle);
      resetIdle();
    }
    
    // Hold to Feel Button
    const holdBtn = deepScene.querySelector('.rm-btn--hold');
    if (holdBtn) {
      let holdTimer;
      
      const startHold = (e) => {
        e.preventDefault();
        holdBtn.classList.add('is-held');
        document.body.classList.add('rm-blur-mode');
        
        // V8: Duck audio for intimacy
        if (typeof RMMusic !== 'undefined') {
            RMMusic.setVolume(0.3);
        }

        // Visual pulse
        const vignette = deepScene.querySelector('.rm-scene__vignette');
        if (vignette) vignette.classList.add('rm-scene__vignette--bright');
        
        // Haptic if available
        if (navigator.vibrate) navigator.vibrate(50);
        
        holdTimer = setInterval(() => {
           if (navigator.vibrate) navigator.vibrate(20);
        }, 200);
        
        // Store holdTimer for cleanup
        deepScene._holdTimer = holdTimer;
      };
      
      const endHold = (e) => {
        e.preventDefault();
        holdBtn.classList.remove('is-held');
        document.body.classList.remove('rm-blur-mode');
        const vignette = deepScene.querySelector('.rm-scene__vignette');
        if (vignette) vignette.classList.remove('rm-scene__vignette--bright');
        
        // V8: Restore audio
        if (typeof RMMusic !== 'undefined') {
            RMMusic.setVolume(1.0);
        }

        clearInterval(holdTimer);
        clearInterval(deepScene._holdTimer);
        deepScene._holdTimer = null;
      };
      
      // CRIT-04: Store references to handlers for cleanup
      deepScene._startHoldHandler = startHold;
      deepScene._endHoldHandler = endHold;
      deepScene._holdBtn = holdBtn;
      
      holdBtn.addEventListener('mousedown', startHold);
      holdBtn.addEventListener('touchstart', startHold);
      holdBtn.addEventListener('mouseup', endHold);
      holdBtn.addEventListener('mouseleave', endHold);
      holdBtn.addEventListener('touchend', endHold);
    }

    // V8: Poetic Text Reveal for Deep Scene
    if (typeof RMReveal !== 'undefined' && RMReveal.preparePoeticText) {
      const deepTexts = deepScene.querySelectorAll('.rm-deep-card__text p');
      deepTexts.forEach(p => {
        // Skip paragraphs that contain interactive easter eggs (like "gözlerini")
        if (p.querySelector('.rm-highlight-eyes')) return;

        RMReveal.preparePoeticText(p);
        
        // Trigger reveal matching the scene element delay
        const delay = parseInt(p.dataset.delay || 0) + 300; // Match base delay
        setTimeout(() => {
          p.classList.add('is-poetic-visible');
        }, delay);
      });
    }
  }

  /**
   * CRIT-04: Clean up deep scene event listeners and timers
   */
  function cleanupDeepSceneEffects() {
    const deepScene = sceneElements.deep;
    if (!deepScene) return;

    // Clean up idle whisper listeners
    if (deepScene._resetIdleHandler) {
      document.removeEventListener('mousemove', deepScene._resetIdleHandler);
      document.removeEventListener('click', deepScene._resetIdleHandler);
      deepScene._resetIdleHandler = null;
    }

    // Clear idle timer
    if (deepScene._idleTimer) {
      clearTimeout(deepScene._idleTimer);
      deepScene._idleTimer = null;
    }

    // Clean up hold button listeners
    const holdBtn = deepScene._holdBtn || deepScene.querySelector('.rm-btn--hold');
    if (holdBtn && deepScene._startHoldHandler) {
      holdBtn.removeEventListener('mousedown', deepScene._startHoldHandler);
      holdBtn.removeEventListener('touchstart', deepScene._startHoldHandler);
      deepScene._startHoldHandler = null;
    }
    if (holdBtn && deepScene._endHoldHandler) {
      holdBtn.removeEventListener('mouseup', deepScene._endHoldHandler);
      holdBtn.removeEventListener('mouseleave', deepScene._endHoldHandler);
      holdBtn.removeEventListener('touchend', deepScene._endHoldHandler);
      deepScene._endHoldHandler = null;
    }

    // Clear hold timer
    if (deepScene._holdTimer) {
      clearInterval(deepScene._holdTimer);
      deepScene._holdTimer = null;
    }

    // Reset visual states
    document.body.classList.remove('rm-blur-mode');
    const vignette = deepScene.querySelector('.rm-scene__vignette');
    if (vignette) vignette.classList.remove('rm-scene__vignette--bright');
    
    const whisperEl = deepScene.querySelector('.rm-idle-whisper');
    if (whisperEl) whisperEl.classList.remove('is-visible');

    deepScene._holdBtn = null;
  }

  /**
   * V6: Animals scene - trigger animated timeline
   */
  function triggerAnimalsTimeline() {
    if (typeof RMAnimalsTimeline === 'undefined') {
      RMUI.log('RMAnimalsTimeline not found, skipping');
      
      // V7: If no timeline, show button after a delay anyway
      const animalsScene = sceneElements.animals;
      if (animalsScene) {
        const nextBtn = animalsScene.querySelector('.rm-scene-next');
        if (nextBtn) {
          setTimeout(() => {
            nextBtn.classList.add('is-visible');
          }, 3000);
        }
      }
      return;
    }

    // Delay timeline start for scene entrance to complete
    setTimeout(() => {
      RMAnimalsTimeline.start();
    }, timing.animalTimelineDelay);
  }

  /**
   * Closing scene effects - Heartburst
   */
  function triggerClosingEffects() {
    const closingScene = sceneElements.closing;
    if (!closingScene) return;

    // Trigger heartburst after title appears
    setTimeout(() => {
      if (typeof RMHeartburst !== 'undefined') {
        RMHeartburst.start();
      }
    }, 1800);
  }

  /**
   * V7: Letter scene effects - Shimmer and intimate feel, paper reveal
   * Handles the "Ritual of the Envelope"
   */
  function triggerLetterEffects() {
    const letterScene = sceneElements.letter;
    if (!letterScene) return;

    // Slow down bokeh for intimate feel
    if (typeof RMParallax !== 'undefined') {
      RMParallax.setIntensity(0.008);
    }

    // V7: Envelope Ritual
    const envelope = letterScene.querySelector('.rm-envelope');
    const envelopeStage = letterScene.querySelector('.rm-envelope-stage');
    const letterContent = letterScene.querySelector('.rm-scene__content--letter');
    const letterCard = letterScene.querySelector('.rm-letter-card');

    if (envelope && envelopeStage && letterContent) {
      // Ensure envelope is ready
      envelope.onclick = () => {
        // Prevent double clicks
        if (envelope.classList.contains('is-open')) return;

        // Open envelope
        envelope.classList.add('is-open');

        // Play sound and swell volume
        if (typeof RMMusic !== 'undefined') {
            RMMusic.playSFX('paper');
            RMMusic.swellVolume(1.3, 4000);
        }

        // Wait for flap animation and paper peek
        setTimeout(() => {
           // Transition to letter
           envelopeStage.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
           envelopeStage.style.opacity = '0';
           envelopeStage.style.transform = 'translateY(20px) scale(0.9)';
           
           setTimeout(() => {
             envelopeStage.style.display = 'none';
             letterContent.style.display = 'flex'; // Changed from block to flex to center
             letterContent.style.opacity = '0';
             
             // Force reflow
             void letterContent.offsetWidth;
             
             letterContent.style.transition = 'opacity 0.8s ease';
             letterContent.style.opacity = '1';
             
             // Trigger entrance animation for letter card
             if (letterCard) {
               // Force reflow
               void letterCard.offsetWidth;
               letterCard.classList.add('rm-scene-element', 'is-visible');
               
               // Trigger subsequent effects
               triggerLetterCardEffects(letterScene);
             }
           }, 500);
        }, 1000);
      };
    } else {
        // Fallback if envelope missing
        triggerLetterCardEffects(letterScene);
    }
  }

  /**
   * Internal helper for letter card specific effects (shimmer, signature)
   */
  function triggerLetterCardEffects(letterScene) {
    // Add shimmer class to letter card after entrance
    const letterCard = letterScene.querySelector('.rm-letter-card');
    if (letterCard) {
      setTimeout(() => {
        letterCard.classList.add('has-shimmer');
      }, timing.letterShimmerDelay);
      
      // V7: Ink Drying Effect
      const bodyText = letterCard.querySelector('.rm-letter-card__body');
      if (bodyText) {
        bodyText.classList.add('rm-ink-drying');
        // Force reflow
        void bodyText.offsetWidth;
        // Start drying
        setTimeout(() => {
            bodyText.classList.add('rm-ink-dried');
        }, 1000);

        // V8: Poetic Reveal for Letter
        if (typeof RMReveal !== 'undefined' && RMReveal.preparePoeticText) {
          const paragraphs = bodyText.querySelectorAll('p');
          paragraphs.forEach(p => {
             RMReveal.preparePoeticText(p);
             
             // Match delay
             const delay = parseInt(p.dataset.delay || 0) + 500; // Extra delay for letter open
             setTimeout(() => {
               p.classList.add('is-poetic-visible');
             }, delay);
          });
        }
      }
    }

    // Mini heartburst from signature when it appears
    const signature = letterScene.querySelector('.rm-letter-card__signature');
    if (signature && typeof RMHeartburst !== 'undefined') {
      setTimeout(() => {
        RMHeartburst.burstFromElement(signature, 4);
      }, 2800);
    }
    
    // Reveal restart button explicitly if needed
    const restartBtn = letterScene.querySelector('.rm-scene-restart');
    if (restartBtn) {
        setTimeout(() => {
            restartBtn.classList.add('is-visible');
        }, 3500);
    }
  }

  /**
   * Set scene mode on shell (changes background)
   */
  function setSceneMode(mode) {
    if (!shellEl) return;

    // Remove all mode classes
    sceneOrder.forEach(scene => {
      shellEl.classList.remove(`rm-scene-mode--${scene}`);
    });

    // Add current mode
    shellEl.classList.add(`rm-scene-mode--${mode}`);

    // Update CSS variable
    document.documentElement.style.setProperty('--rm-current-scene', sceneOrder.indexOf(mode));
  }

  /**
   * Get current scene info
   */
  function getCurrentScene() {
    return {
      name: sceneOrder[currentSceneIndex],
      index: currentSceneIndex,
      mode: sceneModes[sceneOrder[currentSceneIndex]],
      isFirst: currentSceneIndex === 0,
      isLast: currentSceneIndex === sceneOrder.length - 1
    };
  }

  /**
   * Check if currently transitioning
   */
  function isSceneTransitioning() {
    return isTransitioning;
  }

  /**
   * Get total scene count
   */
  function getSceneCount() {
    return sceneOrder.length;
  }

  /**
   * Destroy module
   */
  function destroy() {
    // Remove event listeners
    const nextButtons = document.querySelectorAll('.rm-scene-next');
    nextButtons.forEach(btn => {
      btn.removeEventListener('click', handleNextClick);
    });

    const restartBtn = document.querySelector('.rm-scene-restart');
    if (restartBtn) {
      restartBtn.removeEventListener('click', handleRestart);
    }

    sceneElements = {};
    currentSceneIndex = 0;
    isTransitioning = false;
    initialized = false;
  }

  // Public API
  return {
    init,
    goToScene,
    nextScene,
    prevScene,
    getCurrentScene,
    isSceneTransitioning,
    getSceneCount,
    destroy
  };
})();
