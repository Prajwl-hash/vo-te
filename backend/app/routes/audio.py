
import os
import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.model import Note
from app.supabase_client import supabase
from app.services.transcription import transcribe_audio
from app.services.ai_service import generate_title

router = APIRouter(prefix="/audio")


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    step = "read upload"
    temp_path = None

    try:
        file_content = await file.read()

        if not file_content:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        extension = Path(file.filename or "").suffix.lstrip(".") or "audio"
        unique_filename = f"{uuid.uuid4()}.{extension}"

        # Use the same object path for upload and download.
        storage_path = unique_filename

        step = "Supabase upload"
        supabase.storage.from_("audio").upload(
            storage_path,
            file_content,
            {
                "content-type": file.content_type
                or "application/octet-stream"
            },
        )

        step = "Supabase download"
        audio_data = supabase.storage.from_("audio").download(storage_path)

        step = "write temporary file"
        temp_path = f"temp_{unique_filename}"

        with open(temp_path, "wb") as temp_file:
            temp_file.write(audio_data)

        step = "transcription"
        transcript = transcribe_audio(temp_path)

        step = "title generation"
        title = generate_title(transcript)

        step = "database save"
        note = Note(
            title=title,
            content=transcript,
            filename=unique_filename,
            transcript=transcript,
        )

        db.add(note)
        db.commit()
        db.refresh(note)

        return {
            "message": "Voice note created successfully",
            "note_id": note.id,
            "filename": unique_filename,
            "title": title,
            "transcript": transcript,
        }

    except HTTPException:
        raise

    except Exception as e:
        db.rollback()
        print(f"Voice upload failed at '{step}': {e!r}")

        raise HTTPException(
            status_code=500,
            detail=f"Failed at {step}: {e}",
        ) from e

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()
