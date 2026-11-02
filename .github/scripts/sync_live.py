#!/usr/bin/env python3
"""Write the public live snapshot and keep every copy in step.

Visitors never call api.github.com. The page still reads live-data/live.json
through the raw.githubusercontent.com mirror list. This script also refreshes
docs/live.json and the FALLBACK block in docs/app.js so a failed fetch cannot
surface an older version than the one just published.

Only whitelisted fields are emitted. Site names, page URLs, proxies, activation
material and notification credentials are never read into the snapshot.
The release APK is the one exception: its GitHub download URL is public.
"""

from __future__ import annotations

import datetime
import json
import os
import pathlib
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]
CONFIG = ROOT / "app" / "src" / "main" / "assets" / "app_config.json"
OUT = pathlib.Path("/tmp/live.json")
DOCS_JSON = ROOT / "docs" / "live.json"
DOCS_JS = ROOT / "docs" / "app.js"
START = "// sync:fallback:start\n"
END = "// sync:fallback:end\n"


def latest_release() -> dict | None:
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    if not repo:
        return None
    try:
        raw = subprocess.check_output(
            ["gh", "api", f"repos/{repo}/releases/latest"],
            text=True,
            stderr=subprocess.DEVNULL,
        )
    except (subprocess.CalledProcessError, FileNotFoundError):
        return None
    data = json.loads(raw)
    url = data.get("html_url") or ""
    name = data.get("name") or data.get("tag_name") or ""
    if not url or not name:
        return None
    download = ""
    for asset in data.get("assets") or []:
        asset_name = str(asset.get("name") or "")
        if asset_name.lower().endswith(".apk"):
            download = asset.get("browser_download_url") or ""
            break
    return {
        "name": name,
        "tag": data.get("tag_name") or "",
        "body": (data.get("body") or "").strip(),
        "publishedAt": data.get("published_at") or "",
        "url": url,
        "downloadUrl": download,
    }


def signature(snap: dict) -> tuple:
    release = snap.get("release") or {}
    return (
        snap.get("appName"),
        snap.get("versionName"),
        snap.get("sitesEnabled"),
        release.get("tag"),
        release.get("name"),
        release.get("body"),
        release.get("publishedAt"),
        release.get("url"),
        release.get("downloadUrl") or "",
    )


def load_json(path: pathlib.Path) -> dict | None:
    if not path.is_file():
        return None
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None
    return data if isinstance(data, dict) else None


def patch_fallback(path: pathlib.Path, snap: dict) -> None:
    text = path.read_text(encoding="utf-8")
    if START not in text or END not in text:
        raise SystemExit(f"fallback markers missing in {path}")
    block = START + "const FALLBACK = " + json.dumps(snap, ensure_ascii=False, indent=2) + ";\n" + END
    pre, rest = text.split(START, 1)
    _, post = rest.split(END, 1)
    path.write_text(pre + block + post, encoding="utf-8")


def main() -> None:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    sites = (cfg.get("multiWebConfig") or {}).get("sites") or []
    enabled = sum(1 for site in sites if site.get("enabled", True))
    repo = os.environ.get("GITHUB_REPOSITORY", "Lenoxlkz/Mortal-Reader-App")
    snap = {
        "schema": 1,
        "appName": cfg.get("appName") or "Mortal Reader",
        "versionName": str(cfg.get("versionName") or ""),
        "sitesEnabled": enabled,
        "updatedAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "commit": (os.environ.get("GITHUB_SHA") or "")[:7],
        "release": latest_release(),
        "repo": f"https://github.com/{repo}",
    }
    previous = load_json(DOCS_JSON)
    if previous and signature(previous) == signature(snap):
        snap["updatedAt"] = previous.get("updatedAt") or snap["updatedAt"]
        snap["commit"] = previous.get("commit") or snap["commit"]
    text = json.dumps(snap, ensure_ascii=False, indent=2) + "\n"
    OUT.write_text(text, encoding="utf-8")
    DOCS_JSON.parent.mkdir(parents=True, exist_ok=True)
    DOCS_JSON.write_text(text, encoding="utf-8")
    if DOCS_JS.is_file():
        patch_fallback(DOCS_JS, snap)
    print(json.dumps({
        "versionName": snap["versionName"],
        "sitesEnabled": enabled,
        "commit": snap["commit"],
        "download": bool((snap.get("release") or {}).get("downloadUrl")),
    }))


if __name__ == "__main__":
    main()
