export function scrollToElement(targetId: string, offset: number = 0): void {
  const target = document.getElementById(targetId);
  if (!target) {
    console.warn(`[scrollToElement] Elemento com id "${targetId}" não encontrado.`);
    return;
  }

  const rect = target.getBoundingClientRect();
  const absoluteTop = rect.top + window.pageYOffset;
  const targetPosition = absoluteTop - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

export function scrollToH2ByText(text: string, offset: number = 0): void {
  const normalizeText = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,;:!?()'"]/g, '')
      .replace(/\s+/g, ' ')
      .replace(/^\d+\.\s*/, '')
      .trim();
  };
  const normalizedTarget = normalizeText(text);
  const h2Elements = document.querySelectorAll('.terms-text h2, .privacy-text h2');

  let targetElement: HTMLElement | null = null;
  let bestMatch: { element: HTMLElement; score: number } | null = null;

  for (const h2 of h2Elements) {
    const h2Text = h2.textContent?.trim() || '';
    const normalizedH2 = normalizeText(h2Text);

    if (normalizedH2 === normalizedTarget) {
      targetElement = h2 as HTMLElement;
      break;
    }

    if (normalizedH2.includes(normalizedTarget) || normalizedTarget.includes(normalizedH2)) {
      const matchLength = Math.min(normalizedH2.length, normalizedTarget.length);
      const score = matchLength / Math.max(normalizedH2.length, normalizedTarget.length);

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          element: h2 as HTMLElement,
          score: score
        };
      }
    }
  }

  if (!targetElement && bestMatch && bestMatch.score > 0.7) {
    targetElement = bestMatch.element;
  }

  if (!targetElement) {
    console.warn(`[scrollToH2ByText] Nenhum h2 encontrado para: "${text}"`);
    return;
  }

  const rect = targetElement.getBoundingClientRect();
  const absoluteTop = rect.top + window.pageYOffset;
  const targetPosition = absoluteTop - offset;

  window.scrollTo({
    top: targetPosition,
    behavior: 'smooth',
  });
}

export function initSmoothScroll(): void {
  const elementsWithId = document.querySelectorAll<HTMLElement>('[data-go-to]');
  elementsWithId.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();

      const targetId = el.getAttribute('data-go-to');
      if (!targetId) {
        console.warn('[initSmoothScroll] Elemento com data-go-to vazio.');
        return;
      }

      const offsetAttr = el.getAttribute('data-go-to-position');
      let offset = 0;
      if (offsetAttr !== null) {
        const parsed = parseInt(offsetAttr, 10);
        if (!isNaN(parsed)) {
          offset = parsed;
        } else {
          console.warn(
            `[initSmoothScroll] data-go-to-position deve ser um número, recebido: "${offsetAttr}"`
          );
        }
      }

      scrollToElement(targetId, offset);
    });
  });

  const elementsWithText = document.querySelectorAll<HTMLElement>('[data-go-to-dom]');
  elementsWithText.forEach((el) => {
    el.addEventListener('click', (event) => {
      event.preventDefault();

      const targetText = el.getAttribute('data-go-to-dom');
      if (!targetText) {
        console.warn('[initSmoothScroll] Elemento com data-go-to-dom vazio.');
        return;
      }

      const offsetAttr = el.getAttribute('data-go-to-position');
      let offset = 0;
      if (offsetAttr !== null) {
        const parsed = parseInt(offsetAttr, 10);
        if (!isNaN(parsed)) {
          offset = parsed;
        } else {
          console.warn(
            `[initSmoothScroll] data-go-to-position deve ser um número, recebido: "${offsetAttr}"`
          );
        }
      }

      scrollToH2ByText(targetText, offset);
    });
  });
}
