from fastapi import FastAPI
from sqlalchemy import text
from app.database import engine, Base
from app.model import Note
from fastapi.middleware.cors import CORSMiddleware


from app.database import engine
from app.routes.notes import router as notes_router
from app.routes.audio import router as audio_router
from app import model

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Base.metadata.create_all(bind=engine)

app.include_router(notes_router)
app.include_router(audio_router)


@app.get("/")
def root():
    return {"message": "Voice-to-note api is running"}

