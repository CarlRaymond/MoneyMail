param($ZIP)
$response = Invoke-WebRequest -Uri "https://gis.usps.com/arcgis/rest/services/EDDM/selectZIP/GPServer/routes/execute?f=json&env%3AoutSR=4326&ZIP=${ZIP}&Rte_Box=R&UserName=EDDM" -OutFile "response-${ZIP}.json"
