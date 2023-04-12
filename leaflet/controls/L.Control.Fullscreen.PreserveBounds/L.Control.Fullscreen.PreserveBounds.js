/**
 * Fullscreen control that preserves the map's bounds when switching between modes
 */

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

    let base = L.Control.Fullscreen.prototype;

    L.Control.Fullscreen.PreserveBounds = L.Control.Fullscreen.extend({


        onAdd: function (map) {
            this._map = map;
            this._initialBounds = map.getBounds();

            return base.onAdd.call(this, map);
        },

        _click: function (e) {
            let map = this._map;
            if (map.isFullscreen()) {
                base._click.call(this, e);
                map.fitBounds(this._initialBounds);
            }
            else {
                this._initialBounds = map.getBounds();
                base._click.call(this, e);
            }
        }
    });

    L.control.fullscreen.preserveBounds = function (options) {
        return new L.Control.Fullscreen.PreserveBounds(options);
    };
}));