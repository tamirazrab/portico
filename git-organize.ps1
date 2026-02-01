# Comprehensive script to organize changes into 8 branches
$ErrorActionPreference = 'SilentlyContinue'
$env:GIT_PAGER = ''

function Stage-And-Commit {
    param([string[]]$Files, [string]$Message)
    
    if ($Files.Count -eq 0) { return }
    
    foreach ($f in $Files) {
        if ($f -match '^D\s+(.+)') {
            $path = $matches[1]
            git add $path 2>&1 | Out-Null
        } elseif ($f -match '^[M?]{2}\s+(.+)') {
            $path = $matches[1]
            if (Test-Path $path) {
                git add $path 2>&1 | Out-Null
            }
        } else {
            $path = $f -replace '^[AMD?]{2}\s+', ''
            git add $path 2>&1 | Out-Null
        }
    }
    
    $staged = git diff --cached --name-only
    if ($staged.Count -gt 0) {
        git -c core.pager= commit -m $Message 2>&1 | Out-Null
        Write-Host "Committed: $Message ($($staged.Count) files)"
    }
}

# Get all changed files
$allChanges = @()
git status --porcelain | ForEach-Object { 
    $allChanges += $_.Trim()
}

Write-Host "Found $($allChanges.Count) changed files`n"

# Ensure we start from main
git checkout main 2>&1 | Out-Null

# BRANCH 1: refactor/remove-mvvm-controllers
Write-Host "=== Branch 1: refactor/remove-mvvm-controllers ==="
git checkout -b refactor/remove-mvvm-controllers 2>&1 | Out-Null

$dashboardControllers = $allChanges | Where-Object { $_ -match 'dashboard/controller.*\.ts' -and $_ -match '^D' } | Select-Object -First 7
Stage-And-Commit $dashboardControllers "refactor(dashboard): remove old dashboard controller layer"

$workflowFiles = $allChanges | Where-Object { 
    ($_ -match 'workflows/controller.*\.ts' -or $_ -match 'workflows.*vm.*\.ts' -or $_ -match 'workflows.*\.i-vm\.ts') -and $_ -match '^D' 
} | Select-Object -First 12
Stage-And-Commit $workflowFiles "refactor(workflows): remove controller layer and migrate to hooks"

$credFiles = $allChanges | Where-Object { 
    ($_ -match 'credentials/controller.*\.ts' -or $_ -match 'credentials.*vm.*\.ts' -or $_ -match 'credentials.*\.i-vm\.ts') -and $_ -match '^D' 
} | Select-Object -First 12
Stage-And-Commit $credFiles "refactor(credentials): remove controller layer and migrate to hooks"

$execFiles = $allChanges | Where-Object { 
    ($_ -match 'executions/controller.*\.ts' -or $_ -match 'executions.*vm.*\.ts' -or $_ -match 'executions.*\.i-vm\.ts') -and $_ -match '^D' 
} | Select-Object -First 12
Stage-And-Commit $execFiles "refactor(executions): remove controller layer and migrate to hooks"

Write-Host "Branch 1 completed`n"

# BRANCH 2: refactor/migrate-route-structure
Write-Host "=== Branch 2: refactor/migrate-route-structure ==="
git checkout main 2>&1 | Out-Null
git checkout -b refactor/migrate-route-structure 2>&1 | Out-Null

$oldRoutes = $allChanges | Where-Object { 
    ($_ -match '\(dashboard\)/\(rest\)' -or $_ -match '\(dashboard\)/\(editor\)' -or $_ -match '\(dashboard\)/layout') -and $_ -match '^D' 
} | Select-Object -First 10
Stage-And-Commit $oldRoutes "refactor(routes): remove old dashboard route structure"

