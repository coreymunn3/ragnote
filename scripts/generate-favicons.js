const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function generateFavicons() {
  const publicDir = path.join(__dirname, "..", "public");
  const iconsDir = path.join(publicDir, "icons");

  // Source: Use icon-light-50.png (dark icon for light backgrounds)
  const sourceIcon = path.join(iconsDir, "icon-light-50.png");

  if (!fs.existsSync(sourceIcon)) {
    console.error("Source icon not found:", sourceIcon);
    process.exit(1);
  }

  console.log("Generating favicon sizes from icon-light-50.png...");

  // Generate 16x16
  await sharp(sourceIcon)
    .resize(16, 16, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(iconsDir, "icon-16x16.png"));
  console.log("✓ Generated icon-16x16.png");

  // Generate 32x32
  await sharp(sourceIcon)
    .resize(32, 32, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(path.join(iconsDir, "icon-32x32.png"));
  console.log("✓ Generated icon-32x32.png");

  // Generate apple-touch-icon from 180px version
  const appleSource = path.join(iconsDir, "icon-light-180.png");
  if (fs.existsSync(appleSource)) {
    fs.copyFileSync(appleSource, path.join(iconsDir, "apple-touch-icon.png"));
    console.log("✓ Created apple-touch-icon.png");
  }

  console.log("\n✨ All favicon sizes generated successfully!");
  console.log("\nNote: You can create favicon.ico from icon-32x32.png using:");
  console.log("https://favicon.io/favicon-converter/ or similar online tool");
}

generateFavicons().catch((err) => {
  console.error("Error generating favicons:", err);
  process.exit(1);
});
