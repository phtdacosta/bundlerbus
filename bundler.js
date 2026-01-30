// bundler.js
import { createWriteStream, existsSync, readdirSync, statSync, lstatSync, readFileSync, rmSync } from 'fs';
import { createGzip } from 'zlib';
import tar from 'tar-stream';
import { join, resolve, relative } from 'path';
import { minimatch } from 'minimatch';

// Standard files npm always includes implicitly
const NPM_STANDARD_FILES = [
    'package.json',
    'README.md',
    'README',
    'LICENSE',
    'LICENCE',
    'NOTICE'
];

// Directories/files to always exclude from the scan
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
    '.env.local',
    'payload.tar.gz',
    'bootstrap.js'
];

export async function createPayload(packageJson, entryPoint) {
    console.log('[BUNDLER] Creating payload...');

    const pack = tar.pack();
    const gzip = createGzip();
    const output = createWriteStream('payload.tar.gz');

    pack.pipe(gzip).pipe(output);

    const processedPaths = new Set();
    const root = process.cwd();

    // Prepare Whitelist Patterns
    const hasFilesField = packageJson.files && Array.isArray(packageJson.files);
    const patterns = hasFilesField ? packageJson.files : ['**/*'];

    /**
     * Checks if a relative path matches the package.json "files" whitelist
     */
    function isWhitelisted(relPath) {
        const normalizedRel = relPath.replace(/\\/g, '/');

        return patterns.some(pattern => {
            // 1. Glob match (e.g., "src/**/*.js")
            if (minimatch(normalizedRel, pattern)) return true;

            // 2. Directory prefix match (e.g., pattern "src" matches "src/app.js")
            const dirPrefix = pattern.endsWith('/') ? pattern : `${pattern}/`;
            if (normalizedRel.startsWith(dirPrefix)) return true;

            return false;
        });
    }

    /**
     * Global exclusion filter
     */
    function isGlobalExcluded(path) {
        const baseName = path.split(/[\\/]/).pop().toLowerCase();
        for (const pattern of ALWAYS_EXCLUDE) {
            if (pattern.startsWith('*')) {
                const ext = pattern.substring(1);
                if (baseName.endsWith(ext)) return true;
            } else if (baseName === pattern || path.includes(`/${pattern}/`) || path.includes(`\\${pattern}\\`)) {
                return true;
            }
        }
        return false;
    }

    function addEntry(localPath, archivePath) {
        if (!existsSync(localPath)) return;

        // 1. Prevent duplicate packing and circular refs
        const normalized = resolve(localPath);
        if (processedPaths.has(normalized)) return;
        processedPaths.add(normalized);

        // 2. Symlink protection (Fixes infinite loops in 'bun link')
        const lstats = lstatSync(localPath);
        if (lstats.isSymbolicLink()) return;

        // 3. Skip global junk
        if (isGlobalExcluded(localPath) && !localPath.endsWith('node_modules')) {
            return;
        }

        const relPath = relative(root, localPath);
        const stats = statSync(localPath);
        const isDirectory = stats.isDirectory();
        const isNodeModules = localPath.includes('node_modules');

        // 4. Whitelist Enforcement
        // Directories are always entered to find files, but files must be whitelisted
        if (!isNodeModules && !isDirectory && !isWhitelisted(relPath)) {
            const baseName = relPath.split(/[\\/]/).pop();
            const isImplicit = NPM_STANDARD_FILES.includes(baseName) || relPath === 'package.json';
            if (!isImplicit) return;
        }

        if (isDirectory) {
            try {
                const items = readdirSync(localPath);
                for (const item of items) {
                    addEntry(join(localPath, item), join(archivePath, item));
                }
            } catch (err) {
                console.warn(`[BUNDLER] Could not read directory ${localPath}: ${err.message}`);
            }
        } else {
            // 5. File Packing & Optimization
            const ext = localPath.split('.').pop().toLowerCase();

            // Slim down node_modules by skipping heavy source/map files
            if (isNodeModules) {
                const isJunk = ['map', 'ts', 'tsx', 'h', 'cpp', 'c', 'cc', 'md', 'txt'].includes(ext);
                if (isJunk) return;
            }

            try {
                const content = readFileSync(localPath);
                // Ensure TAR internal paths always use forward slashes for cross-platform extraction
                const tarPath = archivePath.replace(/\\/g, '/');
                pack.entry({ name: tarPath, mode: stats.mode }, content);
            } catch (err) {
                console.warn(`[BUNDLER] Failed to pack file ${localPath}: ${err.message}`);
            }
        }
    }

    // PHASE 1: Scan Project Root (Filters via Whitelist)
    const rootEntries = readdirSync('.');
    for (const item of rootEntries) {
        if (item === 'node_modules' || item === 'dist') continue;
        addEntry(item, item);
    }

    // PHASE 2: Pack node_modules (Implicitly required for native bindings)
    console.log('[BUNDLER] Packing node_modules...');
    addEntry('./node_modules', 'node_modules');

    pack.finalize();

    await new Promise((resolve, reject) => {
        output.on('finish', resolve);
        output.on('error', reject);
    });

    console.log('[BUNDLER] Payload created: payload.tar.gz');
}

export function cleanupPayload() {
    if (existsSync('payload.tar.gz')) rmSync('payload.tar.gz');
    if (existsSync('bootstrap.js')) rmSync('bootstrap.js');
}
