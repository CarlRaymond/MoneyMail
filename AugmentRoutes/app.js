
import zips from '../zips.json' assert { type: 'json' };
import jsonfile from 'jsonfile';

const METERS_PER_MILE = 1609.34;
const RAD_PER_DEGREE = Math.PI / 180.0;
const LMN = [-84.537131, 42.703772];


// For a GeoJSON feature, find the nearest and furthest distances from
// the reference point.
// Returns { min: distMeters, max: distMeters }
function computeRouteDistances(feature, [refLon, refLat]) {

    // From https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
    let creflat = Math.cos(refLat * RAD_PER_DEGREE);
    
    // Compute min and max ref point
    let aMin = 1000000000.0, aMax = 0.0;

    const EARTH_RADIUS = 6378100;
    switch (feature.geometry.type) {
        case "MultiLineString":
            for (let line of feature.geometry.coordinates) {
                for (let [lon, lat] of line) {
                    let deltaLat = Math.abs(lat - refLat) * RAD_PER_DEGREE;
                    let deltaLon = Math.abs(lon - refLon) * RAD_PER_DEGREE;
                    let a = Math.pow(Math.sin(deltaLat/2), 2)
                            + creflat * Math.cos(lat * RAD_PER_DEGREE) * Math.pow(Math.sin(deltaLon/2), 2);
                    if (a < aMin) aMin = a;
                    if (a > aMax) aMax = a;
                }
            }
        break;
    }

    if (aMax== 0.0) {
        // No points processed
        return null;
    }

    let cMin = 2 * Math.asin(Math.sqrt(aMin));
    let cMax = 2 * Math.asin(Math.sqrt(aMax));

    return { minDist: cMin * EARTH_RADIUS, maxDist: cMax * EARTH_RADIUS };
}


let augment = function (data) {

    for (let feature of data.features) {
        // Each feature is a route
        let d = computeRouteDistances(feature, LMN);
        feature.properties.minDistMeters = d.minDist;
        feature.properties.minDistMiles = d.minDist / METERS_PER_MILE;
        feature.properties.maxDistMeters = d.maxDist;
        feature.properties.maxDistMiles = d.maxDist / METERS_PER_MILE;
    }
    return data;
}

// Holds outstanding requests
let requests = [];

for (let zip of zips) {
    let inPath = `../data/routes-${zip}.geojson`;
    let outPath = `../data/routes-augmented-${zip}.geojson`;
    requests.push(jsonfile.readFile(inPath)
        .then(data => {
            if (!data.features) {
                throw new Error(`GeoJSON file at ${inPath} does not contain features.`);
            }
            let adata = augment(data);
            jsonfile.writeFile(outPath, data)
        })
        .catch((error) => { console.log(error); } )
    );
}

// Wait for all results
console.log('waiting...');
await Promise.all(requests);
console.log('done.');



