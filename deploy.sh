#!/bin/bash
cd ~/Downloads/blueprint-envision-platform
echo "=== Building ==="
npx vite build
if [ $? -ne 0 ]; then
  echo "BUILD FAILED"
  exit 1
fi
echo "=== Committing ==="
git add -A
git commit -m "feat: marketing landing page with routing"
echo "=== Pushing ==="
git push origin main
echo "=== DONE ==="