$errorFiles = $allChanges | Where-Object { 
    $_ -match 'error\.tsx' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $errorFiles "feat(errors): add error boundaries to new route structure"

$routeUpdates = $allChanges | Where-Object { 
    ($_ -match 'layout\.tsx' -or $_ -match 'sidenav\.tsx' -or $_ -match 'nav-link' -or $_ -match 'middleware\.ts') -and $_ -match '^ M' 
} | Select-Object -First 10
Stage-And-Commit $routeUpdates "refactor(navigation): update route imports and navigation components"

Write-Host "Branch 2 completed`n"

# BRANCH 3: refactor/consolidate-ui-components
Write-Host "=== Branch 3: refactor/consolidate-ui-components ==="
git checkout main 2>&1 | Out-Null
git checkout -b refactor/consolidate-ui-components 2>&1 | Out-Null

$coreUI = $allChanges | Where-Object { 
    ($_ -match 'components/ui/(dialog|form|button|input|select|textarea|label)\.tsx' -or
     $_ -match 'app/components/ui/(dialog|form|button|input|select|textarea|label)\.tsx') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D')
} | Select-Object -First 12
Stage-And-Commit $coreUI "refactor(ui): move core UI components to shared directory"

$additionalUI = $allChanges | Where-Object { 
    ($_ -match 'components/ui/' -or $_ -match 'app/components/ui/') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D') -and
    $_ -notmatch '(dialog|form|button|input|select|textarea|label)\.tsx'
} | Select-Object -First 12
Stage-And-Commit $additionalUI "refactor(ui): move additional UI components to shared directory"

$sharedComponents = $allChanges | Where-Object { 
    ($_ -match 'components/(entity-components|node-selector|workflow-node|upgrade-modal)\.tsx' -or
     $_ -match 'app/components/(entity-components|node-selector|workflow-node|upgrade-modal)\.tsx') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D')
} | Select-Object -First 10
Stage-And-Commit $sharedComponents "refactor(components): consolidate shared components"

Write-Host "Branch 3 completed`n"

# BRANCH 4: feat/add-server-controllers-layer
Write-Host "=== Branch 4: feat/add-server-controllers-layer ==="
git checkout main 2>&1 | Out-Null
git checkout -b feat/add-server-controllers-layer 2>&1 | Out-Null

$workflowControllers = $allChanges | Where-Object { 
    $_ -match 'server/controllers/workflows.*\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Stage-And-Commit $workflowControllers "feat(server): add workflow controllers to server layer"

$credControllers = $allChanges | Where-Object { 
    $_ -match 'server/controllers/credentials.*\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $credControllers "feat(server): add credential controllers to server layer"

$execDashboardControllers = $allChanges | Where-Object { 
    ($_ -match 'server/controllers/executions.*\.ts' -or $_ -match 'server/controllers/dashboard.*\.ts') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Stage-And-Commit $execDashboardControllers "feat(server): add execution and dashboard controllers"

$trpcRouters = $allChanges | Where-Object { 
    $_ -match 'trpc/routers.*\.ts' -and $_ -match '^ M'
} | Select-Object -First 3
Stage-And-Commit $trpcRouters "refactor(trpc): update routers to use new server controllers"

Write-Host "Branch 4 completed`n"

# BRANCH 5: feat/add-e2e-testing-infrastructure
Write-Host "=== Branch 5: feat/add-e2e-testing-infrastructure ==="
git checkout main 2>&1 | Out-Null
git checkout -b feat/add-e2e-testing-infrastructure 2>&1 | Out-Null

$e2eSetup = $allChanges | Where-Object { 
    ($_ -match 'test/e2e/setup.*\.ts' -or $_ -match 'test/e2e/fixtures.*\.ts' -or
     $_ -match 'docker-compose\.test\.yml' -or $_ -match 'playwright\.config\.ts') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Stage-And-Commit $e2eSetup "feat(testing): add E2E test setup and fixtures"

$e2eHelpers = $allChanges | Where-Object { 
    $_ -match 'test/e2e/helpers.*\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $e2eHelpers "feat(testing): add E2E test helper utilities"

$e2eTests = $allChanges | Where-Object { 
    $_ -match 'test/e2e.*\.spec\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Stage-And-Commit $e2eTests "feat(testing): add comprehensive E2E test suites"

Write-Host "Branch 5 completed`n"

# BRANCH 6: feat/feature-layer-improvements
Write-Host "=== Branch 6: feat/feature-layer-improvements ==="
git checkout main 2>&1 | Out-Null
git checkout -b feat/feature-layer-improvements 2>&1 | Out-Null

$usecases = $allChanges | Where-Object { 
    ($_ -match 'feature.*usecase.*\.ts' -or $_ -match 'feature.*repository.*\.ts' -or $_ -match 'feature.*i-repo.*\.ts') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Stage-And-Commit $usecases "feat(feature): add new use cases and repository methods"

$executors = $allChanges | Where-Object { 
    $_ -match 'executor/components.*\.tsx?' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 13
Stage-And-Commit $executors "refactor(executors): fix import paths and update executor components"

$failures = $allChanges | Where-Object { 
    $_ -match 'feature.*failures.*\.ts' -and $_ -match '^ M'
} | Select-Object -First 7
Stage-And-Commit $failures "refactor(failures): improve error handling consistency"

Write-Host "Branch 6 completed`n"

# BRANCH 7: feat/add-dashboard-hooks-and-types
Write-Host "=== Branch 7: feat/add-dashboard-hooks-and-types ==="
git checkout main 2>&1 | Out-Null
git checkout -b feat/add-dashboard-hooks-and-types 2>&1 | Out-Null

$hooks = $allChanges | Where-Object { 
    $_ -match 'dashboard/hooks.*\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $hooks "feat(hooks): add custom hooks for dashboard features"

$types = $allChanges | Where-Object { 
    $_ -match 'dashboard.*types\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $types "feat(types): add type definitions for dashboard features"

$views = $allChanges | Where-Object { 
    ($_ -match 'dashboard.*view.*\.tsx' -or $_ -match 'dashboard/components.*\.tsx') -and $_ -match '^ M'
} | Select-Object -First 12
Stage-And-Commit $views "refactor(views): update view components to use hooks and types"

Write-Host "Branch 7 completed`n"

# BRANCH 8: feat/infrastructure-and-config-updates
Write-Host "=== Branch 8: feat/infrastructure-and-config-updates ==="
git checkout main 2>&1 | Out-Null
git checkout -b feat/infrastructure-and-config-updates 2>&1 | Out-Null

$inngest = $allChanges | Where-Object { 
    ($_ -match 'inngest.*\.ts' -or $_ -match 'bootstrap/integrations/inngest.*\.ts') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Stage-And-Commit $inngest "refactor(inngest): update Inngest infrastructure and channels"

$bootstrap = $allChanges | Where-Object { 
    ($_ -match 'bootstrap/helpers.*\.ts' -or $_ -match 'bootstrap/configs.*\.ts') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Stage-And-Commit $bootstrap "refactor(bootstrap): update helpers and configuration"

$trpc = $allChanges | Where-Object { 
    $_ -match 'trpc/.*\.tsx?' -and $_ -match '^ M'
} | Select-Object -First 7
Stage-And-Commit $trpc "refactor(trpc): update routers and query client"

$libs = $allChanges | Where-Object { 
    $_ -match 'lib/.*\.ts' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Stage-And-Commit $libs "refactor(lib): update shared library utilities"

$configs = $allChanges | Where-Object { 
    ($_ -match '\.eslintrc' -or $_ -match 'tsconfig\.json' -or $_ -match 'package\.json' -or
     $_ -match 'next\.config\.ts' -or $_ -match '\.gitignore') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Stage-And-Commit $configs "chore(config): update configuration files and dependencies"

Write-Host "Branch 8 completed`n"

Write-Host "All branches created successfully!"
Write-Host "Use 'git branch' to see all branches"





