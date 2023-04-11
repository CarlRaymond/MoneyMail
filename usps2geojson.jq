{
   "type": "FeatureCollection",
   "name": "USPS Carrier Routes",
   "crs": { "type":"name", "properties": {"name":"urn:ogc:def:crs:OGC:1.3:CRS84"}},

   "fields":  (.results[0] | .value | .fields),

   "features": [
        (.results[0] | .value | .features[] |
        {
            "type": "Feature",
            "properties": .attributes,
            "geometry": {
                type: "MultiLineString",
                "coordinates": .geometry.paths
                }
        })
   ]
}
