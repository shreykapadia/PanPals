#!/usr/bin/env bash
# Runs the two-user RLS verification harness (supabase/tests/rls_verification.sql)
# against the LOCAL Supabase stack. Paste this script's output into every
# schema/* PR description (AI-CONTEXT §7, docs/TESTING.md §RLS security tests).
#
# Usage: bash scripts/rls-check.sh
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ID=$(grep '^project_id' "$REPO_ROOT/supabase/config.toml" | sed -E 's/project_id = "(.*)"/\1/')
DB_CONTAINER="supabase_db_${PROJECT_ID}"

echo "Resetting the local stack..."
supabase db reset

echo ""
echo "Running RLS verification against ${DB_CONTAINER}..."
echo ""

OUTPUT=$(docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f - \
  < "$REPO_ROOT/supabase/tests/rls_verification.sql" 2>&1 | grep -E 'PASS:|FAIL:' || true)

echo "$OUTPUT"
echo ""

FAIL_COUNT=$(echo "$OUTPUT" | grep -c 'FAIL:' || true)
PASS_COUNT=$(echo "$OUTPUT" | grep -c 'PASS:' || true)

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "RESULT: ${FAIL_COUNT} FAILED, ${PASS_COUNT} passed."
  exit 1
else
  echo "RESULT: all ${PASS_COUNT} checks PASSED."
fi
