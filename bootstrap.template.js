// bootstrap.template.js (PRODUCTION-HARDENED VERSION)
// Verbose debug logging enabled for production troubleshooting
import { existsSync, mkdirSync, writeFileSync, readFileSync, createWriteStream, rmSync, chmodSync, statSync, readdirSync } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { homedir, tmpdir } from 'os';
import { createGunzip } from 'zlib';
import { Readable } from 'stream';
import tar from 'tar-stream';
import { createHash } from 'crypto';

import payloadArchive from './payload.tar.gz' with { type: 'file' };

const APP_NAME = '___BUNDLERBUS_APP_NAME___';
const APP_VERSION = '___BUNDLERBUS_APP_VERSION___';

// ============================================================================
// CACHE DIRECTORY DISCOVERY WITH FALLBACKS
// ============================================================================

/**
 * Get list of cache directory candidates in priority order
 * Tries: OS standard → system temp → current directory
 */
function getCacheDirCandidates() {
    const candidates = [];
    const platform = process.platform;

    console.log(`[BOOTSTRAP DEBUG] Platform: ${platform}`);

    // Priority 1: Standard OS cache location
    if (platform === 'win32') {
        const localAppData = process.env.LOCALAPPDATA || join(homedir(), 'AppData', 'Local');
        candidates.push(join(localAppData, APP_NAME, APP_VERSION));
    } else if (platform === 'darwin') {
        candidates.push(join(homedir(), 'Library', 'Application Support', APP_NAME, APP_VERSION));
    } else {
        // Linux / Unix (XDG spec)
        const xdgCache = process.env.XDG_CACHE_HOME || join(homedir(), '.cache');
        candidates.push(join(xdgCache, APP_NAME, APP_VERSION));
    }

    // Priority 2: System temp directory
    candidates.push(join(tmpdir(), APP_NAME, APP_VERSION));

    // Priority 3: Current working directory (last resort)
    candidates.push(join(process.cwd(), '.bundlerbus-cache', APP_VERSION));

    console.log(`[BOOTSTRAP DEBUG] Cache directory candidates (in priority order):`);
    candidates.forEach((dir, i) => {
        console.log(`[BOOTSTRAP DEBUG] ${i + 1}. ${dir}`);
    });

    return candidates;
}

/**
 * Find first writable cache directory from candidates
 * Tests each location by trying to create dir and write test file
 */
function findWritableCacheDir() {
    const candidates = getCacheDirCandidates();

    for (let i = 0; i < candidates.length; i++) {
        const dir = candidates[i];
        console.log(`[BOOTSTRAP CACHE] Testing candidate ${i + 1}/${candidates.length}: ${dir}`);

        try {
            // Try to create directory
            mkdirSync(dir, { recursive: true });

            // Test write permission with a test file
            const testFile = join(dir, '.write-test');
            writeFileSync(testFile, 'test', 'utf8');

            // Verify we can read it back
            const content = readFileSync(testFile, 'utf8');
            if (content !== 'test') {
                throw new Error('Write test failed: content mismatch');
            }

            // Clean up test file
            rmSync(testFile, { force: true });

            console.log(`[BOOTSTRAP CACHE] ✓ Selected writable cache directory: ${dir}`);
            return dir;

        } catch (err) {
            console.log(`[BOOTSTRAP CACHE] ✗ Not writable: ${dir} (${err.code || err.message})`);

            // Try to clean up if we created it but failed the test
            try {
                if (existsSync(dir)) {
                    const entries = readdirSync(dir);
                    if (entries.length === 0) {
                        rmSync(dir, { recursive: true, force: true });
                    }
                }
            } catch (cleanupErr) {
                // Ignore cleanup errors
            }

            continue;
        }
    }

    // All candidates failed
    console.error('[BOOTSTRAP ERROR] Cannot find writable cache directory!');
    console.error('[BOOTSTRAP ERROR] Tried locations:');
    candidates.forEach((dir, i) => {
        console.error(`[BOOTSTRAP ERROR] ${i + 1}. ${dir}`);
    });
    console.error('[BOOTSTRAP ERROR]');
    console.error('[BOOTSTRAP ERROR] Possible causes:');
    console.error('[BOOTSTRAP ERROR] - Corporate policy restricts write access');
    console.error('[BOOTSTRAP ERROR] - Running in read-only container/environment');
    console.error('[BOOTSTRAP ERROR] - Disk is full');
    console.error('[BOOTSTRAP ERROR] - SELinux/AppArmor denying access');
    console.error('[BOOTSTRAP ERROR]');
    console.error('[BOOTSTRAP ERROR] Solutions:');
    console.error('[BOOTSTRAP ERROR] 1. Check disk space: df -h (Linux/Mac) or dir C:\\ (Windows)');
    console.error('[BOOTSTRAP ERROR] 2. Check permissions on cache directories');
    console.error('[BOOTSTRAP ERROR] 3. Set writable TMPDIR environment variable');
    console.error('[BOOTSTRAP ERROR] 4. Run from a directory you own');

    throw new Error('No writable cache directory available. See error log above for details.');
}

