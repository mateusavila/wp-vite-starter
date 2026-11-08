export function initAccordion(): void {
  const accordionBlocks = document.querySelectorAll('[data-accordion-block]');
  const groups: { [key: string]: { blocks: Element[]; keepOne: boolean } } = {};

  accordionBlocks.forEach(block => {
    const groupAttr = block.getAttribute('data-accordion-block');
    if (!groupAttr) return;

    const [groupId, modifier] = groupAttr.split(':');
    const keepOne = modifier === 'keep-one';

    if (!groups[groupId]) {
      groups[groupId] = { blocks: [], keepOne };
    }
    groups[groupId].blocks.push(block);
  });

  Object.values(groups).forEach(({ blocks, keepOne }) =>
    initAccordionGroup(blocks, keepOne)
  );
}

function openItem(contentWrapper: HTMLElement, header: HTMLElement, action: HTMLElement | null, icon: HTMLElement | null, image: HTMLElement | null, parent: HTMLElement | null): void {
  contentWrapper.style.maxHeight = 'none';
  const fullHeight = contentWrapper.scrollHeight + 'px';
  contentWrapper.style.maxHeight = '0';
  void contentWrapper.offsetHeight;
  contentWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease-out';
  contentWrapper.style.maxHeight = fullHeight;
  contentWrapper.style.opacity = '1';
  header.setAttribute('data-active', '');
  parent?.setAttribute('data-active', '');
  action?.setAttribute('data-active', '');
  icon?.setAttribute('data-active', '');
  if (image) image.setAttribute('data-active', '');
}

function closeItem(contentWrapper: HTMLElement, header: HTMLElement, action: HTMLElement | null, icon: HTMLElement | null, image: HTMLElement | null, parent: HTMLElement | null): void {
  contentWrapper.style.transition = 'max-height 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.25s ease-out';
  contentWrapper.style.maxHeight = '0';
  contentWrapper.style.opacity = '0';
  header.removeAttribute('data-active');
  parent?.removeAttribute('data-active');
  action?.removeAttribute('data-active');
  icon?.removeAttribute('data-active');
  parent?.removeAttribute('data-active');
  if (image) image.removeAttribute('data-active');
}

function initAccordionGroup(blocks: Element[], keepOne: boolean): void {
  blocks.forEach((block, index) => {
    const header = block.querySelector('[data-accordion]') as HTMLElement | null;
    const contentWrapper = block.querySelector('[data-accordion-content]') as HTMLElement | null;
    const image = block.querySelector('[data-accordion-image]') as HTMLElement | null;
    const parent = block.closest('[data-accordion-block]') as HTMLElement | null; // Corrigido aqui

    if (!header || !contentWrapper) return;

    if (keepOne && index === 0) {
      openItem(contentWrapper, header,
        header.querySelector('[data-accordion-action]'),
        header.querySelector('[data-accordion-icon]'),
        image,
        parent
      );
    } else {
      contentWrapper.style.maxHeight = '0';
      contentWrapper.style.opacity = '0';
    }

    header.addEventListener('click', () => {
      const isOpen = header.hasAttribute('data-active');
      const action = header.querySelector('[data-accordion-action]') as HTMLElement | null;
      const icon = header.querySelector('[data-accordion-icon]') as HTMLElement | null;

      if (keepOne && isOpen) return;

      if (!isOpen) {
        blocks.forEach(otherBlock => {
          if (otherBlock === block) return;
          const otherHeader = otherBlock.querySelector('[data-accordion]') as HTMLElement | null;
          const otherContent = otherBlock.querySelector('[data-accordion-content]') as HTMLElement | null;
          const otherImage = otherBlock.querySelector('[data-accordion-image]') as HTMLElement | null;
          const otherParent = otherBlock.closest('[data-accordion-block]') as HTMLElement | null;

          if (!otherHeader || !otherContent) return;
          closeItem(
            otherContent, otherHeader,
            otherHeader.querySelector('[data-accordion-action]'),
            otherHeader.querySelector('[data-accordion-icon]'),
            otherImage,
            otherParent
          );
        });
        openItem(contentWrapper, header, action, icon, image, parent);
      } else {
        closeItem(contentWrapper, header, action, icon, image, parent);
      }
    });
  });
}
