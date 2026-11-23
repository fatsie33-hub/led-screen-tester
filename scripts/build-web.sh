#!/usr/bin/env bash
# Empaquette la version navigateur (3 fichiers statiques) dans dist/.
set -euo pipefail
cd "$(dirname "$0")/.."

version="$(node -p "require('./package.json').version")"
out="dist/LED-Screen-Tester-${version}-web.zip"

mkdir -p dist
rm -f "$out"

zip -q "$out" index.html styles.css app.js

echo "Version web : $out"
