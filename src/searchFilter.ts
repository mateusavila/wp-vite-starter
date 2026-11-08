export function searchFilter(): void {
  document
    .querySelectorAll<HTMLElement>("[data-filter]")
    .forEach(createFilter);
}

function createFilter(root: HTMLElement): void {
  const input = root.querySelector<HTMLInputElement>("[data-filter-input]");
  const source = root.querySelector<HTMLElement>("[data-filter-source]");

  if (!input || !source) return;

  const items = Array.from(
    source.querySelectorAll<HTMLElement>("[data-filter-item]")
  );

  const resultsSelector = root.dataset.filterResults;
  const defaultSelector = root.dataset.filterDefault;

  const results = resultsSelector
    ? document.querySelector<HTMLElement>(resultsSelector)
    : null;

  const defaultContent = defaultSelector
    ? document.querySelector<HTMLElement>(defaultSelector)
    : null;

  const showDefault = () => {
    if (defaultContent) {
      defaultContent.classList.remove("hidden");
    }

    if (results) {
      results.classList.add("hidden");
      results.replaceChildren();
    }
  };

  const showResults = () => {
    if (defaultContent) {
      defaultContent.classList.add("hidden");
    }

    if (results) {
      results.classList.remove("hidden");
    }
  };

  const render = (matches: HTMLElement[]) => {
    if (!results) return;

    results.replaceChildren();

    matches.forEach((item) => {
      const clone = item.cloneNode(true) as HTMLElement;

      clone.addEventListener("click", () => {
        clone.querySelector<HTMLAnchorElement>("a")?.click();
      });

      results.appendChild(clone);
    });
  };

  const filter = () => {
    const value = input.value
      .trim()
      .toLowerCase();

    if (!value) {
      showDefault();
      return;
    }

    const matches = items.filter((item) => {
      return (
        item.dataset.filterValue
          ?.toLowerCase()
          .includes(value)
      );
    });

    showResults();

    render(matches);
  };

  input.addEventListener("input", filter);

  showDefault();
}
