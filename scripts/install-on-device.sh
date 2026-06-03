#!/bin/bash
set -euo pipefail

config_file="board.config.json"

if [[ ! -f "$config_file" ]]; then
  echo "Missing $config_file. Run web-pack first so it can create the appId." >&2
  exit 1
fi

if ! app_id="$(node -e 'const fs = require("fs"); const config = JSON.parse(fs.readFileSync("board.config.json", "utf8")); if (!config.appId) process.exit(1); process.stdout.write(config.appId);')"; then
  echo "Missing appId in $config_file." >&2
  exit 1
fi

board-connect install "$app_id.webapp.zip" --launch
