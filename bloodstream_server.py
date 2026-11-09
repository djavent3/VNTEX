#!/usr/bin/env python3
"""
VNTEX Bloodstream Default Universal Extractor Server (Port 5055)
- Extracts ANY YouTube video (Reaction videos, Shorts, Podcasts, Livestreams, Music)
- Auto-discovers system ffmpeg or Python imageio-ffmpeg binary
- Serves both /health, /stream API AND static VNTEX files at http://localhost:5055
"""
from http.server import SimpleHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs
import subprocess
import tempfile
import shutil
import json
import sys
import os

# Ensure Homebrew & local bin paths are always available even inside macOS LaunchAgent
os.environ["PATH"] = "/opt/homebrew/bin:/usr/local/bin:" + os.environ.get("PATH", "")
VNTEX_DIR = os.path.dirname(os.path.abspath(__file__))

def get_ffmpeg_location():
    sys_ff = shutil.which("ffmpeg")
    if sys_ff:
        return sys_ff
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class BloodstreamUniversalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=VNTEX_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            ff_loc = get_ffmpeg_location()
            payload = json.dumps({"ok": True, "mode": "universal_default", "ffmpeg": bool(ff_loc)}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return

        if parsed.path == "/stream":
            qs = parse_qs(parsed.query)
            raw_url = (qs.get("url") or [""])[0].strip()
            fmt = (qs.get("format") or ["mp3"])[0].lower()
            if fmt not in ("mp3", "wav", "flac", "m4a"):
                fmt = "mp3"

            if not raw_url:
                err = json.dumps({"error": "Missing YouTube URL parameter."}).encode("utf-8")
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(err)
                return

            with tempfile.TemporaryDirectory() as tmpdir:
                out_tmpl = os.path.join(tmpdir, "extract.%(ext)s")
                ff_loc = get_ffmpeg_location()

                cmd = [
                    sys.executable, "-m", "yt_dlp",
                    "--no-playlist",
                    "--no-check-certificate",
                    "--geo-bypass",
                    "--extractor-args", "youtube:player_client=ios,web,mweb",
                    "-f", "bestaudio[ext=m4a]/bestaudio/best",
                    "-o", out_tmpl
                ]

                if ff_loc:
                    cmd += ["--ffmpeg-location", ff_loc, "-x", "--audio-format", fmt, "--audio-quality", "0"]

                cmd.append(raw_url)
                proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

                files = [
                    os.path.join(tmpdir, f)
                    for f in os.listdir(tmpdir)
                    if not f.endswith(".part") and not f.endswith(".ytdl")
                ]

                if not files:
                    err_tail = (proc.stderr or proc.stdout or "yt-dlp failed to extract video.").strip().splitlines()[-1:]
                    err_msg = err_tail[0] if err_tail else "yt-dlp extraction error"
                    payload = json.dumps({"error": err_msg}).encode("utf-8")
                    self.send_response(500)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Content-Length", str(len(payload)))
                    self.end_headers()
                    self.wfile.write(payload)
                    return

                target_file = files[0]
                ext = os.path.splitext(target_file)[1].lower().lstrip(".")
                with open(target_file, "rb") as f:
                    data = f.read()

                mime = "audio/mpeg" if ext == "mp3" else ("audio/mp4" if ext == "m4a" else "application/octet-stream")
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("X-Extracted-Ext", ext)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        return super().do_GET()

if __name__ == "__main__":
    print("🩸 VNTEX Bloodstream Default Universal Extractor running on http://localhost:5055")
    ThreadedHTTPServer(("127.0.0.1", 5055), BloodstreamUniversalHandler).serve_forever()
