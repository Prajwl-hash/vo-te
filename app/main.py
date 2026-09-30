from fastapi import FastAPI
from sqlalchemy import text

from app.database import engine
from app.routes.notes import router as notes_router
from app.routes.audio import router as audio_router
from app import model

app = FastAPI()

app.include_router(notes_router)
app.include_router(audio_router)


@app.get("/")
def root():
    return {"message": "Voice-to-note api is running"}

