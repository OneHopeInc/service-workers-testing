export function initPinning() {
  let pinnedEl = null;
  const pinnableSelector = 'main p, main h1, main h2, main h3, main h4, main h5, main h6, main blockquote, main li, main pre';
  const pinStorageKey = 'pinnedId';

  const scrollToPinned = () => {
    if (!pinnedEl) return;
    pinnedEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const toggleGoToPinButton = () => {
    const btn = document.getElementById('go-to-pin');
    if (!btn) return;
    if (!pinnedEl) {
      btn.style.display = 'none';
      return;
    }
    const rect = pinnedEl.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;
    btn.style.display = isVisible ? 'none' : 'block';
  };

  const showPinIcon = (el) => {
    const icon = document.createElement('div');
    icon.textContent = '📌';
    icon.className = 'pin-anim';
    el.appendChild(icon);
    setTimeout(() => {
      icon.classList.add('fade-out');
      setTimeout(() => icon.remove(), 500);
    }, 1000);
  };

  document.querySelectorAll(pinnableSelector).forEach((el, index) => {
    el.classList.add('pinnable');
    el.dataset.pinId = 'pin-' + index;
    el.addEventListener('click', () => {
      if (pinnedEl === el) {
        pinnedEl.classList.remove('pinned');
        pinnedEl = null;
        localStorage.removeItem(pinStorageKey);
      } else {
        if (pinnedEl) pinnedEl.classList.remove('pinned');
        pinnedEl = el;
        pinnedEl.classList.add('pinned');
        localStorage.setItem(pinStorageKey, el.dataset.pinId);
        showPinIcon(el);
      }
      toggleGoToPinButton();
    });
  });

  const savedPinId = localStorage.getItem(pinStorageKey);
  if (savedPinId) {
    const savedEl = document.querySelector(`[data-pin-id="${savedPinId}"]`);
    if (savedEl) {
      pinnedEl = savedEl;
      pinnedEl.classList.add('pinned');
      toggleGoToPinButton();
    }
  }

  const btn = document.getElementById('go-to-pin');
  if (btn) {
    btn.addEventListener('click', scrollToPinned);
  }

  window.addEventListener('scroll', () => {
    if (pinnedEl) toggleGoToPinButton();
  });
}
