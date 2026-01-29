import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

async function build() {
    const PAYLOAD_NAME = 'payload.tar.gz';
    console.log(`--- STARTING UNIVERSAL BUILD (${process.platform}-${process.arch}) ---`);

    try {
        // 1. Create the payload using the packer script
        await execAsync('bun build-native-bundle.js');

        if (!existsSync('./dist')) mkdirSync('./dist');

        // 2. Determine target string for Bun
        // Matches: bun-windows-x64, bun-linux-x86_64, bun-darwin-arm64, etc.
        const platform = process.platform;
        const arch = process.arch === 'x64' ? 'x64' : process.arch;
        const target = `bun-${platform === 'win32' ? 'windows' : platform}-${arch}`;

        const ext = platform === 'win32' ? '.exe' : '';
        const outfile = join('./dist', `app-${platform}-${arch}${ext}`);

        // 3. Compile the Loader
        console.log(`[BUILD] Target: ${target}`);
        const cmd = `bun build --compile --target=${target} bootstrap.js --outfile=${outfile}`;

        await execAsync(cmd);
        console.log(`\n[SUCCESS] Build successful: ${outfile}`);

    } catch (err) {
        console.error('\n[FAILURE] Build failed:', err.message);
        process.exit(1);
    } finally {
        if (existsSync(PAYLOAD_NAME)) {
            console.log(`[CLEANUP] Removing temporary ${PAYLOAD_NAME}...`);
            rmSync(PAYLOAD_NAME);
        }
    }
}

build();
