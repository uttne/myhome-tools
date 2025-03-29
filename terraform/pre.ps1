Push-Location "$PSScriptRoot/../backend"
try{
    uv run task build
}
finally{
    Pop-Location
}