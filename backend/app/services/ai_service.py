import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def generate_title(transcript: str) -> str:
    prompt = f"""
Generate a short, clear title for the following voice note.

Rules:
- Maximum 8 words
- No quotation marks
- Return only the title
- Do not add explanations

Voice note:
{transcript}
"""

    response = client.models.generate_content(
        model="gemini-3.5-flash-lite",
        contents=prompt
    )

    return response.text.strip()