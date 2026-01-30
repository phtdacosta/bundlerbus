# 📦🚍 Bundlerbus

**Universal native bindings bundler for Bun's `--compile` flag**

Bundlerbus solves the critical problem of compiling Bun projects that use native Node.js modules (like Sharp, Canvas, better-sqlite3, serialport, etc.) into single-file executables. Bun's built-in `--compile` flag fails when these libraries try to load `.node` bindings from the virtual filesystem.

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
      '--outfile=./dist/THYPRESS-BINDER.exe'
    ]
  },
  darwin: {
    flags: [
      '--target=bun-darwin-arm64',
      '--outfile=./dist/thypress-binder-mac'
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

## License

MIT

## Credits

Inspired by Electron's ASAR format, but designed specifically for Bun's compilation model and native binding requirements. Cooked by [@phteocos](http://x.com/phteocos)
