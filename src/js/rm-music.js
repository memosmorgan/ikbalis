/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - MUSIC MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Music control (Harvey) with UI state management.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMMusic = (function() {
  'use strict';

  // State
  let audioElement = null;
  let buttonElement = null;
  let isPlaying = false;
  let hasInteracted = false;

  // Icons
  const icons = {
    play: '♫',
    pause: '❚❚',
    musicNote: '🎵'
  };

  // SFX
  const sfxFiles = {
    pop: 'public/audio/pop.mp3',
    paper: 'public/audio/paper.mp3',
    shimmer: 'public/audio/shimmer.mp3',
    whoosh: 'public/audio/whoosh.mp3'
  };
  
  const sfxAudio = {};

  /**
   * Initialize music module
   */
  function init() {
    // Get audio element
    audioElement = document.getElementById('rm-music');
    if (!audioElement) {
      RMUI.log('Audio element not found');
      return;
    }

    // Initialize SFX objects
    preloadSFX();

    // Get or create music button
    buttonElement = document.querySelector('.rm-music-button');
    if (!buttonElement) {
      createMusicButton();
    } else {
      setupButton();
    }

    // Set up audio event listeners
    setupAudioEvents();

    RMUI.log('Music V5 module initialized');
  }

  /**
   * Preload SFX files
   */
  function preloadSFX() {
    Object.keys(sfxFiles).forEach(key => {
      const audio = new Audio(sfxFiles[key]);
      audio.volume = 0.4; // Default SFX volume
      sfxAudio[key] = audio;
    });
  }

  /**
   * Play a sound effect
   */
  function playSFX(name) {
    // Only play if user has interacted with page (browser policy)
    // or if we want to force it (optional, but risky)
    // if (!hasInteracted) return; 
    
    const audio = sfxAudio[name];
    if (audio) {
      // Clone node to allow overlapping sounds
      const clone = audio.cloneNode();
      clone.volume = audio.volume;
      clone.play().catch(e => {
        // Ignore play errors (e.g. if file not found or no interaction yet)
        // RMUI.log('SFX Play failed:', e);
      });
    }
  }

  /**
   * Swell volume temporarily (V7 Feature)
   * e.g. for Letter Reveal
   */
  function swellVolume(multiplier = 1.3, duration = 3000) {
    if (!audioElement || !isPlaying) return;
    
    const originalVol = audioElement.volume;
    const targetVol = Math.min(originalVol * multiplier, 1.0);
    
    // Ramp up
    fadeVolume(targetVol, 800);
    
    // Return to normal after duration
    setTimeout(() => {
      fadeVolume(originalVol, 1500);
    }, duration);
  }

  /**
   * Smoothly fade volume to target
   */
  function fadeVolume(target, duration = 1000) {
    if (!audioElement) return;
    
    const start = audioElement.volume;
    const change = target - start;
    const steps = 20;
    const interval = duration / steps;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const newVol = start + (change * (currentStep / steps));
      audioElement.volume = RMUI.clamp(newVol, 0, 1);
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
  }

  /**
   * Create music button if it doesn't exist
   */
  function createMusicButton() {
    buttonElement = document.createElement('button');
    buttonElement.className = 'rm-music-button';
    buttonElement.setAttribute('aria-label', 'Müziği aç');
    buttonElement.setAttribute('aria-pressed', 'false');
    buttonElement.setAttribute('title', 'Müziği aç');
    
    buttonElement.innerHTML = `
      <span class="rm-music-button__icon">${icons.musicNote}</span>
      <span class="rm-music-button__tooltip">Harvey'i aç</span>
    `;
    
    document.body.appendChild(buttonElement);
    setupButton();
  }

  /**
   * Set up button event listeners
   */
  function setupButton() {
    buttonElement.addEventListener('click', togglePlay);
    
    // Keyboard accessibility
    buttonElement.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        togglePlay();
      }
    });
  }

  /**
   * Set up audio event listeners
   */
  function setupAudioEvents() {
    audioElement.addEventListener('play', () => {
      isPlaying = true;
      updateButtonState();
    });

    audioElement.addEventListener('pause', () => {
      isPlaying = false;
      updateButtonState();
    });

    audioElement.addEventListener('ended', () => {
      isPlaying = false;
      updateButtonState();
      // Loop the music
      audioElement.currentTime = 0;
      audioElement.play().catch(() => {});
    });

    audioElement.addEventListener('error', (e) => {
      RMUI.log('Audio error:', e);
      isPlaying = false;
      updateButtonState();
    });
  }

  /**
   * Toggle play/pause
   */
  function togglePlay() {
    if (!audioElement) return;

    hasInteracted = true;

    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }

  /**
   * Play music
   */
  function play() {
    if (!audioElement) return;

    const playPromise = audioElement.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlaying = true;
          updateButtonState();
          RMUI.log('Music playing');
          
          // Show toast on first play
          if (hasInteracted) {
            RMUI.showToast('Harvey çalıyor... 🎵', 2000);
          }
        })
        .catch(error => {
          RMUI.log('Play failed:', error);
          isPlaying = false;
          updateButtonState();
        });
    }
  }

  /**
   * Pause music
   */
  function pause() {
    if (!audioElement) return;

    audioElement.pause();
    isPlaying = false;
    updateButtonState();
    RMUI.log('Music paused');
  }

  /**
   * Update button visual state
   */
  function updateButtonState() {
    if (!buttonElement) return;

    const iconEl = buttonElement.querySelector('.rm-music-button__icon');
    const tooltipEl = buttonElement.querySelector('.rm-music-button__tooltip');

    if (isPlaying) {
      buttonElement.classList.add('is-playing');
      buttonElement.setAttribute('aria-pressed', 'true');
      buttonElement.setAttribute('aria-label', 'Müziği durdur');
      
      if (iconEl) iconEl.textContent = '🎶';
      if (tooltipEl) tooltipEl.textContent = 'Müziği durdur';
    } else {
      buttonElement.classList.remove('is-playing');
      buttonElement.setAttribute('aria-pressed', 'false');
      buttonElement.setAttribute('aria-label', 'Müziği aç');
      
      if (iconEl) iconEl.textContent = icons.musicNote;
      if (tooltipEl) tooltipEl.textContent = "Harvey'i aç";
    }
  }

  /**
   * Set volume
   */
  function setVolume(value) {
    if (audioElement) {
      audioElement.volume = RMUI.clamp(value, 0, 1);
    }
  }

  /**
   * Get current state
   */
  function getState() {
    return {
      isPlaying,
      hasInteracted,
      currentTime: audioElement ? audioElement.currentTime : 0,
      duration: audioElement ? audioElement.duration : 0,
      volume: audioElement ? audioElement.volume : 1
    };
  }

  // Public API
  return {
    init,
    play,
    pause,
    togglePlay,
    setVolume,
    playSFX,
    swellVolume,
    getState
  };
})();
