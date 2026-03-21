// Application configuration constants
export const APP_CONFIG = {
  // App metadata
  name: 'Preview.md',
  version: '1.0.0',
  description: 'A professional markdown preview editor with live editing, dark mode, and side-by-side view',
  
  // GitHub configuration
  github: {
    project: 'vikasdfghjl/previewdotmd',
    url: 'https://github.com/vikasdfghjl/previewdotmd',
    profile: 'https://github.com/vikasdfghjl',
  },
  
  // Feature flags
  features: {
    darkMode: true,
    exportOptions: true,
    syncScroll: false,
  },
  
  // Default settings
  defaults: {
    theme: 'system',
    editorWidth: '50%',
  },
};

// External links
export const EXTERNAL_LINKS = {
  github: APP_CONFIG.github.url,
  issues: `${APP_CONFIG.github.url}/issues`,
  contribute: `${APP_CONFIG.github.url}/blob/main/CONTRIBUTING.md`,
};