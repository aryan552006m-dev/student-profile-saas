$ErrorActionPreference = 'Stop'

function Find-Psql {
    if ($env:PG_BIN) {
        $candidate = Join-Path $env:PG_BIN 'psql.exe'
        if (Test-Path $candidate) { return $candidate }
    }

    $command = Get-Command psql -ErrorAction SilentlyContinue
    if ($command) { return $command.Source }

    $commonPaths = @(
        'C:\Program Files\PostgreSQL\18\bin\psql.exe',
        'C:\Program Files\PostgreSQL\17\bin\psql.exe',
        'C:\Program Files\PostgreSQL\16\bin\psql.exe'
    )
    foreach ($path in $commonPaths) {
        if (Test-Path $path) { return $path }
    }

    throw 'psql.exe was not found. Install the PostgreSQL Windows server/client tools or set PG_BIN to the PostgreSQL bin directory.'
}

$psql = Find-Psql
$database = if ($env:PGDATABASE) { $env:PGDATABASE } else { 'student_profile' }
$user = if ($env:PGUSER) { $env:PGUSER } else { 'postgres' }
$hostName = if ($env:PGHOST) { $env:PGHOST } else { 'localhost' }
$port = if ($env:PGPORT) { $env:PGPORT } else { '5432' }

Write-Host "Using PostgreSQL client: $psql"
Write-Host "Initializing database '$database' on $hostName`:$port"

& $psql --host=$hostName --port=$port --username=$user --dbname=postgres --command="SELECT 'CREATE DATABASE $database' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec"
if ($LASTEXITCODE -ne 0) { throw "Could not connect to PostgreSQL as '$user'. Set PGHOST, PGPORT, PGUSER, and PGPASSWORD as needed." }

& $psql --host=$hostName --port=$port --username=$user --dbname=$database --file=(Join-Path $PSScriptRoot 'schema.sql')
if ($LASTEXITCODE -ne 0) { throw 'Schema initialization failed.' }

& $psql --host=$hostName --port=$port --username=$user --dbname=$database --file=(Join-Path $PSScriptRoot 'seed.sql')
if ($LASTEXITCODE -ne 0) { throw 'Seed initialization failed.' }

Write-Host 'Database schema and development seed applied successfully.'
