/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ROMANTIC MOTION - PARALLAX MODULE (V5 SCENE-BASED)
 * ═══════════════════════════════════════════════════════════════════════════
 * Mouse-based parallax effects for bokeh and ambient elements.
 * Version 5.0 - Scene-Based Romantic Storybook
 * ═══════════════════════════════════════════════════════════════════════════
 */

const RMParallax = (function() {
  'use strict';

  // Configuration
  const config = {
    mouseIntensity: 0.02,
    smoothing: 0.08,
    enabled: true
  };

  // State
  let bokehDots = [];
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  let rafId = null;
  
  // V7: Love Dust (Sparkle) State
  let sparkles = [];
  let lastSparkleTime = 0;
  const SPARKLE_LIMIT = 20;

  /**
   * Initialize parallax
   */
  function init() {
    // Skip on mobile or touch devices
    if (RMUI.state.isMobile || RMUI.state.isTouch) {
      RMUI.log('Parallax disabled on mobile/touch');
      return;
    }

    // Skip if reduced motion is preferred
    if (RMUI.config.reducedMotion) {
      RMUI.log('Parallax disabled for reduced motion');
      return;
    }

    // Get bokeh dots
    bokehDots = Array.from(document.querySelectorAll('.rm-bokeh-dot'));

    if (bokehDots.length === 0) {
      RMUI.log('No parallax elements found');
      return;
    }

    // Set up mouse tracking
    setupMouseTracking();
    
    // V7: Love Dust Setup
    if (!RMUI.config.reducedMotion) {
      setupLoveDust();
    }

    // Start animation loop
    startLoop();

    RMUI.log('Parallax V5 initialized with', bokehDots.length, 'bokeh dots');
  }

  /**
   * Set up mouse movement tracking
   */
  function setupMouseTracking() {
    document.addEventListener('mousemove', RMUI.throttle((e) => {
      // Normalize mouse position to -1 to 1
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, 16), { passive: true });

    // Reset on mouse leave
    document.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });
  }

  /**
   * V7: Love Dust (Sparkle Trail)
   */
  function setupLoveDust() {
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      // Throttle creation (every 100ms) - PERF-01: Reduced from 50ms to reduce DOM churn
      if (now - lastSparkleTime > 100) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleTime = now;
      }
    }, { passive: true });
  }

  function createSparkle(x, y) {
    if (sparkles.length >= SPARKLE_LIMIT) {
      // Remove oldest
      const old = sparkles.shift();
      if (old && old.parentNode) old.remove();
    }

    const sparkle = document.createElement('div');
    sparkle.className = 'rm-sparkle';
    sparkle.style.left = `${x}px`;
    sparkle.style.top = `${y}px`;
    
    // Random offset
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = (Math.random() - 0.5) * 20;
    sparkle.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
    document.body.appendChild(sparkle);
    sparkles.push(sparkle);

    // Remove after animation
    setTimeout(() => {
      if (sparkle.parentNode) {
        sparkle.remove();
        const idx = sparkles.indexOf(sparkle);
        if (idx > -1) sparkles.splice(idx, 1);
      }
    }, 1000);
  }

  /**
   * Start animation loop
   */
  function startLoop() {
    function animate() {
      if (!config.enabled) {
        rafId = requestAnimationFrame(animate);
        return;
      }

      // Smooth interpolation for mouse
      mouseX = RMUI.lerp(mouseX, targetX, config.smoothing);
      mouseY = RMUI.lerp(mouseY, targetY, config.smoothing);

      // Apply parallax to bokeh with varying depths
      bokehDots.forEach((dot, index) => {
        const depths = [0.2, 0.35, 0.15, 0.4, 0.25, 0.3, 0.18, 0.45, 0.22, 0.28];
        const depth = depths[index % depths.length];
        
        const moveX = mouseX * config.mouseIntensity * depth * 60;
        const moveY = mouseY * config.mouseIntensity * depth * 60;
        
        dot.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });

      rafId = requestAnimationFrame(animate);
    }

    animate();
  }

  /**
   * Stop animation loop
   */
  function stopLoop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  /**
   * Enable parallax
   */
  function enable() {
    config.enabled = true;
  }

  /**
   * Disable parallax
   */
  function disable() {
    config.enabled = false;
    
    // Reset all transforms
    bokehDots.forEach(dot => {
      dot.style.transform = '';
    });
  }

  /**
   * Set parallax intensity
   */
  function setIntensity(value) {
    config.mouseIntensity = RMUI.clamp(value, 0, 0.1);
  }

  /**
   * Destroy module
   */
  function destroy() {
    stopLoop();
    disable();
    bokehDots = [];
  }

  // Public API
  return {
    init,
    enable,
    disable,
    setIntensity,
    destroy
  };
})();
