/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - REVEAL MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Handles element visibility transitions within scenes.
 * In V5, this module complements rm-scenes.js for internal element reveals.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMReveal = (function() {
  'use strict';

  // Configuration
  const config = {
    staggerDelay: 100
  };

  /**
   * Initialize reveal system
   * In V5, most reveals are handled by rm-scenes.js
   * This module provides utility functions for additional reveals
   */
  function init() {
    RMUI.log('RMReveal V5 initialized (scene-based mode)');
  }

  /**
   * Manually trigger reveal for an element
   */
  function reveal(element, delay = 0) {
    if (!element) return;

    setTimeout(() => {
      element.classList.add('is-visible');
    }, delay);
  }

  /**
   * Reveal all elements in a container with stagger
   */
  function revealAll(container, stagger = config.staggerDelay) {
    if (!container) return;

    const elements = container.querySelectorAll('.rm-scene-element:not(.is-visible)');
    elements.forEach((el, index) => {
      const delay = parseInt(el.dataset.delay || 0) + (index * stagger);
      setTimeout(() => {
        el.classList.add('is-visible');
      }, delay);
    });
  }

  /**
   * Reset reveal state for elements
   */
  function reset(element) {
    if (element) {
      element.classList.remove('is-visible');
    }
  }

  /**
   * Reset all elements in container
   */
  function resetAll(container) {
    if (!container) return;

    const elements = container.querySelectorAll('.is-visible');
    elements.forEach(el => {
      el.classList.remove('is-visible');
    });
  }

  /**
   * Reveal with animation class
   */
  function revealWithAnimation(element, animationClass, delay = 0) {
    if (!element) return;

    setTimeout(() => {
      element.classList.add(animationClass);
      element.classList.add('is-visible');
    }, delay);
  }

  /**
   * V8: Prepare element for poetic reveal (split words)
   */
  function preparePoeticText(element) {
    if (!element || element.classList.contains('is-poetic-ready')) return;
    
    // Safety check: Do not touch elements marked to skip
    if (element.hasAttribute('data-no-poetic') || element.querySelector('.rm-highlight-eyes')) {
        return;
    }
    
    // Get text content, keeping HTML structure is hard, so we assume simple text blocks for now
    // or we act on leaf nodes. For safety, let's only do this on paragraphs marked for it.
    
    const words = element.innerText.split(' ');
    element.innerHTML = words.map((word, index) => 
      `<span class="rm-poetic-word" style="--word-index: ${index}">${word} </span>`
    ).join('');
    
    element.classList.add('is-poetic-ready');
  }

  /**
   * V8: Trigger poetic reveal
   */
  function revealPoetic(element, delay = 0) {
    if (!element) return;
    
    if (!element.classList.contains('is-poetic-ready')) {
      preparePoeticText(element);
    }
    
    setTimeout(() => {
      element.classList.add('is-poetic-visible');
      element.classList.add('is-visible'); // Ensure base visibility
    }, delay);
  }

  // Public API
  return {
    init,
    reveal,
    revealAll,
    reset,
    resetAll,
    revealWithAnimation,
    preparePoeticText,
    revealPoetic,
    config
  };
})();
