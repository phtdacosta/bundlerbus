# 📦🚍 Bundlerbus

**Universal native bindings bundler for Bun's `--compile` flag**

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

Bundlerbus solves the critical problem of compiling Bun projects that use native Node.js modules (tested with Sharp, Canvas, serialport) into single-file executables. Bun's built-in `--compile` flag fails when these libraries try to load `.node` bindings from the virtual filesystem.

## The Problem

```bash
# This fails when your project uses Sharp, Canvas, or other native modules
bun build --compile ./app.js --outfile ./app.exe

# Error: Cannot find module '/path/to/$bunfs/node_modules/sharp/...'
```

Native modules expect to load binaries from a **real filesystem path**, but Bun's `$bunfs` is virtual.

## The Solution

Bundlerbus extracts your application and `node_modules` to a real directory at runtime (on first launch), then loads your code from there. Native bindings work perfectly because they see real filesystem paths.

```bash
# This works!
bundlerbus ./app.js --outfile ./app.exe
```

## Installation

```bash
npm install -g bundlerbus

# Or use with bunx (no installation)
bunx bundlerbus ./app.js --outfile ./app.exe
```

## Usage

Bundlerbus is a **drop-in replacement** for `bun build --compile`:

```bash
# Instead of:
bun build --compile ./src/cli.js --target bun-windows-x64 --outfile ./dist/app.exe

# Use:
bundlerbus ./src/cli.js --target bun-windows-x64 --outfile ./dist/app.exe
```

All flags are forwarded directly to Bun, so it works with:
- `--target` (platform selection)
- `--outfile` (output path)
- `--minify`, `--sourcemap`
- `--define` (compile-time constants)
- `--windows-icon`, `--windows-publisher`, etc.
- Any future Bun flags

## Entry Point Resolution

Bundlerbus automatically detects your entry point using this priority:

1. **Explicit argument:** `bundlerbus ./src/cli.js`
2. **package.json "bin":** If you have a single binary defined
3. **package.json "main":** Fallback to main entry
4. **Convention:** Checks `./index.js` or `./src/index.js`

### Multiple Binaries

If your `package.json` has multiple bins:

```json
{
  "bin": {
    "app": "./src/cli.js",
    "server": "./src/server.js"
  }
}
```

You must specify which one to build:

```bash
bundlerbus ./src/cli.js --outfile ./dist/app.exe
bundlerbus ./src/server.js --outfile ./dist/server.exe
```

## What Gets Packed

Bundlerbus respects the npm standard `package.json` "files" field:

```json
{
  "files": [
    "src/",
    "templates/",
    "config/"
  ]
}
```

This acts as a whitelist. Only these directories/files are packed into the executable (plus `node_modules` which is always included).

### Standard Files

These are always included (following npm conventions):
- `package.json`
- `README.md` / `README`
- `LICENSE` / `LICENCE`
- `NOTICE`

### Always Excluded

These are never packed:
- `node_modules` (handled separately)
- `.git`, `.github`
- `.vscode`, `.idea`
- `dist/`, `build/`
- `*.log`
- `.env` files

### No "files" Field?

If your `package.json` doesn't have a "files" field, Bundlerbus will:
1. Pack the directory containing your entry point
2. Show a warning suggesting you add the "files" field

```bash
[BUNDLER] Warning: No "files" field in package.json, packing src/
```

## How It Works

Bundlerbus uses a three-stage approach:

### 1. Build Time (Your Machine)

```bash
bundlerbus ./src/cli.js --outfile ./app.exe
```

- Packs your source files + `node_modules` into `payload.tar.gz`
- Generates a `bootstrap.js` loader with your entry point injected
- Calls `bun build --compile bootstrap.js` (with all your flags)
- Cleans up temporary files

### 2. First Run (User's Machine)

```bash
./app.exe
```

- Bootstrap extracts payload to OS-specific cache directory:
  - **Windows:** `%LOCALAPPDATA%\your-app\1.0.0\`
  - **macOS:** `~/Library/Application Support/your-app/1.0.0/`
  - **Linux:** `~/.cache/your-app/1.0.0/`
- Calculates MD5 hash of payload
- Injects native library paths into `PATH`/`LD_LIBRARY_PATH`
- Loads your entry point

### 3. Subsequent Runs

- Bootstrap compares payload hash
- If unchanged, skips extraction (instant startup)
- If changed (new version), re-extracts

## Cache Management

### Version Organization

```
AppData/
  your-app/
    1.0.0/          ← Current version
      .hash         ← Payload hash (triggers re-extract)
      node_modules/
      src/
    0.9.0/          ← Old version (still there)
```

Old versions accumulate but don't interfere. Users can manually delete old version folders if needed.

### Cache Invalidation

Cache is invalidated when:
- Your code changes
- Dependencies change
- Anything in the payload changes

This is **hash-based**, not version-based, so even if you forget to bump your version number, changes will trigger re-extraction.

## Examples

### Basic Usage

```bash
# Simple project
bundlerbus ./index.js --outfile ./dist/app.exe

# With minification
bundlerbus ./src/main.js --minify --outfile ./build/app

# Cross-compilation
bundlerbus ./cli.js --target bun-windows-x64 --outfile ./dist/app-win.exe
bundlerbus ./cli.js --target bun-darwin-arm64 --outfile ./dist/app-mac
bundlerbus ./cli.js --target bun-linux-x64 --outfile ./dist/app-linux
```

### Real-World Project (THYPRESS)

```javascript
// build-exe.js
import { execSync } from 'child_process';
import pkg from './package.json' assert { type: 'json' };

