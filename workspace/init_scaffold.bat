@echo off
echo [INIT] Creating Next.js (Frontend) and NestJS (Backend) directories...

mkdir frontend\src\app 2>nul
mkdir frontend\src\components\ui 2>nul
mkdir frontend\src\lib 2>nul

mkdir backend\src\domain\models 2>nul
mkdir backend\src\domain\rule-engine 2>nul
mkdir backend\src\domain\cycle-penalty 2>nul
mkdir backend\src\domain\scoring 2>nul
mkdir backend\src\domain\finance 2>nul
mkdir backend\src\application\use-cases 2>nul
mkdir backend\src\application\dto 2>nul
mkdir backend\src\infrastructure\supabase 2>nul
mkdir backend\src\infrastructure\repositories 2>nul
mkdir backend\test 2>nul

echo /// ^<reference types="next" /^> > frontend\next-env.d.ts
echo /// ^<reference types="next/image-types/global" /^> >> frontend\next-env.d.ts

echo [INIT] Workspace scaffolding created successfully!
