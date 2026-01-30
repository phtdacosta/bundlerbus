// bootstrap.template.js
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, createWriteStream, rmSync, chmodSync } from 'fs';
import { join, dirname, extname } from 'path';
import { homedir } from 'os';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { createHash } from 'crypto';

// The embedded archive
import payloadArchive from './payload.tar.gz' with { type: 'file' };

const APP_NAME = '___BUNDLERBUS_APP_NAME___';
const APP_VERSION = '___BUNDLERBUS_APP_VERSION___';

function getCacheDir() {
    const platform = process.platform;
    if (platform === 'win32') {
        return join(process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local'), APP_NAME, APP_VERSION);
    } else if (platform === 'darwin') {
        return join(homedir(), 'Library', 'Application Support', APP_NAME, APP_VERSION);
    } else {
        // Linux / Unix (XDG Spec)
        const base = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
        return join(base, APP_NAME, APP_VERSION);
    }
}

async function bootstrap() {
    try {
        const cacheDir = getCacheDir();
        const payloadBuffer = readFileSync(payloadArchive);

        const currentHash = createHash('md5').update(payloadBuffer).digest('hex');
        const hashFile = join(cacheDir, '.hash');
        const existingHash = existsSync(hashFile) ? readFileSync(hashFile, 'utf8') : null;

        if (currentHash !== existingHash) {
            console.log('[BOOTSTRAP] Unfolding environment...');
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
                        const outStream = createWriteStream(outPath);
                        stream.pipe(outStream);
                        outStream.on('finish', () => {
                            // On Unix, ensure binaries are executable
                            if (process.platform !== 'win32') {
                                const isBin = outPath.endsWith('.node') || outPath.endsWith('.so') ||
                                              outPath.endsWith('.dylib') || outPath.includes('bin/');
                                if (isBin) chmodSync(outPath, 0o755);
                            }
                            next();
                        });
                        outStream.on('error', reject);
                    }
                });
                extract.on('finish', resolve);
                Readable.from(payloadBuffer).pipe(createGunzip()).pipe(extract);
            });
            writeFileSync(hashFile, currentHash);
        }

        // --- NATIVE SEARCH PATH INJECTION ---
        const nodeModules = join(cacheDir, 'node_modules');
        const libPaths = new Set();
        const scan = (dir) => {
            if (!existsSync(dir)) return;
            const entries = readdirSync(dir, { withFileTypes: true });
            for (const e of entries) {
                const p = join(dir, e.name);
                if (e.isDirectory()) scan(p);
                else if (['.dll', '.so', '.node', '.dylib'].includes(extname(e.name).toLowerCase())) {
                    libPaths.add(dir);
                }
            }
        };
        scan(nodeModules);

        const platform = process.platform;
        const envVar = platform === 'win32' ? 'PATH' : (platform === 'darwin' ? 'DYLD_LIBRARY_PATH' : 'LD_LIBRARY_PATH');
        const sep = platform === 'win32' ? ';' : ':';

        // Inject native paths into the OS environment
        process.env[envVar] = Array.from(libPaths).join(sep) + sep + (process.env[envVar] || '');

        const entryPoint = join(cacheDir, '___BUNDLERBUS_ENTRY___');
        await import(entryPoint);

    } catch (err) {
        console.error('[BOOTSTRAP] Fatal Error:', err);
        process.exit(1);
    }
}

bootstrap();
