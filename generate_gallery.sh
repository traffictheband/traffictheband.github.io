#!/bin/bash
# ──────────────────────────────────────────────────────────
# Gallery Manifest & Thumbnail Generator
#
# Scans images/gallery/ for image files and:
#   1. Generates optimized thumbnails in images/gallery/thumbs/
#   2. Writes the file list to images/gallery/gallery.json
#
# Usage:
#   ./generate_gallery.sh           # Generate manifest + thumbnails
#   ./generate_gallery.sh --no-thumbs   # Manifest only (skip thumbnails)
#
# Requirements for thumbnails:
#   - ImageMagick (convert) or GraphicsMagick (gm convert)
#   - If neither is installed, thumbnails are skipped gracefully
#
# Thumbnail settings:
#   - Max dimension: 600px (width or height)
#   - Quality: 75% JPEG
#   - Strip metadata for smaller file size
# ──────────────────────────────────────────────────────────

GALLERY_DIR="images/gallery"
THUMBS_DIR="$GALLERY_DIR/thumbs"
OUTPUT="$GALLERY_DIR/gallery.json"
THUMB_SIZE="600x600>"     # Resize to fit within 600x600, keeping aspect ratio
THUMB_QUALITY="75"
SKIP_THUMBS=false
SKIP_STRIP=false

# Parse arguments
if [ "$1" = "--no-thumbs" ]; then
  SKIP_THUMBS=true
fi

# Detect image processing tool
CONVERT_CMD=""
if [ "$SKIP_THUMBS" = false ] || [ "$SKIP_STRIP" = false ]; then
  if command -v magick &>/dev/null; then
    CONVERT_CMD="magick"
  elif command -v convert &>/dev/null; then
    CONVERT_CMD="convert"
  elif command -v gm &>/dev/null; then
    CONVERT_CMD="gm convert"
  else
    echo "⚠ No ImageMagick/GraphicsMagick found - skipping thumbnail generation and metadata stripping."
    echo "  Install: sudo apt install imagemagick"
    SKIP_THUMBS=true
    SKIP_STRIP=true
  fi
fi

# Create thumbs directory
if [ "$SKIP_THUMBS" = false ]; then
  mkdir -p "$THUMBS_DIR"
fi

# Collect all image files, sorted alphabetically
FILES=()
while IFS= read -r filepath; do
  [ -z "$filepath" ] && continue
  FILES+=("$(basename "$filepath")")
done < <(find "$GALLERY_DIR" -maxdepth 1 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.gif' \) | sort)

TOTAL=${#FILES[@]}

if [ "$TOTAL" -eq 0 ]; then
  echo "[]" > "$OUTPUT"
  echo "⚠ No images found in $GALLERY_DIR"
  exit 0
fi

# Generate thumbnails
THUMB_COUNT=0
if [ "$SKIP_THUMBS" = false ]; then
  echo "→ Generating thumbnails ($TOTAL images)..."
  for file in "${FILES[@]}"; do
    SRC="$GALLERY_DIR/$file"
    DEST="$THUMBS_DIR/$file"
    
    # Skip if thumbnail already exists and is newer than source
    if [ -f "$DEST" ] && [ "$DEST" -nt "$SRC" ]; then
      ((THUMB_COUNT++))
      continue
    fi
    
    # Generate thumbnail
    if $CONVERT_CMD "$SRC" -resize "$THUMB_SIZE" -quality "$THUMB_QUALITY" -strip "$DEST" 2>/dev/null; then
      ((THUMB_COUNT++))
      printf "  ✓ %s\n" "$file"
    else
      printf "  ✗ %s (failed)\n" "$file"
    fi
  done
  echo "  Thumbnails: $THUMB_COUNT / $TOTAL"
fi

# Strip metadata from source images
if [ "$SKIP_STRIP" = false ]; then
  echo "→ Stripping metadata from original images..."
  STRIP_COUNT=0
  for file in "${FILES[@]}"; do
    SRC="$GALLERY_DIR/$file"
    ext="${file##*.}"
    TMP="$(mktemp "$GALLERY_DIR/strip.XXXXXX.$ext")"

    if $CONVERT_CMD "$SRC" -strip "$TMP" 2>/dev/null && mv "$TMP" "$SRC"; then
      ((STRIP_COUNT++))
    else
      rm -f "$TMP"
      printf "  ✗ %s (metadata strip failed)\n" "$file"
    fi
  done
  echo "  Metadata stripped: $STRIP_COUNT / $TOTAL"
fi

# Build gallery.json manifest
echo "[" > "$OUTPUT"
for i in "${!FILES[@]}"; do
  COMMA=""
  if [ "$i" -gt 0 ]; then
    COMMA=","
  fi
  printf '%s\n  "%s"' "$COMMA" "${FILES[$i]}" >> "$OUTPUT"
done
echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo "✓ Gallery manifest updated: $OUTPUT ($TOTAL images)"
