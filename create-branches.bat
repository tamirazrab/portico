@echo off
setlocal

REM Set git to not use pager
set GIT_PAGER=cat

REM Branch 1: refactor/remove-mvvm-controllers
echo === Branch 1: refactor/remove-mvvm-controllers ===
git checkout -b refactor/remove-mvvm-controllers 2>nul

REM Commit 1: Remove dashboard controllers
git add "src/app/[lang]/dashboard/controller/create-invoice.controller.ts" 2>nul
git add "src/app/[lang]/dashboard/controller/fetch-summary-info.controller.ts" 2>nul
git add "src/app/[lang]/dashboard/controller/latest-invoices.controller.ts" 2>nul
git add "src/app/[lang]/dashboard/controller/revenue-chart.controller.ts" 2>nul
git -c core.pager=cat commit -m "refactor(dashboard): remove old dashboard controller layer" 2>nul

REM Commit 2: Remove workflow controllers and VMs
git add "src/app/[lang]/dashboard/workflows/controller/*.ts" 2>nul
git add "src/app/[lang]/dashboard/workflows/vm/*.ts" 2>nul
git add "src/app/[lang]/dashboard/workflows/view/*.i-vm.ts" 2>nul
git -c core.pager=cat commit -m "refactor(workflows): remove controller layer and migrate to hooks" 2>nul

REM Commit 3: Remove credential controllers and VMs
git add "src/app/[lang]/dashboard/credentials/controller/*.ts" 2>nul
git add "src/app/[lang]/dashboard/credentials/vm/*.ts" 2>nul
git add "src/app/[lang]/dashboard/credentials/view/*.i-vm.ts" 2>nul
git -c core.pager=cat commit -m "refactor(credentials): remove controller layer and migrate to hooks" 2>nul

REM Commit 4: Remove execution controllers and VMs
git add "src/app/[lang]/dashboard/executions/controller/*.ts" 2>nul
git add "src/app/[lang]/dashboard/executions/vm/*.ts" 2>nul
git add "src/app/[lang]/dashboard/executions/view/*.i-vm.ts" 2>nul
git -c core.pager=cat commit -m "refactor(executions): remove controller layer and migrate to hooks" 2>nul

echo Branch 1 completed

REM Branch 2: refactor/migrate-route-structure
echo === Branch 2: refactor/migrate-route-structure ===
git checkout main 2>nul
git checkout -b refactor/migrate-route-structure 2>nul

REM Commit 1: Remove old route pages
git add "src/app/(dashboard)/(rest)/**/*.tsx" 2>nul
git add "src/app/(dashboard)/(editor)/**/*.tsx" 2>nul
git add "src/app/(dashboard)/layout.tsx" 2>nul
git -c core.pager=cat commit -m "refactor(routes): remove old dashboard route structure" 2>nul

REM Commit 2: Add error boundaries
git add "src/app/global-error.tsx" 2>nul
git add "src/app/[lang]/(auth)/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/credentials/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/executions/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/workflows/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/workflows/[workflowId]/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/credentials/[credentialId]/error.tsx" 2>nul
git add "src/app/[lang]/dashboard/executions/[executionId]/error.tsx" 2>nul
git -c core.pager=cat commit -m "feat(errors): add error boundaries to new route structure" 2>nul

REM Commit 3: Update route imports and navigation
git add "src/app/[lang]/dashboard/layout.tsx" 2>nul
git add "src/app/[lang]/dashboard/components/server/sidenav.tsx" 2>nul
git add "src/app/[lang]/layout.tsx" 2>nul
git add "src/middleware.ts" 2>nul
git -c core.pager=cat commit -m "refactor(navigation): update route imports and navigation components" 2>nul

echo Branch 2 completed

echo All branches created successfully!





