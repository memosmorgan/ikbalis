/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - ANIMALS TIMELINE ENGINE (V7 MINI-SHOW)
 * ═══════════════════════════════════════════════════════════════════════════
 * Animated timeline showing animals one-by-one with speech bubbles.
 * Hamster is FIRST and PRIMARY with special golden star entrance.
 * V7: Enhanced timing for mini-show feel, button only appears after complete
 * Version 7.0 - Cinematic Polish Pass
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMAnimalsTimeline = (function() {
  'use strict';

  // Animal data - Hamster is FIRST and PRIMARY
  // Replaced emoji with gif paths found in public/images/animals/
  // Mapped based on user instructions:
  // cute-happy.gif -> Tilki
  // mocha-bear-music.gif -> Ayı
  // we-bare-bears-polar-bear.gif -> Panda
  // psybirdb1oom.gif -> Tavşan
  const animalsData = [
    { id: 'hamster', gif: 'hamster-hamtaro.gif', name: 'Hamsterişko', line: 'İlk beni alıcaz! Hep hayalindim ben! ✨', isPrimary: true },
    { id: 'cat', gif: 'white-cat.gif', name: 'Kedoş', line: 'Senden sonraki patron benim! 😼' },
    { id: 'dog', gif: 'kopek.jpg', name: 'Köpoş', line: 'Hatırladın beni di mi! 🐕', isSpecial: true },
    { id: 'bunny', gif: 'psybirdb1oom.gif', name: 'Tavşan', line: 'Senin kadar olmasa da tatlışım 🐰' },
    { id: 'bear', gif: 'mocha-bear-music.gif', name: 'Ayışko', line: 'İyi müzik yaparım! 🐻' },
    { id: 'frog', gif: 'frog-pixel.gif', name: 'Kurbik', line: 'Vırak! Masandayım hemen! 🐸' },
    { id: 'panda', gif: 'we-bare-bears-polar-bear.gif', name: 'Pandoşlar', line: 'Sizin gibi iki tatlış buradayız! 🐼🤍' },
    { id: 'sloth', gif: 'sloth-roll.gif', name: 'Tembelişko', line: 'Sana mı çekmişim ne? 🦥' },
    { id: 'fox', gif: 'cute-happy.gif', name: 'Tilkişko', line: 'Güzelliğin kalbimi çaldı 🦊' },
    { id: 'owl', gif: 'frostwalker-owl-snow-owl.gif', name: 'Baykuşko', line: 'Gözlerimi senden alamıyorum 🦉' },
    { id: 'chick', gif: 'duck-ducky.gif', name: 'Civcivişko', line: 'Küçücüğüm ben 🐥' }
  ];

  // State machine states
  const State = {
    IDLE: 'IDLE',
    ENTERING: 'ENTERING',
    HOLDING: 'HOLDING',
    EXITING: 'EXITING',
    COMPLETE: 'COMPLETE'
  };

  // V7: Enhanced Configuration for Mini-Show feel
  const config = {
    enterDuration: 800,          // V7: Slightly longer for more impact
    enterDurationPrimary: 1050,  // V7: Grand entrance for hamster
    holdDuration: 1500,          // V8: Speed up standard animals (Quick-Quick-Slow rhythm)
    holdDurationPrimary: 3200,   // V7: Star gets more time
    holdDurationSpecial: 4000,   // Special animals (like köpek with memory) get extra time
    holdDurationReduced: 1200,
    exitDuration: 550,
    betweenDelay: 350            // V7: Slight pause between animals
  };

  // State
  let currentState = State.IDLE;
  let currentAnimalIndex = -1;
  let stageEl = null;
  let animalContainerEl = null;
  let progressEl = null;
  let staticGridEl = null;
  let initialized = false;
  let timeoutId = null;
  let skipButtonTimeoutId = null;
  let skipButtonEl = null;

  // Spotlight variables
  let spotlightReqId = null;
  let spotlightX = 50;
  let spotlightY = 50;
  let targetSpotlightX = 50;
  let targetSpotlightY = 50;
  let isMouseOverStage = false;

  /**
   * Initialize the animals timeline
   */
  function init() {
    if (initialized) return;

    RMUI.log('Initializing Animals Timeline V7 Mini-Show...');
    
    // Find the animals scene
    const animalsScene = document.querySelector('[data-scene="animals"]');
    if (!animalsScene) {
      RMUI.log('Animals scene not found');
      return;
    }

    // Find and hide static grid
    staticGridEl = animalsScene.querySelector('.rm-animals-grid');

    // Find skip button and attach listener
    skipButtonEl = animalsScene.querySelector('.rm-animals-skip');
    if (skipButtonEl) {
      skipButtonEl.addEventListener('click', (e) => {
        e.preventDefault();
        skip();
        hideSkipButton();
      });
    }

    // Create stage DOM
    createStageDOM(animalsScene);
    
    // V7: Start spotlight loop
    startSpotlightLoop();

    initialized = true;
    RMUI.log('Animals Timeline V7 initialized');
  }

  /**
   * Spotlight Animation Loop
   */
  function startSpotlightLoop() {
    function animate() {
      // Lerp spotlight
      spotlightX += (targetSpotlightX - spotlightX) * 0.1;
      spotlightY += (targetSpotlightY - spotlightY) * 0.1;
      
      if (stageEl) {
        stageEl.style.setProperty('--spotlight-x', `${spotlightX}%`);
        stageEl.style.setProperty('--spotlight-y', `${spotlightY}%`);
      }
      
      spotlightReqId = requestAnimationFrame(animate);
    }
    spotlightReqId = requestAnimationFrame(animate);
  }

  /**
   * Create the stage DOM elements
   */
  function createStageDOM(animalsScene) {
    // Create stage container
    stageEl = document.createElement('div');
    stageEl.className = 'rm-animals-stage';
    stageEl.setAttribute('aria-live', 'polite');
    stageEl.setAttribute('aria-label', 'Hayvan tanıtım gösterisi');
    
    // Mouse tracking for spotlight
    stageEl.addEventListener('mousemove', (e) => {
        if (currentState !== State.ENTERING) {
            const rect = stageEl.getBoundingClientRect();
            targetSpotlightX = ((e.clientX - rect.left) / rect.width) * 100;
            targetSpotlightY = ((e.clientY - rect.top) / rect.height) * 100;
            isMouseOverStage = true;
        }
    });
    
    stageEl.addEventListener('mouseleave', () => {
        isMouseOverStage = false;
        if (currentState !== State.ENTERING) {
            targetSpotlightX = 50;
            targetSpotlightY = 50;
        }
    });

    // Create animal container (for 3D perspective)
    animalContainerEl = document.createElement('div');
    animalContainerEl.className = 'rm-animal-solo-container';

    // Create progress indicator
    progressEl = document.createElement('div');
    progressEl.className = 'rm-animals-progress';
    progressEl.innerHTML = `<span class="rm-animals-progress__current">0</span> / <span class="rm-animals-progress__total">${animalsData.length}</span>`;

    stageEl.appendChild(animalContainerEl);
    stageEl.appendChild(progressEl);

    // Insert stage after header
    const header = animalsScene.querySelector('.rm-animals-header');
    if (header && header.parentNode) {
      header.parentNode.insertBefore(stageEl, header.nextSibling);
    } else {
      const content = animalsScene.querySelector('.rm-scene__content');
      if (content) {
        content.insertBefore(stageEl, content.firstChild);
      }
    }
  }

  /**
   * Start the timeline animation
   */
  function start() {
    if (!initialized || currentState !== State.IDLE) {
      RMUI.log('Timeline not ready or already running');
      return;
    }

    RMUI.log('Starting Animals Timeline V7...');

    // Hide static grid
    if (staticGridEl) {
      staticGridEl.style.display = 'none';
    }

    // Show stage
    if (stageEl) {
      stageEl.classList.add('is-active');
    }

    // V8: Dim header to prevent overlap
    const header = document.querySelector('.rm-animals-header');
    if (header) {
      header.classList.add('is-dimmed');
    }

    // Reset index
    currentAnimalIndex = -1;

    // Start sequence
    showNextAnimal();

    // V7: Show skip button after 5 seconds
    if (skipButtonEl) {
      skipButtonTimeoutId = setTimeout(() => {
        if (currentState !== State.COMPLETE && currentState !== State.IDLE) {
          skipButtonEl.style.display = 'inline-flex';
          // Force reflow
          void skipButtonEl.offsetWidth;
          skipButtonEl.style.opacity = '1';
        }
      }, 5000);
    }
  }

  /**
   * Show the next animal in sequence
   */
  function showNextAnimal() {
    currentAnimalIndex++;

    // Check if we've shown all animals
    if (currentAnimalIndex >= animalsData.length) {
      complete();
      return;
    }

    const animal = animalsData[currentAnimalIndex];
    const isPrimary = animal.isPrimary === true;

    // Update progress
    updateProgress(currentAnimalIndex + 1);

    // Create animal element
    const animalEl = createAnimalElement(animal, isPrimary);
    
    // Clear previous animal
    animalContainerEl.innerHTML = '';
    animalContainerEl.appendChild(animalEl);

    // Transition to ENTERING state
    currentState = State.ENTERING;
    
    // V7: Center spotlight on the entering animal
    targetSpotlightX = 50;
    targetSpotlightY = 50;
    
    // Play Pop SFX
    if (typeof RMMusic !== 'undefined') {
        RMMusic.playSFX('pop');
    }
    
    // Trigger Audience Hearts (Fountain)
    if (typeof RMHeartburst !== 'undefined') {
        // V7: Fountain mode - hearts floating UP from bottom
        RMHeartburst.burstFromElement(stageEl, 10, 'fountain'); 
    }

    // Trigger enter animation
    requestAnimationFrame(() => {
      animalEl.classList.add('is-entering');
      
      // After enter animation, transition to HOLDING
      const enterDur = isPrimary ? config.enterDurationPrimary : config.enterDuration;
      
      timeoutId = setTimeout(() => {
        animalEl.classList.remove('is-entering');
        animalEl.classList.add('is-visible');
        currentState = State.HOLDING;

        // Determine hold duration
        let holdDur = config.holdDuration;
        if (isPrimary) {
          holdDur = config.holdDurationPrimary;
        } else if (animal.isSpecial) {
          holdDur = config.holdDurationSpecial;
        }
        if (RMUI.config.reducedMotion) {
          holdDur = config.holdDurationReduced;
        }

        // After hold, transition to EXITING
        timeoutId = setTimeout(() => {
          currentState = State.EXITING;
          animalEl.classList.remove('is-visible');
          animalEl.classList.add('is-exiting');

          // After exit, show next animal
          timeoutId = setTimeout(() => {
            showNextAnimal();
          }, config.exitDuration + config.betweenDelay);

        }, holdDur);

      }, enterDur);
    });
  }

  /**
   * Create an animal element
   */
  function createAnimalElement(animal, isPrimary) {
    const el = document.createElement('div');
    el.className = 'rm-animal-solo';
    if (isPrimary) {
      el.classList.add('rm-animal-solo--primary');
    }
    if (animal.isSpecial) {
      el.classList.add('rm-animal-solo--special');
    }
    el.setAttribute('data-animal', animal.id);

    // Use IMG tag instead of emoji div, pointing to gif in public/images/animals/
    const gifPath = `public/images/animals/${animal.gif}`;
    
    el.innerHTML = `
      <div class="rm-animal-solo__bubble">${animal.line}</div>
      <img src="${gifPath}" class="rm-animal-solo__image" alt="${animal.name}">
      <div class="rm-animal-solo__name">${animal.name}</div>
    `;

    return el;
  }

  /**
   * Update progress indicator
   */
  function updateProgress(current) {
    if (!progressEl) return;
    
    const currentEl = progressEl.querySelector('.rm-animals-progress__current');
    if (currentEl) {
      currentEl.textContent = current;
    }
  }

  /**
   * Complete the timeline
   */
  function complete() {
    currentState = State.COMPLETE;
    RMUI.log('Animals Timeline V7 complete');
    
    // PERF-02: Cancel spotlight animation frame - no longer needed after completion
    if (spotlightReqId) {
      cancelAnimationFrame(spotlightReqId);
      spotlightReqId = null;
    }
    
    // Hide skip button
    hideSkipButton();

    // V8: Bring back header if needed, or keep it dimmed? 
    // Usually better to keep it away or change it. 
    // Let's keep it dimmed for now as we show the "Complete" message.

    // Clear the stage content after a moment
    setTimeout(() => {
      if (animalContainerEl) {
        animalContainerEl.innerHTML = `
          <div class="rm-animals-complete">
            <span class="rm-animals-complete__emoji">🏡</span>
            <span class="rm-animals-complete__text">Hepsi evimizde olacak!</span>
          </div>
        `;
      }
    }, 300);

    // V7: Dispatch complete event - this triggers the button to appear
    document.dispatchEvent(new CustomEvent('rmui:animals-complete', {
      detail: { totalAnimals: animalsData.length }
    }));
  }

  /**
   * Reset the timeline
   */
  function reset() {
    // Clear any pending timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    
    // PERF-02: Cancel spotlight animation frame to prevent running forever
    if (spotlightReqId) {
      cancelAnimationFrame(spotlightReqId);
      spotlightReqId = null;
    }
    
    // Hide skip button and clear its timeout
    hideSkipButton();

    currentState = State.IDLE;
    currentAnimalIndex = -1;

    // Clear stage
    if (animalContainerEl) {
      animalContainerEl.innerHTML = '';
    }

    // Reset progress
    updateProgress(0);

    // Hide stage
    if (stageEl) {
      stageEl.classList.remove('is-active');
    }

    // Show static grid
    if (staticGridEl) {
      staticGridEl.style.display = '';
    }

    // V8: Restore header
    const header = document.querySelector('.rm-animals-header');
    if (header) {
      header.classList.remove('is-dimmed');
    }

    RMUI.log('Animals Timeline reset');
  }

  /**
   * Helper to hide skip button and clear timeout
   */
  function hideSkipButton() {
    if (skipButtonTimeoutId) {
      clearTimeout(skipButtonTimeoutId);
      skipButtonTimeoutId = null;
    }
    
    if (skipButtonEl) {
      skipButtonEl.style.display = 'none';
      skipButtonEl.style.opacity = '0';
    }
  }

  /**
   * Skip to completion (for reduced motion or impatient users)
   */
  function skip() {
    // Clear any pending timeouts
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Jump to complete
    currentAnimalIndex = animalsData.length - 1;
    updateProgress(animalsData.length);
    complete();

    RMUI.log('Animals Timeline skipped');
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      state: currentState,
      currentIndex: currentAnimalIndex,
      totalAnimals: animalsData.length,
      isRunning: currentState !== State.IDLE && currentState !== State.COMPLETE
    };
  }

  // Public API
  return {
    init,
    start,
    reset,
    skip,
    getState
  };
})();
