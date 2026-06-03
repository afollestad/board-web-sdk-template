---
name: deploy
description: |
  Install the packed .webapp.zip onto the paired Board device and launch it. Use when the user asks to deploy, install, or push to the device.
---

# Deploy

## Preview in a browser

To preview the app in the local machine's browser:

```sh
npm run dev
```

Use the `Local:` URL printed by Vite for browser QA. For the default command
above this is usually `http://localhost:5173/`. Do not add `--host 127.0.0.1`
unless you specifically need that host binding; it changes the printed URL and
can make local-browser verification diverge from the normal dev loop.

If browser automation fails after a previous blocked or failed navigation, open
a fresh browser tab and retry the exact Vite `Local:` URL before concluding
browser QA is blocked.

## Installing on a Board device

### Confirming device compatibility

```sh
board-connect capabilities
```

### Pairing (one-time setup)

If the device isn't paired yet:

```bash
board-connect pair <host>
```

The user must tap "Approve" on the device. After pairing, no address is needed for future commands.

### Get the appId

Read `board.config.json` to get the `appId`.

```bash
cat board.config.json
```

### Install and launch

```bash
board-connect install <appId>.webapp.zip --launch
```

### First install note

On a cold device, the in-device browser host may report "host unavailable". If that happens, foreground the Board Browser on the device once to wake it, then retry. Subsequent installs work without this step.
