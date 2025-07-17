export function initMinimap() {
  const minimap = document.getElementById('minimap');
  const article = document.getElementById('article');
  const navbar = document.getElementById('navbar');
  if (!minimap || !article) return;

  const headings = article.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const headingMap = [];
  let isOpen = false;

  headings.forEach((heading, i) => {
    const tag = heading.tagName.toLowerCase();
    if (!heading.id) heading.id = `heading-${i}`;

    const item = document.createElement('div');
    item.classList.add('minimap-item', tag);
    item.textContent = heading.textContent;
    item.dataset.target = heading.id;

    item.addEventListener('click', () => {
      document.getElementById(heading.id).scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'end' });
      closeMinimap();
    });

    minimap.appendChild(item);
    headingMap.push({ heading, item });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.id;
      const minimapItem = headingMap.find(h => h.heading.id === id)?.item;

      if (minimapItem && entry.isIntersecting && entry.intersectionRatio >= 0.6) {
        headingMap.forEach(h => h.item.classList.remove('active'));
        minimapItem.classList.add('active');
      }
    });
  }, {
    root: null,
    rootMargin: '0px 0px -60% 0px',
    threshold: [0.5, 0.75, 1.0]
  });

  headings.forEach(h => observer.observe(h));

  let startX = 0;
  let startY = 0;
  let triggered = false;

  article.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    triggered = false;
  });

  article.addEventListener('touchmove', (e) => {
    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;

    if (deltaX > 80 && Math.abs(deltaX) > Math.abs(deltaY) && !triggered && !isOpen) {
      triggered = true;
      openMinimap();
    }
  });

  function openMinimap() {
    minimap.classList.add('open');
    article.classList.add('dimmed');
    navbar && navbar.classList.add('dimmed');
    isOpen = true;
  }

  function closeMinimap() {
    minimap.classList.remove('open');
    article.classList.remove('dimmed');
    navbar && navbar.classList.remove('dimmed');
    isOpen = false;
  }

  document.addEventListener('touchstart', (e) => {
    if (isOpen && !minimap.contains(e.target)) {
      closeMinimap();
    }
  });
}
