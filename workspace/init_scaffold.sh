#!/usr/bin/env bash
set -e
echo "[INIT] Creating Next.js (Frontend) and NestJS (Backend) directories..."

mkdir -p frontend/src/app frontend/src/components/ui frontend/src/lib
mkdir -p backend/src/domain/models backend/src/domain/rule-engine backend/src/domain/cycle-penalty
mkdir -p backend/src/domain/scoring backend/src/domain/finance backend/src/application/use-cases
mkdir -p backend/src/application/dto backend/src/infrastructure/supabase backend/src/infrastructure/repositories backend/test

cat << 'EOF' > frontend/next-env.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
EOF

echo "[INIT] Workspace scaffolding created successfully!"
