# AGENTS.md

## Project overview

PasswordNote — a React Native 0.84.1 mobile app for storing and quickly copying sensitive notes/passwords. Chinese-language UI. Android-focused (no active iOS CI).

## Package manager & registry

- **Yarn 3.6.4** with `node-modules` linker (not PnP). Config in `.yarnrc.yml`.
- Uses npm mirror: `https://registry.npmmirror.com`
- `postinstall` runs `patch-package` — there's a patch for `react-native-document-picker` in `patches/`.

```sh
yarn install
```

## Key commands

```sh
yarn test          # Jest (react-native preset), single test: yarn test -- <path>
yarn lint          # ESLint (@react-native config)
yarn start         # Metro dev server
yarn android       # Build & run Android
yarn build:debug   # Android Gradle assembleDebug
yarn build:release # Android Gradle assembleRelease
yarn clean         # Android Gradle clean
```

No typecheck script defined — run `npx tsc --noEmit` manually.

## Architecture

```
index.js          → AppRegistry entrypoint
App.tsx           → Provider stack: GestureHandler → Redux → Tamagui → Navigation
src/
  stores/         → Redux Toolkit slices (note, quickCopy), persisted via AsyncStorage
  views/          → Screen components (Home, AllNotes, NoteDetail)
  components/     → Shared UI components (AddBtn, ConfirmDialog, Header, NoteCard, etc.)
  utils/          → storage.ts (export/import JSON), haptic.ts
  interface.ts    → Core types: Note, QuickCopyItem
components/ui/    → Gluestack-style UI primitives (unused or lightly used — verify before relying on them)
```

## Conventions & gotchas

- **Path alias**: `@/` → `src/` (configured in both `tsconfig.json` and `babel.config.js` via `module-resolver`). Use `@/` imports, not relative paths into src.
- **Tamagui is at rc** (`^2.0.0-rc.31`). API may shift between upgrades.
- **reanimated/plugin** must be last in `babel.config.js` plugins — don't reorder.
- **No CI workflows** exist. No pre-commit hooks. Run `yarn lint` and `npx tsc --noEmit` before considering changes clean.
- **Prettier**: single quotes, trailing commas, no parens on single arrow args.
- **State persistence**: Redux store is auto-persisted to AsyncStorage via `redux-persist`. Don't add manual save/load logic.
- **Node >= 22.11.0** required (see `engines` in package.json).
