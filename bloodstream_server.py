#!/usr/bin/env python3
"""
VNTEX Silent Background Accelerator (Port 5055)
- Zero restrictive -f flags so yt-dlp never throws 'requested format not available'
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

class SilentExtractorHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=VNTEX_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

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
            payload = b'{"ok":true}'
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
                self.send_response(400)
                self.end_headers()
                return

            with tempfile.TemporaryDirectory() as tmpdir:
                out_tmpl = os.path.join(tmpdir, "track.%(ext)s")
                ff_loc = get_ffmpeg_location()

                # Try clean default extraction without -f format restrictions first
                attempts = [
                    [
                        sys.executable, "-m", "yt_dlp",
                        "--no-playlist", "--no-check-certificate", "--geo-bypass",
                        "-x", "--audio-format", fmt, "--audio-quality", "0",
                        "-o", out_tmpl
                    ],
                    [
                        sys.executable, "-m", "yt_dlp",
                        "--no-playlist", "--no-check-certificate", "--geo-bypass",
                        "--extractor-args", "youtube:player_client=android,web",
                        "-o", out_tmpl
                    ]
                ]

                files = []
                for base_cmd in attempts:
                    cmd = list(base_cmd)
                    if ff_loc:
                        cmd += ["--ffmpeg-location", ff_loc]
                    cmd.append(raw_url)
                    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                    files = [
                        os.path.join(tmpdir, f)
                        for f in os.listdir(tmpdir)
                        if not f.endswith(".part") and not f.endswith(".ytdl")
                    ]
                    if files:
                        break

                if not files:
                    self.send_response(500)
                    self.end_headers()
                    return

                target_file = files[0]
                ext = os.path.splitext(target_file)[1].lower().lstrip(".")
                with open(target_file, "rb") as f:
                    data = f.read()

                mime = "audio/mpeg" if ext == "mp3" else ("audio/mp4" if ext == "m4a" else "application/octet-stream")
                self.send_response(200)
                self.send_header("Content-Type", mime)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

        return super().do_GET()

if __name__ == "__main__":
    ThreadedHTTPServer(("127.0.0.1", 5055), SilentExtractorHandler).serve_forever()
