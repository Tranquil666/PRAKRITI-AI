#!/usr/bin/env bash
# Generate SHA-384 SRI hashes for any URL.
#
# Usage:
#   ./gen_sri.sh https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css
#
# Pipe many at once:
#   while read -r url; do ./gen_sri.sh "$url"; done < urls.txt
#
# Paste the resulting `integrity="sha384-..." crossorigin="anonymous"`
# attributes onto the corresponding <script> or <link> tag in index_bootstrap.html.

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <url> [<url>...]" >&2
  exit 2
fi

for url in "$@"; do
  hash=$(curl -fsSL "$url" | openssl dgst -sha384 -binary | openssl base64 -A)
  echo "$url"
  echo "  integrity=\"sha384-${hash}\" crossorigin=\"anonymous\""
done
