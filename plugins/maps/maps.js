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
        center: { lat: -34.397, lng: 150.644 },
        zoom: 8
    },

    on_init: function() {
        if (!this.options.map_id) this.options.map_id = SWAM.Maps.GOOGLE_MAP_ID;
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

    on_render_markers: function() {
        if (this.options.markers) {
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

            });
        }
    },

    on_render_heatmap: function() {
        if (this.options.heatmap_data) {
            let data = [];
            this.options.heatmap_data.forEach(hm_info => {
                data.push({location: new google.maps.LatLng(hm_info.lat, hm_info.lng), weight: hm_info.weight});
            });
            this.heatmap = new google.maps.visualization.HeatmapLayer({
                data: data,
                map: this.map,
            });
        }
    },

    // on_render_markers: function() {
    //     if (this.options.markers) {
    //         this.options.markers.forEach(marker => {
    //            var point = {lat: marker.lat, lng: marker.lng};
    //            new google.maps.Marker({
    //              position: point,
    //              map: this.map,
    //              title: marker.title
    //            });
    //         });
    //     }
    // },

    on_post_render: function() {
        if (SWAM.Map) {
            this.el.style.width = this.options.width;
            this.el.style.height = this.options.height;
            this.map = new SWAM.Map(this.el, {
              center: this.options.center,
              zoom: this.options.zoom,
              mapId: this.options.map_id
            });

            this.on_render_markers();
            this.on_render_heatmap();
        } else {
            if (!SWAM.Maps.GOOGLE_MAP_ID) {
                console.warn("Missing SWAM.Maps.GOOGLE_MAP_ID");
                return;
            }
            initMaps(this.render.bind(this));
        }
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

