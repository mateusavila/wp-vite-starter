// zipMask.ts
export function applyZipMask(id: string): void {
  const inputElement = document.getElementById(id) as HTMLInputElement;

  if (!inputElement) return;

  inputElement.value = formatZipCode(inputElement.value);

  inputElement.addEventListener('input', function (this: HTMLInputElement) {
    this.value = formatZipCode(this.value);
  });
}

function formatZipCode(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const truncated = numbers.slice(0, 9); // ZIP (5) + ZIP+4 (4)
  let formatted = '';

  if (truncated.length <= 5) {
    formatted = truncated;
  } else {
    formatted = `${truncated.slice(0, 5)}-${truncated.slice(5, 9)}`;
  }

  return formatted;
}

export function getUnmaskedZip(id: string): string {
  const inputElement = document.getElementById(id) as HTMLInputElement;
  if (!inputElement) return '';

  return inputElement.value.replace(/\D/g, '');
}

export function isValidZip(id: string): boolean {
  const inputElement = document.getElementById(id) as HTMLInputElement;
  if (!inputElement) return false;

  const numbers = inputElement.value.replace(/\D/g, '');
  return numbers.length === 5 || numbers.length === 9;
}
