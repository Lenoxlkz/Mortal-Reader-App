#!/usr/bin/env python3
"""Write a public live.json for GitHub Pages.

Visitors never call api.github.com. A scheduled (and push-triggered) job
publishes this file on the orphan branch `live-data`, and the page races
raw.githubusercontent.com plus public mirrors.

Only whitelisted fields are emitted. Site names, URLs, proxies, activation
material and notification credentials are never read into the snapshot.
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
    return {
        "name": name,
        "tag": data.get("tag_name") or "",
        "body": (data.get("body") or "").strip(),
        "publishedAt": data.get("published_at") or "",
        "url": url,
    }


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
    OUT.write_text(json.dumps(snap, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"versionName": snap["versionName"], "sitesEnabled": enabled, "commit": snap["commit"]}))


if __name__ == "__main__":
    main()
