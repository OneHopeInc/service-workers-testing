import { initMinimap } from './minimap.js';
import { initPinning } from './pinning.js';
import { initReaderSettings } from './reader-settings.js';

export function initApp() {
  document.addEventListener('DOMContentLoaded', () => {
    initMinimap();
    initPinning();
    initReaderSettings();
  });
}

// For non-module usage
if (typeof window !== 'undefined') {
  window.initApp = initApp;
}
