# Bundlerbus Example

This example demonstrates how to use Bundlerbus to compile a Bun application that uses Sharp (a native Node.js module).

## Setup

```bash
cd example
bun install
```

## Run in Development

```bash
bun run dev
```

This runs the application directly with Bun (no compilation).

## Build Single Executable

```bash
bun run build
```

This creates `./dist/image-processor.exe` (or `image-processor` on Unix).

## Build for All Platforms

```bash
bun run build:all
```

This creates executables for:
- Windows (x64)
- macOS (ARM64)
- Linux (x64)

## Test the Compiled Executable

### Windows
```cmd
dist\image-processor-win.exe
```

### macOS/Linux
```bash
chmod +x dist/image-processor-mac
./dist/image-processor-mac
```

On first run, you'll see:
```
[BOOTSTRAP] Unfolding environment...
```

This extracts the application and node_modules to the cache directory. Subsequent runs are instant.

## What This Example Shows

1. **Native Bindings Work:** Sharp uses `libvips` (a C++ library) which would fail with standard `bun build --compile`
2. **Cache Management:** First run extracts, subsequent runs use cached files
3. **Cross-Platform:** Same code compiles for Windows, macOS, and Linux

## Output

The application creates `output.png` - a 200x150 gradient image, proving that Sharp's native image processing works correctly in the compiled executable.

## Troubleshooting

If you get "command not found: bundlerbus", install it globally:

```bash
npm install -g bundlerbus
```

Or use it directly with bunx:

```bash
bunx bundlerbus ./app.js --outfile ./dist/app.exe
```
