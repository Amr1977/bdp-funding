#!/bin/bash
# cache_bust.sh — update cache-busting query strings in ALL HTML files

# Generate a timestamp version string: YYYYMMDD-HHMMSS
VERSION=$(date +"%Y%m%d-%H%M%S")

# Find all HTML files in the current directory and subdirectories
find . -type f -name "*.html" | while read -r file; do
  echo "🔄 Updating cache-busting in: $file"
  
  # Replace version in CSS and JS links
  sed -i.bak -E "s/(style\.css\?v=)[0-9A-Za-z\-\_]*/\1$VERSION/g" "$file"
  sed -i.bak -E "s/(app\.js\?v=)[0-9A-Za-z\-\_]*/\1$VERSION/g" "$file"
done

echo "✅ Cache-busting version updated to: $VERSION"
echo "   Backups saved as *.bak"