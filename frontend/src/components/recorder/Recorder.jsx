
import { useState } from "react";
import useAudioRecorder from "../../hooks/useAudioRecorder";
import { uploadRecording } from "../../services/api";

export default function Recorder() {
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

  async function handleUpload() {
    if (!audioBlob || uploading) return;

    setUploading(true);
    setError("");
    setResult(null);

    try {
      const data = await uploadRecording(audioBlob);
      setResult(data);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <section style={{ padding: "30px" }}>
      <h1>VO-TE Recorder</h1>

      <p>Status: {recording ? "Recording" : "Ready"}</p>
      <p>Duration: {elapsed} seconds</p>

      {!recording ? (
        <button onClick={startRecording}>Start Recording</button>
      ) : (
        <button onClick={stopRecording}>Stop Recording</button>
      )}


      {audioUrl && audioBlob && (
        <section>
          <h2>Audio Preview</h2>

          <audio controls src={audioUrl} />

          <p>File size: {(audioBlob.size / 1024).toFixed(1)} KB</p>
          <p>Audio format: {audioBlob.type || "Unknown"}</p>

          <button onClick={handleUpload} disabled={uploading}>
            {uploading ? "Uploading…" : "Upload & Transcribe"}
          </button>
        </section>
      )}


      {error && <p role="alert">{error}</p>}

      {result && (
        <section>
          <h2>{result.title || "Voice Note Created"}</h2>
          <p>{result.transcript}</p>
          <p>Note ID: {result.note_id}</p>
        </section>
      )}
    </section>
  );
}
