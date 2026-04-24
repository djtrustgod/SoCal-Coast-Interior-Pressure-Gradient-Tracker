// Build public/favicon.ico from tools/icon-source.svg.
//
// The project's logo is the 🍃 emoji (public/favicon.svg). Browsers render
// the emoji in color via system fonts, but librsvg (sharp's SVG backend) and
// WPF both render color-emoji font glyphs as monochrome outlines. To produce
// a color .ico, we rasterize Twemoji's path-based SVG of the same emoji
// (tools/icon-source.svg, CC-BY 4.0, https://twemoji.twitter.com) which is
// pure paths/fills and renders correctly.
//
// Run:  node tools/make-icon.js

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SIZES = [16, 32, 48, 64, 128, 256];
const repoRoot = path.resolve(__dirname, '..');
const srcSvg = path.join(__dirname, 'icon-source.svg');
const dstIco = path.join(repoRoot, 'public', 'favicon.ico');

async function main() {
    if (!fs.existsSync(srcSvg)) throw new Error(`Missing source: ${srcSvg}`);
    const svgBuf = fs.readFileSync(srcSvg);

    const pngs = [];
    for (const size of SIZES) {
        const png = await sharp(svgBuf, { density: 384 })
            .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer();
        pngs.push({ size, png });
    }

    // ICO header (ICONDIR): reserved(2) | type=1(2) | count(2)
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(pngs.length, 4);

    // ICONDIRENTRY per image (16 bytes each)
    const entries = Buffer.alloc(pngs.length * 16);
    let offset = 6 + entries.length;
    pngs.forEach((p, i) => {
        const e = i * 16;
        entries.writeUInt8(p.size >= 256 ? 0 : p.size, e);       // width  (0 = 256)
        entries.writeUInt8(p.size >= 256 ? 0 : p.size, e + 1);   // height (0 = 256)
        entries.writeUInt8(0, e + 2);                            // color count
        entries.writeUInt8(0, e + 3);                            // reserved
        entries.writeUInt16LE(1, e + 4);                         // planes
        entries.writeUInt16LE(32, e + 6);                        // bits per pixel
        entries.writeUInt32LE(p.png.length, e + 8);              // bytes in resource
        entries.writeUInt32LE(offset, e + 12);                   // file offset of image data
        offset += p.png.length;
    });

    const ico = Buffer.concat([header, entries, ...pngs.map(p => p.png)]);
    fs.writeFileSync(dstIco, ico);

    console.log(`Wrote ${dstIco}`);
    console.log(`  sizes: ${SIZES.join(', ')}  total: ${ico.length} bytes`);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
