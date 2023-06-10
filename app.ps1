param(
    [string]$action = "run"
)

$A = $PSScriptRoot
$monitoring = $false

function MoveAndBuild {
    Write-Host "Moving to Web directory and executing npm install..."
    Set-Location -Path "$A\Web"
    npm install
    Write-Host "Executing npm run build..."
    npm run build
    Write-Host "Copying contents of dist directory to $A\Proxy\html..."
    Copy-Item -Path "dist\*" -Destination "$A\Proxy\html" -Recurse -Force
    Set-Location -Path "$A"
    Write-Host "Moving to Server directory and executing npm install..."
    Set-Location -Path "$A\Server"
    npm install
    Set-Location -Path "$A"
}

function StartNginx {
    Write-Host "Starting nginx.exe..."
    Set-Location -Path "$A\Proxy"
    Start-Process -NoNewWindow -FilePath ".\nginx.exe"
    Set-Location -Path "$A"
}

function StartApp {
    Write-Host "Starting app.js..."
    Set-Location -Path "$A\Server"
    Start-Process -NoNewWindow -FilePath "node.exe" -ArgumentList "app.js"
    Set-Location -Path "$A"
}

function MonitorProcesses {
    while ($monitoring) {
        $nginxRunning = Get-Process -Name "nginx" -ErrorAction SilentlyContinue
        $appRunning = Get-Process -Name "node" -ErrorAction SilentlyContinue
        if (!$nginxRunning -or !$appRunning) {
            Write-Host "Detected process failure. Restarting..."
            RestartProcesses
        }
        Start-Sleep -Seconds 10
    }
}

function RestartProcesses {
    Stop-Process -Name "nginx" -ErrorAction SilentlyContinue
    Stop-Process -Name "node" -ErrorAction SilentlyContinue
    StartNginx
    StartApp
}

function StopMonitoring {
    $monitoring = $false
    Stop-Process -Name "nginx" -ErrorAction SilentlyContinue
    Stop-Process -Name "node" -ErrorAction SilentlyContinue
    Write-Host "Monitoring stopped."
}

if ($action -eq "build") {
    MoveAndBuild
    Read-Host -Prompt "Build process completed. Press Enter to continue..."
}
elseif ($action -eq "run") {
    # MoveAndBuild
    StartNginx
    StartApp
    $monitoring = $true
    Write-Host "Monitoring processes..."
    Start-Job -ScriptBlock { MonitorProcesses }
    Read-Host -Prompt "Press Enter to stop monitoring and exit..."
    StopMonitoring
}
elseif ($action -eq "stop") {
    StopMonitoring
}
else {
    Write-Host "Invalid action parameter. Valid values are 'run', 'build', or 'stop'."
    Read-Host -Prompt "Press Enter to continue..."
}
