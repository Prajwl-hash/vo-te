import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import NoteModal from "./components/notes/NoteModal";

function App() {
  const [modalType, setModalType] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleNoteCreated() {
    setModalType(null);
    setRefreshKey((key) => key + 1);
  }

  return (
    <>
      <Dashboard
        key={refreshKey}
        onCreateNote={setModalType}
      />

      {modalType && (
        <NoteModal
          type={modalType}
          onClose={() => setModalType(null)}
          onCreated={handleNoteCreated}
        />
      )}
    </>
  );
}

export default App;