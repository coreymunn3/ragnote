const fs = require("fs");
const path = require("path");

// Create a simple SVG with a bold "W"
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <text 
    x="50" 
    y="50" 
    font-family="Arial, sans-serif" 
    font-size="80" 
    font-weight="900" 
    text-anchor="middle" 
    dominant-baseline="central" 
    fill="#1e3a8a"
  >W</text>
</svg>`;

const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");

// Save the SVG
fs.writeFileSync(path.join(iconsDir, "favicon-w.svg"), svg);
console.log("✓ Created favicon-w.svg");

console.log("\nNext steps:");
console.log(
  "1. Use https://favicon.io/favicon-converter/ to convert favicon-w.svg to favicon.ico"
);
console.log("2. Or run: cp public/icons/favicon-w.svg public/favicon.ico");
