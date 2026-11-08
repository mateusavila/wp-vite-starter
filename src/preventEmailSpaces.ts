export function preventEmailSpaces(selector = '[data-email]'): void {
  const emailInputs = document.querySelectorAll<HTMLInputElement>(selector);

  if (!emailInputs.length) return;

  emailInputs.forEach((email) => {
    email.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
      }
    });

    email.addEventListener('input', () => {
      email.value = email.value.replace(/\s+/g, '');
    });
  });
}
