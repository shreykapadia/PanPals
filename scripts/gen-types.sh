#!/usr/bin/env bash
# Regenerates types/database.ts from the HOSTED (linked) project schema.
#
# Usage: bash scripts/gen-types.sh
#
# The daily regenerate-and-rebase ritual (AI-CONTEXT §4, SHREY-PLAN.md §4):
#   1. Your schema/* PR merges first each day.
#   2. Run this script in that SAME PR (or immediately after merging) so
#      types/database.ts always reflects what's actually live on hosted.
#      Commit the regenerated file — never hand-edit its body.
#   3. Tell the four feature owners to rebase their open branches on main
#      and re-import from the regenerated types.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT="$REPO_ROOT/types/database.ts"

echo "Generating $OUTPUT from the linked (hosted) project..."

{
  echo "// GENERATED — do not hand-edit. Regenerate via scripts/gen-types.sh after"
  echo "// any migration (AI-CONTEXT §4)."
  echo ""
  supabase gen types typescript --linked
} > "$OUTPUT"

npx prettier --write "$OUTPUT" > /dev/null

echo "Done. Next steps:"
echo "  1. Commit types/database.ts in the SAME PR as the migration it reflects."
echo "  2. Tell Aaron/Joon/Matt/Talbia to rebase on main and re-import."
