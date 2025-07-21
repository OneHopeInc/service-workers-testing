function showView(n) {
	for (let i = 0; i <= 10; i++) {
		document.getElementById('view'+i).classList.remove('active');
	}
	document.getElementById('view'+n).classList.add('active');
	
	// Save current view to localStorage
	localStorage.setItem('currentView', n);
	
	// Update URL with anchor tag for browser back button support
	const viewName = n === 0 ? 'home' : `lesson-${n}`;
	const newUrl = `${window.location.pathname}#${viewName}`;
	history.pushState({ view: n }, '', newUrl);
	
	// Clear pin when switching views
	clearExistingPin();
	pinnedSelector = null;
	localStorage.removeItem('pinnedSelector');
	showPinButton(false);
	
	// Update navigation pill
	updateNavigationPill(n);
}

// Handle browser back/forward button
window.addEventListener('popstate', function(event) {
	if (event.state && event.state.view !== undefined) {
		// Navigate to the view from browser history
		const viewNumber = event.state.view;
		for (let i = 0; i <= 10; i++) {
			document.getElementById('view'+i).classList.remove('active');
		}
		document.getElementById('view'+viewNumber).classList.add('active');
		
		// Update localStorage
		localStorage.setItem('currentView', viewNumber);
		
		// Clear pin when switching views
		clearExistingPin();
		pinnedSelector = null;
		localStorage.removeItem('pinnedSelector');
		showPinButton(false);
		
		// Update navigation pill
		updateNavigationPill(viewNumber);
	}
});

// Handle direct URL access with anchor tags
function handleInitialNavigation() {
	const hash = window.location.hash;
	let viewNumber = 0;
	
	if (hash) {
		if (hash === '#home') {
			viewNumber = 0;
		} else if (hash.startsWith('#lesson-')) {
			const lessonNum = parseInt(hash.replace('#lesson-', ''));
			if (lessonNum >= 1 && lessonNum <= 10) {
				viewNumber = lessonNum;
			}
		}
	} else {
		// Fall back to localStorage if no hash
		const savedView = localStorage.getItem('currentView');
		if (savedView !== null) {
			viewNumber = parseInt(savedView);
		}
	}
	
	// Show the appropriate view
	for (let i = 0; i <= 10; i++) {
		document.getElementById('view'+i).classList.remove('active');
	}
	document.getElementById('view'+viewNumber).classList.add('active');
	
	// Update localStorage
	localStorage.setItem('currentView', viewNumber);
	
	// Update navigation pill
	updateNavigationPill(viewNumber);
	
	// Update history state without triggering popstate
	history.replaceState({ view: viewNumber }, '', window.location.href);
}

// Navigate to previous or next lesson
function navigateLesson(direction) {
	const currentView = parseInt(localStorage.getItem('currentView') || '0');
	const newView = currentView + direction;
	
	// Only allow navigation between lesson views (1-10), not to/from main menu (0)
	if (newView >= 1 && newView <= 10) {
		showView(newView);
	}
}

// Track scroll direction and show/hide nav pill
let lastScrollY = window.scrollY;
let scrollTimeout = null;

function handleScroll() {
	const pill = document.getElementById('lesson-nav-pill');
	if (!pill || pill.style.display === 'none') return;

	const currentScrollY = window.scrollY;
	const scrollingUp = currentScrollY < lastScrollY;
	const atTop = currentScrollY <= 0;

	// Check if at bottom of page
	const viewportHeight = window.innerHeight;
	const docHeight = document.documentElement.scrollHeight;
	const atBottom = currentScrollY + viewportHeight >= docHeight - 10;

	if (atBottom) {
		pill.classList.add('show-at-bottom');
		pill.classList.remove('hide-by-scroll'); // Always show at bottom
	} else {
		pill.classList.remove('show-at-bottom');
		if (scrollingUp || atTop) {
			pill.classList.remove('hide-by-scroll');
		} else {
			pill.classList.add('hide-by-scroll');
		}
	}
	lastScrollY = currentScrollY;
}

window.addEventListener('scroll', handleScroll, { passive: true });

