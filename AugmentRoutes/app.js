
import fs from 'fs/promises';
import zips from '../zips.json' assert { type: 'json' };
import fetch from 'node-fetch';

let requests = [];
let zip;
for (zip of zips) {
    let url = `../routes-${zip}.geojson`;
    requests.push(fetch(url));
}



export { zips }