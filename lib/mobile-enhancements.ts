// Viewport height fix for mobile browsers
// This addresses the issue where mobile browsers change viewport height
// when the address bar shows/hides, causing layout shifts

export const initViewportFix = () => {
  if (typeof window === 'undefined') return;

  // Set initial viewport height
  const setViewportHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  };

  // Set initial value
  setViewportHeight();

  // Update on resize (including orientation change)
  let timeoutId: NodeJS.Timeout;
  const handleResize = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(setViewportHeight, 150);
  };

  window.addEventListener('resize', handleResize);
  window.addEventListener('orientationchange', handleResize);

  // iOS specific fixes
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    // Prevent zoom on input focus
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('focusin', (e) => {
        if (e.target instanceof HTMLElement) {
          const computedStyle = window.getComputedStyle(e.target);
          const fontSize = parseFloat(computedStyle.fontSize);
          if (fontSize < 16) {
            e.target.style.fontSize = '16px';
            e.target.setAttribute('data-original-font-size', computedStyle.fontSize);
          }
        }
      });

      input.addEventListener('focusout', (e) => {
        if (e.target instanceof HTMLElement) {
          const originalSize = e.target.getAttribute('data-original-font-size');
          if (originalSize) {
            e.target.style.fontSize = originalSize;
            e.target.removeAttribute('data-original-font-size');
          }
        }
      });
    });
  }

  // Android Chrome specific fixes
  const isAndroid = /Android/.test(navigator.userAgent);
  if (isAndroid) {
    // Handle virtual keyboard showing/hiding
    let initialViewportHeight = window.innerHeight;
    
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight - currentHeight;
        
        // If height difference is significant, keyboard is likely open
        if (heightDifference > 150) {
          document.body.classList.add('keyboard-open');
        } else {
          document.body.classList.remove('keyboard-open');
        }
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
    }
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('orientationchange', handleResize);
  };
};

// Touch interaction improvements
export const initTouchEnhancements = () => {
  if (typeof window === 'undefined') return;

  // Improve scroll performance on mobile
  const scrollableElements = document.querySelectorAll('.scrollable, [data-scrollable]');
  scrollableElements.forEach((element) => {
    if (element instanceof HTMLElement) {
      element.style.setProperty('-webkit-overflow-scrolling', 'touch');
    }
  });

  // Fix for double-tap zoom on buttons
  const buttons = document.querySelectorAll('button, [role="button"]');
  buttons.forEach((button) => {
    if (button instanceof HTMLElement) {
      button.style.setProperty('touch-action', 'manipulation');
    }
  });

  // Prevent pinch zoom on specific elements
  const noZoomElements = document.querySelectorAll('.no-zoom, [data-no-zoom]');
  noZoomElements.forEach((element) => {
    element.addEventListener('touchstart', (e: Event) => {
      const touchEvent = e as TouchEvent;
      if (touchEvent.touches && touchEvent.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });
  });

  // Improve tap responsiveness
  const tapElements = document.querySelectorAll('button, a, [role="button"], [data-tap]');
  tapElements.forEach((element) => {
    element.addEventListener('touchstart', () => {
      element.classList.add('tap-active');
    });

    element.addEventListener('touchend', () => {
      setTimeout(() => {
        element.classList.remove('tap-active');
      }, 150);
    });

    element.addEventListener('touchcancel', () => {
      element.classList.remove('tap-active');
    });
  });
};

// Screen orientation handling
export const initOrientationHandling = () => {
  if (typeof window === 'undefined') return;

  const handleOrientationChange = () => {
    // Add orientation class to body
    const orientation = window.screen?.orientation?.type || 
                       (window.innerWidth > window.innerHeight ? 'landscape' : 'portrait');
    
    document.body.className = document.body.className
      .replace(/\b(portrait|landscape)-\w+\b/g, '')
      .replace(/\b(portrait|landscape)\b/g, '');
    
    document.body.classList.add(orientation.includes('landscape') ? 'landscape' : 'portrait');

    // Trigger custom orientation change event
    window.dispatchEvent(new CustomEvent('orientationChange', {
      detail: { orientation }
    }));
  };

  // Initial setup
  handleOrientationChange();

  // Listen for orientation changes
  window.addEventListener('orientationchange', () => {
    // Small delay to ensure accurate measurements
    setTimeout(handleOrientationChange, 100);
  });

  window.addEventListener('resize', handleOrientationChange);
};

// Initialize all mobile enhancements
export const initMobileEnhancements = () => {
  if (typeof window === 'undefined') return;

  const cleanupViewport = initViewportFix();
  initTouchEnhancements();
  initOrientationHandling();

  // Add mobile-specific CSS classes
  document.body.classList.add('mobile-enhanced');

  // Detect if running in Capacitor
  if ((window as any).Capacitor) {
    document.body.classList.add('capacitor-app');
  }

  // Return cleanup function
  return () => {
    if (cleanupViewport) cleanupViewport();
    document.body.classList.remove('mobile-enhanced', 'capacitor-app', 'keyboard-open');
  };
};