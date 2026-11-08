// slider.ts
export interface SliderOptions {
  timeout?: number;
}

export interface SliderController {
  next: () => void;
  prev: () => void;
  goTo: (index: number, smooth?: boolean) => void;
  destroy: () => void;
}

function generateId(): string {
  return `slider-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

export function createSlider(
  container: HTMLElement,
  options: SliderOptions = {}
): SliderController {
  const slides = Array.from(container.children) as HTMLElement[];
  if (slides.length === 0) {
    console.warn('[Slider] Container sem filhos.');
    return {
      next: () => {},
      prev: () => {},
      goTo: () => {},
      destroy: () => {},
    };
  }

  let currentIndex = 0;
  let autoplayInterval: number | undefined;
  let scrollTimeout: number | undefined;
  let isDestroyed = false;

  const id = container.id || container.getAttribute('data-slider-id') || generateId();
  if (!container.id) container.id = id;

  let dots: HTMLElement[] = [];
  let backButton: HTMLElement | undefined;
  let nextButton: HTMLElement | undefined;

  const updateDots = (): void => {
    const allDots = document.querySelectorAll(
      `[data-slider-parent="${id}"] [data-slider-index]`
    );
    allDots.forEach((dot) => {
      const index = parseInt(dot.getAttribute('data-slider-index') || '0', 10);
      if (index === currentIndex) {
        dot.setAttribute('data-active', '');
      } else {
        dot.removeAttribute('data-active');
      }
    });

    const legendContainers = document.querySelectorAll(
      `[data-slider-legend="${id}"]`
    );
    legendContainers.forEach((container) => {
      const items = container.querySelectorAll('[data-slider-index]');
      items.forEach((item, i) => {
        if (i === currentIndex) {
          item.setAttribute('data-active', '');
        } else {
          item.removeAttribute('data-active');
        }
      });
    });
  };

  const updateLegends = (): void => {
    const legendContainers = document.querySelectorAll(`[data-slider-legend="${id}"]`);
    legendContainers.forEach(container => {
      const legendItems = container.querySelectorAll('[data-slider-index]');
      legendItems.forEach((item, i) => {
        if (i === currentIndex) {
          item.setAttribute('data-active', '');
        } else {
          item.removeAttribute('data-active');
        }
      });
    });
  };

  const goTo = (index: number, smooth: boolean = true): void => {
    if (isDestroyed) return;
    if (index < 0 || index >= slides.length) return;

    currentIndex = index;
    const slide = slides[index];

    const left =
      slide.getBoundingClientRect().left -
      container.getBoundingClientRect().left +
      container.scrollLeft;

    container.scrollTo({
      left,
      behavior: smooth ? 'smooth' : 'auto',
    });

    updateDots();

    if (options.timeout && options.timeout > 0) {
      resetAutoplay();
    }
  };

  const next = (): void => {
    const nextIndex = Math.min(currentIndex + 1, slides.length - 1);
    goTo(nextIndex);
  };

  const prev = (): void => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    goTo(prevIndex);
  };

  const startAutoplay = (): void => {
    if (autoplayInterval) clearInterval(autoplayInterval);
    if (options.timeout && options.timeout > 0) {
      autoplayInterval = window.setInterval(() => {
        next();
      }, options.timeout);
    }
  };

  const resetAutoplay = (): void => {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      startAutoplay();
    }
  };

  const handleKeydown = (e: KeyboardEvent): void => {
    if (isDestroyed) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      next();
    }
  };

  const handleScroll = (): void => {
    if (isDestroyed) return;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = window.setTimeout(() => {
      updateIndexFromScroll();
      scrollTimeout = undefined;
    }, 100);
  };

  const updateIndexFromScroll = (): void => {
    const scrollLeft = container.scrollLeft;
    let closestIndex = 0;
    let minDist = Infinity;

    slides.forEach((slide, i) => {
      const left =
        slide.getBoundingClientRect().left -
        container.getBoundingClientRect().left +
        container.scrollLeft;

      const dist = Math.abs(left - scrollLeft);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    });

    if (closestIndex !== currentIndex) {
      currentIndex = closestIndex;
      updateDots();
      if (options.timeout && options.timeout > 0) {
        resetAutoplay();
      }
    }
  };

  const findControls = (): void => {
    const wrappers = document.querySelectorAll(`[data-slider-parent="${id}"]`);
    wrappers.forEach((wrapper) => {
      const back = wrapper.querySelector('[data-slider-back]') as HTMLElement | null;
      const nextBtn = wrapper.querySelector('[data-slider-next]') as HTMLElement | null;
      const dotElements = wrapper.querySelectorAll('[data-slider-index]');

      if (back) {
        backButton = back;
        back.addEventListener('click', prev);
      }
      if (nextBtn) {
        nextButton = nextBtn;
        nextBtn.addEventListener('click', next);
      }
      dotElements.forEach((dot) => {
        const dotEl = dot as HTMLElement;
        dots.push(dotEl);
        dotEl.addEventListener('click', () => {
          const index = parseInt(dotEl.getAttribute('data-slider-index') || '0', 10);
          goTo(index);
        });
      });
    });
  };

  const init = (): void => {
    container.setAttribute('tabindex', '0');
    container.addEventListener('keydown', handleKeydown);
    container.addEventListener('scroll', handleScroll);

    if (options.timeout && options.timeout > 0) {
      startAutoplay();
    }

    findControls();
    goTo(0, false);
    updateLegends();
  };

  const destroy = (): void => {
    if (isDestroyed) return;
    isDestroyed = true;
    if (autoplayInterval) clearInterval(autoplayInterval);
    if (scrollTimeout) clearTimeout(scrollTimeout);

    container.removeEventListener('keydown', handleKeydown);
    container.removeEventListener('scroll', handleScroll);
    if (backButton) backButton.removeEventListener('click', prev);
    if (nextButton) nextButton.removeEventListener('click', next);
    (container as any).__slider = undefined;
  };

  init();

  return {
    next,
    prev,
    goTo,
    destroy,
  };
}

/**
 * Inicializa todos os sliders encontrados no contexto.
 * Retorna uma lista de controladores.
 */
export function initSliders(
  context: HTMLElement | Document = document
): SliderController[] {
  const instances: SliderController[] = [];
  const elements = context.querySelectorAll('[data-slider]');

  elements.forEach((el) => {
    const container = el as HTMLElement;
    // Evita reinicializar o mesmo container
    if ((container as any).__slider) return;

    const options: SliderOptions = {};
    const timeoutAttr = container.getAttribute('data-slider-timeout');
    if (timeoutAttr) {
      const timeout = parseInt(timeoutAttr, 10);
      if (!isNaN(timeout) && timeout > 0) {
        options.timeout = timeout;
      }
    }

    const controller = createSlider(container, options);
    (container as any).__slider = controller;
    instances.push(controller);
  });

  return instances;
}
