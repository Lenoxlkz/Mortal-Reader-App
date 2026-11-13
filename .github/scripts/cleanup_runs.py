#!/usr/bin/env python3
"""Trim GitHub Actions history without wiping Sync Live Snapshot.

When the repository has more than 10 workflow runs, keep the 6 newest runs
of any workflow and also the 2 newest "Sync Live Snapshot" runs, even if
those two fall outside the newest six. Everything else that has already
finished is deleted. Runs still queued or in progress are left alone.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys

THRESHOLD = 10
KEEP_NEWEST = 6
KEEP_SYNC = 2
SYNC_NAME = "Sync Live Snapshot"
BUSY = {"queued", "in_progress", "waiting", "pending", "requested", "action_required"}


def gh(path: str, method: str = "GET") -> str:
    result = subprocess.run(
        ["gh", "api", "-X", method, path],
        check=False,
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        raise SystemExit(result.stderr.strip() or f"gh api failed for {path}")
    return result.stdout


def list_runs(repo: str) -> list[dict]:
    runs: list[dict] = []
    page = 1
    while True:
        payload = json.loads(gh(f"repos/{repo}/actions/runs?per_page=100&page={page}"))
        batch = payload.get("workflow_runs") or []
        runs.extend(batch)
        if len(batch) < 100:
            return runs
        page += 1


def main() -> None:
    repo = os.environ.get("GITHUB_REPOSITORY", "Lenoxlkz/Mortal-Reader-App")
    current = os.environ.get("GITHUB_RUN_ID", "")
    runs = list_runs(repo)
    print(json.dumps({"total": len(runs), "threshold": THRESHOLD}))
    if len(runs) <= THRESHOLD:
        print("nothing to delete")
        return

    newest = sorted(runs, key=lambda run: (run.get("created_at") or "", run.get("id") or 0), reverse=True)
    others = [run for run in newest if str(run.get("id")) != str(current)]
    keep = {run["id"] for run in others[:KEEP_NEWEST]}
    syncs = [run for run in others if run.get("name") == SYNC_NAME]
    keep.update(run["id"] for run in syncs[:KEEP_SYNC])
    if current:
        keep.add(int(current))

    deleted = 0
    spared = 0
    for run in newest:
        run_id = run["id"]
        if run_id in keep or run.get("status") in BUSY:
            spared += 1
            continue
        gh(f"repos/{repo}/actions/runs/{run_id}", "DELETE")
        deleted += 1
        print(f"deleted {run_id} {run.get('name')} {run.get('created_at')}")

    print(json.dumps({"deleted": deleted, "kept": spared, "syncReserved": min(KEEP_SYNC, len(syncs))}))


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit(0)
