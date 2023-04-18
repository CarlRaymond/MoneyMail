
import zips from '../zips.json' assert { type: 'json' };
import jsonfile from 'jsonfile';

let requests = [];

let augment = function (data) {

    for (let feature of data.features) {
        // Each feature is a route
        feature.properties.minDist = 0.1;
        feature.properties.maxDist = 1.0;
    }

    return data;
}

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



