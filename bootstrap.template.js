// bootstrap.template.js (DEBUG VERSION)
import { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream, rmSync, chmodSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { homedir } from 'os';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { createHash } from 'crypto';

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
        const base = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
        return join(base, APP_NAME, APP_VERSION);
    }
}

async function bootstrap() {
    try {
        const cacheDir = getCacheDir();
        const flagFile = join(cacheDir, '.done');
        const hashFile = join(cacheDir, '.hash');

        let needsExtraction = !existsSync(flagFile);
        
        if (!needsExtraction) {
            const payloadBuffer = readFileSync(payloadArchive);
            const currentHash = createHash('sha256').update(payloadBuffer).digest('hex');
            const storedHash = existsSync(hashFile) ? readFileSync(hashFile, 'utf8').trim() : null;
            
            if (currentHash !== storedHash) {
                console.log('[BOOTSTRAP] Cache hash mismatch, re-extracting...');
                needsExtraction = true;
            }
        }

        if (needsExtraction) {
            console.log('[BOOTSTRAP] Unfolding environment...');
            
            if (existsSync(cacheDir)) rmSync(cacheDir, { recursive: true, force: true });
            mkdirSync(cacheDir, { recursive: true });

            const payloadBuffer = readFileSync(payloadArchive);
            const currentHash = createHash('sha256').update(payloadBuffer).digest('hex');

            const extract = tar.extract();
            extract.on('entry', (header, stream, next) => {
                const fullPath = join(cacheDir, header.name);
                
                if (header.type === 'directory') {
                    mkdirSync(fullPath, { recursive: true });
                    stream.resume();
                    next();
                } else {
                    mkdirSync(dirname(fullPath), { recursive: true });
                    stream.pipe(createWriteStream(fullPath)).on('finish', () => {
                        if (header.mode && process.platform !== 'win32') {
                            try {
                                chmodSync(fullPath, header.mode);
                            } catch (err) {}
                        }
                        next();
                    });
                }
            });

            await new Promise((resolve, reject) => {
                extract.on('finish', resolve);
                extract.on('error', reject);
                Readable.from(payloadBuffer).pipe(createGunzip()).pipe(extract);
            });

            writeFileSync(hashFile, currentHash);
            writeFileSync(flagFile, 'true');
        }

        // ========================================================================
        // DEBUG: Show what we're working with
        // ========================================================================
        const userArgs = process.argv.slice(2);
        console.log('[BOOTSTRAP DEBUG] Raw argv:', process.argv);
        console.log('[BOOTSTRAP DEBUG] User args:', userArgs);
        console.log('[BOOTSTRAP DEBUG] Current cwd BEFORE any chdir:', process.cwd());

        // ========================================================================
        // CONDITIONAL WORKING DIRECTORY LOGIC
        // ========================================================================
        const hasPathArguments = userArgs.some(arg => {
            if (arg.startsWith('-')) return false;
            
            const commands = ['serve', 'build', 'dev', 'start', 'test', 'help', 'version', 's', 'b', 'd', 'h', 'v'];
            if (commands.includes(arg.toLowerCase())) return false;
            
            const isPath = (
                arg.includes('/') ||
                arg.includes('\\') ||
                isAbsolute(arg) ||
                existsSync(arg)
            );
            
            if (isPath) {
                console.log(`[BOOTSTRAP DEBUG] Detected path argument: "${arg}"`);
            }
            
            return isPath;
        });

        console.log('[BOOTSTRAP DEBUG] hasPathArguments:', hasPathArguments);

        if (!hasPathArguments) {
            const exeFolder = dirname(process.argv[0]);
            console.log('[BOOTSTRAP DEBUG] No path args detected, changing to exe folder:', exeFolder);
            process.chdir(exeFolder);
        } else {
            console.log('[BOOTSTRAP DEBUG] Path arguments detected, NOT changing directory');
        }

        console.log('[BOOTSTRAP DEBUG] Final cwd:', process.cwd());

        process.env.NODE_PATH = join(cacheDir, 'node_modules');

        const entryPoint = join(cacheDir, '___BUNDLERBUS_ENTRY___');
        
        process.argv = [process.argv[0], entryPoint, ...userArgs];
        console.log('[BOOTSTRAP DEBUG] Reconstructed argv:', process.argv);

        const importPath = `file:///${entryPoint.replace(/\\/g, '/')}`;
        await import(importPath);

    } catch (err) {
        console.error('[BOOTSTRAP] Fatal Error:', err);
        process.exit(1);
    }
}

bootstrap();