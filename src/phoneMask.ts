// phoneMask.ts
export function applyPhoneMask(id: string): void {
  const inputElement = document.getElementById(id) as HTMLInputElement;

  if (!inputElement) return;

  inputElement.value = formatPhoneNumber(inputElement.value);

  inputElement.addEventListener('input', function(this: HTMLInputElement) {
    this.value = formatPhoneNumber(this.value);
  });
}

function formatPhoneNumber(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const truncated = numbers.slice(0, 10);
  let formatted = '';

  if (truncated.length === 0) {
    formatted = '';
  } else if (truncated.length <= 3) {
    formatted = `(${truncated}`;
  } else if (truncated.length <= 6) {
    formatted = `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
  } else {
    formatted = `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6, 10)}`;
  }
  return formatted;
}

export function applyPhoneMaskWithCountry(id: string): void {
  const inputElement = document.getElementById(id) as HTMLInputElement;
  if (!inputElement) return;

  inputElement.value = formatPhoneNumberWithCountry(inputElement.value);
  inputElement.addEventListener('input', function(this: HTMLInputElement) {
    this.value = formatPhoneNumberWithCountry(this.value);
  });
}

function formatPhoneNumberWithCountry(value: string): string {
  const numbers = value.replace(/\D/g, '');
  const truncated = numbers.slice(0, 11);
  let formatted = '';
  if (truncated.length === 0) {
    formatted = '';
  } else if (truncated.length === 1) {
    formatted = `+${truncated}`;
  } else if (truncated.length <= 4) {
    formatted = `+${truncated.slice(0, 1)} (${truncated.slice(1)}`;
  } else if (truncated.length <= 7) {
    formatted = `+${truncated.slice(0, 1)} (${truncated.slice(1, 4)}) ${truncated.slice(4)}`;
  } else {
    formatted = `+${truncated.slice(0, 1)} (${truncated.slice(1, 4)}) ${truncated.slice(4, 7)}-${truncated.slice(7, 11)}`;
  }
  return formatted;
}

export function getUnmaskedPhone(id: string): string {
  const inputElement = document.getElementById(id) as HTMLInputElement;
  if (!inputElement) return '';

  return inputElement.value.replace(/\D/g, '');
}

export function setPhoneValue(id: string, value: string): void {
  const inputElement = document.getElementById(id) as HTMLInputElement;

  if (!inputElement) return;

  inputElement.value = formatPhoneNumber(value);
}

export function isValidPhone(id: string): boolean {
  const inputElement = document.getElementById(id) as HTMLInputElement;

  if (!inputElement) return false;

  const numbers = inputElement.value.replace(/\D/g, '');
  return numbers.length === 10;
}

export function isValidPhoneWithCountry(id: string): boolean {
  const inputElement = document.getElementById(id) as HTMLInputElement;

  if (!inputElement)  return false;

  const numbers = inputElement.value.replace(/\D/g, '');
  return numbers.length === 11;
}
