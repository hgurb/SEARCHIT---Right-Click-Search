// Apply before the stylesheet loads to avoid flashing the wrong theme.
(() => {
  let theme = 'dark';
  try {
    if (localStorage.getItem('searchit-theme') === 'light') theme = 'light';
  } catch { /* Keep dark mode when preference storage is unavailable. */ }
  document.documentElement.dataset.theme = theme;

  document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#theme-toggle');
    function updateButton() {
      const label = theme === 'dark' ? 'Light mode' : 'Dark mode';
      button.setAttribute('aria-label', `Switch to ${label.toLowerCase()}`);
      button.setAttribute('title', `Switch to ${label.toLowerCase()}`);
    }
    updateButton();
    button.addEventListener('click', () => {
      theme = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = theme;
      updateButton();
      try { localStorage.setItem('searchit-theme', theme); }
      catch { /* Switching still works for the current page. */ }
    });
  });
})();
