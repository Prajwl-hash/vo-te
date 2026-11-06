import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SECRET_KEY")  # use your rotated key

if not url or not key:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SECRET_KEY")

supabase: Client = create_client(url, key)
print("Supabase project:", url.split("//", 1)[-1].split(".", 1)[0])
print("Supabase client type:", type(supabase).__name__)
try:
    buckets = supabase.storage.list_buckets()
    print("Buckets visible to backend:", [bucket.name for bucket in buckets])
except Exception as e:
    print("Could not list buckets:", repr(e))
