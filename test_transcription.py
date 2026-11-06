from app.services.transcription import transcribe_audio


audio_path = "harvard.wav"

transcript = transcribe_audio(audio_path)

print("\n--- TRANSCRIPT ---")
print(transcript)