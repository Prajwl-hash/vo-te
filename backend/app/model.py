from sqlalchemy import Column, BigInteger, String, Text, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Note(Base):
    __tablename__ = "notes"

    id = Column(BigInteger, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)

    # Voice-to-notes fields
    filename = Column(String(255), nullable=True)
    transcript = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )