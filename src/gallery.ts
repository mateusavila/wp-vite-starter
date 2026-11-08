export function gallery(): void {
  document.querySelectorAll<HTMLElement>("[data-gallery]").forEach(createGallery);
}

function createGallery(container: HTMLElement): void {
  const root = container.parentElement;
  const mobileLayout = container.dataset.mobileLayout ?? "carousel";
  const isGridMobile = () => {
    return (
      mobileLayout === "grid" &&
      window.matchMedia("(max-width: 599px)").matches
    );
  };

  if (!root) return;

  const galleryPrev = root.querySelector<HTMLButtonElement>("[data-gallery-back]");
  const galleryNext = root.querySelector<HTMLButtonElement>("[data-gallery-next]");

  if (!galleryPrev || !galleryNext) return;

  const items = Array.from(container.children) as HTMLElement[];

  if (!items.length) return;

  const galleryId = container.dataset.galleryId;
  const pagination = galleryId
    ? document.querySelector<HTMLElement>(`[data-gallery-parent="${galleryId}"]`)
    : null;

  let paginationPrev: HTMLButtonElement | null = null;
  let paginationNext: HTMLButtonElement | null = null;
  let dots: NodeListOf<HTMLButtonElement> | null = null;

  if (pagination) {
    paginationPrev = pagination.querySelector<HTMLButtonElement>("[data-gallery-back]");
    paginationNext = pagination.querySelector<HTMLButtonElement>("[data-gallery-next]");
    dots = pagination.querySelectorAll<HTMLButtonElement>("[data-gallery-index]");
  }

  const updateButtons = () => {
    if (isGridMobile()) {
      galleryPrev.classList.add("hidden");
      galleryNext.classList.add("hidden");

      if (pagination) {
        pagination.classList.add("hidden");
      }

      return;
    }

    galleryPrev.classList.remove("hidden");
    galleryNext.classList.remove("hidden");

    if (pagination) {
      pagination.classList.remove("hidden");
    }

    const maxScroll = container.scrollWidth - container.clientWidth;

    galleryPrev.classList.toggle("invisible", container.scrollLeft <= 2);
    galleryNext.classList.toggle(
      "invisible",
      container.scrollLeft >= maxScroll - 2
    );

    if (paginationPrev && paginationNext) {
      paginationPrev.disabled = container.scrollLeft <= 2;
      paginationNext.disabled = container.scrollLeft >= maxScroll - 2;
    }
  };

  const currentIndex = (): number => {
    if (isGridMobile()) return 0;
    const scrollLeft = container.scrollLeft;
    let closest = 0;
    let distance = Number.MAX_VALUE;

    items.forEach((item, index) => {
      const diff = Math.abs(item.offsetLeft - scrollLeft);
      if (diff < distance) {
        distance = diff;
        closest = index;
      }
    });

    return closest;
  };

  const goTo = (index: number) => {
    if (isGridMobile()) return;

    index = Math.max(0, Math.min(index, items.length - 1));

    container.scrollTo({
      left: items[index].offsetLeft,
      behavior: "smooth",
    });
  };

  const updatePagination = () => {
    if (isGridMobile()) return;
    if (!dots) return;
    const index = currentIndex();
    dots.forEach((dot, i) => {
      dot.toggleAttribute("data-active", i === index);
    });
  };

  galleryPrev.addEventListener("click", () => {
    goTo(currentIndex() - 1);
  });

  galleryNext.addEventListener("click", () => {
    goTo(currentIndex() + 1);
  });

  container.addEventListener("keydown", (event) => {
    if (isGridMobile()) return;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        goTo(currentIndex() - 1);
        break;
      case "ArrowRight":
        event.preventDefault();
        goTo(currentIndex() + 1);
        break;
      case "Home":
        event.preventDefault();
        goTo(0);
        break;
      case "End":
        event.preventDefault();
        goTo(items.length - 1);
        break;
    }
  });

  if (paginationPrev) {
    paginationPrev.addEventListener("click", () => {
      goTo(currentIndex() - 1);
    });
  }

  if (paginationNext) {
    paginationNext.addEventListener("click", () => {
      goTo(currentIndex() + 1);
    });
  }

  if (dots) {
    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = parseInt(dot.dataset.galleryIndex ?? "0", 10);
        if (!isNaN(index)) {
          goTo(index);
        }
      });
    });
  }

  let timeout: number;
  container.addEventListener("scroll", () => {
    if (isGridMobile()) return;
    updateButtons();
    updatePagination();
    window.clearTimeout(timeout);
    timeout = window.setTimeout(updateButtons, 120);
  });

  window.addEventListener("resize", () => {
    updateButtons();
    updatePagination();
  });

  updateButtons();
  updatePagination();
}
