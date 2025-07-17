const carousel = document.getElementById('carousel');

  function updateScales() {
    const rect = carousel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    for (const item of carousel.children) {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;

      const distance = Math.abs(centerX - itemCenter);
      const maxDistance = rect.width / 2;
      const factor = Math.max(0.5, 1 - distance / maxDistance);

      item.style.setProperty('--shrink-factor', factor.toFixed(2));
    }
  }

  let scrollTimeout;
  function onScrollStop() {
    const rect = carousel.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    let closest = null;
    let closestDistance = Infinity;

    for (const item of carousel.children) {
      const itemRect = item.getBoundingClientRect();
      const itemCenter = itemRect.left + itemRect.width / 2;
      const distance = Math.abs(centerX - itemCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closest = item;
      }
    }

    if (closest) {
      const itemCenter = closest.offsetLeft + closest.offsetWidth / 2;
      const targetScrollLeft = itemCenter - carousel.clientWidth / 2;
      carousel.scrollTo({ left: targetScrollLeft, behavior: 'smooth' });
    }
  }

  function onScroll() {
    updateScales();
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(onScrollStop, 100); // Wait until scroll ends
  }

  carousel.addEventListener('scroll', onScroll);
  window.addEventListener('resize', updateScales);

  // Initial setup
  updateScales();