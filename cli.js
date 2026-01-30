#!/usr/bin/env node
// cli.js
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createPayload, cleanupPayload } from './bundler.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

function resolveEntryPoint(args) {
    // Try package.json first
    let packageJson = {};
    if (existsSync('./package.json')) {
        try {
            packageJson = JSON.parse(readFileSync('./package.json', 'utf8'));
        } catch (err) {
            console.error('[FAILURE] Could not parse package.json:', err.message);
            process.exit(1);
        }
    }

    // Check for explicit entry point in args
    const firstArg = args[0];

    // If first arg looks like a file (ends with .js/.ts/.mjs), use it
    if (firstArg && !firstArg.startsWith('-') && /\.(js|mjs|ts|tsx)$/.test(firstArg)) {
        if (!existsSync(firstArg)) {
            console.error(`[FAILURE] Entry point not found: ${firstArg}`);
            process.exit(1);
        }
        return { entryPoint: firstArg, packageJson, bunFlags: args.slice(1) };
    }

    // No explicit entry, check package.json
    let entryPoint = null;

    // Check "bin" field
    if (packageJson.bin) {
        if (typeof packageJson.bin === 'string') {
            entryPoint = packageJson.bin;
        } else if (typeof packageJson.bin === 'object') {
            const binEntries = Object.values(packageJson.bin);
            if (binEntries.length === 1) {
                entryPoint = binEntries[0];
            } else if (binEntries.length > 1) {
                console.error('[FAILURE] Multiple bin entries found in package.json');
                console.error('Please specify entry point explicitly:');
                console.error('  bundlerbus <entry-point> [bun-flags...]');
                process.exit(1);
            }
        }
    }

    // Check "main" field
    if (!entryPoint && packageJson.main) {
        entryPoint = packageJson.main;
    }

    // Fallback checks
    if (!entryPoint) {
        const fallbacks = ['./index.js', './src/index.js', './main.js'];
        for (const fallback of fallbacks) {
            if (existsSync(fallback)) {
                entryPoint = fallback;
                break;
            }
        }
    }

    if (!entryPoint) {
        console.error('[FAILURE] Could not determine entry point');
        console.error('Please specify entry point explicitly:');
        console.error('  bundlerbus <entry-point> [bun-flags...]');
        console.error('Or add "bin" or "main" field to package.json');
        process.exit(1);
    }

    return { entryPoint, packageJson, bunFlags: args };
}

function generateBootstrap(entryPoint, packageJson) {
    const templatePath = resolve(__dirname, 'bootstrap.template.js');
    const template = readFileSync(templatePath, 'utf8');

    // Normalize entry point (remove leading ./)
    const normalizedEntry = entryPoint.replace(/^\.\//, '');

    // Get app metadata
    const appName = packageJson.name || 'bundlerbus-app';
    const appVersion = packageJson.version || '0.0.0';

    // Replace placeholders
    const bootstrap = template
        .replace('___BUNDLERBUS_ENTRY___', normalizedEntry)
        .replace('___BUNDLERBUS_APP_NAME___', appName)
        .replace('___BUNDLERBUS_APP_VERSION___', appVersion);

    writeFileSync('./bootstrap.js', bootstrap);
    console.log('[SUCCESS] Generated bootstrap.js');
}

async function build() {
    console.log('='.repeat(50));
    console.log('BUNDLERBUS - Native Bindings Bundler');
    console.log('='.repeat(50));

    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        console.log(`
Usage:
  bundlerbus <entry-point> [bun-flags...]
  bundlerbus [bun-flags...]

Examples:
  bundlerbus ./src/cli.js --target bun-windows-x64
  bundlerbus ./index.js --outfile ./dist/app.exe --minify
  bundlerbus --target bun-linux-x64 --outfile ./dist/app

Entry Point Resolution:
  1. First positional argument (if it's a .js/.ts file)
  2. package.json "bin" field
  3. package.json "main" field
  4. Fallback to ./index.js or ./src/index.js

All flags after the entry point are forwarded to 'bun build --compile'
`);
        process.exit(0);
    }

    try {
        // Step 1: Resolve entry point
        const { entryPoint, packageJson, bunFlags } = resolveEntryPoint(args);
        console.log(`[INFO] Entry point: ${entryPoint}`);
        console.log(`[INFO] App: ${packageJson.name}@${packageJson.version}`);

        // Step 2: Create payload
        await createPayload(packageJson, entryPoint);

        // Step 3: Generate bootstrap
        generateBootstrap(entryPoint, packageJson);

        // Step 4: Build with Bun
        console.log('[INFO] Compiling with Bun...');
        const bunCmd = ['bun', 'build', '--compile', './bootstrap.js', ...bunFlags].join(' ');
        console.log(`[INFO] Running: ${bunCmd}`);

        execSync(bunCmd, { stdio: 'inherit' });

        console.log('[SUCCESS] Build complete!');

    } catch (err) {
        console.error('[FAILURE] Build failed:', err.message);
        process.exit(1);
    } finally {
        // Step 5: Cleanup
        console.log('[INFO] Cleaning up temporary files...');
        cleanupPayload();
    }

    console.log('='.repeat(50));
}

build();
