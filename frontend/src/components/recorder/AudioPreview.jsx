
export default function AudioPreview({
  audioUrl,
  audioBlob,
  uploading,
  onUpload,
}) {
  if (!audioUrl || !audioBlob) {
    return null;
  }

  return (
    <section className="preview" aria-labelledby="audio-preview-heading">
      <h2 id="audio-preview-heading">Audio Preview</h2>

      <audio controls preload="metadata" src={audioUrl}>
        Your browser does not support audio playback.
      </audio>

      <button
        type="button"
        className="record-button"
        onClick={onUpload}
        disabled={uploading}
      >
        {uploading ? "Uploading & Transcribing…" : "Upload & Transcribe"}
      </button>

      <p className="file-info">
        {(audioBlob.size / 1024).toFixed(1)} KB · Ready to upload
      </p>
    </section>
  );
}
