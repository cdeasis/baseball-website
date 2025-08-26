from fastapi import FastAPI
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx, trafilatura, json

app = FastAPI()

class ExtractReq(BaseModel):
    url: str

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/extract")
async def extract(req: ExtractReq):
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/124.0.0.0 Safari/537.36"
        ),
        "Accept": ("text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"),
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
    }

    html = None

    #1. try to fetch with httpx (HTTP/2 + redirects)
    try:
        async with httpx.AsyncClient(timeout=20.0, headers=headers, follow_redirects=True, http2=True) as client:
            resp = await client.get(req.url)
            status = resp.status_code
            if status >= 400:
                # return upstream status code
                return JSONResponse(status_code=status, content={"error": f"Upstream fetch failed", "status": status})
            html = resp.text
    except Exception as e:
        #2. if httpx fails (TLS/JS challenges), try trafilatura's own fetch
        try:
            downloaded = trafilatura.fetch_url(req.url)
            if downloaded:
                html = downloaded
        except Exception:
            pass
        if html is None:
            return JSONResponse(status_code=502, content={"error": f"Fetch failed", "detail": 502})
        
    #3. extract using trafilatura
    try:
        data_json = extract_json(html, req.url)
        if not data_json:
            data_json = extract_json(data_json, req.url)
            if data_json:
                # last resort, let trafilatura re-fetch by url
                data_json = trafilatura.extract(
                    data_json,
                    output="json",
                    include_images=True,
                    with_metadata=True,
                    favor_recall=True,
                    url=req.url,
                )
        if not data_json:
            return JSONResponse(status_code=204, content={"error": "No content could be extracted", "canonical_url": req.url})
        
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
            "canonical_url": data.get("url") or req.url,
        }
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "Extraction failed", "detail": str(e)})

def extract_json(html: str, url: str):
    try:
        # newer versions
        return trafilatura.extract(
            html,
            output="json",
            include_images=True,
            with_metadata=True,
            favor_recall=True,
            url=url,
        )
    except TypeError:
        # older versions
        return trafilatura.extract(
            html,
            output_format="json",
            include_images=True,
            with_metadata=True,
            favor_recall=True,
            url=url,
        )