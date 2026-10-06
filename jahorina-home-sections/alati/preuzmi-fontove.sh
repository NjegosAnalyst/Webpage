#!/usr/bin/env bash
# Preuzima Archivo + Barlow (Google Fonts) u folder, za Playwright testove (simulacija sajta nema internet).
# Upotreba: bash preuzmi-fontove.sh <folder>   → pa: node test-vijesti.js <screenshotovi> <folder>
set -euo pipefail
DIR="${1:?folder za fontove}"; mkdir -p "$DIR"; cd "$DIR"
curl -sS -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36" \
  "https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Barlow:wght@300;400;500;600;700&display=swap" -o fonts.css
grep -o "https://fonts.gstatic.com[^)]*" fonts.css | sort -u | while read -r u; do
  f=$(echo "$u" | sed 's#https://fonts.gstatic.com/##; s#/#_#g'); [ -f "$f" ] || curl -sS "$u" -o "$f"
done
echo "Fontovi su u $DIR"
