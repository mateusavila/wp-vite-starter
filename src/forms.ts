import * as z from "zod";
import { ERROR_BORDER_CLASS, HIDDEN_CLASS, FLEX_CLASS } from "./constants";

function clearFieldErrors(fields: string[]) {
  fields.forEach((field) => {
    const input = document.querySelector(`#${field}`);
    const errorDiv = document.querySelector(`#${field}-error`);

    input?.classList.remove(ERROR_BORDER_CLASS);

    if (errorDiv) {
      const paragraph = errorDiv.querySelector("p");
      if (paragraph) paragraph.textContent = "";
      errorDiv.classList.add(HIDDEN_CLASS);
    }
  });
}

function displayFieldErrors(errors: Record<string, string[] | undefined>) {
  Object.entries(errors).forEach(([field, messages]) => {
    if (!messages?.[0]) return;

    const input = document.querySelector(`#${field}`);
    const errorDiv = document.querySelector(`#${field}-error`);

    input?.classList.add(ERROR_BORDER_CLASS);

    if (errorDiv) {
      const paragraph = errorDiv.querySelector("p");
      if (paragraph) paragraph.textContent = messages[0];
      errorDiv.classList.remove(HIDDEN_CLASS);
    }
  });
}

function resetForm(form: HTMLFormElement) {
  form.reset();

  const fileInputs = form.querySelectorAll<HTMLInputElement>('input[type="file"]');
  fileInputs.forEach((input) => {
    input.value = "";
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });

  const filePreviews = form.querySelectorAll('[data-file-preview], .file-preview, .upload-preview');
  filePreviews.forEach((preview) => preview.remove());
}

export async function submitForm<T extends z.ZodRawShape>({
  form,
  schema,
  url,
  loadingEl,
  resultEl,
  resultMode = "div",
  hideFormOnSuccess = true,
  onBeforeSubmit,
  onSuccess,
  onError,
  messageEl,
  successMessage,
  errorMessage,
  titleEl,
  successTitle,
  errorTitle,
}: {
  form: HTMLFormElement;
  schema: z.ZodObject<T>;
  url: string;
  loadingEl: HTMLElement;
  resultEl: HTMLElement;
  resultMode?: "dialog" | "div";
  hideFormOnSuccess?: boolean;
  messageEl?: HTMLElement;
  errorMessage?: string;
  titleEl?: HTMLElement;
  successTitle?: string;
  successMessage?: string;
  errorTitle?: string;
  onBeforeSubmit?: () => void;
  onSuccess?: () => void;
  onError?: () => void;
}): Promise<z.infer<z.ZodObject<T>> | undefined> {
  const formData = new FormData(form);

  const data: Record<string, any> = {};

  Object.keys(schema.shape).forEach((key) => {
    let values = formData.getAll(key);
    if (values.length === 0 && formData.has(`${key}[]`)) {
      values = formData.getAll(`${key}[]`);
    }

    if (values.length === 0) {
      data[key] = "";
    } else if (values.length === 1) {
      data[key] = values[0];
    } else {
      data[key] = values;
    }
  });

  const resolvedSuccessTitle = successTitle || form.dataset.successTitle || "Success";
  const resolvedSuccessMessage = successMessage || form.dataset.successMessage || "Success.";
  const resolvedErrorTitle = errorTitle || form.dataset.errorTitle || "Error";
  const resolvedErrorMessage = errorMessage || form.dataset.errorMessage || "An error occurred. Please try again.";

  clearFieldErrors(Object.keys(schema.shape));

  const isDialog = resultMode === "dialog" && resultEl instanceof HTMLDialogElement;

  const showResult = () => {
    if (isDialog) {
      resultEl.showModal();
    } else {
      resultEl.classList.remove(HIDDEN_CLASS);
      resultEl.classList.add(FLEX_CLASS);
    }
  };

  const hideResult = () => {
    if (isDialog) {
      resultEl.close();
    } else {
      resultEl.classList.remove(FLEX_CLASS);
      resultEl.classList.add(HIDDEN_CLASS);
    }
  };

  hideResult();

  const parsed = schema.safeParse(data);

  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    displayFieldErrors(fieldErrors);
    return undefined;
  }

  if (titleEl) titleEl.textContent = "";
  if (messageEl) messageEl.textContent = "";

  onBeforeSubmit?.();

  loadingEl.classList.remove(HIDDEN_CLASS);
  loadingEl.classList.add(FLEX_CLASS);

  const hasFiles = Object.values(data).some(
    (val) => val instanceof File || (Array.isArray(val) && val.some((v) => v instanceof File))
  );

  let body: BodyInit;
  let headers: HeadersInit = {};

  if (hasFiles) {
    const submitFormData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => submitFormData.append(`${key}[]`, v));
      } else if (value instanceof File) {
        submitFormData.append(`${key}[]`, value);
      } else {
        submitFormData.append(key, value);
      }
    });
    body = submitFormData;
  } else {
    body = JSON.stringify(data);
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    const result = await response.json();

    if (result.status) {
      if (hideFormOnSuccess) {
        form.classList.add(HIDDEN_CLASS);
      }

      resetForm(form);

      loadingEl.classList.remove(FLEX_CLASS);
      loadingEl.classList.add(HIDDEN_CLASS);

      if (titleEl) titleEl.textContent = resolvedSuccessTitle;
      if (messageEl) messageEl.textContent = resolvedSuccessMessage;

      showResult();

      onSuccess?.();

      return parsed.data;
    } else {
      throw new Error(result.message || "Submission failed");
    }
  } catch (error) {
    console.error("Form submission error:", error);

    loadingEl.classList.remove(FLEX_CLASS);
    loadingEl.classList.add(HIDDEN_CLASS);

    if (titleEl) titleEl.textContent = resolvedErrorTitle;
    if (messageEl) messageEl.textContent = resolvedErrorMessage;

    showResult();

    onError?.();

    return undefined;
  }
}
