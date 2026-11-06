
import { useEffect, useRef, useState } from "react";
import {
  AlertCircleIcon,
  FileAudioIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";

import { uploadRecording } from "../services/api";

export default function ExternalAudioUpload({ onCreated, disabled = false }) {
  const maxSizeMB = 25;
  const maxSize = maxSizeMB * 1024 * 1024;

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(candidate) {
    if (!candidate) return;

    setError("");

    const allowedExtensions =
      /\.(mp3|wav|m4a|webm|ogg|mp4|mpeg|mpga|flac)$/i;

    if (!allowedExtensions.test(candidate.name)) {
      setError("Choose a supported audio file.");
      return;
    }

    if (candidate.size > maxSize) {
      setError(`File size must be ${maxSizeMB} MB or less.`);
      return;
    }

    setFile(candidate);
  }

  function handleInputChange(event) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    if (!disabled && !uploading) {
      selectFile(event.dataTransfer.files?.[0]);
    }
  }

  async function handleUpload() {
    if (!file || uploading || disabled) return;

    setError("");
    setUploading(true);

    try {
      await uploadRecording(file, file.name);
      setFile(null);
      await onCreated?.();
    } catch (err) {
      setError(err.message || "Audio transcription failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div
          className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!disabled && !uploading) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsDragging(false);
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.ogg,.mp4,.mpeg,.mpga,.flac,audio/*"
            onChange={handleInputChange}
            aria-label="Upload audio file"
            className="sr-only"
            disabled={disabled || uploading}
          />

          {file && previewUrl ? (
            <div className="flex w-full flex-col items-center justify-center gap-3 p-3">
              <FileAudioIcon className="size-10 opacity-60" />

              <p className="max-w-full break-all text-center text-sm font-medium">
                {file.name}
              </p>

              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              <audio
                controls
                src={previewUrl}
                className="w-full"
              />

              <button
                type="button"
                className="mt-2 inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                onClick={handleUpload}
                disabled={disabled || uploading}
              >
                {uploading ? "Transcribing..." : "Upload & transcribe"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                aria-hidden="true"
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
              >
                <FileAudioIcon className="size-4 opacity-60" />
              </div>

              <p className="mb-1.5 text-sm font-medium">
                Drop your audio here
              </p>

              <p className="text-xs text-muted-foreground">
                MP3, WAV, M4A, WEBM or FLAC (max. {maxSizeMB} MB)
              </p>

              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent disabled:opacity-50"
                onClick={() => inputRef.current?.click()}
                disabled={disabled || uploading}
              >
                <UploadIcon
                  aria-hidden="true"
                  className="-ms-1 size-4 opacity-60"
                />
                Select audio
              </button>
            </div>
          )}
        </div>

        {file && (
          <div className="absolute right-4 top-4">
            <button
              type="button"
              aria-label="Remove audio"
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white outline-none transition-colors hover:bg-black/80"
              onClick={() => {
                setFile(null);
                setError("");
              }}
              disabled={uploading}
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-center gap-1 text-xs text-destructive"
          role="alert"
        >
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <p
        aria-live="polite"
        className="mt-2 text-center text-xs text-muted-foreground"
        role="status"
      >
        Audio uploader · Drag and drop or select a file
      </p>
    </div>
  );
}
