interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
}

interface UploadFieldOptions {
  id: string;
  multiple: boolean;
  maxSize: number;
  maxFiles: number;
  accept: string;
}

// Extensões que o navegador realmente consegue decodificar e exibir dentro de uma tag <img>.
// Formatos como .psd, .ai, .tiff podem vir com MIME "image/*" mas não são renderizáveis nativamente.
const RENDERABLE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'jfif', 'avif'];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${units[i]}`;
}

function generateFileId(): string {
  return `file_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function getFileExtension(file: File): string {
  return file.name.split('.').pop()?.toLowerCase() || '';
}

/**
 * Verifica se o arquivo é uma imagem que o <img> consegue de fato renderizar.
 * Não confia apenas no MIME type, pois formatos como .psd podem ser reportados
 * como "image/*" mesmo sem suporte nativo de decodificação no navegador.
 */
function isImage(file: File): boolean {
  const ext = getFileExtension(file);
  return file.type.startsWith('image/') && RENDERABLE_IMAGE_EXTENSIONS.includes(ext);
}

function isPdf(file: File): boolean {
  return file.type === 'application/pdf' || getFileExtension(file) === 'pdf';
}

function createPreviewUrl(file: File): string | undefined {
  if (isImage(file)) {
    return URL.createObjectURL(file);
  }
  return undefined;
}

function getPdfIcon(): string {
  return `
    <svg class="w-full h-full text-red-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
      <path fill="#fff" d="M14 2v6h6"/>
      <text x="12" y="17" font-size="6" font-weight="bold" fill="#ef4444" text-anchor="middle" font-family="Arial">PDF</text>
    </svg>
  `;
}

/**
 * Ícone genérico com uma "etiqueta" da extensão do arquivo (ex: PSD, AI, DOC, XLS, CSV).
 * Usado para qualquer formato que não seja imagem renderizável nem PDF.
 */
function getLabeledFileIcon(ext: string): string {
  const label = ext.slice(0, 4).toUpperCase();
  const colorMap: Record<string, string> = {
    PSD: '#3b82f6',
    AI: '#f97316',
    DOC: '#2563eb',
    DOCX: '#2563eb',
    XLS: '#16a34a',
    XLSX: '#16a34a',
    CSV: '#16a34a',
  };
  const color = colorMap[label] || '#64748b';

  return `
    <svg class="w-full h-full" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 2a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6H6z"
        fill="${color}" fill-opacity="0.12" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M14 2v6h6" stroke="${color}" stroke-width="1.5" stroke-linejoin="round"/>
      <text x="12" y="17" font-size="6" font-weight="bold" fill="${color}" text-anchor="middle" font-family="Arial">${label}</text>
    </svg>
  `;
}

function getGenericIcon(): string {
  return `
    <svg class="w-full h-full text-navy/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
    </svg>
  `;
}

/**
 * Resolve qual ícone estático mostrar para um arquivo que não é uma imagem renderizável.
 */
function getStaticIconFor(file: File): string {
  if (isPdf(file)) return getPdfIcon();

  const ext = getFileExtension(file);
  const knownExtensions = ['psd', 'ai', 'doc', 'docx', 'xls', 'xlsx', 'csv'];
  if (knownExtensions.includes(ext)) {
    return getLabeledFileIcon(ext);
  }

  return getGenericIcon();
}

