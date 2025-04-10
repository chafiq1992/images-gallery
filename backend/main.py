from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import boto3
import os

app = FastAPI()

# ✅ Set this to your actual frontend Render domain
ALLOWED_ORIGINS = [
    "https://irrakids-gallery.onrender.com"
]

# ✅ Your public R2.dev URL (after clicking 'Allow Access' in Cloudflare)
PUBLIC_R2_URL = "https://irrakids-stock.8014bc60546828ccb2bfdfe29a21d6f2.r2.dev"

# Enable CORS so the frontend can fetch from the backend
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
            # ✅ Serve image via public R2.dev URL
            url = f"{PUBLIC_R2_URL}/{key}"
            image_urls.append(url)

    return image_urls
