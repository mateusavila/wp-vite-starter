// assets/js/gallery-modal.ts

interface GalleryItem {
  type: 'image' | 'video';
  src: string;
  alt: string;
  videoId?: string;
}

export function initGalleryModal() {
  const dialog = document.getElementById('gallery-modal') as HTMLDialogElement;
  if (!dialog) return;
  const scrollContainer = dialog.querySelector('[data-scroll-container]') as HTMLElement;
  if (!scrollContainer) return;

  let currentItems: GalleryItem[] = [];
  let currentIndex = 0;

  function bindTriggers() {
    document.querySelectorAll('[data-open-gallery]').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const galleryId = (trigger as HTMLElement).dataset.openGallery;
        const startIndex = parseInt((trigger as HTMLElement).dataset.galleryIndex || '0', 10);
        if (galleryId) {
          open(galleryId, startIndex);
        }
      });
    });
  }

  function bindKeyboard() {
    document.addEventListener('keydown', (e) => {
      if (!dialog.open) return;
      if (e.key === 'Escape') {
        close();
      } else if (e.key === 'ArrowRight') {
        navigate('next');
      } else if (e.key === 'ArrowLeft') {
        navigate('prev');
      }
    });
  }

  function bindDialogEvents() {
    dialog.querySelector('[data-close]')?.addEventListener('click', () => close());
    dialog.querySelector('[data-prev]')?.addEventListener('click', () => navigate('prev'));
    dialog.querySelector('[data-next]')?.addEventListener('click', () => navigate('next'));
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        close();
      }
    });
  }

  function open(galleryId: string, startIndex: number = 0) {
    const triggers = document.querySelectorAll<HTMLElement>(
      `[data-open-gallery="${galleryId}"]`
    );
    if (triggers.length === 0) return;

    currentItems = Array.from(triggers).map((trigger) => {
      const img = trigger.querySelector('img');
      const type = (trigger.dataset.galleryType as 'image' | 'video') || 'image';
      return {
        type,
        src: img?.getAttribute('src') || '',
        alt: img?.getAttribute('alt') || '',
        videoId: trigger.dataset.videoId,
      };
    });

    currentIndex = startIndex;
    renderItems();
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    updateArrowsState();
    activateSlide(currentIndex);
  }

  function close() {
    dialog.close();
    document.body.style.overflow = '';
    scrollContainer.innerHTML = '';
  }

  function renderItems() {
    scrollContainer.innerHTML = currentItems
      .map((item, index) => {
        if (item.type === 'video') {
          return `
            <div class="w-full shrink-0 snap-center flex items-center justify-center px-4" data-gallery-modal-index="${index}" data-gallery-modal-type="video" data-video-id="${item.videoId}">
              <div class="relative w-full aspect-video max-h-full" data-video-slot>
                <img
                  src="${item.src}"
                  alt="${item.alt}"
                  class="w-full h-full object-contain select-none"
                  draggable="false"
                >
              </div>
            </div>
          `;
        }
        return `
          <div class="w-full shrink-0 snap-center flex items-center justify-center px-4" data-gallery-modal-index="${index}" data-gallery-modal-type="image">
            <img
              src="${item.src}"
              alt="${item.alt}"
              class="max-h-full max-w-full object-contain select-none"
              draggable="false"
            >
          </div>
        `;
      })
      .join('');

    requestAnimationFrame(() => {
      scrollContainer.scrollLeft = scrollContainer.clientWidth * currentIndex;
    });
  }

  // Carrega o iframe do YouTube só pro slide ativo; descarrega os demais (pausa o vídeo).
  function activateSlide(index: number) {
    const slides = scrollContainer.querySelectorAll<HTMLElement>('[data-gallery-modal-index]');
    slides.forEach((slide) => {
      const slideIndex = parseInt(slide.dataset.galleryModalIndex || '-1', 10);
      const isVideo = slide.dataset.galleryModalType === 'video';
      if (!isVideo) return;

      const slot = slide.querySelector('[data-video-slot]') as HTMLElement;
      if (!slot) return;

      if (slideIndex === index) {
        const videoId = slide.dataset.videoId;
        if (videoId && !slot.querySelector('iframe')) {
          slot.innerHTML = `
            <iframe
              src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
              class="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              frameborder="0"
            ></iframe>
          `;
        }
      } else if (slot.querySelector('iframe')) {
        // remove o iframe pra parar o vídeo, volta a mostrar a thumb
        const item = currentItems[slideIndex];
        slot.innerHTML = item
          ? `<img src="${item.src}" alt="${item.alt}" class="w-full h-full object-contain select-none" draggable="false">`
          : '';
      }
    });
  }

  function navigate(direction: 'next' | 'prev') {
    const scrollAmount = scrollContainer.clientWidth;
    scrollContainer.scrollBy({
      left: direction === 'next' ? scrollAmount : -scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(() => {
      currentIndex = Math.round(scrollContainer.scrollLeft / scrollContainer.clientWidth);
      updateArrowsState();
      activateSlide(currentIndex);
    }, 300);
  }

  function updateArrowsState() {
    const prevBtn = dialog.querySelector('[data-prev]') as HTMLButtonElement;
    const nextBtn = dialog.querySelector('[data-next]') as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex === currentItems.length - 1;
  }

  bindTriggers();
  bindKeyboard();
  bindDialogEvents();
}
