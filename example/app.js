// // // app.js - Simple Sharp usage test
// // import sharp from 'sharp';
// // import { writeFileSync } from 'fs';

// // async function main() {
// //   console.log('\n='.repeat(50));
// //   console.log('SHARP TEST APPLICATION');
// //   console.log('='.repeat(50));

// //   try {
// //     console.log('\n[1/3] Creating a 400x300 red image...');

// //     // Create a simple red rectangle
// //     const redImage = await sharp({
// //       create: {
// //         width: 400,
// //         height: 300,
// //         channels: 4,
// //         background: { r: 255, g: 0, b: 0, alpha: 1 }
// //       }
// //     })
// //     .png()
// //     .toBuffer();

// //     console.log('[2/3] Resizing to 200x150...');

// //     // Resize it
// //     const resized = await sharp(redImage)
// //       .resize(200, 150)
// //       .toBuffer();

// //     console.log('[3/3] Writing output.png...');

// //     writeFileSync('output.png', resized);

// //     console.log('\n✓ SUCCESS! Created output.png (200x150 red image)');
// //     console.log('✓ Sharp is working correctly!\n');

// //   } catch (err) {
// //     console.error('\n✗ FAILED:', err.message);
// //     console.error('\nFull error:', err);
// //     process.exit(1);
// //   }
// // }

// // main();


// import sharp from 'sharp';
// // import Database from 'better-sqlite3';
// import bcrypt from 'bcrypt';
// import { createCanvas } from 'canvas';
// import { SerialPort } from 'serialport';
// import argon2 from 'argon2';
// import { writeFileSync } from 'fs';

// async function runSuite() {
//     console.log('═'.repeat(50));
//     console.log('       NATIVE ROBUSTNESS TEST SUITE');
//     console.log('═'.repeat(50));

//     // 1. SHARP (Image Processing / libvips)
//     // try {
//     //     await sharp({ create: { width: 10, height: 10, channels: 3, background: 'red' } }).toBuffer();
//     //     console.log('[SUCCESS] SHARP: Load & libvips resolution success');
//     // } catch (e) { console.error('[FAILURE] SHARP Failed:', e.message); }
//     try {
//       console.log('\n[1/3] Creating a 400x300 red image...');

//       // Create a simple red rectangle
//       const redImage = await sharp({
//         create: {
//           width: 400,
//           height: 300,
//           channels: 4,
//           background: { r: 255, g: 0, b: 0, alpha: 1 }
//         }
//       })
//       .png()
//       .toBuffer();

//       console.log('[2/3] Resizing to 200x150...');

//       // Resize it
//       const resized = await sharp(redImage)
//         .resize(200, 150)
//         .toBuffer();

//       console.log('[3/3] Writing output.png...');

//       writeFileSync('output.png', resized);

//       console.log('\n✓ SUCCESS! Created output.png (200x150 red image)');
//       console.log('✓ Sharp is working correctly!\n');

//     } catch (err) {
//       console.error('\n✗ FAILED:', err.message);
//       console.error('\nFull error:', err);
//       process.exit(1);
//     }

//     // 2. BETTER-SQLITE3 (Database / SQLite C API)
//     // try {
//     //     const db = new Database(':memory:');
//     //     db.prepare('CREATE TABLE test (val TEXT)').run();
//     //     console.log('[SUCCESS] SQLITE3: In-memory DB & C-binding success');
//     // } catch (e) { console.error('[FAILURE] SQLITE3 Failed:', e.message); }

//     // 3. BCRYPT (Cryptography / C++ threadpool)
//     try {
//         const hash = await bcrypt.hash('test', 10);
//         const match = await bcrypt.compare('test', hash);
//         console.log('[SUCCESS] BCRYPT: Hash & Salt native execution success');
//     } catch (e) { console.error('[FAILURE] BCRYPT Failed:', e.message); }

//     // 4. CANVAS (Graphics / Cairo/Pango binaries)
//     try {
//         const canvas = createCanvas(100, 100);
//         const ctx = canvas.getContext('2d');
//         ctx.fillText('Test', 10, 10);
//         console.log('[SUCCESS] CANVAS: Cairo graphics backend success');
//     } catch (e) { console.error('[FAILURE] CANVAS Failed:', e.message); }

//     // 5. ARGON2 (Modern Crypto / Optimized CPU instructions)
//     try {
//         const hash = await argon2.hash("password");
//         console.log('[SUCCESS] ARGON2: SIMD/Instruction set mapping success');
//     } catch (e) { console.error('[FAILURE] ARGON2 Failed:', e.message); }

//     // 6. SERIALPORT (Hardware / Windows Comms API)
//     try {
//         // We just test if it can list ports (uses native binding)
//         await SerialPort.list();
//         console.log('[SUCCESS] SERIALPORT: Windows EnumPorts access success');
//     } catch (e) { console.error('[FAILURE] SERIALPORT Failed:', e.message); }

//     console.log('\n' + '═'.repeat(50));
//     console.log('        TEST SUITE COMPLETE');
//     console.log('═'.repeat(50));
// }

// runSuite();


// Example application using Sharp (native binding)
import sharp from 'sharp';
import { writeFileSync } from 'fs';

async function main() {
  console.log('\n' + '='.repeat(50));
  console.log('BUNDLERBUS EXAMPLE - Image Processing Test');
  console.log('='.repeat(50));

  try {
    console.log('\n[1/3] Creating a 400x300 gradient image...');

    // Create a gradient image
    const image = await sharp({
      create: {
        width: 400,
        height: 300,
        channels: 4,
        background: { r: 255, g: 100, b: 0, alpha: 1 }
      }
    })
    .png()
    .toBuffer();

    console.log('[2/3] Resizing to 200x150...');

    // Resize it
    const resized = await sharp(image)
      .resize(200, 150)
      .toBuffer();

    console.log('[3/3] Writing output.png...');

    writeFileSync('output.png', resized);

    console.log('\n✓ SUCCESS! Created output.png (200x150 gradient image)');
    console.log('✓ Sharp is working correctly with native bindings!\n');

  } catch (err) {
    console.error('\n✗ FAILED:', err.message);
    console.error('\nFull error:', err);
    process.exit(1);
  }
}

main();
