// bundler.js
import { createWriteStream, existsSync, readdirSync, statSync, lstatSync, readFileSync, rmSync } from 'fs';
import { createGzip } from 'zlib';
import tar from 'tar-stream';
import { join, resolve, relative } from 'path';

// Standard files npm always includes
const NPM_STANDARD_FILES = [
    'package.json',
    'README.md',
    'README',
    'LICENSE',
    'LICENCE',
    'NOTICE'
];

// Directories/files to always exclude
// REMOVED 'node_modules' from here because we manually handle it!
const ALWAYS_EXCLUDE = [
    '.git',
    '.github',
    '.vscode',
    '.idea',
    'dist',
    'build',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    '.env',
    '.env.local'
];

export async function createPayload(packageJson, entryPoint) {
    console.log('[BUNDLER] Creating payload...');

    const pack = tar.pack();
    const gzip = createGzip();
    const output = createWriteStream('payload.tar.gz');

    pack.pipe(gzip).pipe(output);

    const processedPaths = new Set();

    function shouldExclude(path) {
        const baseName = path.split(/[\\/]/).pop().toLowerCase();

        // Check ALWAYS_EXCLUDE patterns
        for (const pattern of ALWAYS_EXCLUDE) {
            if (pattern.startsWith('*')) {
                // Wildcard pattern
                const ext = pattern.substring(1);
                if (baseName.endsWith(ext)) return true;
            } else if (baseName === pattern || path.includes(`/${pattern}/`) || path.includes(`\\${pattern}\\`)) {
                return true;
            }
        }

        return false;
    }

    function addEntry(localPath, archivePath) {
      if (!existsSync(localPath)) {
          // Only warn if it's not a known excluded file
          if (!shouldExclude(localPath)) {
              console.warn(`[BUNDLER] Warning: Path not found: ${localPath}`);
          }
          return;
      }

      // 1. Resolve absolute path to detect duplicates/circular refs
      const normalized = resolve(localPath);
      if (processedPaths.has(normalized)) return;
      processedPaths.add(normalized);

      // 2. DETECT SYMLINKS (Crucial for 'bun link' and preventing infinite loops)
      const lstats = lstatSync(localPath);
      if (lstats.isSymbolicLink()) {
          // We skip symlinks in the bundle to avoid circular recursion.
          // When the app is extracted, it will use real files.
          return;
      }

      // 3. Check global exclusions (dist, .git, etc.)
      // We bypass exclusion check ONLY for the top-level node_modules folder itself
      if (shouldExclude(localPath) && !localPath.endsWith('node_modules')) {
          return;
      }

      const stats = statSync(localPath);

      if (stats.isDirectory()) {
          try {
              const items = readdirSync(localPath);
              for (const item of items) {
                  // Use recursive calls for children
                  addEntry(join(localPath, item), join(archivePath, item));
              }
          } catch (err) {
              console.warn(`[BUNDLER] Could not read directory ${localPath}: ${err.message}`);
          }
      } else {
          // 4. FILE OPTIMIZATION
          const ext = localPath.split('.').pop().toLowerCase();

          // Skip heavy development junk in node_modules to keep EXE size down
          if (localPath.includes('node_modules')) {
              const isJunk = ['map', 'ts', 'tsx', 'h', 'cpp', 'c', 'cc', 'md', 'txt'].includes(ext);
              if (isJunk) return;
          }

          // 5. PACK THE FILE
          try {
              const content = readFileSync(localPath);
              // Use forward slashes for the TAR archive (internal standard)
              const tarPath = archivePath.replace(/\\/g, '/');
              pack.entry({ name: tarPath, mode: stats.mode }, content);
          } catch (err) {
              console.warn(`[BUNDLER] Failed to pack file ${localPath}: ${err.message}`);
          }
      }
    }

    // 1. Pack files based on package.json "files" field
    if (packageJson.files && Array.isArray(packageJson.files)) {
        console.log('[BUNDLER] Packing from "files" field...');
        for (const pattern of packageJson.files) {
            if (existsSync(pattern)) {
                const stats = statSync(pattern);
                if (stats.isDirectory()) {
                    const cleanPattern = pattern.replace(/\/$/, '');
                    addEntry(`./${cleanPattern}`, cleanPattern);
                } else {
                    addEntry(pattern, pattern);
                }
            }
        }
    } else {
        // Fallback: Pack the directory containing the entry point
        const entryDir = entryPoint.includes('/')
            ? entryPoint.substring(0, entryPoint.lastIndexOf('/'))
            : '.';

        console.log(`[BUNDLER] Warning: No "files" field in package.json, packing ${entryDir}`);

        if (entryDir === '.') {
            // Entry is at root, pack everything...
            readdirSync('.').forEach(item => {
                // ...EXCEPT node_modules, which we handle specifically in Step 3
                if (item === 'node_modules') return;
                addEntry(item, item);
            });
        } else {
            addEntry(`./${entryDir}`, entryDir);
        }
    }

    // 2. Always pack npm standard files
    for (const file of NPM_STANDARD_FILES) {
        if (existsSync(file) && !processedPaths.has(resolve(file))) {
            addEntry(file, file);
        }
    }

    // 3. Always pack node_modules (This works now because it's removed from ALWAYS_EXCLUDE)
    console.log('[BUNDLER] Packing node_modules...');
    addEntry('./node_modules', 'node_modules');

    pack.finalize();

    await new Promise(r => output.on('finish', r));

    console.log('[BUNDLER] Payload created: payload.tar.gz');
}

export function cleanupPayload() {
    if (existsSync('payload.tar.gz')) {
        rmSync('payload.tar.gz');
    }
    if (existsSync('bootstrap.js')) {
        rmSync('bootstrap.js');
    }
}
