
const API_BASE_URL = "http://127.0.0.1:8000";


export async function uploadRecording(audioBlob, filename) {
  const formData = new FormData();
  formData.append("file", audioBlob, filename || "recording.webm");

  const response = await fetch(`${API_BASE_URL}/audio/upload`, {
    method: "POST",
    body: formData,
  })
  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Upload and transcription failed."
    );
  }

  return data;
}


export async function getNotes() {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/notes`);
  } catch {
    throw new Error("Could not connect to the backend.");
  }

  if (!response.ok) {
    throw new Error("Could not load your notes.");
  }

  return response.json();
}

export async function createNote(title, content) {
  const response = await fetch("http://127.0.0.1:8000/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, content }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Could not save the note.");
  }

  return data;
}