// ============================================================================
// LOCK FILE MANAGEMENT (PREVENTS RACE CONDITIONS)
// ============================================================================

const LOCK_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes - stale lock threshold
const LOCK_WAIT_MAX_MS = 5 * 60 * 1000; // 5 minutes - max wait time
const LOCK_CHECK_INTERVAL_MS = 100; // 100ms between lock checks

/**
 * Acquire extraction lock (prevents concurrent extraction)
 * Returns true if lock acquired, false if another process owns it
 */
function tryAcquireLock(lockFile) {
    try {
        // Check for stale lock first
        if (existsSync(lockFile)) {
            console.log('[BOOTSTRAP LOCK] Lock file exists, checking if stale...');

            try {
                const lockStats = statSync(lockFile);
                const lockAge = Date.now() - lockStats.mtimeMs;

                console.log(`[BOOTSTRAP LOCK] Lock age: ${Math.round(lockAge / 1000)}s`);

                if (lockAge > LOCK_MAX_AGE_MS) {
                    console.log('[BOOTSTRAP LOCK] Lock is stale (older than 5 minutes), removing...');
                    rmSync(lockFile, { force: true });
                } else {
                    console.log('[BOOTSTRAP LOCK] Lock is fresh, another instance is extracting');
                    return false;
                }
            } catch (statErr) {
                // Lock file disappeared between existsSync and statSync - that's fine
                console.log('[BOOTSTRAP LOCK] Lock file disappeared, will try to acquire');
            }
        }

        // Try to create lock file atomically
        const lockContent = JSON.stringify({
            pid: process.pid,
            timestamp: Date.now(),
            hostname: process.env.HOSTNAME || process.env.COMPUTERNAME || 'unknown'
        }, null, 2);

        writeFileSync(lockFile, lockContent, { flag: 'wx' }); // 'wx' = exclusive create, fails if exists

        console.log(`[BOOTSTRAP LOCK] ✓ Acquired lock (PID: ${process.pid})`);
        return true;

    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log('[BOOTSTRAP LOCK] Lock acquired by another process (EEXIST)');
            return false;
        }
        throw err;
    }
}

/**
 * Release extraction lock
 */
function releaseLock(lockFile) {
    try {
        if (existsSync(lockFile)) {
            rmSync(lockFile, { force: true });
            console.log('[BOOTSTRAP LOCK] ✓ Released lock');
        }
    } catch (err) {
        console.log(`[BOOTSTRAP LOCK] Failed to release lock: ${err.message}`);
        // Don't throw - lock will be cleaned up as stale next time
    }
}

/**
 * Wait for another instance to finish extraction
 */
async function waitForExtraction(lockFile, flagFile) {
    console.log('[BOOTSTRAP LOCK] Waiting for other instance to finish extraction...');

    const startTime = Date.now();
    let lastLogTime = startTime;

    while (existsSync(lockFile)) {
        const elapsed = Date.now() - startTime;

        // Log progress every 5 seconds
        if (Date.now() - lastLogTime > 5000) {
            console.log(`[BOOTSTRAP LOCK] Still waiting... (${Math.round(elapsed / 1000)}s elapsed)`);
            lastLogTime = Date.now();
        }

        // Timeout check
        if (elapsed > LOCK_WAIT_MAX_MS) {
            console.error('[BOOTSTRAP ERROR] Timeout waiting for extraction to complete!');
            console.error('[BOOTSTRAP ERROR] This could mean:');
            console.error('[BOOTSTRAP ERROR] - Another instance crashed during extraction');
            console.error('[BOOTSTRAP ERROR] - Extraction is taking longer than expected');
            console.error('[BOOTSTRAP ERROR] - Lock file is stuck');
            console.error('[BOOTSTRAP ERROR]');
            console.error('[BOOTSTRAP ERROR] Manual fix: Delete the lock file and cache directory:');
            console.error(`[BOOTSTRAP ERROR] Lock: ${lockFile}`);
            console.error(`[BOOTSTRAP ERROR] Cache: ${dirname(lockFile)}`);
            throw new Error('Timeout waiting for extraction lock');
        }

        // Wait a bit before checking again
        await new Promise(resolve => setTimeout(resolve, LOCK_CHECK_INTERVAL_MS));
    }

    console.log('[BOOTSTRAP LOCK] Other instance finished, verifying extraction...');

    // Verify the other instance succeeded
    if (!existsSync(flagFile)) {
        console.error('[BOOTSTRAP ERROR] Other instance failed to complete extraction!');
        console.error('[BOOTSTRAP ERROR] Cache may be corrupted. Will attempt re-extraction.');
        throw new Error('Extraction incomplete after lock released');
    }

    console.log('[BOOTSTRAP LOCK] ✓ Extraction verified complete');
}

