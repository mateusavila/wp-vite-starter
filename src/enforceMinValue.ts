export function enforceMinValue(
  inputId: string,
  min: number = 1,
  allowEmpty: boolean = false
): void {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) {
    console.warn(`[enforceMinValue] Input com id "${inputId}" não encontrado.`);
    return;
  }

  const enforce = () => {
    const rawValue = input.value.trim();
    if (allowEmpty && rawValue === "") return;
    if (rawValue === "" || isNaN(Number(rawValue)) || Number(rawValue) < min) {
      input.value = String(min);
    }
  };

  input.addEventListener("blur", enforce);
  input.addEventListener("change", enforce);
  if (!allowEmpty) {
    enforce();
  }
}
