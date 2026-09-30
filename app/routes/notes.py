from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.model import Note
from app.schemas import NotesCreate,NotesUpdate

router = APIRouter()


@router.post("/notes")
def create_note(note: NotesCreate, db: Session = Depends(get_db)):
    new_note = Note(
        title=note.title,
        content=note.content
    )

    db.add(new_note)
    db.commit()
    db.refresh(new_note)

    return new_note

@router.get("/notes/{note_id}")
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        return {"message": "Note not found"}

    return note


@router.put("/notes/{note_id}")
def update_note(
    note_id: int,
    note_data: NotesUpdate,
    db: Session = Depends(get_db)
):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        return {"message": "Note not found"}

    note.title = note_data.title
    note.content = note_data.content

    db.commit()
    db.refresh(note)

    return note

@router.delete("/notes/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()

    if not note:
        return {"message": "Note not found"}

    db.delete(note)
    db.commit()

    return {"message": "Note deleted successfully"}