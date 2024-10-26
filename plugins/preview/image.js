SWAM.Views.ImageViewer = SWAM.View.extend({
    template: `<div class="image-preview-controls">
        <div class="row">
            <div class="col">
                <button class="btn btn-link" data-action="zoom_in"><i class="bi bi-zoom-in"></i></button>
                <button class="btn btn-link" data-action="zoom_out"><i class="bi bi-zoom-out"></i></button>
                <button class="ms-3 btn btn-link" data-action="rotate_left"><i class="bi bi-arrow-counterclockwise"></i></button>
                <button class="btn btn-link" data-action="rotate_right"><i class="bi bi-arrow-clockwise"></i></button>
                <button class="ms-3 btn btn-link" data-action="download"><i class="bi bi-download"></i></button>
            </div>
        </div>
    </div>
    <canvas id="image-canvas"></canvas>`,

    classes: "image-preview text-center",

    loadImage: function(image_url) {
        this.options.zoom_level = 1.0;
        this.options.rotation = 0;
        this.options.url = image_url;
        if (!this.options.name) this.options.name = image_url.split("/").pop();

        const img = new Image();
        img.onload = () => {
            this.options.image = img;
            this.renderImage(); // Render image when it has loaded
        };
        img.src = image_url;
    },

    on_action_zoom_in: function() {
        this.options.zoom_level += 0.1;
        this.renderImage();
    },

    on_action_zoom_out: function() {
        if (this.options.zoom_level <= 0.2) return;
        this.options.zoom_level -= 0.1;
        this.renderImage();
    },

    on_action_rotate_left: function() {
        this.options.rotation = (this.options.rotation - 90) % 360; // Rotate counterclockwise
        this.renderImage();
    },

    on_action_rotate_right: function() {
        this.options.rotation = (this.options.rotation + 90) % 360; // Rotate clockwise
        this.renderImage();
    },

    on_action_download: function() {
        const link = document.createElement("a");
        link.href = this.canvas.toDataURL("image/jpeg");
        link.download = this.options.name; // Use the original file name for download
        link.click();
    },

    renderImage: function() {
        const canvas = this.canvas;
        const ctx = this.ctx;
        const img = this.options.image;
        const zoom = this.options.zoom_level;
        const rotation = this.options.rotation;

        // Clear canvas before redrawing
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Adjust canvas size to fit the zoomed and rotated image
        const width = img.width * zoom;
        const height = img.height * zoom;

        canvas.width = (rotation % 180 === 0) ? width : height;
        canvas.height = (rotation % 180 === 0) ? height : width;

        // Translate to the center of the canvas before applying transformations
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.scale(zoom, zoom);

        // Draw the image at the center
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();
    },

    on_post_render: function() {
        this.canvas = this.$el.find("#image-canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.loadImage(this.options.url);
    }
});
