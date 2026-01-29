import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync } from 'fs';

const execAsync = promisify(exec);

async function build() {
    console.log('--- STARTING CLEAN-ROOM LOADER BUILD ---');
    try {
        await execAsync('bun build-native-bundle.js');
        if (!existsSync('./dist')) mkdirSync('./dist');

        const target = process.platform === 'win32' ? 'bun-windows-x64' : 'bun-linux-x64';
        const outfile = process.platform === 'win32' ? './dist/app-test.exe' : './dist/app-test';

        // Notice: NO --external flags needed anymore.
        // Bun only compiles the bootstrap code.
        const cmd = `bun build --compile --target=${target} bootstrap.js --outfile=${outfile}`;

        console.log(`[BUILD] Creating binary...`);
        await execAsync(cmd);
        console.log(`\n[SUCCESS] Build successful: ${outfile}`);
    } catch (err) {
        console.error('\n[FAILURE] Build failed:', err.message);
        process.exit(1);
    }
}
build();
