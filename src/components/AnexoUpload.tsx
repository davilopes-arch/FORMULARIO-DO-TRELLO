import React, { useState, useRef, useEffect } from 'react';
import { AttachmentItem } from '../types';

interface AnexoUploadProps {
  idPrefix: string;
  anexos: AttachmentItem[];
  onChange: (anexos: AttachmentItem[]) => void;
  maxFiles?: number;
}

export function AnexoUpload({
  idPrefix,
  anexos,
  onChange,
  maxFiles = 5,
}: AnexoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState<AttachmentItem | null>(null);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

  // Helper para ler File em Promise com DataUrl
  const readFileAsDataUrl = (file: File): Promise<AttachmentItem> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          name: file.name,
          dataUrl: reader.result as string,
          size: file.size,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const processFiles = async (files: File[], isFromPaste = false) => {
    const validImages = files.filter((f) => f.type.startsWith('image/'));
    if (validImages.length === 0) {
      if (!isFromPaste) {
        alert('Apenas arquivos de imagem são permitidos (PNG, JPG, WEBP).');
      }
      return;
    }

    const availableSlots = maxFiles - anexos.length;
    if (availableSlots <= 0) {
      alert(`Limite de ${maxFiles} imagens já atingido.`);
      return;
    }

    const filesToAdd = validImages.slice(0, availableSlots);
    const oversized = filesToAdd.filter((f) => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      alert('Algumas imagens excedem o limite de 10MB.');
      return;
    }

    try {
      const newItems = await Promise.all(filesToAdd.map(readFileAsDataUrl));
      onChange([...anexos, ...newItems]);

      if (isFromPaste) {
        setPasteFeedback('📋 Print colado com sucesso!');
        setTimeout(() => setPasteFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Erro ao ler imagens:', err);
      alert('Houve um erro ao processar a imagem.');
    }
  };

  // Suporte a colar com Ctrl + V em qualquer lugar da tela quando na página do formulário
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Se o foco estiver em um input ou textarea de texto simples e NÃO for imagem, ignora
      const target = e.target as HTMLElement;
      const isTextInput =
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') &&
        (target as HTMLInputElement).type !== 'file';

      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const blob = item.getAsFile();
          if (blob) {
            // Gera um nome legível baseado no timestamp
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `print_${timeStr}.png`;
            const file = new File([blob], fileName, { type: blob.type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        // Se encontramos imagens no clipboard, previne ação padrão se necessário e anexa
        if (!isTextInput) {
          e.preventDefault();
        }
        processFiles(imageFiles, true);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [anexos, maxFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = anexos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="field">
      <div className="field-head">
        <div className="field-label">Anexos / Prints</div>
        <div className="field-hint">
          {anexos.length}/{maxFiles} imagens
        </div>
      </div>

      {pasteFeedback && (
        <div className="mb-2 p-2 px-3 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 animate-pulse">
          <span>✓</span> {pasteFeedback}
        </div>
      )}

      <div
        ref={dropAreaRef}
        className={`anexo-area ${isDragOver ? 'drag' : ''}`}
        id={`${idPrefix}-anexo-area`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          className="anexo-input"
          type="file"
          id={`${idPrefix}-anexo-input`}
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <div className="anexo-icon">🖼️</div>
        <div className="anexo-label">Clique, arraste ou dê Ctrl + V aqui</div>
        <div className="anexo-hint flex flex-col gap-1 items-center">
          <span>PNG · JPG · WEBP — até 10MB cada</span>
          <span className="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold bg-[var(--surface)] text-[var(--ink)] rounded border border-[var(--border)]">
            Dica rápida: tire print com Win + Shift + S e aperte Ctrl + V
          </span>
        </div>
      </div>

      {anexos.length > 0 && (
        <div className="anexo-thumbs" id={`${idPrefix}-anexo-thumbs`}>
          {anexos.map((anexo, idx) => (
            <div
              className="anexo-thumb group relative cursor-pointer"
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setPreviewImage(anexo);
              }}
              title="Clique para ampliar / ver imagem"
            >
              <img src={anexo.dataUrl} alt={anexo.name} />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold pointer-events-none">
                🔍 Ver
              </div>
              <button
                type="button"
                className="anexo-thumb-rm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(idx);
                }}
                title="Remover anexo"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {anexos.length > 0 && (
        <div className="anexo-count" id={`${idPrefix}-anexo-count`}>
          {anexos.length} imagem{anexos.length > 1 ? 's' : ''} pronta{anexos.length > 1 ? 's' : ''} para envio
        </div>
      )}

      {/* Lightbox / Modal de visualização ampliada */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-[var(--surface)] p-3 rounded-lg border-2 border-[var(--border)] max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)] mb-2">
              <span className="font-mono text-xs text-[var(--ink)] truncate max-w-md">
                📎 {previewImage.name}
              </span>
              <button
                type="button"
                className="px-2 py-1 text-xs font-bold bg-[var(--surface2)] hover:bg-[var(--border)] text-[var(--ink)] rounded cursor-pointer"
                onClick={() => setPreviewImage(null)}
              >
                Fechar ✕
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center bg-zinc-900/5 rounded p-2">
              <img
                src={previewImage.dataUrl}
                alt={previewImage.name}
                className="max-w-full max-h-[72vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
