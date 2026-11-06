
import { useState } from "react";

import { createNote, uploadRecording } from "../../services/api";
import useAudioRecorder from "../../hooks/useAudioRecorder";
import ExternalAudioUpload from "./ExternalUpload";
import "./NoteModal.css";

export default function NoteModal({ type, onClose, onCreated }) {
    const isVoice = type === "voice";

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const {
        recording,
        audioUrl,
        audioBlob,
        elapsed,
        error,
        setError,
        startRecording,
        stopRecording,
        resetRecording,
    } = useAudioRecorder();

    async function handleTypedSave(event) {
        event.preventDefault();
        setErrorMessage("");
        setSaving(true);

        try {
            await createNote(title.trim(), content.trim());
            await onCreated();
            handleClose();
        } catch (err) {
            setErrorMessage(err.message || "Could not save the note.");
        } finally {
            setSaving(false);
        }
    }

    async function handleVoiceSave() {
        if (!audioBlob || saving) return;

        setErrorMessage("");
        setSuccessMessage("");
        setSaving(true);

        try {
            const result = await uploadRecording(audioBlob);

            setSuccessMessage(
                `Transcription complete${result?.title ? `: ${result.title}` : "!"}`
            );

            await onCreated();
        } catch (err) {
            setErrorMessage(err.message || "Upload and transcription failed.");
        } finally {
            setSaving(false);
        }
    }

    function handleClose() {
        if (recording || saving) return;
        resetRecording();
        onClose();
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    }

    return (
        <div className="note-modal-overlay" onMouseDown={handleClose}>
            <section
                className={`note-modal ${isVoice ? "note-modal-voice" : ""}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="note-modal-title"
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="note-modal-header">
                    <div>
                        <p className="note-modal-eyebrow">
                            {isVoice ? "VOICE CAPTURE" : "QUICK CAPTURE"}
                        </p>

                        <h2 id="note-modal-title">
                            {isVoice ? "Voice note" : "Typed note"}
                        </h2>

                        <p className="note-modal-description">
                            {isVoice
                                ? "Record your thoughts or upload an existing recording."
                                : "Capture your thoughts before you forget them."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="note-modal-close"
                        onClick={handleClose}
                        disabled={recording || saving}
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {isVoice ? (
                    <>
                        <div className="voice-note-columns">
                            {/* Left column: recorder */}
                            <section className="voice-panel">
                                <p className="voice-panel-label">RECORD A NEW NOTE</p>

                                <div className="recording-display">
                                    <div
                                        className={`recording-indicator ${recording ? "active" : ""
                                            }`}
                                    >
                                        <span />
                                    </div>

                                    <strong>{formatTime(elapsed)}</strong>

                                    <p>
                                        {recording
                                            ? "Recording in progress"
                                            : audioBlob
                                                ? "Recording ready"
                                                : "Ready when you are"}
                                    </p>
                                </div>

                                {!audioBlob && !recording && (
                                    <button
                                        type="button"
                                        className="note-modal-primary"
                                        onClick={async () => {
                                            setErrorMessage("");
                                            setError("");

                                            try {
                                                await startRecording();
                                            } catch (err) {
                                                setErrorMessage(
                                                    err.message || "Could not start recording."
                                                );
                                            }
                                        }}
                                        disabled={saving}
                                    >
                                        Start recording
                                    </button>
                                )}

                                {recording && (
                                    <button
                                        type="button"
                                        className="note-modal-danger"
                                        onClick={stopRecording}
                                        disabled={saving}
                                    >
                                        Stop recording
                                    </button>
                                )}

                                {audioUrl && (
                                    <div className="audio-preview">
                                        <audio controls src={audioUrl}>
                                            Your browser does not support audio playback.
                                        </audio>
                                    </div>
                                )}

                                {(error || errorMessage) && (
                                    <p className="note-modal-error">
                                        {errorMessage || error}
                                    </p>
                                )}

                                {successMessage && (
                                    <p className="note-modal-success">{successMessage}</p>
                                )}

                                {audioBlob && (
                                    <div className="note-modal-actions">
                                        <button
                                            type="button"
                                            className="note-modal-secondary"
                                            onClick={() => {
                                                resetRecording();
                                                setErrorMessage("");
                                                setSuccessMessage("");
                                                setError("");
                                            }}
                                            disabled={saving}
                                        >
                                            Record again
                                        </button>

                                        <button
                                            type="button"
                                            className="note-modal-primary"
                                            onClick={handleVoiceSave}
                                            disabled={saving}
                                        >
                                            {saving ? "Transcribing..." : "Upload & transcribe"}
                                        </button>
                                    </div>
                                )}
                            </section>

                            {/* Right column: existing audio uploader */}
                            <section className="upload-panel">
                                <p className="voice-panel-label">UPLOAD EXISTING AUDIO</p>

                                <ExternalAudioUpload
                                    onCreated={onCreated}
                                    disabled={recording || saving}
                                />
                            </section>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleTypedSave} className="typed-note-form">
                        <label htmlFor="note-title">Title</label>

                        <input
                            id="note-title"
                            type="text"
                            placeholder="Give your note a title"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                            maxLength={200}
                            required
                        />

                        <label htmlFor="note-content">Your note</label>

                        <textarea
                            id="note-content"
                            placeholder="Start writing..."
                            value={content}
                            onChange={(event) => setContent(event.target.value)}
                            rows={7}
                            required
                        />

                        {errorMessage && (
                            <p className="note-modal-error">{errorMessage}</p>
                        )}

                        <div className="note-modal-actions">
                            <button
                                type="button"
                                className="note-modal-secondary"
                                onClick={handleClose}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="note-modal-primary"
                                disabled={saving || !title.trim() || !content.trim()}
                            >
                                {saving ? "Saving..." : "Save note"}
                            </button>
                        </div>
                    </form>
                )}
            </section>
        </div>
    );
}
