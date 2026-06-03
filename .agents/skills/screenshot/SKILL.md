---
name: screenshot
description: |
  Capture a screenshot of the current screen on the paired Board device. Use when the user asks to screenshot, grab a screen capture, or see what's on the device.
  It may also aid in debugging when needed.
---

# Screenshot

## Confirming device compatibility

```sh
board-connect capabilities
```

## Screenshotting

Grabs a screenshot of the current screen on the paired Board device.

```bash
board-connect screenshot --out shot.png
```

Output defaults to `shot.png` in the working directory. If the user specifies a different filename or path, use that instead.
