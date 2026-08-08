// panelAccordion.js - Makes every .container-section--headed panel inside the
// left sidebar expandable/collapsible by clicking its header.

const PANEL_CLASS = 'container-section--headed';
const HEADER_CLASS = 'container-section-header';
const COLLAPSED_CLASS = 'is-collapsed';

export function setupPanelAccordions({
  documentObj = globalThis.document,
} = {}) {
  function initPanel(panel) {
    if (panel.dataset.accordionWired) return;
    panel.dataset.accordionWired = '1';

    const header = panel.querySelector(`:scope > .${HEADER_CLASS}`);
    if (!header) return;

    header.style.cursor = 'pointer';
    header.addEventListener('click', () => {
      panel.classList.toggle(COLLAPSED_CLASS);
    });
  }

  documentObj.querySelectorAll(`.left-accordion-section .${PANEL_CLASS}`).forEach(initPanel);
}
