#!/usr/bin/env bash
# Resets the LOCAL Supabase stack: drops the local db, re-applies every
# migration under supabase/migrations/ in order, then runs supabase/seed.sql.
#
# Usage: bash scripts/db-reset.sh
#
# Requires Docker Desktop running and `supabase start` to have been run at
# least once (this script does not start the stack — see B1's Verify step).
# Never run this against the hosted project; it only ever targets the local
# stack (AI-CONTEXT §2 — schema changes go through migrations, not this).
set -euo pipefail

supabase db reset
