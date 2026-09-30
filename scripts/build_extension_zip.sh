#!/bin/sh
# Build vigil-extension.zip with the extension contents at the ARCHIVE ROOT.
#
# The extracted folder must be selectable directly in chrome://extensions →
# "Load unpacked", so manifest.json sits at the top level of the archive next
# to the folders it references (background/, sidepanel/, vendor/, ...). Nesting
# everything under extension/ makes Chrome fail with:
#   "Manifest file is missing or unreadable — Could not load manifest."
#
# Excluded: the Python test suite and bytecode caches (development-only).
set -eu

cd "$(dirname "$0")/.." # repo root

rm -f vigil-extension.zip
(cd extension && zip -rq ../vigil-extension.zip . -x "__pycache__/*" -x "test_extension.py")

# Sanity gate: the manifest must be at the zip root, never nested.
if ! unzip -l vigil-extension.zip | grep -q " manifest.json$"; then
  echo "error: manifest.json is not at the zip root; refusing to ship" >&2
  exit 1
fi

echo "Built vigil-extension.zip ($(du -h vigil-extension.zip | cut -f1)) — manifest at archive root"
