import { createWriteStream, existsSync, readdirSync, statSync, readFileSync } from 'fs';
import { createGzip } from 'zlib';
import tar from 'tar-stream';
import { join } from 'path';

async function bundle() {
    console.log('[BUILDER] Packing app logic and dependencies...');
    const pack = tar.pack();
    const gzip = createGzip();
    const output = createWriteStream('payload.tar.gz');

    pack.pipe(gzip).pipe(output);

    function addEntry(localPath, archivePath) {
        if (!existsSync(localPath)) return;
        const stats = statSync(localPath);
        if (stats.isDirectory()) {
            if (localPath.includes('.bin')) return;
            readdirSync(localPath).forEach(item => {
                addEntry(join(localPath, item), join(archivePath, item));
            });
        } else {
            pack.entry({ name: archivePath, mode: stats.mode }, readFileSync(localPath));
        }
    }

    addEntry('./app.js', 'app.js');
    addEntry('./node_modules', 'node_modules');

    pack.finalize();
    return new Promise(r => output.on('finish', r));
}
bundle();
