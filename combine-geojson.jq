{
  type: "FeatureCollection",
  name: "USPS Carrier Routes",
  crs: {
    type: "name",
    properties: {
      name: "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  features: [ inputs.features[] ]
}