param(
  [string]$DatasourceUrl = "jdbc:mysql://localhost:3306/plateforme_missions?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC",
  [string]$DatasourceUsername = "missions_demo",
  [string]$DatasourcePassword = "missions_demo_password"
)

$ErrorActionPreference = "Stop"

Push-Location $PSScriptRoot
try {
  $env:SPRING_DATASOURCE_URL = $DatasourceUrl
  $env:SPRING_DATASOURCE_USERNAME = $DatasourceUsername
  $env:SPRING_DATASOURCE_PASSWORD = $DatasourcePassword

  if (-not $env:APP_JWT_SECRET) {
    throw "APP_JWT_SECRET est requis (valeur Base64 d'au moins 32 octets). Consultez .env.example."
  }

  Write-Host "Compilation et installation des modules Maven..." -ForegroundColor Cyan
  mvn -DskipTests install
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }

  Push-Location (Join-Path $PSScriptRoot "api")
  try {
    Write-Host "Demarrage de l'API Spring Boot..." -ForegroundColor Green
    mvn spring-boot:run
    exit $LASTEXITCODE
  }
  finally {
    Pop-Location
  }
}
finally {
  Pop-Location
}
