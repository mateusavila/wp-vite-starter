import 'vite/modulepreload-polyfill';
import './style.css';
import { initAccordion } from './accordion';
import { searchFilter } from './searchFilter';

type LazyModule = [selector: string, load: () => Promise<unknown>];

const lazyModules: LazyModule[] = [
  ['[data-newsletter-form]', async () => (await import('./newsletter')).initNewsletter()],
  ['[data-modal]', async () => (await import('./modals')).initModals()],
  ['[data-email]', async () => (await import('./preventEmailSpaces')).preventEmailSpaces()],
  ['[data-gallery]', async () => (await import('./gallery')).gallery()],
  ['[data-open-gallery]', async () => (await import('./gallery-modal')).initGalleryModal()],
  ['[data-slider]', async () => (await import('./initSliders')).initSliders()],
];

function lazySmoothScroll(): void {
  if (!document.querySelector('[data-go-to], [data-go-to-dom]')) return;

  const load = () => {
    import('./initSmoothScroll')
      .then(({ initSmoothScroll }) => initSmoothScroll())
      .catch((error) => console.error('lazy module failed: smooth-scroll', error));
  };

  if (!document.querySelector('[data-blog-post]')) {
    load();
    return;
  }

  const desktop = window.matchMedia('(min-width: 1024px)');

  if (desktop.matches) {
    load();
    return;
  }

  const onDesktop = (event: MediaQueryListEvent) => {
    if (!event.matches) return;

    desktop.removeEventListener('change', onDesktop);
    load();
  };

  desktop.addEventListener('change', onDesktop);
}

function lazyScrollSpy(): void {
  if (document.querySelector('[data-no-scrollspy]') || !document.querySelector('[data-go-to]')) return;

  const desktop = window.matchMedia('(min-width: 1024px)');

  const load = () => {
    if (!desktop.matches) return;

    desktop.removeEventListener('change', load);
    import('./initScrollSpy')
      .then(({ initScrollSpy }) => initScrollSpy())
      .catch((error) => console.error('lazy module failed: scroll-spy', error));
  };

  if (desktop.matches) {
    load();
  } else {
    desktop.addEventListener('change', load);
  }
}

function init(): void {
  lazySmoothScroll();
  lazyScrollSpy();
  initAccordion();
  searchFilter();

  lazyModules.forEach(([selector, load]) => {
    if (document.querySelector(selector)) {
      load().catch((e) => console.error(`lazy module failed: ${selector}`, e));
    }
  });

}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
