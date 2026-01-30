# Contributing to Bundlerbus

Thank you for your interest in contributing! This document explains the architecture and how to work on Bundlerbus.

## Architecture Overview

Bundlerbus has three main components:

### 1. cli.js (Build Orchestrator)

**Responsibilities:**
- Parse command-line arguments
- Resolve entry point (from args or package.json)
- Coordinate the build process
- Call Bun with forwarded flags
- Handle errors and cleanup

**Key Functions:**
- `resolveEntryPoint()` - Determines which file to use as the entry point
- `generateBootstrap()` - Injects user's entry point into the template
- `build()` - Main orchestration logic

### 2. bundler.js (Payload Packer)

**Responsibilities:**
- Read package.json "files" field
- Pack source files + node_modules into tar.gz
- Handle exclusions (node_modules, .git, etc.)
- Optimize payload size (skip .map, .ts files in node_modules)

**Key Functions:**
- `createPayload()` - Main packing logic
- `shouldExclude()` - Determines what to skip
- `addEntry()` - Recursively adds files to archive
- `cleanupPayload()` - Removes temporary files

### 3. bootstrap.template.js (Runtime Loader)

**Responsibilities:**
- Extract payload to OS-specific cache directory
- Hash-based cache invalidation
- Inject native library paths into environment
- Load user's application

**Key Functions:**
- `getCacheDir()` - Determines cache location per OS
- `bootstrap()` - Main extraction and loading logic

**Placeholders:**
- `___BUNDLERBUS_ENTRY___` - Replaced with user's entry point
- `___BUNDLERBUS_APP_NAME___` - Replaced with package.json name
- `___BUNDLERBUS_APP_VERSION___` - Replaced with package.json version

## File Flow

```
User runs: bundlerbus ./src/cli.js --target bun-windows-x64 --outfile ./app.exe

1. cli.js resolves entry point → ./src/cli.js
2. cli.js reads package.json → { files: ["src/"], ... }
3. bundler.js packs:
   - src/ (from "files")
   - node_modules/ (always)
   - package.json, LICENSE, README (npm standard)
   → payload.tar.gz

4. cli.js generates bootstrap.js:
   - Reads bootstrap.template.js
   - Replaces ___BUNDLERBUS_ENTRY___ with 'src/cli.js'
   - Replaces ___BUNDLERBUS_APP_NAME___ with 'myapp'
   - Replaces ___BUNDLERBUS_APP_VERSION___ with '1.0.0'
   → bootstrap.js

5. cli.js calls Bun:
   bun build --compile bootstrap.js --target bun-windows-x64 --outfile ./app.exe

6. cli.js cleans up:
   - Deletes payload.tar.gz
   - Deletes bootstrap.js

7. User gets: app.exe (contains bootstrap + payload.tar.gz)
```

## Testing Changes

### Local Development

1. Clone the repository
2. Link the package locally:

```bash
cd bundlerbus
bun link
```

3. In your test project:

```bash
bun link bundlerbus
bundlerbus ./app.js --outfile ./test.exe
```

### Testing the Example

```bash
cd example
bun install
bun link bundlerbus  # Use local version
bun run build
./dist/image-processor.exe  # Test the compiled executable
```

## Common Changes

### Adding a New Placeholder

If you need to inject additional data into bootstrap.template.js:

1. Add placeholder to `bootstrap.template.js`:
```javascript
const MY_DATA = '___BUNDLERBUS_MY_DATA___';
```

2. Replace it in `cli.js` `generateBootstrap()`:
```javascript
const bootstrap = template
  .replace('___BUNDLERBUS_ENTRY___', normalizedEntry)
  .replace('___BUNDLERBUS_MY_DATA___', myValue);
```

### Changing Packing Logic

To modify what gets packed, edit `bundler.js`:

- `ALWAYS_EXCLUDE` array - Add patterns to always skip
- `shouldExclude()` - Add custom exclusion logic
- `addEntry()` - Modify file filtering

### Modifying Cache Behavior

To change cache invalidation or extraction, edit `bootstrap.template.js`:

- `getCacheDir()` - Change cache location logic
- Hash comparison (line 33-37) - Modify when re-extraction happens
- Path injection (line 71-92) - Change how native paths are set

## Code Style

- Use ES modules (`import`/`export`)
- Console messages use bracketed prefixes: `[SUCCESS]`, `[FAILURE]`, `[INFO]`, `[BUNDLER]`, `[BOOTSTRAP]`
- No emojis in output (use ✓ unicode character if needed)
- Comments explain "why", not "what"
- Keep functions focused and single-purpose

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Test with the example application
5. Update README.md if adding features
6. Commit with descriptive messages
7. Push and create a pull request

## Future Enhancements (Good First Issues)

### Easy

- [ ] Add `bundlerbus --version` flag
- [ ] Add `bundlerbus clean` command to purge old caches
- [ ] Better error messages for common failures

### Medium

- [ ] Glob pattern support in "files" field (using `glob` package)
- [ ] Progress bar during extraction (using `progress` package)
- [ ] Verify native dependencies exist before building

### Hard

- [ ] Lazy extraction (only extract modules actually required)
- [ ] Delta updates (rsync-style, only re-extract changed files)
- [ ] Shared cache (multiple apps share common dependencies)

## Questions?

Open an issue or discussion on GitHub. We're happy to help!

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).
