# Query USPS API for each ZIP code listed in zips.txt, then produce a routes-{ZIP}.geojson file
# with the route features, and stats-{ZIP}.json file with tabular data.
New-Item -ItemType Directory -Force Data | Out-Null
$zips = Get-Content .\zips.txt
foreach ($zip in $zips) {
    $dataFile = ".\data\data-${ZIP}.json"
    if (-not(Test-Path -Path $dataFile)) {
        Invoke-WebRequest -Uri "https://gis.usps.com/arcgis/rest/services/EDDM/selectZIP/GPServer/routes/execute?f=json&env%3AoutSR=4326&ZIP=${ZIP}&Rte_Box=R&UserName=EDDM" -OutFile $dataFile
    }
    jq -f .\usps2geojson.jq $dataFile > ".\data\routes-${zip}.geojson"
    jq -f .\usps2stats.jq $dataFile > ".\data\stats-${zip}.json"
}
