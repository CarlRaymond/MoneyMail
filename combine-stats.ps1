# Dumb workaround for Powershell command line length limits and wildcard expansion
# Merges all stats-?????.json files into stats.json
$statsFiles = Get-ChildItem .\data -Filter stats-?????.json

New-Item -Path .\data\stats.json -Force

foreach ($f in $statsFiles ) { 
    Write-Output $f
    # Remove OBJECTID and Shape_Length properties
    jq '[ .[] | del(.OBJECTID) | del(.Shape_Length) ]' $f > .\data\cleaned.json
    # Merge cleaned file with partial result
    jq -s 'map(.[])' .\data\cleaned.json .\data\stats.json > .\data\temp.json
    Remove-Item .\data\stats.json
    Rename-Item .\data\temp.json -NewName stats.json -Force
}
Remove-Item -Force .\data\cleaned.json
 
# Convert to CSV
Get-Content .\data\stats.json | ConvertFrom-Json | ConvertTo-Csv | Out-File .\data\stats.csv
