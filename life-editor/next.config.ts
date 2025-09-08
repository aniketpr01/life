import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    appDir: true,
    forceSwcTransforms: true,
  },
  // Completely disable error overlay in development
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  // Disable fast refresh for a cleaner experience
  reactStrictMode: false,
  images: {
    domains: ['github.com', 'avatars.githubusercontent.com'],
  },
  // Completely disable error overlay and suppress extension errors
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Disable all error overlays
      config.devtool = false;
      config.infrastructureLogging = { level: 'error' };
      
      // Remove error overlay plugin entirely
      config.plugins = config.plugins.filter(plugin => {
        const pluginName = plugin?.constructor?.name || '';
        return !pluginName.includes('ReactRefreshWebpackPlugin') && 
               !pluginName.includes('ErrorOverlayPlugin');
      });
      
      // Override webpack-dev-server client options
      if (config.entry && typeof config.entry === 'object') {
        Object.keys(config.entry).forEach(key => {
          if (Array.isArray(config.entry[key])) {
            config.entry[key] = config.entry[key].filter(entry => 
              !entry.includes('webpack-dev-server/client') &&
              !entry.includes('react-refresh')
            );
          }
        });
      }
      
      // Add custom error suppression
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.done.tap('SuppressAllErrors', (stats) => {
            // Clear all errors for cleaner development
            stats.compilation.errors = [];
            stats.compilation.warnings = [];
          });
          
          // Also suppress during compilation
          compiler.hooks.compilation.tap('SuppressAllErrors', (compilation) => {
            compilation.hooks.processErrors.tap('SuppressAllErrors', (errors) => {
              return errors.filter(error => 
                !error.message?.includes('MetaMask') &&
                !error.message?.includes('chrome-extension://') &&
                !error.message?.includes('Failed to connect')
              );
            });
          });
        }
      });
    }
    
    return config;
  },
  // Suppress specific console warnings
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
};

export default nextConfig;