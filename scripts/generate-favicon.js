const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Convert SVG to PNG first
    await sharp('public/favicon.svg')
      .resize(32, 32)
      .toFile('public/favicon.png');

    // Convert PNG to ICO format
    const pngBuffer = fs.readFileSync('public/favicon.png');
    await sharp(pngBuffer)
      .toFormat('ico')
      .toFile('public/favicon.ico');

    // Clean up temporary PNG file
    fs.unlinkSync('public/favicon.png');

    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon(); 