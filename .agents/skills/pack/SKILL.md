---
name: pack
description: |
  Pack the built dist/ into a .webapp.zip for device installation. Use when the user asks to pack, package, or bundle the app for deployment.
---

# Pack

Packs `dist/` into a `.webapp.zip` using `web-pack`.

```bash
web-pack dist --package-id <package-id> --name "<name>"
```

- `<package-id>`: reverse-domain identifier, e.g. `fun.board.mygame`
- `<name>`: display name, e.g. `"My Game"`

If the user hasn't provided these, ask before running.

On first run, `web-pack` mints a random UUID as `appId` and writes it to `board.config.json`. Commit that file — it ties saved games to this app. If `appId` changes, the device treats it as a different app and old saves are lost.

## With a Piece Set Model

If the game uses Pieces, pass `--model`:

```bash
web-pack dist --package-id <package-id> --name "<name>" --model ./model.tflite
```

`web-pack` records the model's sha256 in the manifest. Games using only touch omit `--model`.
