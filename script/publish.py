#!/usr/bin/env python3
"""Builds the frontend bundle, syncs component and cards to HA host, and registers dashboard resource.

The resource is versioned with a hash of its contents: without that HA keeps
serving the cached old file and the update never reaches the browser.
"""
import asyncio
import hashlib
import json
import os
import pathlib
import subprocess
import sys

import websockets

ROOT = pathlib.Path(__file__).resolve().parent.parent
BUNDLE = ROOT / "dist" / "ha-smart-charging-card.js"
CUSTOM_COMP = ROOT / "custom_components" / "smart_charger"
SSH_HOST = os.environ.get("HA_SSH_HOST", "server-home")
REMOTE_CONFIG = os.environ.get(
    "HA_CONFIG", "/home/grigorii/.local/state/podman/homeassistant/config"
)
REMOTE_WWW = f"{REMOTE_CONFIG}/www"
REMOTE_COMP = f"{REMOTE_CONFIG}/custom_components"


async def update_resource(url: str) -> None:
    ha_url = os.environ.get("HOME_ASSISTANT_URL", "http://192.168.100.200:8123")
    host = ha_url.split("://", 1)[-1].rstrip("/")
    key = os.environ.get("HOME_ASSISTANT_KEY")
    if not key:
        print("HOME_ASSISTANT_KEY not set in environment, skipping WebSocket resource update")
        return

    async with websockets.connect(f"ws://{host}/api/websocket", max_size=None) as ws:
        await ws.recv()
        await ws.send(json.dumps({"type": "auth", "access_token": key}))
        auth_res = json.loads(await ws.recv())
        if auth_res.get("type") != "auth_ok":
            sys.exit(f"authentication failed: {auth_res}")

        counter = [0]

        async def call(payload: dict) -> dict:
            counter[0] += 1
            payload["id"] = counter[0]
            await ws.send(json.dumps(payload))
            while True:
                res = json.loads(await ws.recv())
                if res.get("id") == counter[0] and res.get("type") == "result":
                    return res

        items = (await call({"type": "lovelace/resources"}))["result"]
        ours = [r for r in items if BUNDLE.name in r["url"]]
        if ours:
            await call(
                {
                    "type": "lovelace/resources/update",
                    "resource_id": ours[0]["id"],
                    "res_type": "module",
                    "url": url,
                }
            )
            print("resource updated:", url)
        else:
            await call(
                {"type": "lovelace/resources/create", "res_type": "module", "url": url}
            )
            print("resource created:", url)


def main() -> None:
    print("1. Building frontend card bundle...")
    subprocess.run(
        ["npm", "--prefix", str(ROOT / "cards"), "run", "build"], check=True
    )

    version = hashlib.sha256(BUNDLE.read_bytes()).hexdigest()[:8]
    print("version:", version)

    print(f"2. Copying bundle to {SSH_HOST}:{REMOTE_WWW}/{BUNDLE.name}...")
    subprocess.run(
        ["scp", "-o", "BatchMode=yes", str(BUNDLE), f"{SSH_HOST}:{REMOTE_WWW}/{BUNDLE.name}"],
        check=True,
    )

    print(f"3. Syncing custom_components/smart_charger to {SSH_HOST}:{REMOTE_COMP}...")
    subprocess.run(
        ["rsync", "-avz", "--delete", f"{CUSTOM_COMP}/", f"{SSH_HOST}:{REMOTE_COMP}/smart_charger/"],
        check=True,
    )

    print("4. Updating Lovelace resource via WebSocket...")
    asyncio.run(update_resource(f"/local/{BUNDLE.name}?v={version}"))
    print("Done! Reload your dashboard tab.")


if __name__ == "__main__":
    main()
