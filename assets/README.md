# Assets Directory

This directory contains static assets and media files used throughout the Claude Flow platform. These resources include images, icons, documentation assets, and other static content used in documentation, user interfaces, and marketing materials.

## Table of Contents

1. [Images](#images) (1 file)
2. [Usage Guidelines](#usage-guidelines)
3. [File Organization](#file-organization)
4. [Quick Reference](#quick-reference)

---

## Images

### image.png
**Primary Claude Flow visual asset**
- Main logo or promotional image for the platform
- Used in documentation and user interface
- Brand representation and visual identity
- Standard format for web and print usage

**Properties:**
- Format: PNG (Portable Network Graphics)
- Optimized for web display
- Transparent background support
- High-resolution for various use cases

**Usage Contexts:**
- Documentation headers and branding
- User interface elements
- GitHub repository visualization
- Marketing and promotional materials

---

## Usage Guidelines

### Image Usage Standards
- **Resolution**: Maintain high quality for all use cases
- **Format**: Use appropriate formats (PNG for logos, JPG for photos)
- **Optimization**: Compress images for web performance
- **Accessibility**: Provide alt text for all images

### Brand Guidelines
- **Consistency**: Use consistent visual style across all assets
- **Quality**: Maintain high visual quality standards
- **Context**: Ensure images are appropriate for their usage context
- **Updates**: Keep assets current with brand evolution

### File Naming Conventions
- **Descriptive**: Use clear, descriptive filenames
- **Lowercase**: Use lowercase with hyphens for web compatibility
- **Versioning**: Include version numbers for major updates
- **Purpose**: Indicate intended usage in filename when relevant

---

## File Organization

### Current Structure
```
assets/
└── image.png          # Main brand/logo image
```

### Recommended Expansion
```
assets/
├── images/
│   ├── logos/         # Brand logos and variations
│   ├── icons/         # UI icons and symbols
│   ├── screenshots/   # Application screenshots
│   └── diagrams/      # Architecture and flow diagrams
├── fonts/             # Custom typography
├── styles/            # CSS and styling assets
└── media/             # Video and audio files
```

### File Types by Category
- **Logos**: SVG, PNG (with transparency)
- **Icons**: SVG (preferred), PNG, ICO
- **Screenshots**: PNG, JPG
- **Diagrams**: SVG, PNG, PDF
- **Fonts**: WOFF2, WOFF, TTF
- **Media**: MP4, WebM, MP3, WAV

---

## Quick Reference

### Adding New Assets
```bash
# Add new image
cp new-logo.png assets/images/logos/

# Optimize for web
npx imagemin assets/images/*.png --out-dir=assets/images/optimized/

# Generate different sizes
npx sharp-cli resize 100 100 assets/image.png --output assets/image-100x100.png
```

### Using Assets in Documentation
```markdown
# Markdown usage
![Claude Flow Logo](../assets/image.png)

# HTML usage
<img src="../assets/image.png" alt="Claude Flow Logo" width="200">
```

### Web Usage
```html
<!-- In HTML -->
<img src="/assets/image.png" alt="Claude Flow">

<!-- In CSS -->
.logo {
  background-image: url('../assets/image.png');
}
```

### Asset Optimization
```bash
# PNG optimization
pngquant assets/*.png --output assets/optimized/

# SVG optimization
svgo assets/*.svg --output assets/optimized/

# WebP conversion
cwebp assets/*.png -o assets/webp/
```

### Version Management
- **Git LFS**: Use for large binary assets
- **CDN**: Consider CDN for frequently accessed assets
- **Backup**: Maintain backups of original, uncompressed assets
- **Documentation**: Document asset sources and licensing

### Best Practices
- **Size Limits**: Keep individual files under 1MB when possible
- **Formats**: Use modern formats (WebP, AVIF) with fallbacks
- **Compression**: Balance quality and file size
- **Accessibility**: Provide descriptive alt text
- **Performance**: Lazy load non-critical images
- **Licensing**: Ensure proper licensing for all assets

### Common Commands
```bash
# Check file sizes
ls -lh assets/

# Find large files
find assets/ -size +500k -type f

# Validate image formats
file assets/*

# Generate thumbnails
mkdir -p assets/thumbnails
for img in assets/*.png; do
  convert "$img" -resize 150x150 "assets/thumbnails/$(basename "$img")"
done
```

---

*Last Updated: ${new Date().toISOString()}*

This assets directory contains the visual and media resources that support Claude Flow's documentation, user interface, and brand identity.