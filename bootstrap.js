import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, createWriteStream } from 'fs';
import { join, dirname, extname } from 'path';
import { homedir } from 'os';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import tar from 'tar-stream';

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
        const marker = join(cacheDir, '.extracted');

        // 1. Extraction Logic
        if (!existsSync(marker)) {
            console.log(`[BOOTSTRAP] Initializing runtime environment...`);
            if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

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
                Readable.from(readFileSync(payloadArchive)).pipe(createGunzip()).pipe(extract);
            });
            writeFileSync(marker, new Date().toISOString());
        }

        // 2. Setup Native Paths
        const nodeModules = join(cacheDir, 'node_modules');
        const libPaths = new Set();
        const scan = (dir) => {
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const p = join(dir, e.name);
                if (e.isDirectory()) scan(p);
                else if (['.dll', '.so', '.node', '.dylib'].includes(extname(e.name).toLowerCase())) libPaths.add(dir);
            }
        };
        if (existsSync(nodeModules)) scan(nodeModules);

        const envVar = process.platform === 'win32' ? 'PATH' : (process.platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH');
        const sep = process.platform === 'win32' ? ';' : ':';
        process.env[envVar] = Array.from(libPaths).join(sep) + sep + (process.env[envVar] || '');

        // 3. Launch from Disk
        const entryPoint = join(cacheDir, 'app.js');
        console.log('[BOOTSTRAP] Launching payload...');

        // Using dynamic import on the absolute physical path
        await import(entryPoint);

    } catch (err) {
        console.error('[BOOTSTRAP] Fatal Error:', err);
        process.exit(1);
    }
}

bootstrap();
