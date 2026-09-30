const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '../assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// 1x1 pixel base64 PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const buffer = Buffer.from(base64Png, 'base64');

['icon.png', 'splash.png', 'adaptive-icon.png', 'favicon.png'].forEach((file) => {
  fs.writeFileSync(path.join(assetsDir, file), buffer);
});

console.log('Created asset placeholders in mobile/assets');
