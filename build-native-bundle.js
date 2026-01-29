import { createWriteStream, existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { createGzip } from 'zlib';
import tar from 'tar-stream';
import { join } from 'path';

// "Junk" patterns common in node_modules that aren't needed at runtime
// WILL STAY DEACTIVATED FOR NOW
const SKIP_LIST = [
    // 'test', 'tests', '.github', '.circleci', '.bin',
    // 'docs', 'examples', 'example', 'changelog.md',
    // 'readme.md', '.npmignore', '.eslintignore', '.travis.yml'
];

async function bundle() {
    console.log('[BUILDER] Packing app logic + Slimmed node_modules...');
    const pack = tar.pack();
    const gzip = createGzip();
    const output = createWriteStream('payload.tar.gz');

    pack.pipe(gzip).pipe(output);

    function addEntry(localPath, archivePath) {
        if (!existsSync(localPath)) return;
        const stats = statSync(localPath);
        const baseName = localPath.split(/[\\/]/).pop().toLowerCase();

        // Slimming Filter: Skip known junk
        if (SKIP_LIST.includes(baseName)) return;

        if (stats.isDirectory()) {
            readdirSync(localPath).forEach(item => {
                addEntry(join(localPath, item), join(archivePath, item));
            });
        } else {
            // Further optimization: skip source maps and header files
            const ext = baseName.split('.').pop();
            if (['map', 'h', 'cpp', 'c', 'ts'].includes(ext) && localPath.includes('node_modules')) return;

            pack.entry({ name: archivePath, mode: stats.mode }, readFileSync(localPath));
        }
    }

    addEntry('./app.js', 'app.js');
    addEntry('./node_modules', 'node_modules');

    pack.finalize();
    return new Promise(r => output.on('finish', r));
}
bundle();
