import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync } from 'fs';

const execAsync = promisify(exec);

async function build() {
    const PAYLOAD_NAME = 'payload.tar.gz';
    console.log('--- STARTING CLEAN-ROOM LOADER BUILD ---');

    try {
        // 1. Create the payload
        await execAsync('bun build-native-bundle.js');

        if (!existsSync('./dist')) mkdirSync('./dist');

        const target = process.platform === 'win32' ? 'bun-windows-x64' : 'bun-linux-x64';
        const outfile = process.platform === 'win32' ? './dist/app-test.exe' : './dist/app-test';

        // 2. Compile the Loader
        const cmd = `bun build --compile --target=${target} bootstrap.js --outfile=${outfile}`;

        console.log(`[BUILD] Compiling loader binary...`);
        await execAsync(cmd);
        console.log(`\n[SUCCESS] Build successful: ${outfile}`);

    } catch (err) {
        console.error('\n[FAILURE] Build failed:', err.message);
        process.exit(1);
    } finally {
        // 3. CLEANUP: Delete the temporary archive
        if (existsSync(PAYLOAD_NAME)) {
            console.log(`[CLEANUP] Removing temporary ${PAYLOAD_NAME}...`);
            rmSync(PAYLOAD_NAME);
        }
    }
}

build();