const configs = {
  win32: {
    flags: [
      '--windows-icon=./icon.ico',
      '--windows-publisher="THYPRESS™"',
      `--windows-version="${pkg.version}"`,
      '--target=bun-windows-x64',
      '--outfile=./dist/THYPRESS-LAUNCHER.exe'
    ]
  },
  darwin: {
    flags: [
      '--target=bun-darwin-arm64',
      '--outfile=./dist/thypress-launcher-mac'
    ]
  }
};

const target = process.platform;
const config = configs[target];

const cmd = [
  'bundlerbus ./src/cli.js',
  `--define globalThis.__VERSION__='"${pkg.version}"'`,
  ...config.flags
].join(' ');

execSync(cmd, { stdio: 'inherit' });
```

## Troubleshooting

### Native Module Not Found

```
Error: Cannot find module 'sharp'
```

**Solution:** Ensure the module is in `dependencies` (not `devDependencies`) and run `npm install` before building.

### Extraction Failed

```
[BOOTSTRAP] Fatal Error: EACCES: permission denied
```

**Solution:** User needs write access to:
- Windows: `%LOCALAPPDATA%`
- macOS: `~/Library/Application Support`
- Linux: `~/.cache` or `$XDG_CACHE_HOME`

### Wrong Entry Point

```
[FAILURE] Could not determine entry point
```

**Solution:** Specify entry point explicitly:

```bash
bundlerbus ./src/index.js [flags...]
```

Or add to `package.json`:

```json
{
  "bin": "./src/cli.js"
}
```

## Known Quirks & Tips

| Detection | Bun Version | Quirk | Fix |
| :--- | :--- | :--- | :--- |
| 2025-01-30 | ~v1.3.3 | **The "Ghost Drive" Crash:** `process.chdir()` can throw `ENOENT` in compiled EXEs if the path resolves to a virtual drive (like `B:` or `Z:`) that doesn't exist on the physical machine. | Use a "Smart Switch" check: `if (process.cwd() !== targetPath) process.chdir(targetPath);` |

**The "Ghost Drive" Explained:**
When Bun compiles an EXE, it creates a virtual filesystem inside the binary. If your code calls `process.chdir()`, Bun intercepts this call. If the path looks like an internal Bun path (often caused by how `__dirname` or relative paths resolve during compilation), it may try to tell Windows to move the process to a virtual drive letter (the "Ghost Drive"). Windows doesn't recognize this as a physical drive and crashes the app with an `ENOENT` error.

**The Fix:**
Always check if you are already in the target directory before calling `chdir()`. This prevents the unnecessary system call that wakes up the Bun interceptor and triggers the "Ghost Drive" logic.

```javascript
import path from 'node:path';

const target = path.resolve(destination);
if (process.cwd() !== target) {
  process.chdir(target);
}
```

## Comparison to Bun's --compile

| Feature | Bun --compile | Bundlerbus |
|---------|---------------|------------|
| Pure JS projects | ✅ Works | ✅ Works |
| Native bindings (Sharp, Canvas) | ❌ Fails | ✅ Works |
| Startup time | Instant | Slight delay on first run |
| Distribution size | Smaller | Larger (includes full node_modules) |
| Cache invalidation | N/A | Hash-based (robust) |
| Flag compatibility | Native | Transparent forwarding |

## Technical Details

### Why Extraction Works

Many native modules use `__dirname` or similar to locate their binaries:

```javascript
// Inside sharp/lib/constructor.js
const libvips = require(path.join(__dirname, '../build/Release/sharp.node'));
```

In Bun's `$bunfs`, `__dirname` points to a fake path like:
```
$bunfs/node_modules/sharp/lib
```

Native code can't read from `$bunfs`. It needs a real path like:
```
C:\Users\Alice\AppData\Local\myapp\1.0.0\node_modules\sharp\lib
```

Bundlerbus provides that real path by extracting to disk.

### Path Injection

After extraction, Bundlerbus scans `node_modules` for `.dll`, `.so`, `.dylib`, `.node` files and injects their directories into:
- **Windows:** `PATH`
- **macOS:** `DYLD_LIBRARY_PATH`
- **Linux:** `LD_LIBRARY_PATH`

This ensures native binaries can find their dependencies.

## Limitations

- **First-run extraction:** Adds ~1-2 seconds on first launch
- **Disk space:** Full `node_modules` is extracted (can be 100MB+)
- **Write permissions:** Users need write access to cache directory

These tradeoffs are acceptable for the **100% reliability** with native bindings.

## Future Enhancements

- [x] Glob pattern support in "files" field
- [ ] Lazy extraction (only extract modules actually `require()`'d)
- [ ] Delta updates (only re-extract changed files)
- [ ] `bundlerbus clean` command to purge old caches
- [ ] Compression options (brotli, zstd)

## Related Projects & Ecosystem

Bundlerbus was originally developed to enhance [**THYPRESS.org**](https://thypress.org) — a zero-config static site generator that instantly turns a folder of Markdown notes into a production-ready website — that needed a reliable native binding bundling.
-  **THYPRESS Launcher** — https://github.com/thypress/launcher
- (If you’re using Bundlerbus in your own project and would like it featured here as an example of how it’s used in the wild, feel free to open a PR or drop a link! 🚍✨)


## License

MIT

## Credits

Inspired by Electron's ASAR format, but designed specifically for Bun's compilation model and native binding requirements. Cooked by [@phteocos](http://x.com/phteocos)
