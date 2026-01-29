import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, createWriteStream, rmSync } from 'fs';
import { join, dirname, extname } from 'path';
import { homedir } from 'os';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { createHash } from 'crypto';

// The embedded archive
import payloadArchive from './payload.tar.gz' with { type: 'file' };

const APP_NAME = 'app-test';
const VERSION = '1.0.0';

function getCacheDir() {
    const platform = process.platform;
    const baseCache = platform === 'win32'
        ? join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), APP_NAME)
        : (platform === 'darwin' ? join(homedir(), 'Library', 'Caches', APP_NAME) : join(process.env.XDG_CACHE_HOME || join(homedir(), '.cache'), APP_NAME));
    return join(baseCache, VERSION, `${platform}-${process.arch}`);
}

async function bootstrap() {
    try {
        const cacheDir = getCacheDir();
        const payloadBuffer = readFileSync(payloadArchive);

        // 1. Calculate Hash of the embedded archive
        const currentHash = createHash('md5').update(payloadBuffer).digest('hex');
        const hashFile = join(cacheDir, '.hash');
        const existingHash = existsSync(hashFile) ? readFileSync(hashFile, 'utf8') : null;

        // 2. Extract if hash doesn't match or doesn't exist
        if (currentHash !== existingHash) {
            console.log(`[BOOTSTRAP] Updating/Initializing runtime (Hash: ${currentHash.slice(0,8)})...`);
            if (existsSync(cacheDir)) rmSync(cacheDir, { recursive: true, force: true });
            mkdirSync(cacheDir, { recursive: true });

            await new Promise((resolve, reject) => {
                const extract = tar.extract();
                extract.on('entry', (header, stream, next) => {
                    const outPath = join(cacheDir, header.name);
                    if (header.type === 'directory') {
                        mkdirSync(outPath, { recursive: true });
                        stream.resume(); next();
                    } else {
                        mkdirSync(dirname(outPath), { recursive: true });
                        stream.pipe(createWriteStream(outPath)).on('finish', next).on('error', reject);
                    }
                });
                extract.on('finish', resolve);
                Readable.from(payloadBuffer).pipe(createGunzip()).pipe(extract);
            });
            writeFileSync(hashFile, currentHash);
        }

        // 3. Setup Native Paths (Recursive Scan)
        const nodeModules = join(cacheDir, 'node_modules');
        const libPaths = new Set();
        const scan = (dir) => {
            if (!existsSync(dir)) return;
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const p = join(dir, e.name);
                if (e.isDirectory()) scan(p);
                else if (['.dll', '.so', '.node', '.dylib'].includes(extname(e.name).toLowerCase())) libPaths.add(dir);
            }
        };
        scan(nodeModules);

        const envVar = process.platform === 'win32' ? 'PATH' : (process.platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH');
        const sep = process.platform === 'win32' ? ';' : ':';
        process.env[envVar] = Array.from(libPaths).join(sep) + sep + (process.env[envVar] || '');

        // 4. Launch Application
        const entryPoint = join(cacheDir, 'app.js');
        console.log('[BOOTSTRAP] System ready. Launching payload...');
        await import(entryPoint);

    } catch (err) {
        console.error('[BOOTSTRAP] Fatal Error:', err);
        process.exit(1);
    }
}

bootstrap();