// Update the navigation pill display
function updateNavigationPill(viewNumber) {
	const lessonNumber = document.querySelector('.lesson-number');
	const prevButton = document.querySelector('.nav-prev');
	const nextButton = document.querySelector('.nav-next');
	const pill = document.getElementById('lesson-nav-pill');

	if (viewNumber === 0) {
		// Hide pill on main menu
		pill.style.display = 'none';
		return;
	} else {
		// Show pill on lesson views
		pill.style.display = 'flex';
	}

	// Update lesson number
	lessonNumber.textContent = `Lesson ${viewNumber}`;

	// Update button states
	prevButton.disabled = viewNumber <= 1;
	nextButton.disabled = viewNumber >= 10;

	// Always show pill after view change
	pill.classList.remove('hide-by-scroll');
	lastScrollY = window.scrollY;
}

// Load the saved view on page load
window.addEventListener('load', function() {
	// Check for anchor tag in URL first, then fall back to localStorage
	handleInitialNavigation();
});

if ('serviceWorker' in navigator) {
	window.addEventListener('load', function() {
		navigator.serviceWorker.register('/service-worker.js')
			.then(function(registration) {
				console.log('ServiceWorker registration successful with scope: ', registration.scope);
			}, function(err) {
				console.log('ServiceWorker registration failed: ', err);
			});
	});
} 

// Settings Drawer Logic
function toggleSettingsDrawer() {
	const drawer = document.getElementById('settings-drawer');
	drawer.classList.toggle('open');
	if (drawer.classList.contains('open')) {
		drawer.focus();
	}
}

document.addEventListener('mousedown', function(e) {
	const drawer = document.getElementById('settings-drawer');
	const burger = document.getElementById('burger-menu-btn');
	if (!drawer.contains(e.target) && e.target !== burger && drawer.classList.contains('open')) {
		drawer.classList.remove('open');
	}
});

document.addEventListener('keydown', function(e) {
	const drawer = document.getElementById('settings-drawer');
	if (e.key === 'Escape' && drawer.classList.contains('open')) {
		drawer.classList.remove('open');
	}
});

// Text size state and logic
const TEXT_SIZES = ['small', 'medium', 'large'];
const TEXT_SIZE_LABELS = { small: 'Small', medium: 'Medium', large: 'Large' };
const TEXT_SIZE_VALUES = { small: '15px', medium: '17px', large: '20px' };
let currentTextSize = 'medium';

function changeTextSize(direction) {
	let idx = TEXT_SIZES.indexOf(currentTextSize);
	idx = Math.max(0, Math.min(TEXT_SIZES.length - 1, idx + direction));
	currentTextSize = TEXT_SIZES[idx];
	updateTextSizeUI();
	applySettings();
}

function updateTextSizeUI() {
	// Optionally disable buttons at min/max
	document.querySelectorAll('.text-size-btn')[0].disabled = currentTextSize === 'small';
	document.querySelectorAll('.text-size-btn')[1].disabled = currentTextSize === 'large';
}

const LINE_HEIGHTS = ['tight', 'normal', 'loose'];
const LINE_HEIGHT_VALUES = { tight: '1.3', normal: '1.6', loose: '2' };
let currentLineHeight = 'normal';

function cycleLineHeight() {
  let idx = LINE_HEIGHTS.indexOf(currentLineHeight);
  idx = (idx + 1) % LINE_HEIGHTS.length;
  currentLineHeight = LINE_HEIGHTS[idx];
  applySettings();
}

function applySettings() {
  // Text size
  document.body.style.fontSize = TEXT_SIZE_VALUES[currentTextSize];
  // Line height
  document.body.style.lineHeight = LINE_HEIGHT_VALUES[currentLineHeight];
  // Save to localStorage
  localStorage.setItem('settings', JSON.stringify({ textSize: currentTextSize, lineHeight: currentLineHeight }));
}

window.addEventListener('DOMContentLoaded', function() {
  const settings = JSON.parse(localStorage.getItem('settings') || '{}');
  if (settings.textSize && TEXT_SIZES.includes(settings.textSize)) currentTextSize = settings.textSize;
  if (settings.lineHeight && LINE_HEIGHTS.includes(settings.lineHeight)) currentLineHeight = settings.lineHeight;
  updateTextSizeUI();
  applySettings();
});

// Prevent pinch zoom
// and double-tap zoom on mobile
document.addEventListener('touchmove', function(event) {
  if (event.scale !== 1) {
    event.preventDefault();
  }
}, { passive: false });

