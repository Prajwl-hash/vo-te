from faster_whisper import WhisperModel

model = WhisperModel(
    "tiny",
    device="cpu",
    compute_type="int8"
)


import traceback


def transcribe_audio(audio_path: str) -> str:
    try:
        segments, info = model.transcribe(audio_path)
        transcript = " ".join(
            segment.text.strip()
            for segment in segments
        )
        return transcript.strip()
    except Exception:
        traceback.print_exc()
        raise