from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os
import urllib.parse

app = FastAPI()

# ✅ Your frontend domain
ALLOWED_ORIGINS = [
    "https://irrakids-gallery.onrender.com"
]

# ✅ Correct public R2.dev bucket domain (from Cloudflare > Bucket Settings)
PUBLIC_R2_URL = "https://pub-aadd8a1590004fc1b5e24e48b4f0a.r2.dev"

# ✅ CORS setup so frontend can fetch from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/r2-images")
def list_r2_images():
    access_key = os.getenv("R2_ACCESS_KEY")
    secret_key = os.getenv("R2_SECRET_KEY")
    endpoint = os.getenv("R2_ENDPOINT")
    bucket = os.getenv("R2_BUCKET")

    s3 = boto3.client(
        "s3",
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key
    )

    image_urls = []
    response = s3.list_objects_v2(Bucket=bucket)

    for obj in response.get("Contents", []):
        key = obj["Key"]
        if key.lower().endswith((".jpg", ".jpeg", ".png")):
            # ✅ Encode path and use public R2.dev domain
            url = f"{PUBLIC_R2_URL}/{urllib.parse.quote(key)}"
            image_urls.append(url)

    return image_urls