function renderFileItem(item: FileItem): string {
  const { file, previewUrl } = item;
  const isImg = isImage(file);

  let thumbnailContent = '';
  if (isImg && previewUrl) {
    // Sem onerror inline: markup HTML embutido em atributo (via JSON.stringify) quebra o
    // parser HTML por causa das aspas do SVG. O fallback de erro é anexado via
    // addEventListener depois de inserir no DOM (ver renderList -> attachThumbnailFallbacks).
    thumbnailContent = `<img src="${previewUrl}" alt="${file.name}" class="w-full h-full object-cover rounded" data-preview-img />`;
  } else {
    thumbnailContent = getStaticIconFor(file);
  }

  return `
    <div
      class="flex items-center gap-3 bg-white border border-navy/15 rounded-lg p-2 hover:border-navy/30 transition-colors group"
      data-file-id="${item.id}"
    >
      <div class="w-12 h-12 flex-shrink-0 bg-navy/5 rounded overflow-hidden flex items-center justify-center" data-thumbnail>
        ${thumbnailContent}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-navy/90 text-[13px] font-medium truncate" title="${file.name}">
          ${file.name}
        </p>
        <p class="text-navy/50 text-[11px] mt-0.5">
          ${formatFileSize(file.size)}
        </p>
      </div>
      <button
        type="button"
        data-remove-file="${item.id}"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-navy/40 hover:text-red-600 hover:bg-red-50 transition-colors"
        title="Remove files"
        aria-label="Remove ${file.name}"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
}

export function initFileUpload(id: string): void {
  const container = document.querySelector(`[data-upload-id="${id}"]`) as HTMLDivElement | null;
  const dropzone = document.getElementById(`${id}-dropzone`) as HTMLDivElement | null;
  const input = document.getElementById(id) as HTMLInputElement | null;
  const fileListContainer = document.getElementById(`${id}-file-list`) as HTMLDivElement | null;
  const fileItems = fileListContainer?.querySelector('[data-file-items]') as HTMLDivElement | null;
  const fileCount = fileListContainer?.querySelector('[data-file-count]') as HTMLSpanElement | null;
  const removeAllBtn = fileListContainer?.querySelector('[data-remove-all]') as HTMLButtonElement | null;

  if (!container || !dropzone || !input || !fileListContainer || !fileItems || !fileCount || !removeAllBtn) {
    console.warn(`[initFileUpload] not found "${id}".`);
    return;
  }

  const options: UploadFieldOptions = {
    id,
    multiple: container.dataset.multiple === 'true',
    maxSize: parseInt(container.dataset.maxSize || '0', 10),
    maxFiles: parseInt(container.dataset.maxFiles || '0', 10),
    accept: container.dataset.accept || '',
  };

  let files: FileItem[] = [];
  const renderList = (): void => {
    if (files.length === 0) {
      fileListContainer.classList.add('hidden');
      removeAllBtn.classList.add('hidden');
      fileItems.innerHTML = '';
      fileCount.textContent = '0';
      return;
    }

    fileListContainer.classList.remove('hidden');
    fileCount.textContent = String(files.length);

    if (options.multiple && files.length > 1) {
      removeAllBtn.classList.remove('hidden');
    } else {
      removeAllBtn.classList.add('hidden');
    }

    fileItems.innerHTML = files.map(renderFileItem).join('');
    attachThumbnailFallbacks();
    syncInputFiles();
  };

  /**
   * Conecta o fallback de erro nas imagens de preview via addEventListener,
   * em vez de atributo onerror inline (que quebrava o HTML por causa do
   * escaping de aspas do SVG embutido). Se o blob não conseguir ser
   * decodificado como imagem, troca pelo ícone estático correspondente.
   */
  const attachThumbnailFallbacks = (): void => {
    fileItems.querySelectorAll<HTMLImageElement>('img[data-preview-img]').forEach((imgEl) => {
      imgEl.addEventListener(
        'error',
        () => {
          const fileWrapper = imgEl.closest<HTMLElement>('[data-file-id]');
          const thumbnailWrapper = imgEl.closest<HTMLElement>('[data-thumbnail]');
          const fileId = fileWrapper?.getAttribute('data-file-id');
          const item = files.find((f) => f.id === fileId);
          if (thumbnailWrapper && item) {
            thumbnailWrapper.innerHTML = getStaticIconFor(item.file);
          }
        },
        { once: true }
      );
    });
  };

  const syncInputFiles = (): void => {
    if (files.length === 0) {
      input.value = '';
      return;
    }

    try {
      const dataTransfer = new DataTransfer();
      files.forEach((item) => dataTransfer.items.add(item.file));
      input.files = dataTransfer.files;
    } catch (err) {
      console.warn('[initFileUpload] Não foi possível sincronizar arquivos com o input.', err);
    }
  };

  const validateFile = (file: File): string | null => {
    if (options.maxSize > 0 && file.size > options.maxSize) {
      return `O arquivo "${file.name}" excede o tamanho máximo de ${formatFileSize(options.maxSize)}.`;
    }
    if (options.accept) {
      const acceptedTypes = options.accept.split(',').map((t) => t.trim().toLowerCase());
      const fileType = file.type.toLowerCase();
      const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
      const matches = acceptedTypes.some((type) => {
        if (type.startsWith('.')) return fileExt === type;
        if (type.endsWith('/*')) return fileType.startsWith(type.replace('/*', '/'));
        return fileType === type;
      });
      if (!matches) {
        return `O arquivo "${file.name}" não é de um tipo aceito.`;
      }
    }
    return null;
  };

  const addFiles = (newFiles: FileList | File[]): void => {
    const incoming = Array.from(newFiles);
    const errors: string[] = [];

    incoming.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
        return;
      }

      if (!options.multiple) {
        files.forEach((f) => {
          if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
        });
        files = [];
      }

      if (options.maxFiles > 0 && files.length >= options.maxFiles) {
        errors.push(`Limit of ${options.maxFiles} file(s) reached.`);
        return;
      }

      const previewUrl = createPreviewUrl(file);
      files.push({
        id: generateFileId(),
        file,
        previewUrl,
      });
    });

    if (errors.length > 0) {
      console.warn('[initFileUpload] Errors:', errors);
      const errorContainer = container.querySelector('[data-error-message]');
      if (errorContainer) {
        errorContainer.textContent = errors[0];
      }
    }

    renderList();
  };

  const removeFile = (fileId: string): void => {
    const index = files.findIndex((f) => f.id === fileId);
    if (index === -1) return;

    const item = files[index];
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);

    files.splice(index, 1);
    renderList();
  };

  const removeAllFiles = (): void => {
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    files = [];
    renderList();
  };

  const handleDragEnter = (e: DragEvent): void => {
    e.preventDefault();
    dropzone.classList.add('border-navy', 'bg-navy/5');
  };

  const handleDragOver = (e: DragEvent): void => {
    e.preventDefault();
    dropzone.classList.add('border-navy', 'bg-navy/5');
  };

  const handleDragLeave = (e: DragEvent): void => {
    e.preventDefault();
    dropzone.classList.remove('border-navy', 'bg-navy/5');
  };

  const handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    dropzone.classList.remove('border-navy', 'bg-navy/5');
    if (e.dataTransfer?.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  dropzone.addEventListener('dragenter', handleDragEnter);
  dropzone.addEventListener('dragover', handleDragOver);
  dropzone.addEventListener('dragleave', handleDragLeave);
  dropzone.addEventListener('drop', handleDrop);

  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      const selected = Array.from(input.files);
      input.value = '';
      addFiles(selected);
    } else {
      removeAllFiles();
    }
  });

  fileItems.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const removeBtn = target.closest('[data-remove-file]') as HTMLElement | null;
    if (removeBtn) {
      const fileId = removeBtn.getAttribute('data-remove-file');
      if (fileId) removeFile(fileId);
    }
  });

  removeAllBtn.addEventListener('click', (e) => {
    e.preventDefault();
    removeAllFiles();
  });

  const cleanup = (): void => {
    dropzone.removeEventListener('dragenter', handleDragEnter);
    dropzone.removeEventListener('dragover', handleDragOver);
    dropzone.removeEventListener('dragleave', handleDragLeave);
    dropzone.removeEventListener('drop', handleDrop);
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    files = [];
  };

  (container as any).__uploadCleanup = cleanup;
}
