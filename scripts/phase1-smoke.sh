#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "→ 1/5 TypeScript compiles..."
npx tsc --noEmit
echo "  ✓ ok"

echo "→ 2/5 Required files exist..."
test -f app.json || { echo "  ✗ app.json missing"; exit 1; }
test -f babel.config.js || { echo "  ✗ babel.config.js missing"; exit 1; }
test -f metro.config.js || { echo "  ✗ metro.config.js missing"; exit 1; }
test -f tailwind.config.js || { echo "  ✗ tailwind.config.js missing"; exit 1; }
test -f global.css || { echo "  ✗ global.css missing"; exit 1; }
test -f lib/supabase.ts || { echo "  ✗ lib/supabase.ts missing"; exit 1; }
test -f types/database.types.ts || { echo "  ✗ database types missing"; exit 1; }
test -f .env.example || { echo "  ✗ .env.example missing"; exit 1; }
test -f .env.local || { echo "  ✗ .env.local missing (run setup)"; exit 1; }
test -f AI_ASSISTANT_USAGE.md || { echo "  ✗ AI_ASSISTANT_USAGE.md missing"; exit 1; }
test -f supabase/migrations/00000000000001_initial_schema.sql || { echo "  ✗ initial migration missing"; exit 1; }
test -f supabase/seed.sql || { echo "  ✗ seed.sql missing"; exit 1; }
echo "  ✓ ok"

echo "→ 3/5 url-polyfill is FIRST import in lib/supabase.ts..."
# Allow comment lines before the import; find first actual import line.
first_import=$(grep -nE "^import " lib/supabase.ts | head -1 | cut -d: -f2-)
case "$first_import" in
  *react-native-url-polyfill/auto*)
    echo "  ✓ ok" ;;
  *)
    echo "  ✗ url-polyfill must be the FIRST import (got: $first_import)"
    exit 1 ;;
esac

echo "→ 4/5 Database types contain expected tables..."
grep -q "profiles:" types/database.types.ts \
  && grep -q "courses:" types/database.types.ts \
  && grep -q "modules:" types/database.types.ts \
  && grep -q "module_items:" types/database.types.ts \
  && grep -q "roadmap_items:" types/database.types.ts \
  && grep -q "topics:" types/database.types.ts \
  && grep -q "student_progress:" types/database.types.ts \
  || { echo "  ✗ types missing one or more expected tables"; exit 1; }
echo "  ✓ ok"

echo "→ 5/5 No secrets in git history..."
LEAK=$(git log --all -p 2>/dev/null | grep -Ei "(eyJ[a-zA-Z]{20,})" | grep -v "placeholder" || true)
if [ -n "$LEAK" ]; then
  echo "  ✗ possible secret detected in git history:"
  echo "$LEAK" | head -5
  exit 1
fi
echo "  ✓ ok"

echo
echo "Phase 1 smoke checks: ALL GREEN ✓"
