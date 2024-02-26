SWAM.Maps = {
    GOOGLE_API_KEY: "",
    GOOGLE_MAP_ID: "",
    libraries: ["marker", "visualization"],
    show: function(opts) {
        return SWAM.Views.Map.showDialog(opts);
    }
};

SWAM.Views.Map = SWAM.View.extend({

    defaults: {
        title: "Map",
        height: "400px",
        width: "100%",
        size: "lg",
        tag_class: 'swam-map-tag',
        map_id: null,
        heatmap_max_intensity: 100,
        heatmap_scale_radius: false,
        heatmap_radius: null,
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    },

    on_init: function() {
        if (!this.options.map_id) this.options.map_id = SWAM.Maps.GOOGLE_MAP_ID;
        this.debouncedTrigger = window.debounce(
            this.trigger.bind(this),
            200
        );
        if (this.options.markers) {
            this.setMarkers(this.options.markers);
        }
        if (this.options.heatmap) {
            this.setHeatmapData(this.options.heatmap);
        }
    },

    bindMapEvents: function() {
        if (this.map) {
            this.map.addListener("zoom_changed", this.on_map_changed.bind(this));
            this.map.addListener("center_changed", this.on_map_changed.bind(this));
        }
    },

    unbindMapEvents: function() {
        if (this.map) {
            google.maps.event.clearListeners(this.map, "zoom_changed");
            google.maps.event.clearListeners(this.map, "center_changed");
        }
    },

    on_map_changed: function(evt) {
        this.debouncedTrigger("map_changed", {
            zoom: this.getZoom(),
            center: this.getCenter()
        });
    },

    createInlineMarker: function(marker_info) {
        let tag = document.createElement('div');
        tag.className = marker_info.tag_class || this.options.tag_class;
        tag.textContent = marker_info.title;
        let point = {lat: marker_info.lat, lng: marker_info.lng};
        let adv_marker = new google.maps.marker.AdvancedMarkerElement({
          position: point,
          map: this.map,
          content: tag
        });
        return adv_marker;
    },

    createMarker: function(marker_info) {
        let point = {lat: marker_info.lat, lng: marker_info.lng};
        let content = null;
        if (marker_info.index || marker_info.scale) {
            const pin = new google.maps.marker.PinElement({
                glyph: marker_info.glyph,
                scale: marker_info.scale || 1
            });
            content = pin.element;
        }

        let adv_marker = new google.maps.marker.AdvancedMarkerElement({
          position: point,
          map: this.map,
          content: content
        });
        return adv_marker;
    },

    setMarkers: function(markers, render) {
        if (this._markers) {
            this._markers.forEach(marker => {
                marker.map = null;
            });
        }
        this._markers = [];
        this.options.markers = markers;
        this._markers_changed = true;
        if (render) this.renderMarkers();
    },

    renderMarkers: function() {
        if (this.options.markers && this._markers_changed) {
            this._markers_changed = false;
            this.info_window = new google.maps.InfoWindow();
            this.options.markers.forEach(marker_info => {
                let adv_marker;
                if (marker_info.inline) {
                    adv_marker = this.createInlineMarker(marker_info);
                } else {
                    adv_marker = this.createMarker(marker_info);
                }

               if (marker_info.callback) {
                    adv_marker.addListener('click', marker_info.callback);
               } else if (!marker_info.inline && marker_info.title) {
                    adv_marker.addListener('click', ({ domEvent, latLng }) => {
                        const { target } = domEvent;
                        this.info_window.close();
                        this.info_window.setContent(marker_info.title);
                        this.info_window.open(adv_marker.map, adv_marker);
                    });
               }
               this._markers.push(adv_marker);
            });
        }
    },

    hideHeatmap: function() {
        if (this.heatmap) this.heatmap.setMap(null);
    },

    setHeatmapData: function(data, render) {
        let weighted = [];
        data.forEach(hm_info => {
            weighted.push({
                location: new google.maps.LatLng(hm_info.lat, hm_info.lng),
                weight: hm_info.weight
            });
        });
        this._hm_data = weighted;
        if (render) this.renderHeatmap();
    },

    renderHeatmap: function() {
        if (!google.maps.visualization.HeatmapLayer) {
            console.warn("missing google.maps.visualization.HeatmapLayer");
            return;
        }
        if (this._hm_data) {
            if (!this.heatmap) {
                this.heatmap = new google.maps.visualization.HeatmapLayer();
            }
            this.heatmap.setMap(this.map);
            this.heatmap.setOptions({
                maxIntensity: this.options.heatmap_max_intensity,
                scaleRadius: this.options.heatmap_scale_radius,
                radius: this.options.heatmap_radius,
            });
            this.heatmap.setData(this._hm_data);
        }
    },

    on_post_render: function() {
        if (SWAM.Map) {
            this.el.style.width = this.options.width;
            this.el.style.height = this.options.height;
            if (this.map) {
                this.unbindMapEvents();
            }
            this.map = new SWAM.Map(this.el, {
              center: this.options.center,
              zoom: this.options.zoom,
              mapId: this.options.map_id
            });
            this.bindMapEvents();
            this.renderMarkers();
            this.renderHeatmap();
        } else {
            if (!SWAM.Maps.GOOGLE_MAP_ID) {
                console.warn("Missing SWAM.Maps.GOOGLE_MAP_ID");
                return;
            }
            initMaps(this.render.bind(this));
        }
    },
    getCenter: function() {
        if (this.map) {
            let c = this.map.getCenter();
            return {lat:c.lat(), lng:c.lng()};
        }
        return null;
    },
    getZoom: function() {
        if (this.map) {
            return this.map.getZoom();
        }
        return this.options.zoom;
    },
    update: function() {
        this.renderMarkers();
        this.renderHeatmap();
    }
}, {
    showDialog: function(opts) {
        let view = new this(opts);
        return SWAM.Dialog.show({
            title: view.options.title,
            view: view,
            size: view.options.size
        });
    }
});

window.initMaps = function(callback) {
    if (!window.google_maps_init) {
        window.google_maps_init = async function(){
            SWAM.Map = google.maps.Map;
            // await google.maps.importLibrary("marker");
            callback();
        };
        window.loadScript(`https://maps.googleapis.com/maps/api/js?key=${SWAM.Maps.GOOGLE_API_KEY}&libraries=${SWAM.Maps.libraries.join(",")}&callback=google_maps_init`, null, true);
    } else {
        callback();
    }
}

