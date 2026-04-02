/**
 * Icon Generator Script
 * 
 * This script generates PNG icons in various sizes from the SVG icon.
 * Run with: node scripts/generate-icons.js
 * 
 * Note: This requires a tool like ImageMagick, sharp, or similar.
 * For now, we'll create placeholder instructions.
 */

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

console.log('PWA Icon Generator');
console.log('==================');
console.log('');
console.log('Required icon sizes:', sizes.join(', '));
console.log('');
console.log('SVG source:', svgPath);
console.log('');
console.log('To generate PNG icons, you can use one of these methods:');
console.log('');
console.log('Option 1: Using sharp (Node.js)');
console.log('  npm install sharp');
console.log('  Then run this script again');
console.log('');
console.log('Option 2: Using ImageMagick');
console.log('  Install ImageMagick from https://imagemagick.org');
console.log('  Run:');
sizes.forEach(size => {
  console.log(`  convert -background none public/icon.svg -resize ${size}x${size} public/icon-${size}x${size}.png`);
});
console.log('');
console.log('Option 3: Using an online converter');
console.log('  1. Go to https://convertio.co/svg-png/ or similar');
console.log('  2. Upload public/icon.svg');
console.log('  3. Download PNGs in these sizes:', sizes.join(', '));
console.log('  4. Rename them to: icon-72x72.png, icon-96x96.png, etc.');
console.log('');
console.log('Option 4: Using Figma or Sketch');
console.log('  1. Import public/icon.svg');
console.log('  2. Export frames in each required size');
console.log('  3. Save to public/ directory');
console.log('');

// Check if sharp is available
try {
  const sharp = require('sharp');
  
  async function generateIcons() {
    console.log('Generating icons using sharp...');
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      
      console.log(`  ✓ Generated icon-${size}x${size}.png`);
    }
    
    console.log('');
    console.log('All icons generated successfully!');
  }
  
  generateIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
  
} catch (err) {
  // sharp not installed, show manual instructions
  console.log('Note: sharp is not installed. Install it with: npm install --save-dev sharp');
  console.log('');
}
