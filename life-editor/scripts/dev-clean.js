#!/usr/bin/env node

// Clean development server without error overlays
process.env.FAST_REFRESH = 'false';
process.env.DISABLE_ESLINT_PLUGIN = 'true';

const { spawn } = require('child_process');
const path = require('path');

// Override Next.js error handling
const originalConsoleError = console.error;
console.error = function(...args) {
  const message = args[0]?.toString() || '';
  
  // Suppress extension and MetaMask errors
  if (message.includes('MetaMask') || 
      message.includes('chrome-extension://') ||
      message.includes('Failed to connect') ||
      message.includes('Runtime Error') ||
      message.includes('Call Stack')) {
    return;
  }
  
  originalConsoleError.apply(console, args);
};

// Start Next.js with custom environment
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    FAST_REFRESH: 'false',
    DISABLE_ESLINT_PLUGIN: 'true',
    NODE_OPTIONS: '--max-old-space-size=4096'
  },
  cwd: process.cwd()
});

nextProcess.on('close', (code) => {
  process.exit(code);
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
});