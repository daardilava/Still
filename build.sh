#!/usr/bin/env bash
# Bundles src/ into public/app.js + public/app.css (needs esbuild + react; see README)
set -e
cd "$(dirname "$0")"
${ESBUILD:-npx esbuild} src/main.jsx --bundle --minify --format=iife --jsx=automatic --loader:.js=jsx \
  --define:process.env.NODE_ENV='"production"' --outfile=public/app.js
