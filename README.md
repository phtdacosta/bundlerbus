# 📦🚍 Bundlerbus

**Native bindings bundler for Bun's `--compile` flag**

![npm version](https://img.shields.io/npm/v/bundlerbus.svg)
![npm downloads (monthly)](https://img.shields.io/npm/dm/bundlerbus.svg)
![npm downloads (total)](https://img.shields.io/npm/dt/bundlerbus.svg)
![license](https://img.shields.io/npm/l/bundlerbus.svg)
![GitHub stars](https://img.shields.io/github/stars/phtdacosta/bundlerbus?style=social)
![GitHub forks](https://img.shields.io/github/forks/phtdacosta/bundlerbus)
![GitHub issues](https://img.shields.io/github/issues/phtdacosta/bundlerbus)
![GitHub last commit](https://img.shields.io/github/last-commit/phtdacosta/bundlerbus)
![Repo size](https://img.shields.io/github/repo-size/phtdacosta/bundlerbus)
![THYPRESS.ORG](https://img.shields.io/badge/THYPRESS.ORG-–?style=flat&color=%23333&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MzgiIGhlaWdodD0iODM4Ij48cGF0aCBmaWxsPSIjRkZGIiBkPSJtMTU0LjM4NiAxMDkuODYgMi42MjUtLjAxYzIuOTE1LS4wMDggNS44My0uMDEgOC43NDUtLjAxMWw2LjI1OS0uMDE1YzUuNjgzLS4wMTMgMTEuMzY2LS4wMiAxNy4wNS0uMDI0IDMuNTYtLjAwMyA3LjExOS0uMDA3IDEwLjY3OS0uMDEyIDExLjE2MS0uMDEzIDIyLjMyMi0uMDIzIDMzLjQ4NC0uMDI3IDEyLjgzNC0uMDA0IDI1LjY2OS0uMDIyIDM4LjUwNC0uMDUgOS45NDQtLjAyMyAxOS44ODgtLjAzMyAyOS44MzMtLjAzNCA1LjkyNS0uMDAxIDExLjg1LS4wMDcgMTcuNzc1LS4wMjUgMzguNDEyLS4xMSA3NC40MzEgMS4xNjIgMTEwLjY2IDE1LjM0OGwyLjMyNy45MDFjMzQuNDk2IDEzLjYwNyA2MS4zMSA0MC4wOTUgNzYuMzYgNzMuODE4IDMuMzA2IDcuNzE1IDUuNTYzIDE1LjQ2NSA3LjQ1NCAyMy42MjVhMTAwLjA3NCAxMDAuMDc0IDAgMCAwIDEuODEyIDYuNzMyYzQuNDAyIDE1LjM1IDQuNTE2IDMyLjAyMSA0LjM4MyA0Ny44Ni0uMDI0IDMuMDI1LS4wMiA2LjA1LS4wMTQgOS4wNzQtLjAxNiAxMS4xNjItLjU3NSAyMS45NTgtMi4zMjIgMzIuOTlsLS4zNjUgMi40NzJjLTQuMTM0IDI2LjkzLTE1LjAxNyA1My42Ni0zMi42MzUgNzQuNTI4bC0yLjM2MyAyLjg2Yy0xNS42MzMgMTguMTE0LTM3LjU0NyAzMC45MjMtNTkuOTM0IDM4LjgzMWExNzcuNDggMTc3LjQ4IDAgMCAwLTYuNTk0IDIuNDYxYy02LjU0IDIuNTk1LTEzLjE0IDMuOTM1LTIwLjA0MyA1LjEyNS0zLjg0Mi42NjQtNy42MzcgMS40OTEtMTEuNDQxIDIuMzQ4LTcuMTM3IDEuNTQ3LTEzLjk5IDIuMzk0LTIxLjI4NiAyLjM4MmwtMi40Ni0uMDAzTDM2MSA0NTFsLjAwMyAxLjc0MmE5Njc5MC4yMjkgOTY3OTAuMjI5IDAgMCAxIC4xNjIgMTE0LjUxMmwuMDAyIDIuNDY4Yy4wMTMgMTMuMTkuMDM3IDI2LjM4LjA2NCAzOS41Ny4wMjkgMTMuNTM1LjA0NSAyNy4wNy4wNTEgNDAuNjAzLjAwNCA4LjM1Mi4wMTcgMTYuNzAzLjA0MiAyNS4wNTUuMDE2IDUuNzI2LjAyIDExLjQ1My4wMTcgMTcuMTgtLjAwMiAzLjMwNC4wMDIgNi42MDguMDE3IDkuOTEyLjAxNSAzLjU4NC4wMTEgNy4xNjguMDAzIDEwLjc1MmwuMDI2IDMuMTU3Yy0uMDUgOC4wMDUtMS41MjIgMTQuMTg0LTcuMzg3IDIwLjA0OS02Ljc1IDQuMjEyLTEyLjg3IDUuMTUtMjAuNzYgNS4xMzRsLTIuMzQ4LjAwN2MtMi41OTEuMDA2LTUuMTgzLjAwNS03Ljc3NC4wMDRsLTUuNTc5LjAxYy01LjA1LjAxLTEwLjEuMDEyLTE1LjE0OS4wMTItMy4xNTYuMDAxLTYuMzEyLjAwMy05LjQ2Ny4wMDYtMTEuMDEzLjAwOS0yMi4wMjUuMDEzLTMzLjAzOC4wMTItMTAuMjYgMC0yMC41Mi4wMS0zMC43OC4wMjYtOC44MTQuMDEzLTE3LjYyNi4wMTgtMjYuNDQuMDE4LTUuMjYxIDAtMTAuNTIzLjAwMi0xNS43ODUuMDEzLTQuOTUuMDEtOS45LjAxLTE0Ljg1LjAwMy0xLjgxNC0uMDAyLTMuNjI4IDAtNS40NDIuMDA3LTIuNDgyLjAwOC00Ljk2NC4wMDMtNy40NDYtLjAwNWwtMi4xNi4wMTZjLTYuNDI1LS4wNDQtMTIuOTQyLS45MjUtMTguMjMyLTQuODI2bC0xLjg5LTEuMzE2Yy01LjUyNi02LjMwMy02LjQ0NS0xMy40NS02LjM2Ni0yMS41NGwtLjAxOS0zLjA4MmMtLjAxNS0zLjQwNS0uMDAyLTYuODEuMDEtMTAuMjE2LS4wMDUtMi40NjgtLjAxMi00LjkzNS0uMDItNy40MDItLjAxNS01LjM2My0uMDE4LTEwLjcyNy0uMDEtMTYuMDkuMDE0LTcuOTc1LjAwNC0xNS45NS0uMDEtMjMuOTI2LS4wMjYtMTQuMjQ1LS4wMjctMjguNDktLjAyLTQyLjczNWEzMzE0Ny4xODcgMzMxNDcuMTg3IDAgMCAwLS4wMDItNDIuNDE2bC0uMDA0LTcuNTZhNjY5MDguNzI5IDY2OTA4LjcyOSAwIDAgMSAuMDA2LTk0LjQ3NGMuMDE1LTI3Ljk3Ni4wMDYtNTUuOTUxLS4wMjItODMuOTI3YTcxMjA4LjQ3OCA3MTIwOC40NzggMCAwIDEtLjAzMy0xMDQuMzV2LTIuNWMuMDA0LTEyLjQ1OC0uMDA1LTI0LjkxNi0uMDItMzcuMzc0LS4wMTktMTQuMTY2LS4wMTktMjguMzMzLjAwNC00Mi41LjAxMy03LjkyNy4wMTItMTUuODU0LS4wMS0yMy43ODItLjAxNC01LjkxOC0uMDAyLTExLjgzNy4wMi0xNy43NTYuMDA1LTIuMzk0LjAwMi00Ljc5LS4wMTEtNy4xODQtLjAxNi0zLjI1NS0uMDAyLTYuNTA4LjAyLTkuNzYybC0uMDM2LTIuODJjLjA5NS02Ljc2NyAxLjg2NS0xMi4wODggNS42NjMtMTcuNzI1IDUuNjItNS4zNzkgMTAuOTAzLTYuMTQ4IDE4LjM4Ni02LjE0WiIvPjwvc3ZnPg==)

Compile Bun projects with Sharp, Canvas, or other native modules into single-file executables. Drop-in replacement for `bun build --compile`.

## The Problem → The Solution

```bash
# ❌ This fails with native modules
bun build --compile ./app.js --outfile ./app.exe
# Error: Cannot find module '/path/to/$bunfs/node_modules/sharp/...'

# ✅ This works
bundlerbus ./app.js --outfile ./app.exe
```

**How:** Extracts your app + `node_modules` to a real filesystem at runtime. Native bindings see real paths instead of Bun's virtual `$bunfs`.

**Trade-off:** Larger bundles (~100MB+), ~2-3s first-run delay. Subsequent runs: < 50ms. Zero configuration.

---

## Quick Start

```bash
# Install
npm install -g bundlerbus

# Use (same flags as Bun)
bundlerbus ./src/cli.js --target bun-windows-x64 --outfile ./dist/app.exe

# That's it. Your app with native modules now compiles.
```

**Forwards all Bun flags:** `--target`, `--minify`, `--define`, `--windows-icon`, etc.

---

## How It Works

```
Build Time (your machine):
  [Your Code] + [node_modules] → payload.tar.gz → compiled.exe

First Run (user's machine):
  compiled.exe → Extract to cache (~/.cache/app/1.0.0/) → Launch app
                 └─ Native modules see real paths ✅

Subsequent Runs:
  compiled.exe → Check hash → Cache hit → Launch (< 50ms)
```

**Cache locations** (automatic fallback):
- **Windows:** `%LOCALAPPDATA%\your-app\1.0.0\`
- **macOS:** `~/Library/Application Support/your-app/1.0.0/`
- **Linux:** `~/.cache/your-app/1.0.0/`

Falls back to system temp or current directory if standard location is locked.

---

## Entry Point Detection

Bundlerbus finds your entry point automatically:

1. Explicit argument: `bundlerbus ./src/cli.js`
2. `package.json` → `"bin"` field (if single entry)
3. `package.json` → `"main"` field
4. Convention: `./index.js`, `./src/index.js`, or `./main.js`

**Multiple binaries?** Specify explicitly:
```bash
bundlerbus ./src/cli.js --outfile ./dist/app.exe
bundlerbus ./src/server.js --outfile ./dist/server.exe
```

---

## What Gets Packed

**Strategy:** Pack everything for maximum reliability.

✅ **Included:**
- All project files (except `node_modules/` and `dist/` during root scan)
- Complete `node_modules/` directory with zero filtering

❌ **Excluded:**
- `dist/` directory (build output)

**Why pack everything?**
- Zero configuration required
- No missing dependencies at runtime
- Works with any project structure
- No "forgot to include X" errors

**Trade-off:** Larger bundles, but 100% reliability. Native modules have complex dependency chains—missing a single `.dll` causes runtime failures.

---

## Examples

### Basic

```bash
bundlerbus ./index.js --outfile ./dist/app.exe
bundlerbus ./src/main.js --minify --outfile ./build/app
```

### Cross-Platform Build Script

```javascript
// build.js
import { spawnSync } from 'child_process';
import pkg from './package.json' assert { type: 'json' };

const platforms = {
  win32: ['--target', 'bun-windows-x64', '--outfile', './dist/app-win.exe'],
  darwin: ['--target', 'bun-darwin-arm64', '--outfile', './dist/app-mac'],
  linux: ['--target', 'bun-linux-x64', '--outfile', './dist/app-linux']
};

Object.entries(platforms).forEach(([name, flags]) => {
  console.log(`Building for ${name}...`);
  const result = spawnSync('bundlerbus', ['./src/cli.js', ...flags], {
    stdio: 'inherit'
  });
  if (result.status !== 0) process.exit(1);
});
```

### With Windows Metadata

```javascript
const args = [
  './src/cli.js',
  '--windows-icon=./icon.ico',
  '--windows-publisher="Your Company"',
  `--windows-version="${pkg.version}"`,
  '--target=bun-windows-x64',
  '--outfile=./dist/app.exe'
];

spawnSync('bundlerbus', args, { stdio: 'inherit' });
```

---

## Platform Support

| Platform | Status | Testing |
|----------|--------|---------|
| **Windows x64** | ✅ Production | Fully tested (Sharp, Canvas) |
| **macOS Intel/ARM** | ⚠️ Beta | Code ready, needs community testing |
| **Linux x64** | ⚠️ Beta | Code ready, needs community testing |

---

## Troubleshooting

### Native Module Not Found

```
Error: Cannot find module 'sharp'
```

**Fix:** Ensure module is in `dependencies` (not `devDependencies`), run `npm install` before building.

---

### Permission Denied

```
[BOOTSTRAP ERROR] Cannot find writable cache directory!
```

**Fix:** Bundlerbus tries 3 locations automatically. Check logs to see which were tested. User needs write access to at least one.

---

### Concurrent Starts (First Run)

```
[BOOTSTRAP LOCK] Waiting for other instance to finish extraction...
```

**Not an error.** If multiple instances start during first extraction:
- First instance extracts (~2-3s)
- Others wait safely
- All start normally after extraction completes

This is race condition protection working correctly.

---

### Files In Use (Development Only)

```
[BOOTSTRAP ERROR] Cannot delete cache - files are in use!
```

**Cause:** Old instance still running (common when rebuilding without closing).

**Fix:**
1. Close all running instances
2. Wait a few seconds
3. Try again

**Note:** Only happens in dev with same version number. Production uses different versions → different cache dirs → no conflict.

---

### Wrong Entry Point

```
[FAILURE] Could not determine entry point
```

**Fix:** Specify explicitly or add to `package.json`:

```bash
bundlerbus ./src/index.js [flags...]
```

```json
{
  "bin": "./src/cli.js"
}
```

---

## Comparison to Bun's --compile

| Feature | Bun --compile | Bundlerbus |
|---------|---------------|------------|
| Pure JS projects | ✅ | ✅ |
| Native bindings | ❌ | ✅ |
| Startup time | Instant | ~50ms cached, ~2s first |
| Bundle size | Smaller | Larger (~100MB+) |
| Configuration | None | None |
| Reliability with natives | 0% | 100% |

---

## Technical Deep Dive

<details>
<summary><strong>Why Extraction Works</strong></summary>

Native modules use `__dirname` to locate binaries:

```javascript
// sharp/lib/constructor.js
const libvips = require(path.join(__dirname, '../build/Release/sharp.node'));
```

In Bun's `$bunfs`: `__dirname` → `$bunfs/node_modules/sharp/lib` (virtual, unreadable by native code)

After extraction: `__dirname` → `C:\Users\...\AppData\Local\app\1.0.0\node_modules\sharp\lib` (real path ✅)

</details>

<details>
<summary><strong>Native Module Resolution</strong></summary>

Bundlerbus sets `NODE_PATH` to extracted `node_modules`:

```javascript
process.env.NODE_PATH = '/cache/path/node_modules'
```

Modern native modules use **relative loading**:
- **Linux:** `RPATH=$ORIGIN`
- **macOS:** `@loader_path`
- **Windows:** Same-directory search

No `LD_LIBRARY_PATH` manipulation needed. Works with macOS SIP.

</details>

<details>
<summary><strong>Conditional Working Directory</strong></summary>

Smart `cwd` management:

**With path arguments** (drag-and-drop, CLI):
```bash
app.exe ./content  # cwd unchanged, app gets correct path
```

**Without paths** (double-click):
```bash
app.exe --verbose  # cwd = exe folder (portable behavior)
```

Allows apps to work as both CLI tools and portable executables.

</details>

<details>
<summary><strong>Cache Invalidation</strong></summary>

**SHA-256 hash-based:**
- Payload hash stored in `.hash` file
- Checked on every run (< 1ms)
- Mismatch triggers re-extraction
- Version number doesn't matter—any change detected

**File-based locking** prevents corruption if multiple instances start during extraction.

</details>

---

## Debug Logging

Comprehensive logging for troubleshooting:

```
[BOOTSTRAP DEBUG] Platform: win32
[BOOTSTRAP CACHE] ✓ Selected writable cache directory: C:\...\AppData\Local\app\1.0.0
[BOOTSTRAP LOCK] ✓ Acquired lock (PID: 12345)
[BOOTSTRAP] Extracting archive...
[BOOTSTRAP] Extracted 500 files...
[BOOTSTRAP] ✓ Extraction complete: 3564 files, 0 directories
[BOOTSTRAP TIMING] Bootstrap completed in 2895ms
```

All errors include actionable solutions.

---

## Manual Cache Cleanup

```bash
# Windows
del /s /q %LOCALAPPDATA%\your-app

# macOS
rm -rf ~/Library/Application\ Support/your-app

# Linux
rm -rf ~/.cache/your-app
```

Old versions accumulate but don't interfere. Safe to delete manually.

---

## Limitations

| Limitation | Impact | Justification |
|-----------|--------|---------------|
| Large bundles (~100MB+) | Storage | Native modules + dependencies. Reliability > size. |
| First-run delay (~2-3s) | UX | Extraction cost. Cached runs: < 50ms. |
| Disk space (2x bundle) | Storage | Uncompressed cache. Users can clean old versions. |

---

## Roadmap

- [x] SHA-256 cache validation
- [x] Cross-platform cache dirs
- [x] Race condition protection
- [x] Fallback cache locations
- [ ] Smart filtering (opt-in `"files"` field support)
- [ ] `bundlerbus clean` command
- [ ] Delta extraction (only changed files)
- [ ] Lazy loading (extract on `require()`)

---

## Related Projects

Built for [**THYPRESS**](https://thypress.org) — zero-config static site generator with Sharp image processing.

- **THYPRESS Launcher** — https://github.com/thypress/launcher

*Using Bundlerbus? Add your project here!* 🚍

---

## License

MIT

---

## Credits

Created by [@phteocos](http://x.com/phteocos). Inspired by Electron ASAR, designed for Bun's native binding challenges.
