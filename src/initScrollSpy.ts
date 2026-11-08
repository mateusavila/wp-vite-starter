export function initScrollSpy(): void {
  if (document.querySelector('[data-no-scrollspy]')) return;

  const tocLinks = document.querySelectorAll<HTMLElement>('[data-go-to]');
  if (!tocLinks.length) return;

  const linkMap = new Map<string, HTMLElement>();
  tocLinks.forEach((link) => {
    const id = link.getAttribute('data-go-to');
    if (id) linkMap.set(id, link);
  });

  const headings = Array.from(linkMap.keys())
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => el !== null);

  if (!headings.length) return;

  const setActive = (id: string) => {
    tocLinks.forEach((link) => link.classList.remove('is-active'));
    const activeLink = linkMap.get(id);
    activeLink?.classList.add('is-active');
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

      if (visible.length > 0) {
        setActive(visible[0].target.id);
      }
    },
    {
      rootMargin: '-120px 0px -70% 0px',
      threshold: 0,
    }
  );

  headings.forEach((heading) => observer.observe(heading));
}
