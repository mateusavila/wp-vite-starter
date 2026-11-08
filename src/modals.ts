export function initModals(): void {
  document.querySelectorAll<HTMLButtonElement>('button[data-modal]').forEach((trigger) => {
    const dialog = document.getElementById(trigger.dataset.modal ?? '');

    if (!(dialog instanceof HTMLDialogElement)) return;

    trigger.addEventListener('click', () => dialog.showModal());
  });
}
