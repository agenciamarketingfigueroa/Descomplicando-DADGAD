const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

menuButton?.addEventListener('click', () => {
  const open = menu?.classList.toggle('is-open') ?? false;
  menuButton.setAttribute('aria-expanded', String(open));
});

menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('is-open');
  menuButton?.setAttribute('aria-expanded', 'false');
}));

document.querySelectorAll('[data-event]').forEach((element) => {
  element.addEventListener('click', () => {
    const detail = { event: element.dataset.event, label: element.dataset.label || element.textContent.trim() };
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
  });
});

document.querySelectorAll('[data-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });
