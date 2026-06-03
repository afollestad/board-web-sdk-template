# Board Web SDK Template

A minimal Vite and TypeScript starter for building web apps with the
[Board Web SDK](https://docs.dev.board.fun/web/getting-started).

The sample app renders a simple canvas grid and listens for Board touch input
when it is running on-device. It also runs in a desktop browser, where
device-backed SDK calls are skipped.

This is an independent template and is not affiliated with Board.fun.

## Requirements

- Node 18 or newer
- `web-pack` for packaging `dist/` into a Board web app
- `board-connect` for pairing, installing, launching, screenshots, and logs
- A Board device on the `MP.1.9.x` OS family or newer for device testing

Check device support with:

```sh
board-connect capabilities
```

## Local Development

Install dependencies:

```sh
npm install
```

Run the Vite dev server:

```sh
npm run dev
```

Build the static app:

```sh
npm run build
```

The build output is written to `dist/`.

## Package And Install

Package the built app with a reverse-domain package id and display name:

```sh
web-pack dist --package-id fun.board.example --name "Example"
```

On the first successful package, `web-pack` creates `board.config.json` with an
`appId`. Keep that file committed for a real project so saves continue to
belong to the same app.

Install and launch the packaged app on a paired Board:

```sh
scripts/install-on-device.sh
```

Stream logs from the running app:

```sh
board-connect logs <appId> --follow
```

If the app uses physical Pieces, pass a Piece Set Model when packaging:

```sh
web-pack dist --package-id fun.board.example --name "Example" --model ./model.tflite
```

## Project Layout

- `src/main.ts` contains the sample canvas app.
- `public/` contains static assets copied by Vite.
- `scripts/install-on-device.sh` installs the packaged app using the generated
  `appId`.
- `AGENTS.md` contains repo-specific agent instructions, including guidance for
  idiomatic Board SDK usage.
- `.agents/skills/` contains the build, pack, deploy, logs, and screenshot
  workflows used by local coding agents. `.codex/skills` and `.claude/skills`
  point to the same skill directory.
