param($ZIP)
Invoke-WebRequest -Uri "https://gis.usps.com/arcgis/rest/services/EDDM/selectZIP/GPServer/routes/execute?f=json&env%3AoutSR=4326&ZIP=${ZIP}&Rte_Box=R&UserName=EDDM" -OutFile ".\data\response-${ZIP}.json"
jq -f .\usps2geojson.jq ".\data\response-${ZIP}.json" > ".\data\routes-${ZIP}.geojson"
jq -f .\usps2csv.jq ".\data\response-${ZIP}.json" > ".\data\stats-${ZIP}.json"

