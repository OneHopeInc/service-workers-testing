console.log('Test JS loaded and cached by service worker!');

document.addEventListener('DOMContentLoaded', function() {
  const heading = document.getElementById('heading');
  if (heading) {
    heading.style.color = '#e26a2a';
  }
}); 