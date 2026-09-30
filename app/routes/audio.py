import uuid

from fastapi import APIRouter, UploadFile, File

from app.supabase_client import supabase

router = APIRouter()


@router.post("/audio/upload")
async def upload_audio(file: UploadFile = File(...)):
    file_content = await file.read()

    extension = file.filename.split(".")[-1]
    unique_filename = f"{uuid.uuid4()}.{extension}"

    file_path = f"audio/{unique_filename}"

    supabase.storage.from_("audio").upload(
        file_path,
        file_content,
        {
            "content-type": file.content_type
        }
    )

    return {
        "message": "Audio uploaded successfully",
        "filename": unique_filename,
        "path": file_path
    }