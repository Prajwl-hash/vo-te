
export default function RecordingControls({
  recording,
  audioBlob,
  elapsed,
  onStart,
  onStop,
}) {
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return (
    <>
      <div
        className={`record-indicator ${recording ? "active" : ""}`}
        role="status"
        aria-live="polite"
      >
        <span aria-hidden="true" />
        {recording ? "Recording in progress" : "Ready to record"}
      </div>

      <div className="timer" aria-label={`Recording duration ${formatTime(elapsed)}`}>
        {formatTime(elapsed)}
      </div>

      <div className="controls">
        {!recording ? (
          <button
            type="button"
            className="record-button"
            onClick={onStart}
          >
            <span className="record-dot" aria-hidden="true" />
            {audioBlob ? "Record Again" : "Start Recording"}
          </button>
        ) : (
          <button
            type="button"
            className="stop-button"
            onClick={onStop}
          >
            <span className="stop-square" aria-hidden="true" />
            Stop Recording
          </button>
        )}
      </div>
    </>
  );
}
