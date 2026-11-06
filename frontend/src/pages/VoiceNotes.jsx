
import { useState } from "react";
import useAudioRecorder from "../hooks/useAudioRecorder";
import { uploadRecording } from "../services/api";
import "./VoiceNotes.css";

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function VoiceNote() {
  const {
    recording,
    audioUrl,
    audioBlob,
    elapsed,
    error,
    setError,
    startRecording,
    stopRecording,
  } = useAudioRecorder();

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    console.log("External file selected:", file);

    if (!file) return;


    const allowedExtensions =
      /\.(mp3|wav|m4a|webm|ogg|mp4|mpeg|mpga|flac)$/i;

    if (!allowedExtensions.test(file.name)) {
      setError("Choose a supported audio file.");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setFileUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return URL.createObjectURL(file);
    });

    setSelectedFile(file);
  }


  async function handleUpload(blob, filename) {
    if (!blob || uploading) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const data = await uploadRecording(
        blob,
        filename || blob.name || "recording.webm"
      );

      setResult(data);
      setSelectedFile(null);
    } catch (err) {
      console.error("Audio upload error:", err);
      setError(err.message || "Upload and transcription failed.");
    } finally {
      setUploading(false);
    }
  }


  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
  }

  return (
    <main className="voice-page">
      <header className="voice-header">
        <a href="/" className="voice-back">← All Notes</a>
        <span className="voice-brand">vo-te</span>
      </header>

      <section className="voice-card">
        <p className="voice-eyebrow">VOICE NOTE</p>
        <h1>Capture your thoughts.</h1>
        <p className="voice-description">
          Record your voice or upload an existing audio file to create a note.
        </p>

        <div className="voice-status" aria-live="polite">
          <span className={recording ? "status-dot recording" : "status-dot"} />
          {recording ? "Recording in progress" : "Ready to record"}
        </div>

        <div className="voice-timer" aria-live="off">
          {formatTime(elapsed)}
        </div>

        <div className="voice-actions">
          {!recording ? (
            <button
              type="button"
              className="voice-primary"
              onClick={startRecording}
              disabled={uploading}
            >
              <span aria-hidden="true">●</span>
              {audioBlob ? "Record Again" : "Start Recording"}
            </button>
          ) : (
            <button
              type="button"
              className="voice-stop"
              onClick={stopRecording}
              disabled={uploading}
            >
              <span aria-hidden="true">■</span>
              Stop Recording
            </button>
          )}
        </div>

        {audioUrl && audioBlob && (
          <section className="voice-preview">
            <h2>Recording Preview</h2>
            <audio controls src={audioUrl}>
              Your browser does not support audio playback.
            </audio>
            <p className="voice-file-info">
              {(audioBlob.size / 1024).toFixed(1)} KB · {audioBlob.type || "Audio"}
            </p>
            <button
              type="button"
              className="voice-primary upload-button"
              onClick={() =>
                handleUpload(
                  audioBlob,
                  `recording.${audioBlob.type.includes("webm") ? "webm" : "audio"}`
                )
              }
              disabled={uploading || recording}
            >
              {uploading ? "Uploading & transcribing…" : "Upload & Transcribe"}
            </button>
          </section>
        )}

        <div className="audio-divider">
          <span>OR UPLOAD AN AUDIO FILE</span>
        </div>


        <section className="file-upload-section">
          <label htmlFor="audio-file" className="file-picker">
            <span className="file-picker-icon" aria-hidden="true">↑</span>
            <strong>Choose an audio file</strong>
            <span>MP3, WAV, M4A, WEBM, OGG, MP4, or FLAC</span>
            <span>Maximum size: 25 MB</span>
          </label>

          <input
            id="audio-file"
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.ogg,.mp4,.mpeg,.mpga,.flac,audio/*"
            onChange={handleFileChange}
            disabled={uploading || recording}
          />

          {selectedFile && (
            <div className="voice-preview">
              <h2>Selected External Audio</h2>
              <p className="voice-file-info">{selectedFile.name}</p>
              <p className="voice-file-info">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>

              <audio controls src={fileUrl}>
                Your browser does not support audio playback.
              </audio>

              <button
                type="button"
                className="voice-primary upload-button"
                onClick={() =>
                  handleUpload(selectedFile, selectedFile.name)
                }
                disabled={uploading || recording || !selectedFile}
              >
                {uploading
                  ? "Transcribing external file…"
                  : "Transcribe External File"}
              </button>
            </div>
          )}
        </section>


        {error && <p className="voice-error" role="alert">{error}</p>}

        {result && (
          <section className="voice-result" aria-live="polite">
            <p className="voice-eyebrow">NOTE CREATED</p>
            <h2>{result.title || "Voice Note"}</h2>
            <p className="transcript">
              {result.transcript || result.content || "No transcript returned."}
            </p>
            {result.note_id && (
              <p className="voice-file-info">Note ID: {result.note_id}</p>
            )}
            <a href="/" className="voice-back">Return to All Notes →</a>
          </section>
        )}
      </section>
    </main>
  );
}
