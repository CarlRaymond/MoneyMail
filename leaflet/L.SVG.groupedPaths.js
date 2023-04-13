(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['leaflet'], factory);
    } else if (typeof module !== 'undefined') {
        // Node/CommonJS
        module.exports = factory(require('leaflet'));
    } else {
        // Browser globals
        if (typeof window.L === 'undefined') {
            throw new Error('Leaflet must be loaded first');
        }
        factory(window.L);
    }
}(function (L) {

    L.SVG.include({
        _addPath: function (layer) {
            if (!this._rootGroup) { this._initContainer(); }
            if (layer.options && layer.options.containerName) {
                let childGroup = this._rootGroup.querySelector('.' + layer.options.containerName);
                if (!childGroup) {
                    childGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                    childGroup.classList.add(layer.options.containerName);
                    this._rootGroup.appendChild(childGroup);
                }
                childGroup.appendChild(layer._path);
            } else {
                this._rootGroup.appendChild(layer._path);
            }
            layer.addInteractiveTarget(layer._path);
        }
    });
}));