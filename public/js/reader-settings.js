// reader-settings.js
// Handles font size, line height, column width, and presets for the reader UI

export function initReaderSettings() {
  const root = document.documentElement;
  const fontSlider = document.getElementById('font-slider');
  const lineSlider = document.getElementById('line-slider');
  const widthSlider = document.getElementById('width-slider');
  const settingsToggle = document.getElementById('settings-toggle');
  const settingsPanel = document.getElementById('reader-settings');
  const main = document.querySelector('main');

  if (!fontSlider || !lineSlider || !widthSlider || !settingsToggle || !settingsPanel || !main) return;

  // Animate transitions
  document.body.style.transition = 'font-size 0.2s ease, line-height 0.2s ease';
  main.style.transition = 'max-width 0.2s ease';

  // Load saved preferences
  const savedFontSize = localStorage.getItem('readerFontSize');
  const savedLineHeight = localStorage.getItem('readerLineHeight');
  const savedWidth = localStorage.getItem('readerColumnWidth');

  if (savedFontSize) {
    document.body.style.fontSize = savedFontSize;
    fontSlider.value = parseInt(savedFontSize);
  }
  if (savedLineHeight) {
    document.body.style.lineHeight = savedLineHeight;
    lineSlider.value = parseFloat(savedLineHeight);
  }
  if (savedWidth) {
    main.style.maxWidth = savedWidth + 'ch';
    widthSlider.value = parseInt(savedWidth);
  }

  // Slider event listeners
  fontSlider.addEventListener('input', () => {
    const size = fontSlider.value + 'px';
    document.body.style.fontSize = size;
    localStorage.setItem('readerFontSize', size);
  });

  lineSlider.addEventListener('input', () => {
    const height = lineSlider.value;
    document.body.style.lineHeight = height;
    localStorage.setItem('readerLineHeight', height);
  });

  widthSlider.addEventListener('input', () => {
    const width = widthSlider.value + 'ch';
    main.style.maxWidth = width;
    localStorage.setItem('readerColumnWidth', widthSlider.value);
  });

  // Toggle visibility of the settings panel
  settingsToggle.addEventListener('click', () => {
    settingsPanel.style.display = settingsPanel.style.display === 'flex' ? 'none' : 'flex';
  });

  // Handle preset buttons
  document.querySelectorAll('#presets button').forEach(btn => {
    btn.addEventListener('click', () => {
      const font = btn.getAttribute('data-font');
      const line = btn.getAttribute('data-line');
      const width = btn.getAttribute('data-width');
      // Apply settings
      document.body.style.fontSize = font + 'px';
      document.body.style.lineHeight = line;
      main.style.maxWidth = width + 'ch';
      // Update sliders
      fontSlider.value = font;
      lineSlider.value = line;
      widthSlider.value = width;
      // Save preferences
      localStorage.setItem('readerFontSize', font + 'px');
      localStorage.setItem('readerLineHeight', line);
      localStorage.setItem('readerColumnWidth', width);
    });
  });
}
