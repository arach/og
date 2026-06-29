#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OG_DIR="$ROOT/native/og-render"
DIST="$ROOT/dist/release"
VERSION="${1:-$(node -p "require('$ROOT/package.json').version")}"

if [[ -z "${OG_SIGN_IDENTITY:-}" ]]; then
  SIGN_IDENTITY="$(security find-identity -v -p codesigning 2>/dev/null | grep 'Developer ID Application' | head -1 | awk '{print $2}')"
else
  SIGN_IDENTITY="$OG_SIGN_IDENTITY"
fi
NOTARY_PROFILE="${OG_NOTARY_PROFILE:-notarytool}"
ENTITLEMENTS="$OG_DIR/og-render.entitlements"

if [[ -z "$SIGN_IDENTITY" ]]; then
  echo "Error: no Developer ID Application signing identity found."
  echo "Set OG_SIGN_IDENTITY or install a Developer ID certificate."
  exit 1
fi

echo "==> og-render release v$VERSION"
echo "    Sign: $SIGN_IDENTITY"
echo "    Notary profile: $NOTARY_PROFILE"

rm -rf "$DIST"
mkdir -p "$DIST"

build_arch() {
  local arch="$1"
  local target="darwin-$arch"
  local out_dir="$DIST/$target"
  local binary="$out_dir/og-render"
  local zip="$DIST/og-render-v${VERSION}-${target}.zip"

  mkdir -p "$out_dir"

  echo "==> Building $target..."
  if [[ "$arch" == "arm64" ]]; then
    (cd "$OG_DIR" && swift build -c release)
    cp "$OG_DIR/.build/release/og-render" "$binary"
  else
    (cd "$OG_DIR" && swift build -c release --triple x86_64-apple-macosx)
    cp "$OG_DIR/.build/x86_64-apple-macosx/release/og-render" "$binary"
  fi

  chmod +x "$binary"

  echo "==> Signing $target..."
  codesign --force --options runtime --timestamp \
    --entitlements "$ENTITLEMENTS" \
    --sign "$SIGN_IDENTITY" \
    "$binary"

  codesign --verify --strict --verbose=2 "$binary"

  echo "==> Notarizing $target..."
  rm -f "$zip"
  ditto -c -k --keepParent "$binary" "$zip"

  xcrun notarytool submit "$zip" \
    --keychain-profile "$NOTARY_PROFILE" \
    --wait

  echo "==> Stapling $target..."
  if xcrun stapler staple "$binary" 2>/dev/null; then
    echo "    stapled ticket to binary"
  else
    echo "    staple skipped (CLI binaries use online notarization ticket — zip is notarized)"
  fi

  shasum -a 256 "$binary" | awk '{print $1}' > "$out_dir/og-render.sha256"
  echo "$VERSION" > "$out_dir/VERSION"

  codesign --verify --strict --verbose=2 "$binary" >/dev/null
  echo "    ✓ $binary (signed + notarized)"
}

build_arch arm64

if (cd "$OG_DIR" && swift build -c release --triple x86_64-apple-macosx >/dev/null 2>&1); then
  build_arch x64
else
  echo "==> Skipping darwin-x64 (cross-compile unavailable on this host)"
fi

cat > "$DIST/manifest.json" <<EOF
{
  "version": "$VERSION",
  "builtAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "targets": {
    "darwin-arm64": "og-render-v${VERSION}-darwin-arm64.zip",
    "darwin-x64": "og-render-v${VERSION}-darwin-x64.zip"
  }
}
EOF

echo ""
echo "==> Release artifacts in $DIST"
ls -lh "$DIST"/*.zip 2>/dev/null || true
echo ""
echo "Upload with:"
echo "  gh release create og-render-v$VERSION dist/release/*.zip dist/release/manifest.json --title \"og-render v$VERSION\""