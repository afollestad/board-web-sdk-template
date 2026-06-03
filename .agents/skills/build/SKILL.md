---
name: build
description: |
  Build the project with TypeScript and Vite. Use when the user asks to build, compile, or run the build step.
---

# Build

Build a static app with relative paths. In Vite, set `base: "./"`:

```ts
// vite.config.ts
export default {
  base: "./",
};
```

To compile TypeScript and bundle with Vite:

```bash
npm run build
```

This runs `tsc && vite build`, outputting to `dist/`. Fix any type errors before proceeding to pack or deploy.
