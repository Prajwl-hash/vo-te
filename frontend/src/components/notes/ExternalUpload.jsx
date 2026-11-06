import { useEffect, useRef, useState } from "react";
import {
  AudioLines,
  CheckCircle2,
  FileAudio,
  LoaderCircle,
  Upload,
  X,
} from "lucide-react";

import { uploadRecording } from "../../services/api";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const ACCEPTED_AUDIO_TYPES = new Set([
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
  "video/mp4",
]);

const ACCEPTED_EXTENSIONS = [
  ".mp3",
  ".wav",
  ".m4a",
  ".webm",
  ".ogg",
  ".mp4",
  ".mpeg",
  ".mpga",
  ".flac",
  ".aac",
];

const ACCEPT_ATTRIBUTE = ACCEPTED_EXTENSIONS.join(",");

function formatFileSize(bytes) {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateAudioFile(file) {
  if (!file) {
    return "Please choose an audio file.";
  }

  const extension = `.${file.name.split(".").pop()}`.toLowerCase();

  if (!ACCEPTED_EXTENSIONS.includes(extension)) {
    return "Unsupported file format. Choose an MP3, WAV, M4A, WEBM, OGG, MP4, FLAC, or AAC file.";
  }

  if (file.size === 0) {
    return "This file is empty. Please choose another audio file.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "The audio file exceeds the 25 MB limit.";
  }

  // File extensions are checked because browsers may provide an empty
  // or inconsistent MIME type for otherwise valid audio files.
  if (
    file.type &&
    !ACCEPTED_AUDIO_TYPES.has(file.type) &&
    !file.type.startsWith("audio/") &&
    file.type !== "application/octet-stream"
  ) {
    return "This file does not appear to be an audio file.";
  }

  return "";
}

export default function ExternalAudioUpload({
  onCreated,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const dragCounterRef = useRef(0);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const busy = disabled || uploading;

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  function chooseFile(file) {
    if (busy) return;

    setErrorMessage("");
    setSuccessMessage("");

    const validationError = validateAudioFile(file);

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSelectedFile(file);
  }

  function handleInputChange(event) {
    const file = event.target.files?.[0];

    if (file) {
      chooseFile(file);
    }

    // Allows the same file to be selected again after removal.
    event.target.value = "";
  }

  function handleDragEnter(event) {
    event.preventDefault();
    event.stopPropagation();

    if (busy) return;

    dragCounterRef.current += 1;
    setDragging(true);
  }

  function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current -= 1;

    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setDragging(false);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    if (!busy) {
      event.dataTransfer.dropEffect = "copy";
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    dragCounterRef.current = 0;
    setDragging(false);

    if (busy) return;

    const file = event.dataTransfer.files?.[0];

    if (!file) {
      setErrorMessage("Drop an audio file to continue.");
      return;
    }

    chooseFile(file);
  }

  function removeFile() {
    if (busy) return;

    setSelectedFile(null);
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleUpload() {
    if (!selectedFile || busy) return;

    setErrorMessage("");
    setSuccessMessage("");
    setUploading(true);

    try {
      const result = await uploadRecording(
        selectedFile,
        selectedFile.name
      );

      setSelectedFile(null);

      setSuccessMessage(
        `Transcription complete${result?.title ? `: ${result.title}` : "!"}`
      );

      // Refresh the existing notes list.
      if (onCreated) {
        await onCreated();
      }
    } catch (error) {
      setErrorMessage(
        error?.message || "Audio upload and transcription failed."
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTRIBUTE}
        onChange={handleInputChange}
        disabled={busy}
        className="hidden"
        aria-label="Choose an audio file"
      />

      {!selectedFile ? (
        <Card
          className={[
            "border-2 border-dashed bg-background shadow-none transition-colors",
            dragging
              ? "border-primary bg-accent"
              : "border-border hover:border-primary/50",
            busy ? "opacity-60" : "",
          ].join(" ")}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center gap-4 px-5 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              {dragging ? (
                <AudioLines
                  className="size-6 text-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Upload
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {dragging
                  ? "Drop your audio file here"
                  : "Upload an audio file"}
              </p>

              <p className="text-sm text-muted-foreground">
                Drag and drop your file here, or browse your device.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <FileAudio data-icon="inline-start" />
              Choose audio file
            </Button>

            <p className="text-xs text-muted-foreground">
              MP3, WAV, M4A, WEBM, OGG, MP4, FLAC or AAC · Max 25 MB
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-none">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <FileAudio
                  className="size-5 text-foreground"
                  aria-hidden="true"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">
                  {selectedFile.name}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeFile}
                disabled={busy}
                aria-label="Remove selected audio file"
              >
                <X aria-hidden="true" />
              </Button>
            </div>

            {previewUrl && (
              <>
                <Separator />

                <audio
                  className="w-full"
                  controls
                  preload="metadata"
                  src={previewUrl}
                >
                  Your browser does not support audio playback.
                </audio>
              </>
            )}

            <Button
              type="button"
              onClick={handleUpload}
              disabled={busy}
              className="w-full"
            >
              {uploading ? (
                <>
                  <LoaderCircle
                    className="animate-spin"
                    data-icon="inline-start"
                  />
                  Uploading and transcribing…
                </>
              ) : (
                <>
                  <Upload data-icon="inline-start" />
                  Upload and transcribe
                </>
              )}
            </Button>

            {uploading && (
              <p
                className="text-center text-xs text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                Processing your audio. This may take a few moments.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {errorMessage && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert role="status" aria-live="polite">
          <CheckCircle2
            className="size-4"
            aria-hidden="true"
          />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}