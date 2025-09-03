from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx, trafilatura, json, asyncio
from urllib.parse import urlparse

app = FastAPI()

class ExtractReq(BaseModel):
    url: str

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

def is_cbs(url: str) -> bool:
    try:
        return "cbssports.com" in urlparse(url).netloc
    except Exception:
        return False

async def fetch_with_retries_and_amp(url: str, timeout=25.0, max_retries=4):
    """Try main URL with retries:
        if still failing and domain is CBS, try AMP fallback by appending '/amp'
        Returns (html, used_amp, last_status)
    """
    last_status = None
    async with httpx.AsyncClient(
        timeout=timeout, headers=HEADERS, follow_redirects=True, http2=True
    ) as client:
        # main URL retries
        for i in range(max_retries):
            try:
                r = await client.get(url)
                last_status = r.status_code
                if r.status_code < 400 and r.text.strip():
                    return r.text, False, last_status
            except Exception:
                last_status = "exception"
            await asyncio.sleep(0.8 * (i + 1))

        # AMP fallback for CBS
        if is_cbs(url) and "/amp/" not in url:
            amp_url = url.rstrip("/") + "/amp/"
            for i in range(2):
                try:
                    r = await client.get(amp_url)
                    last_status = r.status_code
                    if r.status_code < 400 and r.text.strip():
                        return r.text, True, last_status
                except Exception:
                    last_status = "exception"
                await asyncio.sleep(0.8 * (i + 1))
        
        # alternate CBS AMP query parameter
        if is_cbs(url):
            alt_amp = url.rstrip("/") + "/?output=amp"
            for i in range(2):
                try:
                    r = await client.get(alt_amp)
                    last_status = r.status_code
                    if r.status_code < 400 and r.text.strip():
                        return r.text, True, last_status
                except Exception:
                    last_status = "exception"
                await asyncio.sleep(0.8 * (i + 1))

    # last resort: let trafilatura fetch (some sites work better through it)
    try:
        downloaded = trafilatura.fetch_url(url)
        if downloaded:
            return downloaded, False, last_status
    except Exception:
        pass

    return None, False, last_status

def extract_json_from_html(html: str, url: str):
    # try both trafilatura signatures
    try: 
        return trafilatura.extract(
            html,
            output="json",
            include_images=True,
            with_metadata=True,
            favor_recall=True,
            url=url,
        )
    except TypeError:
        return trafilatura.extract(
            html,
            output_format="json",
            include_images=True,
            with_metadata=True,
            favor_recall=True,
            url=url,
        )

@app.get("/health")
def health():
    return {"ok": True}

@app.post("/extract")
async def extract(req: ExtractReq):
    html, used_amp, last_status = await fetch_with_retries_and_amp(req.url)

    if not html:
        # return actionable error
        detail = {
            "error": "Upstream fetch failed",
            "url": req.url,
            "last_status": last_status,
            "amp_attempted": is_cbs(req.url),
        }
        raise HTTPException(status_code=502, detail=detail)
    
    #1: try extraction from HTML given
    data_json = extract_json_from_html(html, req.url)

    #2: if that fails, last resort: let trafilatura fetch and extract by URL itself
    if not data_json:
        try:
            data_json = trafilatura.extract(
                url=req.url,
                output="json",
                include_images=True,
                with_metadata=True,
                favor_recall=True,
            )
        except TypeError:
            data_json = trafilatura.extract(
                url=req.url,
                output_format="json",
                include_images=True,
                with_metadata=True,
                favor_recall=True,
            )

    if not data_json:
        # no content extracted
        return JSONResponse(
            status_code=204,
            content={"error": "No content could be extracted", "canonical_url": req.url},
        )
    
    # normalize JSON
    try: 
        data = json.loads(data_json)
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Bad JSON from extractor", "detail": str(e)})
    
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
        "amp_used": used_amp,
    }