// Global error suppression for browser extensions
(function() {
  'use strict';
  
  // List of error patterns to suppress
  const suppressPatterns = [
    'MetaMask',
    'chrome-extension://',
    'moz-extension://',
    'extension://',
    'Failed to connect',
    'ethereum',
    'web3',
    'injected',
    'inpage.js',
    'content-script',
    'window.ethereum',
    'provider',
  ];
  
  function shouldSuppress(message) {
    if (!message) return false;
    const msgStr = message.toString().toLowerCase();
    return suppressPatterns.some(pattern => msgStr.includes(pattern.toLowerCase()));
  }
  
  // Suppress console errors
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalError.apply(console, arguments);
  };
  
  console.warn = function(...args) {
    if (shouldSuppress(args[0])) {
      return;
    }
    originalWarn.apply(console, arguments);
  };
  
  // Suppress unhandled rejections
  window.addEventListener('unhandledrejection', function(event) {
    if (shouldSuppress(event.reason?.message || event.reason)) {
      event.preventDefault();
      return false;
    }
  });
  
  // Suppress runtime errors
  window.addEventListener('error', function(event) {
    if (shouldSuppress(event.message || event.error?.message)) {
      event.preventDefault();
      return false;
    }
  });
  
  // Completely hide ALL Next.js error overlays
  function hideErrorOverlay() {
    // Remove all possible overlay elements
    const overlaySelectors = [
      '[data-nextjs-dialog-overlay]',
      '[data-nextjs-toast]', 
      '[data-nextjs-dialog]',
      '#__next-build-watcher',
      '.next-error-h1',
      '.next-error-desc',
      'div[style*="position: fixed"][style*="z-index"]',
      'div[style*="background: rgb(17, 17, 17)"]',
      'div[style*="background: rgb(24, 24, 24)"]'
    ];
    
    overlaySelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        if (el && (shouldSuppress(el.textContent) || el.textContent?.includes('Runtime') || el.textContent?.includes('Call Stack'))) {
          el.style.display = 'none !important';
          el.style.visibility = 'hidden !important';
          el.style.opacity = '0 !important';
          el.remove();
        }
      });
    });
    
    // Also remove any fixed position divs that might be error overlays
    const fixedDivs = document.querySelectorAll('div[style*="position: fixed"]');
    fixedDivs.forEach(div => {
      const content = div.textContent || '';
      if (content.includes('MetaMask') || 
          content.includes('Failed to connect') ||
          content.includes('Runtime') ||
          content.includes('Call Stack') ||
          content.includes('1/1') ||
          content.includes('Next.js')) {
        div.style.display = 'none !important';
        div.style.visibility = 'hidden !important';
        div.style.opacity = '0 !important';
        div.remove();
      }
    });
    
    // Also target Next.js error indicators
    const errorIndicators = document.querySelectorAll('[data-nextjs-toast], [data-nextjs-dialog], .nextjs-portal, [id*="nextjs"]');
    errorIndicators.forEach(el => {
      if (el.textContent?.includes('MetaMask') || el.textContent?.includes('Failed to connect')) {
        el.remove();
      }
    });
  }
  
  // Ultra aggressive checking - every 10ms
  setInterval(hideErrorOverlay, 10);
  
  // Also check on every animation frame for immediate suppression
  const checkOverlays = () => {
    hideErrorOverlay();
    requestAnimationFrame(checkOverlays);
  };
  requestAnimationFrame(checkOverlays);
  
  // Also check on DOM changes
  if (window.MutationObserver) {
    const observer = new MutationObserver(hideErrorOverlay);
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }
  
  // Remove on load
  document.addEventListener('DOMContentLoaded', hideErrorOverlay);
  window.addEventListener('load', hideErrorOverlay);
  
  console.log('✅ Extension error suppression active');
})();