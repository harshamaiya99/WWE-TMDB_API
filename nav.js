// Shared navigation behavior: theme toggle, install button wiring, and persistence
(function(){
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const installBtn = document.getElementById('pwaInstallBtn');
  const showSelect = document.getElementById('showSelect');
  const yearSelect = document.getElementById('yearSelect');

  // Restore theme
  try {
    if (localStorage.getItem('theme') === 'light') {
      document.body.classList.add('light-theme');
      if (themeIcon) themeIcon.textContent = 'light_mode';
    } else {
      if (themeIcon) themeIcon.textContent = 'dark_mode';
    }
  } catch(e){ /* ignore storage issues */ }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch(e){}
      if (themeIcon) themeIcon.textContent = isLight ? 'light_mode' : 'dark_mode';
    });
  }

  // Sync selects with localStorage so pages stay consistent
  if (showSelect) {
    // initialize from storage if set
    const persistedShow = localStorage.getItem('wwe_show');
    if (persistedShow) showSelect.value = persistedShow;
    showSelect.addEventListener('change', () => {
      try { localStorage.setItem('wwe_show', showSelect.value); } catch(e){}
    });
  }
  if (yearSelect) {
    const persistedYear = localStorage.getItem('wwe_year');
    if (persistedYear) yearSelect.value = persistedYear;
    yearSelect.addEventListener('change', () => {
      try { localStorage.setItem('wwe_year', yearSelect.value); } catch(e){}
    });
  }

  // Stay in sync across tabs/pages (UI update only)
  window.addEventListener('storage', (e) => {
    if (e.key === 'wwe_show' && showSelect) showSelect.value = e.newValue;
    if (e.key === 'wwe_year' && yearSelect) yearSelect.value = e.newValue;
    if (e.key === 'theme') {
      if (e.newValue === 'light') document.body.classList.add('light-theme');
      else document.body.classList.remove('light-theme');
      if (themeIcon) themeIcon.textContent = e.newValue === 'light' ? 'light_mode' : 'dark_mode';
    }
  });

  // install button wiring left as-is: pages can call registerPrompt handler to enable
})();