// ============================================================================
// DISK SPACE CHECK
// ============================================================================

/**
 * Check if sufficient disk space is available
 * Estimates uncompressed size as 3x compressed size
 */
function checkDiskSpace(cacheDir, payloadSize) {
    try {
        // For now, just log a warning if we can't check
        // Real implementation would use statfs on Unix or GetDiskFreeSpaceEx on Windows
        const estimatedSize = payloadSize * 3; // Rough estimate: 3x compressed size
        const estimatedSizeMB = Math.round(estimatedSize / 1024 / 1024);

        console.log(`[BOOTSTRAP DEBUG] Payload size: ${Math.round(payloadSize / 1024 / 1024)}MB (compressed)`);
        console.log(`[BOOTSTRAP DEBUG] Estimated extraction size: ~${estimatedSizeMB}MB`);
        console.log(`[BOOTSTRAP DEBUG] Recommended free space: ${estimatedSizeMB * 2}MB`);

        // TODO: Add actual disk space check in v1.2
        // For now, just log the requirements

    } catch (err) {
        console.log(`[BOOTSTRAP DEBUG] Could not check disk space: ${err.message}`);
    }
}

// ============================================================================
// MAIN BOOTSTRAP FUNCTION
// ============================================================================

async function bootstrap() {
    const startTime = Date.now();
    console.log(`[BOOTSTRAP TIMING] Bootstrap started at ${new Date().toISOString()}`);

    try {
        // Find writable cache directory (with fallbacks)
        const cacheDir = findWritableCacheDir();
        const flagFile = join(cacheDir, '.done');
        const hashFile = join(cacheDir, '.hash');
        const lockFile = join(cacheDir, '.lock');

        // Check if extraction is needed
        let needsExtraction = !existsSync(flagFile);

        if (!needsExtraction) {
            console.log('[BOOTSTRAP CACHE] Cache exists, verifying integrity...');

            // Fast path: cache exists, verify hash
            const payloadBuffer = readFileSync(payloadArchive);
            const currentHash = createHash('sha256').update(payloadBuffer).digest('hex');
            const storedHash = existsSync(hashFile) ? readFileSync(hashFile, 'utf8').trim() : null;

            console.log(`[BOOTSTRAP DEBUG] Current hash: ${currentHash}`);
            console.log(`[BOOTSTRAP DEBUG] Stored hash: ${storedHash || '(none)'}`);

            if (currentHash !== storedHash) {
                console.log('[BOOTSTRAP CACHE] Hash mismatch - payload has changed, re-extracting...');
                needsExtraction = true;
            } else {
                console.log('[BOOTSTRAP CACHE] ✓ Hash verified, using cached environment');
            }
        } else {
            console.log('[BOOTSTRAP CACHE] No cache found, first-time extraction needed');
        }

        if (needsExtraction) {
            console.log('[BOOTSTRAP] Unfolding environment...');

            // Try to acquire lock
            const lockAcquired = tryAcquireLock(lockFile);

            if (!lockAcquired) {
                // Another instance is extracting, wait for it
                await waitForExtraction(lockFile, flagFile);
                console.log('[BOOTSTRAP] Extraction complete (done by other instance)');
            } else {
                // We own the lock, do the extraction
                try {
                    // Clean and recreate cache directory
                    if (existsSync(cacheDir)) {
                        console.log('[BOOTSTRAP] Removing old cache...');

                        try {
                            rmSync(cacheDir, { recursive: true, force: true });
                        } catch (rmErr) {
                            // Windows: Files in use by another instance
                            if (rmErr.code === 'EACCES' || rmErr.code === 'EBUSY' || rmErr.code === 'EPERM') {
                                console.error('[BOOTSTRAP ERROR] Cannot delete cache - files are in use!');
                                console.error('[BOOTSTRAP ERROR]');
                                console.error('[BOOTSTRAP ERROR] This usually means:');
                                console.error('[BOOTSTRAP ERROR] - Another instance of the app is running');
                                console.error('[BOOTSTRAP ERROR] - A file explorer window has the cache open');
                                console.error('[BOOTSTRAP ERROR] - An antivirus is scanning the files');
                                console.error('[BOOTSTRAP ERROR]');
                                console.error('[BOOTSTRAP ERROR] Solutions:');
                                console.error('[BOOTSTRAP ERROR] 1. Close all running instances of the app');
                                console.error('[BOOTSTRAP ERROR] 2. Wait a few seconds and try again');
                                console.error('[BOOTSTRAP ERROR] 3. Manually delete: ' + cacheDir);
                                console.error('[BOOTSTRAP ERROR]');

                                // Release lock before exiting
                                releaseLock(lockFile);

                                throw new Error('Cache directory is locked by another process. Close all app instances and retry.');
                            }

                            // Other errors, re-throw
                            throw rmErr;
                        }
                    }

                    console.log(`[BOOTSTRAP] Creating cache directory: ${cacheDir}`);
                    mkdirSync(cacheDir, { recursive: true });

                    // Read and hash payload
                    console.log('[BOOTSTRAP] Reading payload...');
                    const payloadBuffer = readFileSync(payloadArchive);
                    const payloadSize = payloadBuffer.length;
                    console.log(`[BOOTSTRAP] Payload size: ${Math.round(payloadSize / 1024 / 1024)}MB`);

                    // Check disk space
                    checkDiskSpace(cacheDir, payloadSize);

                    const currentHash = createHash('sha256').update(payloadBuffer).digest('hex');
                    console.log(`[BOOTSTRAP] Payload hash: ${currentHash}`);

                    // Extract tarball
                    console.log('[BOOTSTRAP] Extracting archive...');
                    let extractedFiles = 0;
                    const directoriesCreated = new Set();  // Track unique directories

                    const extract = tar.extract();
                    extract.on('entry', (header, stream, next) => {
                        const fullPath = join(cacheDir, header.name);

                        if (header.type === 'directory') {
                            mkdirSync(fullPath, { recursive: true });
                            stream.resume();
                            next();
                        } else {
                            const dir = dirname(fullPath);
                            mkdirSync(dir, { recursive: true });

                            // Track parent directories
                            let currentDir = dir;
                            while (currentDir !== cacheDir && currentDir !== dirname(currentDir)) {
                                directoriesCreated.add(currentDir);
                                currentDir = dirname(currentDir);
                            }

                            stream.pipe(createWriteStream(fullPath)).on('finish', () => {
                                if (header.mode && process.platform !== 'win32') {
                                    try {
                                        chmodSync(fullPath, header.mode);
                                    } catch (err) {}
                                }

                                extractedFiles++;

                                if (extractedFiles % 500 === 0) {
                                    console.log(`[BOOTSTRAP] Extracted ${extractedFiles} files...`);
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

                    console.log(`[BOOTSTRAP] ✓ Extraction complete: ${extractedFiles} files, ${directoriesCreated.size} directories created`);

                    // Write hash and completion flag
                    writeFileSync(hashFile, currentHash);
                    writeFileSync(flagFile, 'true');

                    console.log('[BOOTSTRAP] ✓ Cache validated and marked ready');

                } finally {
                    // Always release lock, even if extraction failed
                    releaseLock(lockFile);
                }
            }
        }

        // ========================================================================
        // ARGUMENT PROCESSING
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

        // ========================================================================
        // ENVIRONMENT SETUP
        // ========================================================================
        process.env.NODE_PATH = join(cacheDir, 'node_modules');
        console.log('[BOOTSTRAP DEBUG] NODE_PATH set to:', process.env.NODE_PATH);

        const entryPoint = join(cacheDir, '___BUNDLERBUS_ENTRY___');
        console.log('[BOOTSTRAP DEBUG] Entry point:', entryPoint);

        // Reconstruct argv
        process.argv = [process.argv[0], entryPoint, ...userArgs];
        console.log('[BOOTSTRAP DEBUG] Reconstructed argv:', process.argv);

        const importPath = `file:///${entryPoint.replace(/\\/g, '/')}`;

        const elapsedMs = Date.now() - startTime;
        console.log(`[BOOTSTRAP TIMING] Bootstrap completed in ${elapsedMs}ms`);
        console.log(`[BOOTSTRAP] Launching application...`);

        await import(importPath);

    } catch (err) {
        console.error('[BOOTSTRAP ERROR] Fatal error during bootstrap!');
        console.error('[BOOTSTRAP ERROR] Error:', err);
        console.error('[BOOTSTRAP ERROR] Stack:', err.stack);
        console.error('[BOOTSTRAP ERROR]');
        console.error('[BOOTSTRAP ERROR] Troubleshooting steps:');
        console.error('[BOOTSTRAP ERROR] 1. Check disk space');
        console.error('[BOOTSTRAP ERROR] 2. Delete cache directory and try again');
        console.error('[BOOTSTRAP ERROR] 3. Check file permissions');
        console.error('[BOOTSTRAP ERROR] 4. Run with elevated privileges');
        process.exit(1);
    }
}

bootstrap();
