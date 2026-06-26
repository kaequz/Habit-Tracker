(function () {
  let navLinks = [];
  let mainEl = null;
  let cardEl = null;

  function getPageFileFromPath(pathname = window.location.pathname) {
    const cleanPath = pathname.replace(/\\/g, '/').replace(/\/+/, '/').replace(/\/$/, '');
    const fileName = cleanPath.split('/').pop() || 'index.html';
    return fileName === '' ? 'index.html' : fileName;
  }

  function setActiveLink(pageFile) {
    navLinks.forEach((link) => {
      const linkFile = (link.getAttribute('href') || '').split('/').pop() || 'index.html';
      const isActive = linkFile === pageFile || (pageFile === 'index.html' && linkFile === 'index.html');
      link.classList.toggle('active', isActive);
    });
  }

  function clearInjectedScripts() {
    document.querySelectorAll('script[data-router-script]').forEach((script) => script.remove());
  }

  function runPageScripts(scriptContents) {
    clearInjectedScripts();
    scriptContents.forEach((scriptText) => {
      const scriptEl = document.createElement('script');
      scriptEl.setAttribute('data-router-script', 'true');
      scriptEl.textContent = scriptText;
      document.body.appendChild(scriptEl);
    });
  }

  async function navigateTo(pageFile) {
    if (!mainEl) return;

    const targetUrl = pageFile === 'index.html' ? 'index.html' : pageFile;
    const response = await fetch(targetUrl);
    if (!response.ok) return;

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const targetMain = doc.querySelector('main.app-shell');
    const targetCard = targetMain ? targetMain.querySelector('.card') : null;
    const scripts = Array.from(doc.querySelectorAll('script')).filter((script) => !script.src).map((script) => script.textContent);

    if (targetCard && cardEl) {
      cardEl.className = targetCard.className;
      cardEl.innerHTML = targetCard.innerHTML;
    }

    document.title = doc.title || 'Habit Tracker';
    runPageScripts(scripts);
    setActiveLink(pageFile);
    history.pushState({ page: pageFile }, '', targetUrl);
    window.scrollTo(0, 0);
  }

  function bindEvents() {
    document.addEventListener('click', (event) => {
      const link = event.target.closest('.bottom-nav .nav-item');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const targetFile = href.split('/').pop() || 'index.html';
      const currentFile = getPageFileFromPath(window.location.pathname);
      if (targetFile === currentFile) return;

      event.preventDefault();
      navigateTo(targetFile);
    });

    window.addEventListener('popstate', () => {
      const pageFile = getPageFileFromPath(window.location.pathname);
      setActiveLink(pageFile);
    });
  }

  function init() {
    navLinks = Array.from(document.querySelectorAll('.bottom-nav .nav-item'));
    mainEl = document.querySelector('main.app-shell');
    cardEl = document.querySelector('.card');

    const pageFile = getPageFileFromPath(window.location.pathname);
    setActiveLink(pageFile);
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
