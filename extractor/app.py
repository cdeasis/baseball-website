from fastapi import FastAPI
from pydantic import BaseModel
import httpx, trafilatura, json


app = FastAPI()

class ExtractReq(BaseModel):
    url: str

@app.post("/extract")
async def extract(req: ExtractReq):
    headers = {"User-Agent": "YourSiteBot/1.0; contact@example.com"}
    async with httpx.AsyncClient(timeout=15.0, headers=headers, follow_redirects=True) as client:
        resp = await client.get(req.url)
        html = resp.text
    
    data_json = trafilatura.extract(html, output="json", include_images=True, with_metadata=True)
    if not data_json:
        return {"text": "", "title": "", "byline": "", "lead_image": "", "canonical_url": req.url}
    
    data = json.loads(data_json)
    lead_image = None
    if isinstance(data.get("images"), list) and data["images"]:
        lead_image = data["images"][0]
    elif data.get("image"):
        lead_image = data["image"]

    return {
        "text": data.get("text") or "",
        "title": data.get("title") or "",
        "byline": data.get("author") or "",
        "lead_image": lead_image,
        "canonical_url": data.get("url") or req.url
    }