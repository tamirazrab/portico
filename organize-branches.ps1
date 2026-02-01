# Script to organize changes into 8 feature branches
# Set git pager to avoid issues
$env:GIT_PAGER = 'cat'
$env:GIT_CONFIG_NOSYSTEM = '1'
$ProgressPreference = 'SilentlyContinue'

# Get all changed files
Write-Host "Getting changed files..."
$statusOutput = git status --porcelain
$allFiles = $statusOutput | ForEach-Object { $_.Trim() }

# Helper function to stage and commit files
function Commit-Files {
    param(
        [string[]]$Files,
        [string]$Message
    )
    if ($Files.Count -eq 0) {
        Write-Host "  No files to commit for: $Message"
        return $false
    }
    
    Write-Host "  Staging $($Files.Count) files for: $Message"
    foreach ($file in $Files) {
        $filePath = $file -replace '^[AMD\?]{2}\s+', ''
        if (Test-Path $filePath -ErrorAction SilentlyContinue) {
            git add $filePath 2>&1 | Out-Null
        } elseif ($file -match '^D') {
            # File is deleted, stage deletion
            git add $filePath 2>&1 | Out-Null
        }
    }
    
    Write-Host "  Committing: $Message"
    git -c core.pager=cat commit -m $Message 2>&1 | Out-Null
    return $true
}

# Branch 1: refactor/remove-mvvm-controllers
Write-Host "`n=== Branch 1: refactor/remove-mvvm-controllers ==="
git -c core.pager=cat checkout -b refactor/remove-mvvm-controllers 2>&1 | Out-Null

# Commit 1: Remove dashboard controllers
$dashboardControllers = $allFiles | Where-Object { $_ -match 'dashboard/controller/.*\.ts$' -and $_ -match '^D' } | Select-Object -First 7
Commit-Files -Files $dashboardControllers -Message "refactor(dashboard): remove old dashboard controller layer"

# Commit 2: Remove workflow controllers and VMs
$workflowFiles = $allFiles | Where-Object { 
    ($_ -match 'workflows/controller/.*\.ts$' -or 
     $_ -match 'workflows/.*vm/.*\.ts$' -or 
     $_ -match 'workflows/.*\.i-vm\.ts$') -and $_ -match '^D' 
} | Select-Object -First 12
Commit-Files -Files $workflowFiles -Message "refactor(workflows): remove controller layer and migrate to hooks"

# Commit 3: Remove credential controllers and VMs
$credFiles = $allFiles | Where-Object { 
    ($_ -match 'credentials/controller/.*\.ts$' -or 
     $_ -match 'credentials/.*vm/.*\.ts$' -or 
     $_ -match 'credentials/.*\.i-vm\.ts$') -and $_ -match '^D' 
} | Select-Object -First 12
Commit-Files -Files $credFiles -Message "refactor(credentials): remove controller layer and migrate to hooks"

# Commit 4: Remove execution controllers and VMs
$execFiles = $allFiles | Where-Object { 
    ($_ -match 'executions/controller/.*\.ts$' -or 
     $_ -match 'executions/.*vm/.*\.ts$' -or 
     $_ -match 'executions/.*\.i-vm\.ts$') -and $_ -match '^D' 
} | Select-Object -First 12
Commit-Files -Files $execFiles -Message "refactor(executions): remove controller layer and migrate to hooks"

Write-Host "Branch 1 completed`n"

# Branch 2: refactor/migrate-route-structure
Write-Host "=== Branch 2: refactor/migrate-route-structure ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b refactor/migrate-route-structure 2>&1 | Out-Null

# Commit 1: Remove old route pages
$oldRoutes = $allFiles | Where-Object { 
    ($_ -match '\(dashboard\)/\(rest\)/' -or 
     $_ -match '\(dashboard\)/\(editor\)/' -or
     $_ -match '\(dashboard\)/layout\.tsx$') -and $_ -match '^D' 
} | Select-Object -First 10
Commit-Files -Files $oldRoutes -Message "refactor(routes): remove old dashboard route structure"

