/**
 * For each ZIP code in zips.json, fetch route data from gis.usps.com, augment the routes
 * with the minimum and maximum distance from the reference point, save the data file,
 * transform via jq to geojson file, and transform via jq to statistics file.
 */

import zips from '../zips.json' assert { type: 'json' };
import fs from 'fs';
import jq from 'node-jq';

const METERS_PER_MILE = 1609.34;
const RAD_PER_DEGREE = Math.PI / 180.0;
const LMN = [-84.537131, 42.703772];


// For a feature, find the nearest and furthest distances from the reference point.
// Note this isn't a GeoJSON feature, it's an esriGeometryPolyline, which has
// .geometry.paths instead of .geometry.coordinates, using the same format as a
// GeoJSON MultiLineString.
// Returns { min: distMeters, max: distMeters }
let computeRouteDistances = function(feature, [refLon, refLat]) {

    // Compute min and max ref point
    let aMin = 1000000000.0, aMax = 0.0;

    const EARTH_RADIUS = 6378100;

    // From https://stackoverflow.com/questions/43167417/calculate-distance-between-two-points-in-leaflet
    let cosRefLat = Math.cos(refLat * RAD_PER_DEGREE);
    
    for (let line of feature.geometry.paths) {
        for (let [lon, lat] of line) {
            let deltaLat = Math.abs(lat - refLat) * RAD_PER_DEGREE;
            let deltaLon = Math.abs(lon - refLon) * RAD_PER_DEGREE;
            let a = Math.pow(Math.sin(deltaLat/2), 2)
                    + cosRefLat * Math.cos(lat * RAD_PER_DEGREE) * Math.pow(Math.sin(deltaLon/2), 2);
            if (a < aMin) aMin = a;
            if (a > aMax) aMax = a;
        }
    }

    if (aMax == 0.0) {
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
        feature.attributes.minDistMeters = d.minDist;
        feature.attributes.minDistMiles = d.minDist / METERS_PER_MILE;
        feature.attributes.maxDistMeters = d.maxDist;
        feature.attributes.maxDistMiles = d.maxDist / METERS_PER_MILE;
    }
    return data;
}

// Load jq scripts synchronously
let usps2geojson = fs.readFileSync('../usps2geojson.jq', { encoding: 'utf-8'}).replace(/(\r\n|\n|\r)/gm, "");
let usps2stats = fs.readFileSync('../usps2stats.jq', { encoding: 'utf-8'}).replace(/(\r\n|\n|\r)/gm, "");

// Holds outstanding requests
let requests = [];

for (let zip of zips) {
    let uspsUrl = `https://gis.usps.com/arcgis/rest/services/EDDM/selectZIP/GPServer/routes/execute?f=json&env%3AoutSR=4326&ZIP=${zip}&Rte_Box=R&UserName=EDDM`
    let outPath = `../Data/data-${zip}.json`;
    let geojsonPath = `../Data/routes-${zip}.geojson`;
    let statsPath = `../Data/stats-${zip}.json`;

    console.log(`Fetching route data for ${zip}...`);
    fetch(uspsUrl)
        .then(response => {
            console.log(`Received route data for ${zip}`);
            if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText} fetching ${uspsUrl}`);
            return response.json()
        })
        .then(data => {
            let results = data.results;
            if (!results) throw new Error(`Expected 'results' property not found in ${uspsUrl}`);

            // If any messages, print them.
            if (data.messages && Array.isArray(data.messages))
                for (let m in data.messages)
                    console.log(m);
            
            // Process features
            augment(results[0].value);

            // Write augmented route file
            let prom1 = fs.promises.writeFile(outPath, JSON.stringify(data), { encoding: 'utf-8' })
                .then(() => { console.log(`Wrote ${outPath}`); });
            
            // Transform with jq to geojson file
            let prom2 = jq.run(usps2geojson, data, { input: 'json', output: 'json' })
                .then(geojson => fs.promises.writeFile(geojsonPath, JSON.stringify(geojson), { encoding: 'utf-8' }))
                .then(() => { console.log(`Wrote ${geojsonPath}`); });

            // Transform with jq to stats file
            let prom3 = jq.run(usps2stats, data, { input: 'json', output: 'json' })
                .then(stats => fs.promises.writeFile(statsPath, JSON.stringify(stats), { encoding: 'utf-8' }))
                .then(() => { console.log(`Wrote ${statsPath}`); });

            //return Promise.all([prom1, prom2, prom3]);
        });
}

// Wait for all results
console.log('waiting...');
//await Promise.all(requests);
//console.log('done.');



