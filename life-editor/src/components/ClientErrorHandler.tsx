'use client';

import { useEffect } from 'react';

export default function ClientErrorHandler() {
  useEffect(() => {
    // Suppress MetaMask and browser extension errors
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Filter out MetaMask and extension-related errors
      if (message.includes('MetaMask') || 
          message.includes('chrome-extension://') ||
          message.includes('Failed to connect') ||
          message.includes('ethereum') ||
          message.includes('web3')) {
        return;
      }
      
      originalError.apply(console, args);
    };
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      
      // Filter out MetaMask and extension-related warnings
      if (message.includes('MetaMask') || 
          message.includes('chrome-extension://') ||
          message.includes('ethereum') ||
          message.includes('web3')) {
        return;
      }
      
      originalWarn.apply(console, args);
    };
    
    // Global error handler for unhandled promises
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason;
      
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
    };
    
    // Global error handler for runtime errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      
      if (message.includes('MetaMask') ||
          message.includes('chrome-extension://') ||
          message.includes('Failed to connect') ||
          message.includes('ethereum') ||
          message.includes('web3')) {
        event.preventDefault();
        return false;
      }
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);
    
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}