#!/usr/bin/env python3
"""
VNTEX Bloodstream Universal yt-dlp Extractor Bridge (Port 5055)
- Extracts ANY YouTube link (Reaction videos, Shorts, Livestreams, Podcasts, Music)
- Includes Access-Control-Allow-Private-Network: true so https://djavent3.github.io can call localhost!
"""
from http.server import BaseHTTPRequestHandler, HTTPServer
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs
import subprocess
import tempfile
import shutil
import sys
import os

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class BloodstreamBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self.send_response(200)
            self._send_cors()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"ok":true}')
            return

        if parsed.path == "/stream":
            qs = parse_qs(parsed.query)
            url = (qs.get("url") or [""])[0].split("&list=")[0]
            fmt = (qs.get("format") or ["mp3"])[0].lower()
            if fmt not in ("mp3", "wav", "flac", "m4a"):
                fmt = "mp3"

            if not url:
                self.send_response(400)
                self._send_cors()
                self.end_headers()
                return

            with tempfile.TemporaryDirectory() as tmpdir:
                out_tmpl = os.path.join(tmpdir, "audio.%(ext)s")
                ytdlp_bin = shutil.which("yt-dlp")
                base_cmd = [ytdlp_bin] if ytdlp_bin else [sys.executable, "-m", "yt_dlp"]

                if shutil.which("ffmpeg"):
                    cmd = base_cmd + ["--no-playlist", "-f", "bestaudio/best", "-x", "--audio-format", fmt, "--audio-quality", "0", "-o", out_tmpl, url]
                else:
                    cmd = base_cmd + ["--no-playlist", "-f", "bestaudio[ext=m4a]/bestaudio/best", "-o", out_tmpl, url]

                subprocess.run(cmd, check=False)
                files = [os.path.join(tmpdir, f) for f in os.listdir(tmpdir) if not f.endswith(".part")]
                if not files:
                    self.send_response(500)
                    self._send_cors()
                    self.end_headers()
                    return

                with open(files[0], "rb") as f:
                    data = f.read()

                self.send_response(200)
                self._send_cors()
                self.send_header("Content-Type", "audio/mpeg" if fmt == "mp3" else "application/octet-stream")
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return

if __name__ == "__main__":
    print("🩸 VNTEX Bloodstream Universal yt-dlp Extractor active on http://127.0.0.1:5055")
    ThreadedHTTPServer(("127.0.0.1", 5055), BloodstreamBridgeHandler).serve_forever()