# Commit 2: Add error boundaries
$errorFiles = $allFiles | Where-Object { 
    $_ -match 'error\.tsx$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $errorFiles -Message "feat(errors): add error boundaries to new route structure"

# Commit 3: Update route imports and navigation
$routeUpdates = $allFiles | Where-Object { 
    ($_ -match 'layout\.tsx$' -or 
     $_ -match 'sidenav\.tsx$' -or 
     $_ -match 'nav-link' -or
     $_ -match 'middleware\.ts$') -and $_ -match '^ M' 
} | Select-Object -First 10
Commit-Files -Files $routeUpdates -Message "refactor(navigation): update route imports and navigation components"

Write-Host "Branch 2 completed`n"

# Branch 3: refactor/consolidate-ui-components
Write-Host "=== Branch 3: refactor/consolidate-ui-components ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b refactor/consolidate-ui-components 2>&1 | Out-Null

# Commit 1: Move core UI components
$coreUI = $allFiles | Where-Object { 
    ($_ -match 'components/ui/(dialog|form|button|input|select|textarea|label)\.tsx$' -or
     $_ -match 'app/components/ui/(dialog|form|button|input|select|textarea|label)\.tsx$') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D')
} | Select-Object -First 12
Commit-Files -Files $coreUI -Message "refactor(ui): move core UI components to shared directory"

# Commit 2: Move additional UI components
$additionalUI = $allFiles | Where-Object { 
    ($_ -match 'components/ui/' -or $_ -match 'app/components/ui/') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D')
} | Where-Object { $_ -notmatch '(dialog|form|button|input|select|textarea|label)\.tsx$' } | Select-Object -First 12
Commit-Files -Files $additionalUI -Message "refactor(ui): move additional UI components to shared directory"

# Commit 3: Consolidate shared components
$sharedComponents = $allFiles | Where-Object { 
    ($_ -match 'components/(entity-components|node-selector|workflow-node|upgrade-modal)\.tsx$' -or
     $_ -match 'app/components/(entity-components|node-selector|workflow-node|upgrade-modal)\.tsx$') -and 
    ($_ -match '^\?\?' -or $_ -match '^ M' -or $_ -match '^D')
} | Select-Object -First 10
Commit-Files -Files $sharedComponents -Message "refactor(components): consolidate shared components"

Write-Host "Branch 3 completed`n"

# Branch 4: feat/add-server-controllers-layer
Write-Host "=== Branch 4: feat/add-server-controllers-layer ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b feat/add-server-controllers-layer 2>&1 | Out-Null

# Commit 1: Add workflow controllers
$workflowControllers = $allFiles | Where-Object { 
    $_ -match 'server/controllers/workflows/.*\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Commit-Files -Files $workflowControllers -Message "feat(server): add workflow controllers to server layer"

# Commit 2: Add credential controllers
$credControllers = $allFiles | Where-Object { 
    $_ -match 'server/controllers/credentials/.*\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $credControllers -Message "feat(server): add credential controllers to server layer"

# Commit 3: Add execution and dashboard controllers
$execDashboardControllers = $allFiles | Where-Object { 
    ($_ -match 'server/controllers/executions/.*\.ts$' -or
     $_ -match 'server/controllers/dashboard/.*\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Commit-Files -Files $execDashboardControllers -Message "feat(server): add execution and dashboard controllers"

# Update tRPC routers
$trpcRouters = $allFiles | Where-Object { 
    $_ -match 'trpc/routers/.*\.ts$' -and $_ -match '^ M'
} | Select-Object -First 3
Commit-Files -Files $trpcRouters -Message "refactor(trpc): update routers to use new server controllers"

Write-Host "Branch 4 completed`n"

# Branch 5: feat/add-e2e-testing-infrastructure
Write-Host "=== Branch 5: feat/add-e2e-testing-infrastructure ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b feat/add-e2e-testing-infrastructure 2>&1 | Out-Null

# Commit 1: Add E2E test setup and fixtures
$e2eSetup = $allFiles | Where-Object { 
    ($_ -match 'test/e2e/setup/.*\.ts$' -or
     $_ -match 'test/e2e/fixtures/.*\.ts$' -or
     $_ -match 'docker-compose\.test\.yml$' -or
     $_ -match 'playwright\.config\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Commit-Files -Files $e2eSetup -Message "feat(testing): add E2E test setup and fixtures"

# Commit 2: Add E2E test helpers
$e2eHelpers = $allFiles | Where-Object { 
    $_ -match 'test/e2e/helpers/.*\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $e2eHelpers -Message "feat(testing): add E2E test helper utilities"

# Commit 3: Add E2E test suites
$e2eTests = $allFiles | Where-Object { 
    $_ -match 'test/e2e/.*\.spec\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Commit-Files -Files $e2eTests -Message "feat(testing): add comprehensive E2E test suites"

Write-Host "Branch 5 completed`n"

# Branch 6: feat/feature-layer-improvements
Write-Host "=== Branch 6: feat/feature-layer-improvements ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b feat/feature-layer-improvements 2>&1 | Out-Null

# Commit 1: Add new use cases and repository methods
$usecases = $allFiles | Where-Object { 
    ($_ -match 'feature/.*usecase/.*\.ts$' -or
     $_ -match 'feature/.*repository/.*\.ts$' -or
     $_ -match 'feature/.*i-repo/.*\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Commit-Files -Files $usecases -Message "feat(feature): add new use cases and repository methods"

# Commit 2: Update executor components
$executors = $allFiles | Where-Object { 
    ($_ -match 'executor/components/.*\.tsx?$' -or
     $_ -match 'executor/components/.*\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 13
Commit-Files -Files $executors -Message "refactor(executors): fix import paths and update executor components"

# Commit 3: Update failure handling
$failures = $allFiles | Where-Object { 
    $_ -match 'feature/.*failures/.*\.ts$' -and $_ -match '^ M'
} | Select-Object -First 7
Commit-Files -Files $failures -Message "refactor(failures): improve error handling consistency"

Write-Host "Branch 6 completed`n"

# Branch 7: feat/add-dashboard-hooks-and-types
Write-Host "=== Branch 7: feat/add-dashboard-hooks-and-types ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b feat/add-dashboard-hooks-and-types 2>&1 | Out-Null

# Commit 1: Add dashboard hooks
$hooks = $allFiles | Where-Object { 
    $_ -match 'dashboard/hooks/.*\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $hooks -Message "feat(hooks): add custom hooks for dashboard features"

# Commit 2: Add feature types
$types = $allFiles | Where-Object { 
    $_ -match 'dashboard/.*types\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $types -Message "feat(types): add type definitions for dashboard features"

# Commit 3: Update view components
$views = $allFiles | Where-Object { 
    ($_ -match 'dashboard/.*view/.*\.tsx$' -or
     $_ -match 'dashboard/components/.*\.tsx$') -and $_ -match '^ M'
} | Select-Object -First 12
Commit-Files -Files $views -Message "refactor(views): update view components to use hooks and types"

Write-Host "Branch 7 completed`n"

# Branch 8: feat/infrastructure-and-config-updates
Write-Host "=== Branch 8: feat/infrastructure-and-config-updates ==="
git -c core.pager=cat checkout main 2>&1 | Out-Null
git -c core.pager=cat checkout -b feat/infrastructure-and-config-updates 2>&1 | Out-Null

# Commit 1: Update Inngest infrastructure
$inngest = $allFiles | Where-Object { 
    ($_ -match 'inngest/.*\.ts$' -or
     $_ -match 'bootstrap/integrations/inngest/.*\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Commit-Files -Files $inngest -Message "refactor(inngest): update Inngest infrastructure and channels"

# Commit 2: Update bootstrap and helpers
$bootstrap = $allFiles | Where-Object { 
    ($_ -match 'bootstrap/helpers/.*\.ts$' -or
     $_ -match 'bootstrap/configs/.*\.ts$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 10
Commit-Files -Files $bootstrap -Message "refactor(bootstrap): update helpers and configuration"

# Commit 3: Update tRPC routers
$trpc = $allFiles | Where-Object { 
    ($_ -match 'trpc/.*\.ts$' -or $_ -match 'trpc/.*\.tsx$') -and $_ -match '^ M'
} | Select-Object -First 7
Commit-Files -Files $trpc -Message "refactor(trpc): update routers and query client"

# Commit 4: Update shared libraries
$libs = $allFiles | Where-Object { 
    $_ -match 'lib/.*\.ts$' -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 7
Commit-Files -Files $libs -Message "refactor(lib): update shared library utilities"

# Commit 5: Update configuration files
$configs = $allFiles | Where-Object { 
    ($_ -match '\.eslintrc.*$' -or
     $_ -match 'tsconfig\.json$' -or
     $_ -match 'package\.json$' -or
     $_ -match 'next\.config\.ts$' -or
     $_ -match '\.gitignore$') -and ($_ -match '^\?\?' -or $_ -match '^ M')
} | Select-Object -First 8
Commit-Files -Files $configs -Message "chore(config): update configuration files and dependencies"

Write-Host "Branch 8 completed`n"

Write-Host "All branches created successfully!"
Write-Host "Use 'git branch' to see all branches"
Write-Host "Use 'git log --oneline <branch-name>' to see commits on each branch"

