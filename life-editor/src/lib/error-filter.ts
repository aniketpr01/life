// Error filtering utility for browser extensions
export function isExtensionError(error: any): boolean {
  const message = error?.message || error?.toString() || '';
  const stack = error?.stack || '';
  
  const extensionPatterns = [
    'MetaMask',
    'chrome-extension://',
    'Failed to connect',
    'ethereum',
    'web3',
    'extension script',
    'injected script',
    'inpage.js',
    'content-script',
  ];
  
  return extensionPatterns.some(pattern => 
    message.includes(pattern) || stack.includes(pattern)
  );
}

export function shouldSuppressError(error: any): boolean {
  return isExtensionError(error);
}

// Set up global error handlers for development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Monkey patch webpack's error handling
  const originalWebpackJsonp = (window as any).__webpack_require__;
  
  if (originalWebpackJsonp) {
    const originalErrorHandler = originalWebpackJsonp.e;
    if (originalErrorHandler) {
      originalWebpackJsonp.e = function(chunkId: any) {
        return originalErrorHandler.call(this, chunkId).catch((error: any) => {
          if (shouldSuppressError(error)) {
            return Promise.resolve();
          }
          throw error;
        });
      };
    }
  }
}