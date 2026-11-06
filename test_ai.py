from app.services.ai_service import generate_title

transcript = """
I need to finish the backend API, test the PostgreSQL
connection and deploy the project this week.
"""

title = generate_title(transcript)

print("Generated title:", title)