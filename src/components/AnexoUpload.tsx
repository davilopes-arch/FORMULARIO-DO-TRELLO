import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, X, Eye, FileText, CheckCircle2 } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);

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
      setUploadProgress(20);
      const timer = setTimeout(() => setUploadProgress(75), 150);

      const newItems = await Promise.all(filesToAdd.map(readFileAsDataUrl));
      clearTimeout(timer);
      setUploadProgress(100);

      setTimeout(() => {
        onChange([...anexos, ...newItems]);
        setUploadProgress(null);
      }, 250);

      if (isFromPaste) {
        setPasteFeedback('Print colado com sucesso!');
        setTimeout(() => setPasteFeedback(null), 3500);
      }
    } catch (err) {
      console.error('Erro ao ler imagens:', err);
      setUploadProgress(null);
      alert('Houve um erro ao processar a imagem.');
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
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
            const now = new Date();
            const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `print_${timeStr}.png`;
            const file = new File([blob], fileName, { type: blob.type });
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="field">
      <div className="field-head">
        <div className="field-label flex items-center gap-1.5 font-bold text-[var(--ink)]">
          <ImageIcon className="w-4 h-4 text-orange-600" />
          <span>Anexos e Evidências</span>
        </div>
        <div className="field-hint text-xs font-mono">
          <span className={anexos.length >= maxFiles ? 'text-amber-600 font-bold' : ''}>
            {anexos.length}
          </span>
          /{maxFiles} imagens
        </div>
      </div>

      {pasteFeedback && (
        <div className="mb-2.5 p-2 px-3 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{pasteFeedback}</span>
        </div>
      )}

      {/* Zona de Drop melhorada */}
      <div
        ref={dropAreaRef}
        className={`anexo-area transition-all duration-200 rounded-xl border-2 border-dashed ${
          isDragOver
            ? 'border-orange-500 bg-orange-50/70 scale-[1.01]'
            : 'border-[var(--border2)] hover:border-orange-400 hover:bg-orange-50/20'
        } p-5 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden`}
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

        {uploadProgress !== null && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-orange-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="w-11 h-11 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-2.5 shadow-inner transition-transform group-hover:scale-105">
          <UploadCloud className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div className="text-sm font-bold text-[var(--ink)] mb-1">
          Arraste imagens ou <span className="text-orange-600 underline underline-offset-2">selecione do computador</span>
        </div>

        <div className="text-xs text-[var(--ink2)] max-w-sm flex flex-col items-center gap-1">
          <span>Formatos aceitos: PNG, JPG ou WEBP (até 10MB)</span>
          <div className="mt-1 px-2.5 py-1 text-[11px] font-mono font-medium bg-[var(--surface2)] text-[var(--ink)] rounded-md border border-[var(--border)] flex items-center gap-1.5 shadow-xs">
            <span className="text-orange-600 font-bold">⚡ Atalho:</span>
            <span>Tire print (Win + Shift + S) e aperte <b>Ctrl + V</b> em qualquer lugar</span>
          </div>
        </div>
      </div>

      {/* Miniaturas de Anexos Estilizadas */}
      {anexos.length > 0 && (
        <div className="mt-3.5 space-y-2">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink3)] font-semibold">
            Arquivos Anexados ({anexos.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" id={`${idPrefix}-anexo-thumbs`}>
            {anexos.map((anexo, idx) => (
              <div
                key={idx}
                className="group relative bg-white border border-[var(--border2)] rounded-lg p-1.5 shadow-xs hover:shadow-md transition-all flex items-center gap-2 overflow-hidden"
              >
                {/* Thumbnail quadrado */}
                <div
                  className="w-12 h-12 rounded-md overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 cursor-pointer relative"
                  onClick={() => setPreviewImage(anexo)}
                >
                  <img
                    src={anexo.dataUrl}
                    alt={anexo.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Info do arquivo */}
                <div
                  className="flex-1 min-w-0 pr-6 cursor-pointer"
                  onClick={() => setPreviewImage(anexo)}
                >
                  <div className="text-xs font-semibold text-[var(--ink)] truncate" title={anexo.name}>
                    {anexo.name}
                  </div>
                  {anexo.size && (
                    <div className="text-[10px] font-mono text-[var(--ink3)]">
                      {formatFileSize(anexo.size)}
                    </div>
                  )}
                </div>

                {/* Botão de exclusão */}
                <button
                  type="button"
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-zinc-200 hover:bg-red-500 hover:text-white text-zinc-600 flex items-center justify-center text-xs transition-colors cursor-pointer border-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(idx);
                  }}
                  title="Remover anexo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal / Lightbox de Pré-visualização Ampliada */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-[var(--surface)] p-3.5 rounded-xl border-2 border-[var(--ink)] max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)] mb-2.5">
              <span className="font-mono text-xs font-semibold text-[var(--ink)] truncate max-w-md flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                {previewImage.name}
              </span>
              <button
                type="button"
                className="px-2.5 py-1 text-xs font-bold bg-[var(--surface2)] hover:bg-[var(--border)] text-[var(--ink)] rounded-md cursor-pointer border border-[var(--border)]"
                onClick={() => setPreviewImage(null)}
              >
                ✕ Fechar
              </button>
            </div>
            <div className="overflow-auto max-h-[78vh] flex items-center justify-center bg-zinc-950/5 rounded-lg p-2">
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
