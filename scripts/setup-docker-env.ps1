# Claude Flow Docker Environment Setup Script for Windows
# This script helps Windows users set up their Docker environment for Claude Flow

param(
    [switch]$SkipPrerequisites,
    [switch]$Force
)

# Colors for output
$Colors = @{
    Red = "Red"
    Green = "Green" 
    Yellow = "Yellow"
    Blue = "Cyan"
}

function Write-Log {
    param([string]$Message, [string]$Color = "White")
    Write-Host "[INFO] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Colors.Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Colors.Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Colors.Red
}

function Test-CommandExists {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Test-DockerInstallation {
    Write-Log "Checking Docker installation..."
    
    if (!(Test-CommandExists "docker")) {
        Write-Error "Docker is not installed or not in PATH"
        Write-Host "Please install Docker Desktop for Windows:"
        Write-Host "https://docs.docker.com/desktop/windows/install/"
        exit 1
    }
    
    # Check if Docker Desktop is running
    try {
        docker info | Out-Null
        Write-Success "Docker is properly installed and running"
    }
    catch {
        Write-Error "Cannot connect to Docker daemon"
        Write-Host "Please ensure Docker Desktop is running"
        exit 1
    }
    
    # Check Docker Compose
    try {
        docker compose version | Out-Null
        Write-Success "Docker Compose is available"
    }
    catch {
        Write-Error "Docker Compose is not available"
        Write-Host "Please update Docker Desktop to the latest version"
        exit 1
    }
}

function Test-WSL2 {
    Write-Log "Checking WSL2 status..."
    
    try {
        $wslVersion = wsl --status 2>$null
        if ($wslVersion -match "WSL 2") {
            Write-Success "WSL2 is properly configured"
        }
        else {
            Write-Warning "WSL2 may not be configured properly"
            Write-Host "Consider running: wsl --set-default-version 2"
        }
    }
    catch {
        Write-Warning "WSL2 status could not be determined"
    }
}

function Test-SystemRequirements {
    Write-Log "Checking system requirements..."
    
    # Check available memory
    $totalMemory = (Get-CimInstance Win32_PhysicalMemory | Measure-Object -Property capacity -Sum).sum / 1GB
    if ($totalMemory -lt 4) {
        Write-Warning "System has $([math]::Round($totalMemory, 1))GB RAM. Minimum 4GB recommended"
    }
    else {
        Write-Success "System memory: $([math]::Round($totalMemory, 1))GB (sufficient)"
    }
    
    # Check available disk space
    $availableSpace = (Get-CimInstance -ClassName Win32_LogicalDisk -Filter "DeviceID='C:'").FreeSpace / 1GB
    if ($availableSpace -lt 2) {
        Write-Warning "Available disk space: $([math]::Round($availableSpace, 1))GB. Minimum 2GB required"
    }
    else {
        Write-Success "Available disk space: $([math]::Round($availableSpace, 1))GB (sufficient)"
    }
}

function Setup-Environment {
    Write-Log "Setting up environment file..."
    
    if (Test-Path ".env") {
        if (!$Force) {
            Write-Warning ".env file already exists. Creating backup..."
            $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
            Copy-Item ".env" ".env.backup.$timestamp"
        }
    }
    
    if (!(Test-Path ".env.example")) {
        Write-Error ".env.example not found. Please run this script from the Claude Flow root directory"
        exit 1
    }
    
    Copy-Item ".env.example" ".env"
    Write-Success "Created .env file from template"
    
    Write-Host ""
    Write-Warning "IMPORTANT: Please edit the .env file and set your GITHUB_TOKEN"
    Write-Host "You can edit it with: notepad .env"
    Write-Host "Or: code .env (if using VS Code)"
    Write-Host ""
}

function Test-DockerConfig {
    Write-Log "Testing Docker Compose configuration..."
    
    try {
        docker compose config | Out-Null
        Write-Success "Docker Compose configuration is valid"
    }
    catch {
        Write-Error "Docker Compose configuration is invalid"
        Write-Host "Please check your docker-compose.yml and .env files"
        exit 1
    }
}

function New-Directories {
    Write-Log "Creating necessary directories..."
    
    $directories = @("data", "logs", "workspace", "backups")
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir | Out-Null
        }
    }
    
    Write-Success "Created directory structure"
}

function Show-NextSteps {
    Write-Host ""
    Write-Success "Docker environment setup complete!"
    Write-Host ""
    Write-Host "Next steps:"
    Write-Host "1. Edit .env file and set your GITHUB_TOKEN:"
    Write-Host "   notepad .env"
    Write-Host ""
    Write-Host "2. Start Claude Flow:"
    Write-Host "   docker compose up -d                          # Production"
    Write-Host "   docker compose --profile development up -d    # Development"
    Write-Host ""
    Write-Host "3. Check status:"
    Write-Host "   docker compose ps"
    Write-Host ""
    Write-Host "4. View logs:"
    Write-Host "   docker compose logs -f claude-flow"
    Write-Host ""
    Write-Host "5. Access Claude Flow:"
    Write-Host "   http://localhost:3000"
    Write-Host ""
    Write-Host "For more help, see: .\Docker-Readme.md"
    Write-Host ""
    Write-Host "Windows-specific batch files:"
    Write-Host "   start-claude-flow.bat    # Start services"
    Write-Host "   stop-claude-flow.bat     # Stop services"
    Write-Host "   logs-claude-flow.bat     # View logs"
}

function Test-Prerequisites {
    if (!$SkipPrerequisites) {
        # Check if running as Administrator
        $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
        $isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
        
        if (!$isAdmin) {
            Write-Warning "Running without Administrator privileges"
            Write-Host "Some features may require Administrator access"
        }
        
        # Check Windows version
        $osVersion = [System.Environment]::OSVersion.Version
        if ($osVersion.Major -lt 10) {
            Write-Warning "Windows 10 or later is recommended for Docker Desktop"
        }
        
        # Check if Hyper-V is available
        try {
            $hyperv = Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V-All
            if ($hyperv.State -eq "Enabled") {
                Write-Success "Hyper-V is enabled"
            }
            else {
                Write-Warning "Hyper-V is not enabled. WSL2 mode is recommended"
            }
        }
        catch {
            Write-Log "Could not check Hyper-V status"
        }
    }
}

# Main execution
function Main {
    Write-Host "Claude Flow Docker Environment Setup for Windows"
    Write-Host "=============================================="
    Write-Host ""
    
    Test-Prerequisites
    Test-DockerInstallation
    Test-WSL2
    Test-SystemRequirements
    Setup-Environment
    Test-DockerConfig
    New-Directories
    Show-NextSteps
}

# Run main function
try {
    Main
}
catch {
    Write-Error "Setup failed: $($_.Exception.Message)"
    exit 1
}