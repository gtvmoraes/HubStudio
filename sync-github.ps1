$projectPath = "C:\Users\Dantas\Documents\TCC\tcc"
$debounceSeconds = 10

$env:PATH += ";C:\Program Files\Git\cmd;C:\Program Files\GitHub CLI"

Write-Host "Monitorando alteracoes em: $projectPath"
Write-Host "Pressione Ctrl+C para parar."

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $projectPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]::LastWrite -bor [System.IO.NotifyFilters]::FileName -bor [System.IO.NotifyFilters]::DirectoryName

$lastSync = [datetime]::MinValue
$timer = $null

$action = {
    $path = $Event.SourceEventArgs.FullPath
    $name = $Event.SourceEventArgs.Name

    # Ignora pasta .git e o proprio script
    if ($name -match "^\.git" -or $name -eq "sync-github.ps1") { return }

    $script:lastChanged = $name
    $script:pendingSync = $true
}

Register-ObjectEvent $watcher "Changed" -Action $action | Out-Null
Register-ObjectEvent $watcher "Created" -Action $action | Out-Null
Register-ObjectEvent $watcher "Deleted" -Action $action | Out-Null
Register-ObjectEvent $watcher "Renamed" -Action $action | Out-Null

$script:pendingSync = $false
$script:lastChanged = ""
$script:lastSyncTime = [datetime]::MinValue

while ($true) {
    Start-Sleep -Seconds 1

    if ($script:pendingSync) {
        $secondsSincePending = ([datetime]::Now - $script:lastSyncTime).TotalSeconds
        if ($secondsSincePending -ge $debounceSeconds) {
            $script:pendingSync = $false
            $script:lastSyncTime = [datetime]::Now

            Set-Location $projectPath

            $status = git status --porcelain
            if ($status) {
                $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                git add -A
                git commit -m "auto: sync em $timestamp"
                git push origin main
                Write-Host "[$timestamp] Sincronizado com GitHub."
            }
        }
    }
}
