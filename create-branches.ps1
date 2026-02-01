# Script to create branches and make commits
# Disable pager for git
$env:GIT_PAGER = 'cat'

# Function to create branch and make commits
function Create-BranchWithCommits {
    param(
        [string]$BranchName,
        [array]$Commits
    )
    
    Write-Host "Creating branch: $BranchName"
    git checkout -b $BranchName 2>&1 | Out-Null
    
    foreach ($commit in $Commits) {
        $files = $commit.Files
        $message = $commit.Message
        
        Write-Host "  Staging files for: $message"
        foreach ($file in $files) {
            git add $file 2>&1 | Out-Null
        }
        
        Write-Host "  Committing: $message"
        git commit -m $message 2>&1 | Out-Null
    }
    
    Write-Host "Branch $BranchName completed`n"
}

# Get all changed files from git status
$allChanges = git status --porcelain | ForEach-Object { $_.Trim() }

# Branch 1: Remove MVVM Controllers
Write-Host "=== Branch 1: refactor/remove-mvvm-controllers ==="
git checkout -b refactor/remove-mvvm-controllers 2>&1 | Out-Null

# Commit 1: Remove dashboard controllers
$dashboardControllers = $allChanges | Where-Object { $_ -match "dashboard/controller/.*\.ts$" -and $_ -match "^D" }
if ($dashboardControllers) {
    $dashboardControllers | ForEach-Object { git add ($_ -replace "^D\s+", "") 2>&1 | Out-Null }
    git commit -m "refactor(dashboard): remove old dashboard controller layer" 2>&1 | Out-Null
}

# Commit 2: Remove workflow controllers and VMs  
$workflowControllers = $allChanges | Where-Object { $_ -match "workflows/controller/.*\.ts$" -and $_ -match "^D" }
$workflowVMs = $allChanges | Where-Object { $_ -match "workflows/.*vm/.*\.ts$" -and $_ -match "^D" }
$workflowIVMs = $allChanges | Where-Object { $_ -match "workflows/.*\.i-vm\.ts$" -and $_ -match "^D" }
$workflowFiles = ($workflowControllers + $workflowVMs + $workflowIVMs) | Select-Object -First 12
if ($workflowFiles) {
    $workflowFiles | ForEach-Object { git add ($_ -replace "^D\s+", "") 2>&1 | Out-Null }
    git commit -m "refactor(workflows): remove controller layer and migrate to hooks" 2>&1 | Out-Null
}

# Commit 3: Remove credential controllers and VMs
$credControllers = $allChanges | Where-Object { $_ -match "credentials/controller/.*\.ts$" -and $_ -match "^D" }
$credVMs = $allChanges | Where-Object { $_ -match "credentials/.*vm/.*\.ts$" -and $_ -match "^D" }
$credIVMs = $allChanges | Where-Object { $_ -match "credentials/.*\.i-vm\.ts$" -and $_ -match "^D" }
$credFiles = ($credControllers + $credVMs + $credIVMs) | Select-Object -First 12
if ($credFiles) {
    $credFiles | ForEach-Object { git add ($_ -replace "^D\s+", "") 2>&1 | Out-Null }
    git commit -m "refactor(credentials): remove controller layer and migrate to hooks" 2>&1 | Out-Null
}

# Commit 4: Remove execution controllers and VMs
$execControllers = $allChanges | Where-Object { $_ -match "executions/controller/.*\.ts$" -and $_ -match "^D" }
$execVMs = $allChanges | Where-Object { $_ -match "executions/.*vm/.*\.ts$" -and $_ -match "^D" }
$execIVMs = $allChanges | Where-Object { $_ -match "executions/.*\.i-vm\.ts$" -and $_ -match "^D" }
$execFiles = ($execControllers + $execVMs + $execIVMs) | Select-Object -First 12
if ($execFiles) {
    $execFiles | ForEach-Object { git add ($_ -replace "^D\s+", "") 2>&1 | Out-Null }
    git commit -m "refactor(executions): remove controller layer and migrate to hooks" 2>&1 | Out-Null
}

Write-Host "Branch 1 completed`n"

# Return to main to create next branch
git checkout main 2>&1 | Out-Null

Write-Host "Script completed. Check branches with: git branch"





