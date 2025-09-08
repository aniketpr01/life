// Suppress browser extension errors in development
if (typeof window !== 'undefined') {
  // Store original methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Override console.error to filter extension errors
  console.error = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Don't log MetaMask or extension errors
    if (message.includes('MetaMask') || 
        message.includes('chrome-extension://') ||
        message.includes('Failed to connect') ||
        message.includes('ethereum') ||
        message.includes('web3')) {
      return;
    }
    
    originalConsoleError.apply(console, args);
  };
  
  // Override console.warn to filter extension warnings
  console.warn = function(...args) {
    const message = args[0]?.toString() || '';
    
    // Don't log MetaMask or extension warnings
    if (message.includes('MetaMask') || 
        message.includes('chrome-extension://') ||
        message.includes('ethereum') ||
        message.includes('web3')) {
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };
  
  // Prevent unhandled rejection errors from extensions
  window.addEventListener('unhandledrejection', function(event) {
    const reason = event.reason?.message || event.reason || '';
    
    if (typeof reason === 'string' && (
      reason.includes('MetaMask') ||
      reason.includes('chrome-extension://') ||
      reason.includes('Failed to connect') ||
      reason.includes('ethereum') ||
      reason.includes('web3')
    )) {
      event.preventDefault();
      return false;
    }
  });
  
  // Prevent runtime errors from extensions
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    
    if (message.includes('MetaMask') ||
        message.includes('chrome-extension://') ||
        message.includes('Failed to connect') ||
        message.includes('ethereum') ||
        message.includes('web3')) {
      event.preventDefault();
      return false;
    }
  });
}