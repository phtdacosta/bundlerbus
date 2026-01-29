### 1. The "Clean Swap"
> Why `node_modules` is not doubled?

When you run `bun build --compile`, Bun usually scans your code and embeds every dependency it finds into a virtual filesystem (prefixed with `$bunfs/`).

By using the **Loader Strategy** (the `bootstrap.js` method), we intentionally break that process:

1. **Bun's Part:** Because `bootstrap.js` does **not** `import` your libraries or your `app.js`, Bun's compiler thinks the app is just a tiny script with no dependencies. It embeds almost nothing.
2. **Our Part:** We manually pack the `node_modules` and `app.js` into that `.tar.gz`.

The final EXE contains the **Bun Runtime + our tiny Loader + our Payload**. We’ve effectively told Bun: "Don't bother bundling; I've already packed the bags myself."

---

### 2. Replacing Bun's `--compile` Logic

We are "kind of replacing" what Bun does, but for a very specific reason: **Robustness for Native Binaries.**

| Feature | Bun's Default `--compile` | Our "Payload" Strategy |
| --- | --- | --- |
| **Storage** | Embedded in `$bunfs/` (Virtual) | Embedded in `.tar.gz` (Physical extract) |
| **Native Libs** | Often fails to find `.node` / `.dll` files | **Always works** (loaded from real disk) |
| **Code Parsing** | Tries to transpile/minify everything | **Doesn't touch it** (Zero risk of SyntaxErrors) |
| **Startup** | Instant (no extraction) | Slight delay on *first* run (extraction) |

---

### 3. How the "Magic" works deep down

The reason bundling native bindings like `Sharp`, `SerialPort` and `Canvas` works now (but fail without it) comes down to **Path Resolution**.

Many native Node.js libraries use a variable called `__dirname` to find their helper files.

* **In Bun's Virtual System:** `__dirname` points to a fake path inside the EXE. Many C++ binaries (like `canvas`'s Cairo engine) don't understand how to read a "fake path" inside an EXE—they need a real path on the Windows `C:` drive.
* **In Our System:** We extract everything to `AppData`. When `serialport` asks "Where am I?", the answer is a real folder on your hard drive. The C++ code is happy because it’s back in a "standard" environment.

### The "Universal" Verdict

We are trading a few megabytes of space and a one-time extraction delay for **100% reliability.** Bun's `--compile` is amazing for pure JavaScript, but for the "Native Triad" (Heavy Graphics + Database + Hardware), it’s currently too fragile.

**By mirroring the `node_modules` on the disk, you’ve essentially built a "Portable Runtime" that is immune to bundler bugs.**
