/**
 * Leaflet button control using a template within the HTML.
 * 
 * In page markup:
 * <script type="text/html" id="ResetButton">
 *    <div class="leaflet-control-templatebutton leaflet-bar leaflet-control">
 *        <a class="leaflet-bar-part leaflet-bar-part-single montserrat" title="Reset map to original view" href="#" role="button">
 *            <i class="leaflet-control-templatebutton-icon fa fa-undo"></i>
 *            <span class="leaflet-control-templatebutton-text">Reset View</span>
 *        </a>
 *    </div>
 * </script>
 * 
 * In Javascript:
 *         L.control.templateButton({
 *          templateId: "ResetButton"
 *          position: "topleft",
 *          onClick: [some function],
 *          args: { argument object passed to click handler }
 *      }).addTo(map);
 * 
 */
(function (factory, window) {
    if (typeof define === "function" && define.amd) {
        define(["leaflet"], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("leaflet"));
    }

    if (typeof window !== "undefined" && window.L) {
        window.L.Control.TemplateButton = factory(L);
    }
}(function (L) {
    TemplateButton = L.Control.extend({
        options: {
            position: "topleft",
            title: "Button",
            args: {  },
            onClick: null,
        },

        onAdd: function (map) {
            this._map = map;

            // Parse the template
            if (!this.options.templateId) {
                throw new Error("TemplateButton: templateId not specified.");
            }

            let template = null;
            template = document.getElementById(this.options.templateId);
            if (!template) {
                throw new Error(`TemplateButton: invalid templateId: '${this.options.templateId}'.`);
            }

            let frag = document.createRange().createContextualFragment(template.innerHTML);
            if (frag.childElementCount != 1) {
                throw new Error(`TemplateButton: control template must have one top-level element. Template with id '${this.options.templateId}' has ${frag.childElementCount}.`);
            }
            this._container = frag.children[0];

            L.DomEvent.on(this._container, "click", this._clickHandler, this);

            return this._container;
        },

        onRemove: function (map) {
            L.DomEvent.off(this._container, "click", this._clickHandler, this);
        },

        _clickHandler: function (e) {
            e.preventDefault(); // Prevent link from being processed
            if (this.options.onClick) {
                return this.options.onClick(e, e.currentTarget, this.options.args);
            }
            return false;
        },
    });

    L.control.templateButton = function (options) {
        return new TemplateButton(options);
    };

    return TemplateButton;
}, window));
