# Pre-requisites

- A Board device on the `MP.1.9.x` OS family or newer. The device must expose the web-app install and logs capabilities; confirm with `board-connect capabilities` (see "Confirming device compatibility" below).
- Node 18 or newer for the build toolchain.
- The `web-pack` and `board-connect` tools available on your machine.

# Board SDK

Source: https://docs.dev.board.fun/web/ai-assistant

You are writing TypeScript against the Board Web SDK (`@board.fun/web-sdk`). Board is a 23.8" 1080p landscape touch console; its touch sensor detects both fingers and physical Pieces, which are game tokens with conductive Glyph patterns on their bases. The SDK is ESM-only and runs the web app inside Board's built-in browser.

## Basics

- Import the single frozen `Board` object:

```ts
import { Board, BoardContactType } from "@board.fun/web-sdk";
```

- Every feature hangs off it across six domains: `Board.input`, `Board.session`, `Board.save`, `Board.avatar`, `Board.pause`, and `Board.application`.
- Always gate device calls on `Board.isOnDevice`. In a desktop browser it is `false` and service-backed calls do not no-op: sync calls such as `Board.session.*`, `Board.pause.*`, `Board.application.*`, and the `save` getters throw, while async calls such as `Board.save.*`, `Board.avatar.*`, and `Board.session.present*` reject because the native bridge is absent.
- The one exception is `Board.input.getContacts()`, which safely returns `[]` off-device.
- Gate sync calls behind `if (Board.isOnDevice)` and wrap async calls in `try`/`catch` so the same build stays runnable without hardware.
- Do not gate features on `Board.sdkVersion`; it is informational only. There is no bridge or OS version exposed to games. New OS capabilities degrade gracefully through in-bridge capability checks. Use `Board.session.isReady()` for session-manager readiness, and `Board.session.areServicesReady()` for save/overlay service readiness.
- The SDK uses two async styles: Promises for request/response calls, and callbacks/subscriptions for the touch stream and pause results.

## Touch Input

Subscribe to `Board.input`; each callback receives a full per-frame snapshot of contacts. Filter Pieces by `glyphId`, not by contact type.

```ts
import { Board, BoardContactType, type BoardContact } from "@board.fun/web-sdk";

function onContacts(contacts: ReadonlyArray<BoardContact>) {
  for (const c of contacts) {
    if (c.type === BoardContactType.Glyph) {
      handlePiece(c.glyphId, c.x, c.y, c.orientation);
    }
  }
}

if (Board.isOnDevice) {
  Board.input.subscribe(onContacts);
}
```

Each contact includes `contactId`, `type` (`BoardContactType.Finger`, `BoardContactType.Glyph`, or `BoardContactType.Blob`), `glyphId`, `x`, `y`, `orientation`, `phase`, and `isTouched`.

- Coordinates are device pixels with origin at the top-left and Y increasing downward.
- There are no discrete down/up events. Keep a previous-frame map keyed by `contactId` and diff snapshots for edges.
- Use `Board.input.unsubscribe(callback)` when tearing down a subscription.
- `Board.input.getContactsByType(type)` returns a filtered snapshot when a polling-style read is more convenient.
- `isTouched` can help distinguish a handled Piece from a resting Piece, but should not be required unless the game explicitly needs that behavior.
- Finger touch needs no model.
- Piece detection uses a Piece Set Model recorded at pack time.

## Players And Sessions

The roster is OS-owned; the game never silently adds or removes players.

- Read with `Board.session.getPlayers()`, `Board.session.getPlayerCount()`, and `Board.session.getActiveProfile()`.
- Change players through the OS selector with `Board.session.presentAddPlayer(aiTypeIndices?)` or `Board.session.presentReplacePlayer(sessionId, aiTypeIndices?)`. Both return `Promise<boolean>` where `true` means added/replaced and `false` means dismissed.
- Use `Board.session.resetPlayers()` when the game needs to clear the roster.
- Declare AI types with `Board.session.setAIPlayerTypes([{ name, description }])`.

```ts
const added = await Board.session.presentAddPlayer();
if (added) refreshRoster();
```

## Save Games

Create, load, list, and update saves with Promise-based APIs: `Board.save.create`, `Board.save.load`, `Board.save.list`, and `Board.save.update`.

```ts
const meta = await Board.save.create(
  "Turn 12",
  payload, // Uint8Array
  playedTimeMs,
  gameVersion
);
const saves = await Board.save.list();
await Board.save.removePlayersFromSave(meta.id);

// To remove only the active profile:
await Board.save.removeActiveProfileFromSave(meta.id);
```

There is no direct delete. A game removes its own involvement with `removePlayersFromSave` for the current game's players or `removeActiveProfileFromSave` for only the active profile. The system deletes the save once no players remain.

Save metadata includes `id`, `description`, `createdAt`, `updatedAt`, `playedTime`, `fileSize`, `gameVersion`, `playerCount`, `players[]`, `hasCoverImage`, `payloadChecksum`, and `coverImageChecksum`. Each player entry includes `playerId`, `name`, `avatarId`, `type`, and `aiTypeIndex`.

## Avatars

- `Board.avatar.loadPNG(avatarId)` resolves to a cached PNG data URI.
- `Board.avatar.getDefault()` returns avatar 0.
- `Board.avatar.forPlayer(player)` loads a player's avatar. Prefer it for session players because `BoardPlayer.avatarId` is typed as `string`, while `loadPNG()` accepts a numeric avatar id.
- Assign the data URI directly to an `<img>` element's `src`.

## Pause Overlay

The OS owns the menu button and UI; the game supplies context and reads results. Use `Board.pause.setContext(context)`, `Board.pause.updateContext(partial)`, and `Board.pause.clearContext()`. Subscribe with `Board.pause.onResult(callback)`, which is preferred over the legacy `Board.pause.pollResult()`.

```ts
Board.pause.setContext({
  offerSaveOption: true, // adds the system "Save & Quit" option
  customButtons: [{ id: "restart", title: "Restart", icon: "circulararrow" }],
});

const unsubscribePause = Board.pause.onResult((result) => {
  if (result.action === "quit" || result.action === "save_and_quit") {
    Board.application.quit();
  }
  if (result.action === "custom_button" && result.customButtonId === "restart") {
    restartGame();
  }
});

// later: unsubscribePause();
```

`Board.pause.onResult(callback)` returns an unsubscribe function. Clean it up if the game recreates pause handlers during restart or teardown.

## Application Lifecycle

- `Board.application.quit()` closes the web app and returns to the launcher.
- `Board.application.showProfileSwitcher()` and `Board.application.hideProfileSwitcher()` drive the OS profile switcher.

## Important Notes

- Gate on `Board.isOnDevice`, not `Board.sdkVersion`.
- Use `Board.session.isReady()` for session-manager readiness and `Board.session.areServicesReady()` for save/overlay service readiness.
- Use Y-down coordinates with no flip. Contacts are device pixels, origin top-left.
- Identify Pieces by `glyphId`, not by contact type.
- There is no direct save delete. A game removes its own players with `removePlayersFromSave` or `removeActiveProfileFromSave`; the system deletes the save automatically once no players remain associated with it.

## The dev loop

Change code, build, pack, install, watch logs, repeat.
