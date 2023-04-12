// Extends L.Marker to support CSS classes.
// Taken from https://stackoverflow.com/questions/68022975/how-to-keep-class-attribute-stored-for-leaflet-js-markers

// Following https://github.com/Leaflet/Leaflet/blob/master/PLUGIN-GUIDE.md
(function (factory, window) {

    // define an AMD module that relies on 'leaflet'
    if (typeof define === 'function' && define.amd) {
        define(['leaflet'], factory);

        // define a Common JS module that relies on 'leaflet'
    } else if (typeof exports === 'object') {
        module.exports = factory(require('leaflet'));
    }

    // attach your plugin to the global 'L' variable
    if (typeof window !== 'undefined' && window.L) {
        L.marker.classed = function (latLng, options) {
            return new L.Marker.Classed(latLng, options);
        }

        window.L.Marker.Classed = factory(L);
        window.L.marker.classed = function (latLng, options) {
            return new window.L.Marker.Classed(latLng, options);
        }
    }
}(function (L) {
    L.Marker.Classed = L.Marker.extend({
        options: {
            classes: []
        },
        addClass: function (className) {
            if (this.options.classes.indexOf(className) === -1) {
                this.options.classes.push(className);
            }
            this._initIcon();
        },
        getClasses: function () {
            return this.options.classes;
        },
        removeClass: function (className) {
            var index = this.options.classes.indexOf(className);
            if (index > -1) {
                this.options.classes.splice(index, 1);
            }
            this._initIcon();
        },
        _initIcon: function () {
            L.Marker.prototype._initIcon.apply(this, null);
            for (let cls of this.options.classes) {
                L.DomUtil.addClass(this._icon, cls);
            }
        }
    });

    return L.Marker.Classed;
}, window));
