
export default function UploadStatus({ uploading, error, result }) {
  return (
    <>
      {uploading && (
        <p className="upload-status" role="status" aria-live="polite">
          Uploading your recording and generating the transcript…
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {result && (
        <section className="preview" aria-labelledby="result-heading">
          <h2 id="result-heading">
            {result.title || "Voice Note Created"}
          </h2>

          <p className="transcript">{result.transcript}</p>

          <p className="file-info">
            Note ID: {result.note_id}
          </p>
        </section>
      )}
    </>
  );
}
