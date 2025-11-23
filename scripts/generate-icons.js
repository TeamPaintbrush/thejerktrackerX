#!/usr/bin/env node

/**
 * Simple SVG to PNG icon generator for PWA
 * Creates all required icon sizes for the JERK Tracker app
 * 
 * Usage: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// SVG template for the JERK Tracker icon
const iconSVG = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ed7734;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#de5d20;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="512" height="512" rx="80" ry="80" fill="url(#bg)"/>
  
  <!-- JT Monogram -->
  <text x="256" y="320" font-family="system-ui, -apple-system, sans-serif" 
        font-size="240" font-weight="800" text-anchor="middle" fill="white">JT</text>
  
  <!-- QR Code dots pattern -->
  <circle cx="100" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="130" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="160" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="100" cy="130" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="160" cy="130" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="100" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="130" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="160" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
  
  <circle cx="412" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="382" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="352" cy="100" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="412" cy="130" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="352" cy="130" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="412" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="382" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
  <circle cx="352" cy="160" r="12" fill="rgba(255,255,255,0.3)"/>
</svg>
`.trim();

// Required icon sizes for PWA
const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Shortcut icons (simplified versions)
const shortcuts = {
  'shortcut-dashboard.png': 'D',
  'shortcut-order.png': '+',
  'shortcut-qr.png': '□'
};

// Create icons directory
const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Generating PWA icons for JERK Tracker...');

// Generate main app icons
iconSizes.forEach(size => {
  const filename = `icon-${size}x${size}.png`;
  const svgContent = iconSVG.replace(/width="512" height="512"/, `width="${size}" height="${size}"`);
  
  // For this example, we'll save SVG files that can be converted to PNG later
  // In a real app, you'd use a library like sharp or puppeteer to generate PNGs
  fs.writeFileSync(path.join(iconsDir, filename.replace('.png', '.svg')), svgContent);
  console.log(`✓ Generated ${filename} (as SVG)`);
});

// Generate shortcut icons
Object.entries(shortcuts).forEach(([filename, letter]) => {
  const shortcutSVG = `
<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">
  <rect width="96" height="96" rx="15" ry="15" fill="#ed7734"/>
  <text x="48" y="65" font-family="system-ui, sans-serif" 
        font-size="48" font-weight="700" text-anchor="middle" fill="white">${letter}</text>
</svg>
  `.trim();
  
  fs.writeFileSync(path.join(iconsDir, filename.replace('.png', '.svg')), shortcutSVG);
  console.log(`✓ Generated ${filename} (as SVG)`);
});

// Create a simple HTML preview
const previewHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>JERK Tracker Icons Preview</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 2rem; background: #fafaf9; }
    .icon-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .icon-item { text-align: center; padding: 1rem; background: white; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .icon-item img { width: 64px; height: 64px; margin-bottom: 0.5rem; }
    .shortcut-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 1rem; margin: 2rem 0; }
  </style>
</head>
<body>
  <h1>🎯 JERK Tracker PWA Icons</h1>
  
  <h2>Main App Icons</h2>
  <div class="icon-grid">
    ${iconSizes.map(size => `
      <div class="icon-item">
        <img src="icons/icon-${size}x${size}.svg" alt="${size}x${size}" />
        <div>${size}×${size}</div>
      </div>
    `).join('')}
  </div>
  
  <h2>Shortcut Icons</h2>
  <div class="shortcut-grid">
    ${Object.keys(shortcuts).map(filename => `
      <div class="icon-item">
        <img src="icons/${filename.replace('.png', '.svg')}" alt="${filename}" />
        <div>${filename}</div>
      </div>
    `).join('')}
  </div>
  
  <h2>📱 Next Steps</h2>
  <p>To complete the PWA setup:</p>
  <ol>
    <li>Convert SVG files to PNG using a tool like ImageMagick or online converter</li>
    <li>Test the PWA on mobile devices</li>
    <li>Verify all icons display correctly</li>
    <li>Test offline functionality</li>
  </ol>
  
  <h2>🚀 Convert Command Example</h2>
  <pre style="background: #f5f5f4; padding: 1rem; border-radius: 0.25rem;">
# Using ImageMagick (if installed)
for size in 16 32 72 96 128 144 152 192 384 512; do
  convert icons/icon-\${size}x\${size}.svg icons/icon-\${size}x\${size}.png
done
  </pre>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, '..', 'public', 'icon-preview.html'), previewHTML);

console.log('\n🎉 Icon generation complete!');
console.log('📁 Icons saved to: public/icons/');
console.log('👀 View preview at: http://localhost:3000/icon-preview.html');
console.log('\n💡 Note: SVG files generated. Convert to PNG for full PWA support.');
console.log('🔧 Install ImageMagick or use an online SVG→PNG converter.');