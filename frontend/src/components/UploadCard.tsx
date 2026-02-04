import React, { useCallback, useRef, useState } from "react";
import { Camera, ImageUp, UploadCloud } from "lucide-react";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface UploadCardProps {
  onFileSelected: (file: File | null) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({ onFileSelected }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const file = files[0];

      if (!file.type.startsWith("image/")) {
        setError("Пожалуйста, выберите изображение листа.");
        onFileSelected(null);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError("Размер файла не должен превышать 10 МБ.");
        onFileSelected(null);
        return;
      }

      setError(null);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  return (
    <section
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/80 p-4 shadow-sm sm:p-6"
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onDrop={onDrop}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-500/10 text-leaf-300 ring-1 ring-leaf-500/40">
          <ImageUp className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-slate-50">
            Загрузите фото листа растения
          </h2>
          <p className="text-xs text-slate-400">
            Поддерживаются JPEG и PNG до 10 МБ. Для более точной диагностики
            используйте хорошо освещённое фото, фокус на поражённой области листа.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm hover:border-leaf-500/70 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
          >
            <UploadCloud className="h-4 w-4" />
            <span>Выбрать файл</span>
          </button>
          <p className="text-[11px] text-slate-500">
            …или перетащите изображение листа в эту область.
          </p>
          <input
            ref={inputRef}
            id="leaf-upload-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onChange}
          />
        </div>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="leaf-camera-input"
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm hover:border-leaf-500/70 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
          >
            <Camera className="h-4 w-4" />
            <span>Сделать фото с камеры</span>
          </label>
          <input
            id="leaf-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onChange}
          />
          <p className="text-[11px] text-slate-500">
            На мобильных устройствах откроется камера для быстрого захвата снимка.
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-lg border border-rose-700/70 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
          {error}
        </p>
      )}

      {preview && (
        <div className="mt-2 overflow-hidden rounded-xl border border-slate-800 bg-slate-950/70">
          <div className="flex items-center justify-between border-b border-slate-800 px-3 py-2">
            <span className="text-xs font-medium text-slate-200">Предпросмотр</span>
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onFileSelected(null);
              }}
              className="text-xs text-slate-400 hover:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-400"
            >
              Очистить
            </button>
          </div>
          <div className="max-h-72 w-full overflow-hidden bg-slate-900">
            <img
              src={preview}
              alt="Предпросмотр листа"
              className="h-full w-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};

