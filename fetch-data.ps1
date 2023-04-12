New-Item -ItemType Directory -Force Data
$zips = Get-Content .\zips.txt
foreach ($zip in $zips) {
    Invoke-WebRequest -Uri "https://gis.usps.com/arcgis/rest/services/EDDM/selectZIP/GPServer/routes/execute?f=json&env%3AoutSR=4326&ZIP=${ZIP}&Rte_Box=R&UserName=EDDM" -OutFile ".\data\response-${ZIP}.json"
    jq -f .\usps2geojson.jq ".\data\response-${zip}.json" > ".\data\routes-${zip}.geojson"
    jq -f .\usps2csv.jq ".\data\response-${zip}.json" > ".\data\stats-${zip}.json"
}

# Fails when lots of files. Command line too long.
#jq -n -f .\combine-geojson.jq .\data\routes-*.geojson > .\data\routes.geojson
