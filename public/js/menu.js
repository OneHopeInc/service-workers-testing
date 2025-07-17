document.querySelector('.menu-toggle')?.addEventListener('click', () => {
    document.querySelector('.menu')?.classList.toggle('show');
  });
  
  document.querySelectorAll('.dropdown').forEach(drop => {
    drop.addEventListener('click', () => drop.classList.toggle('open'));
  });