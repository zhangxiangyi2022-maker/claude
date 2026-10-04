# Clawd desktop pet launcher (Windows PowerShell 5.1, no install needed)
# Compiles ClawdPet.cs next to this file and starts the pet.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms, System.Drawing
try {
    $here = Split-Path -Parent $MyInvocation.MyCommand.Path
    $src = [IO.File]::ReadAllText((Join-Path $here 'ClawdPet.cs'), [Text.Encoding]::UTF8)
    Add-Type -TypeDefinition $src -ReferencedAssemblies System.Windows.Forms, System.Drawing -Language CSharp
    [ClawdDesktop.App]::Run($MyInvocation.MyCommand.Path)
} catch {
    [System.Windows.Forms.MessageBox]::Show("Clawd failed to start:`n`n" + $_.Exception.Message, 'Clawd') | Out-Null
}
