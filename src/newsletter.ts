export function initNewsletter(): void {
  document.querySelectorAll<HTMLFormElement>('[data-newsletter-form]').forEach((form) => {
    const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    const status = form.querySelector<HTMLElement>('[data-newsletter-status]');

    if (!button || !status) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (button.disabled) return;

      button.disabled = true;
      status.textContent = '';

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
        });
        const result = await response.json() as { message: string };
        status.textContent = result.message;
        if (response.ok) form.reset();
      } catch {
        status.textContent = status.dataset.error ?? '';
      } finally {
        button.disabled = false;
      }
    });
  });
}
