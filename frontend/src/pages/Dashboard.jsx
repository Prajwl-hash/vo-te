
import { useEffect, useState } from "react";
import { getNotes } from "../services/api";
import "./Dashboard.css";



export default function Dashboard({ onCreateNote }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);

  useEffect(() => {
    function handleHashChange() {
      if (window.location.hash === "#voice-note") {
        window.location.hash = "voice-note";
      }
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    async function loadNotes() {
      try {
        const data = await getNotes();
        setNotes(Array.isArray(data) ? data : data.notes || []);
      } catch (err) {
        setError(err.message || "Could not load your notes.");
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, []);

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <a className="brand" href="/" aria-label="VO-TE home">
          <span className="brand-icon">v.</span>
          <span>vo-te</span>
        </a>

        <button
          type="button"
          className="add-button"
          aria-label="Create a note"
          aria-expanded={showCreateMenu}
          onClick={() => setShowCreateMenu((open) => !open)}
        >
          +
        </button>

        {showCreateMenu && (
          <div className="create-menu">
            <button
              type="button"
              // Typed Note
              onClick={() => {
                setShowCreateMenu(false);
                onCreateNote("typed");
              }}
            >
              <span>✎</span>
              <span>
                <strong>Typed Note</strong>
                <small>Write and save manually</small>
              </span>
            </button>

            <button
              type="button"
              // Voice Note
              onClick={() => {
                setShowCreateMenu(false);
                onCreateNote("voice");
              }}
            >
              <span>♬</span>
              <span>
                <strong>Voice Note</strong>
                <small>Record and transcribe audio</small>
              </span>
            </button>
          </div>
        )}
      </header>

      <section className="dashboard-heading">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>All Notes</h1>
        <p>Your thoughts, organized in one place.</p>
      </section>

      {loading && <p role="status">Loading your notes…</p>}

      {error && <p className="dashboard-error" role="alert">{error}</p>}

      {!loading && !error && notes.length === 0 && (
        <section className="empty-state">
          <div className="empty-icon">✎</div>
          <h2>Your space is ready</h2>
          <p>Create your first note using the plus button above.</p>
        </section>
      )}

      {!loading && notes.length > 0 && (
        <section className="notes-grid" aria-label="Your notes">
          {notes.map((note) => (
            <div className="note-card">
            <article className="note-card" key={note.id}>
              <div className="note-card-top">
                <span className="note-type-icon">
                  {note.filename ? "♬" : "✎"}
                </span>
                <span className="note-type">
                  {note.filename ? "Voice" : "Text"}
                </span>
              </div>

              <h2>{note.title || "Untitled note"}</h2>

              <p className="note-content">
                {note.transcript || note.content || "No content yet."}
              </p>

              {note.created_at && (
                <time dateTime={note.created_at}>
                  {new Date(note.created_at).toLocaleDateString()}
                </time>
              )}
            </article>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
