const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateFavicon() {
  try {
    // Chuyển đổi SVG sang PNG trước
    await sharp('public/favicon.svg')
      .resize(32, 32)
      .toFile('public/favicon.png');

    // Chuyển đổi PNG sang định dạng ICO
    const pngBuffer = fs.readFileSync('public/favicon.png');
    await sharp(pngBuffer)
      .toFormat('ico')
      .toFile('public/favicon.ico');

    // Dọn dẹp file PNG tạm thời
    fs.unlinkSync('public/favicon.png');

    console.log('Favicon generated successfully!');
  } catch (error) {
    console.error('Error generating favicon:', error);
  }
}

generateFavicon();
