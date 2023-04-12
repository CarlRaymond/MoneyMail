param($ZIP)
jq -f .\usps2geojson.jq ".\data\response-${ZIP}.json" > ".\data\routes-${ZIP}.geojson"
jq -f .\usps2csv.jq ".\data\response-${ZIP}.json" | ConvertFrom-Json | ConvertTo-Csv | Out-File ".\data\stats-${ZIP}.csv"