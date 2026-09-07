# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`@gddl/gd-client` — an ESM TypeScript library wrapping the Geometry Dash (boomlings) HTTP API. Published as `lib/` (compiled by `tsc`), with two entry points: `.` → `lib/index.js` and `./util` → `lib/util/index.js`.

## Commands

Bun is the package manager (`bun.lock`), but the scripts are npm-style:

```
bun install
npm run lint       # eslint src (type-checked rules; part of build)
npm run build      # lint + tsc -> lib/
npm run clean      # rimraf lib
npm run prettier   # format src
npm run knip       # unused files/exports/deps
npm run docgen     # typedoc --watch
```

A husky `pre-commit` hook runs `lint-staged`, which prettier-formats staged `*.ts`.

## Architecture

Five layers, all rooted at `Client`:

**`Base` (`src/Base.ts`)** — every non-plain class extends it. It holds `public readonly client: Client` and forces an abstract `toJSON()`. When adding a class, wire it into the enclosing `toJSON()` chain (`Client.toJSON()` aggregates the whole tree).

**`Client` (`src/Client.ts`)** — the root object. Owns `versions` (gameVersion/binaryVersion sent on every request), `endpoints` (a `Record<string, string>` defaulting to `DefaultEndpoints`), `headers`, and auth state (`account: Account`, `auth: { accountID, gjp2 }` set by `login()`). Both `endpoints` and `headers` are constructor parameters — that is the supported way to point the library at a GDPS (private server). `Client` also carries a large set of thin `async` delegates (`getFriendsList()`, `sendMessage()`, …) that just forward to a server client; keep new work on the server client and add a delegate only if it matches that existing pattern.

**`src/server/*Client` — the raw API layer.** Each extends `RequestClient` and covers one endpoint family (Account, Comment, Leaderboard, Level, Like, List, Reward, Socials, Song, User). `RequestClient.baseRequest()` is the only place that touches axios:

- POSTs form-encoded data to `` `${server}/${client.endpoints[endpoint]}` `` — the first argument is the **endpoint key**, not the path.
- Injects `secret` (default `SECRETS.COMMON`), `gdw: 0`, and `gameVersion`/`binaryVersion` unless the key is in `VERSIONLESS_ENDPOINTS`.
- Throws `GdApiError` (with `code`) when the response is `-1`; otherwise raw response text comes back and the caller parses it.
- `accountRequest()` presets `SECRETS.ACCOUNT`. Account login/backup/sync additionally pass `{ server: DEFAULT_ACCOUNT_URL }` because they live on a different host.

**`src/managers/*Manager` — the friendly layer.** `CachedManager<T extends Base>` adds `cache: Map<number, T>`. Managers own a server client, check/populate the cache, return `structures/` instances, and translate `GdApiError` into meaningful errors (see `LevelManager.fetch`, which is overloaded: number → single `Level`, options → `Level[]`).

**`src/structures/*`** — rich domain objects (`Level`, `User`, `Comment`, `List`, `Post`, `LeaderboardRecord`). They take `(client, data)` where `data` is `Omit<ClassProperties<Self>, 'client' | ...managers>`, so adding a field means adding the property, assigning it in the constructor, and including it in `toJSON()`.

### RobTop response parsing

GD returns `#`-delimited segments of `key:value:key:value` strings. Parsing lives in `src/util/parsers/`:

- `robTopSplit(str, sep)` → `Map`, `robTopSplitDict(str, sep)` → object.
- `remapKeys(map, keyMap)` renames numeric keys to names; it **throws** on an unknown key, so key maps (`src/util/parsers/keyMaps/`) must be exhaustive for the endpoint.
- `parseLevel`/`parseUser`/`parseSongs`/etc. do the numeric-key lookups inline and construct structures; missing required keys throw `Parsing error: …`.

### Request signing

`src/constants.ts` holds all the magic values: `SECRETS`, `KEYS`, `SALTS`, `DefaultEndpoints`, default server URLs and headers. `src/util/chk.ts` (`base64Encode(xor(sha1(values.join('') + salt), key))`) is the shared signing primitive behind `gjp2`, `generateUploadSeed2`, `generateUploadListSeed`, `generatePlatformerLeaderboardSeed`, and the per-endpoint `chk`/`seed2` fields. Signed requests are order-sensitive — copy the exact value order from the existing call sites.

## Conventions

- **Barrel files, no default exports, no `import *`** (enforced by convention since commit `7bc9a65`). Every source folder has an `index.ts` re-exporting its members, and `src/index.ts` is nothing but `export *` over those barrels plus `Base`/`Client`/`Account`. Adding a file therefore means adding one line to its folder's barrel — that is the whole step; anything exported from the file becomes public. Keep internal imports on the concrete module path (`'../server/RequestClient'`, not `'../server'`) to avoid import cycles.
- `@typescript-eslint/explicit-member-accessibility` is an error — every class member needs `public`/`private`/`protected`.
- `@typescript-eslint/no-floating-promises` is an error; `noUnusedLocals`/`noUnusedParameters` are on (prefix intentionally unused with `_`).
- Prettier: 4 spaces, single quotes, 120 columns.
- Types that are plain data go in `src/types/`, option/response interfaces used across files in `src/interfaces/`, numeric API enums in `src/enums/`.