let lastTouchEnd = 0;
document.addEventListener('touchend', function(event) {
  const now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false); 

// --- Pinning Functionality ---
let pinnedSelector = null;
let pinHighlightTimeout = null;

function getPinButton() {
  return document.getElementById('pill-pin-btn');
}

function clearExistingPin() {
  document.querySelectorAll('.pinned-emoji').forEach(e => e.remove());
  document.querySelectorAll('.pinned-highlight').forEach(e => e.classList.remove('pinned-highlight'));
}

function addPinToElement(el) {
  clearExistingPin();
  const pin = document.createElement('span');
  pin.textContent = '📌';
  pin.className = 'pinned-emoji';
  pin.style.marginLeft = '0.5em';
  el.appendChild(pin);
  let selector = el.getAttribute('data-pin-id');
  if (!selector) {
    selector = 'pin-' + Date.now();
    el.setAttribute('data-pin-id', selector);
  }
  pinnedSelector = selector;
  localStorage.setItem('pinnedSelector', selector);
  showPinButton(true);
}

// Pin button INSIDE the pill, as the last child
function ensurePinButtonInPill() {
  let pinBtn = document.getElementById('pill-pin-btn');
  if (!pinBtn) {
    pinBtn = document.createElement('button');
    pinBtn.id = 'pill-pin-btn';
    pinBtn.type = 'button';
    pinBtn.className = 'pill-pin-btn';
    pinBtn.style.display = 'none';
    pinBtn.setAttribute('aria-label', 'Go to pinned spot');
    pinBtn.innerText = '📌';
    pinBtn.onclick = scrollToPin;
  }
  // Place as last child of the pill
  const pill = document.getElementById('lesson-nav-pill');
  if (pill && pill.lastElementChild !== pinBtn) {
    pill.appendChild(pinBtn);
  }
}

// Update pin button show/hide to match pill
function showPinButton(show) {
  const btn = getPinButton();
  const pill = document.getElementById('lesson-nav-pill');
  if (btn) {
    btn.style.display = show && pill && pill.style.display !== 'none' ? 'flex' : 'none';
    // Match scroll-based hide/show
    if (pill && pill.classList.contains('hide-by-scroll')) {
      btn.classList.add('hide-by-scroll');
    } else {
      btn.classList.remove('hide-by-scroll');
    }
    if (pill && pill.classList.contains('show-at-bottom')) {
      btn.classList.add('show-at-bottom');
    } else {
      btn.classList.remove('show-at-bottom');
    }
  }
}

// Patch scroll handler to also update pin button
const origHandleScroll = handleScroll;
function handleScrollWithPin() {
  origHandleScroll();
  showPinButton(!!pinnedSelector);
}
window.removeEventListener('scroll', handleScroll);
window.addEventListener('scroll', handleScrollWithPin, { passive: true });

function handlePinClick(e) {
  const lessonView = e.target.closest('.view');
  if (!lessonView || lessonView.id === 'view0') return;
  if (!['H1','H2','H3','P'].includes(e.target.tagName)) return;
  const selector = e.target.getAttribute('data-pin-id');
  if (selector && selector === pinnedSelector) {
    // Unpin if clicking the same element
    clearExistingPin();
    pinnedSelector = null;
    localStorage.removeItem('pinnedSelector');
    showPinButton(false);
    return;
  }
  addPinToElement(e.target);
}
document.removeEventListener('click', handlePinClick); // Remove previous if any
document.addEventListener('click', handlePinClick);

function scrollToPin() {
  if (!pinnedSelector) return;
  const el = document.querySelector('[data-pin-id="' + pinnedSelector + '"]');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('pinned-highlight');
    if (pinHighlightTimeout) clearTimeout(pinHighlightTimeout);
    pinHighlightTimeout = setTimeout(() => {
      el.classList.remove('pinned-highlight');
    }, 1500);
  }
}

window.addEventListener('DOMContentLoaded', function() {
  ensurePinButtonInPill();
  // Restore pin if present
  const stored = localStorage.getItem('pinnedSelector');
  if (stored) {
    const el = document.querySelector('[data-pin-id="' + stored + '"]');
    if (el) {
      addPinToElement(el);
    } else {
      showPinButton(false);
    }
  } else {
    showPinButton(false);
  }
}); 