function initPdfLib(callback) {
  // Check if pdfjsLib is already defined
  if (typeof pdfjsLib !== "undefined") {
    // If already loaded, execute the callback immediately
    callback();
    return;
  }

  // If not loaded, create a script element to load it dynamically
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.min.js";
  script.onload = () => {
    // Configure the PDF worker source after loading
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";
    // Call the callback function after the library has loaded
    callback();
  };

  script.onerror = () => {
    console.error("Failed to load PDF.js library.");
  };

  // Append the script to the document head
  document.head.appendChild(script);
}


SWAM.Views.PDFViewer = SWAM.View.extend({
    template: `<div class="pdf-preview-controls">
    <div class="row">
        <div class="col">
            <button class="btn btn-link" data-action="prev_page">Previous Page</button>
            <button class="btn btn-link" data-action="next_page">Next Page</button>
        </div>
        <div class="col">
            <span id="page_num"></span> / <span id="page_count"></span>
        </div>
        <div class="col">
            <button class="btn btn-link" data-action="zoom_in">Zoom In</button>
            <button class="btn btn-link" data-action="zoom_out">Zoom Out</button>
        </div>
    </div>
</div>
<canvas id="pdf-canvas"></canvas>`,

    classes: "pdf-preview text-center",

    loadPDF: function(pdf_url) {
        this.options.pdf_doc = null;
        this.options.page_num = 1;
        this.options.is_rendering = false;
        this.options.zoom_level = 1.0;
        this.options.url = pdf_url;
        pdfjsLib.getDocument(this.options.url).promise.then(pdf => {
            this.on_pdf(pdf);
        })
    },

    on_action_next_page: function() {
        if (this.options.is_rendering) return SWAM.toast("Error", "rendering");
        if (this.options.page_num >= this.options.pdf_doc.numPages) return;
        this.options.page_num += 1;
        this.renderPage(this.options.page_num);
    },

    on_action_prev_page: function() {
        if (this.options.is_rendering) return SWAM.toast("Error", "rendering");
        if (this.options.page_num <= 1) return;
        this.options.page_num -= 1;
        this.renderPage(this.options.page_num);
    },

    on_action_zoom_in: function() {
        // if (this.options.is_rendering) return SWAM.toast("Error", "rendering");
        this.options.zoom_level += 0.1;
        this.renderPage(this.options.page_num);
    },

    on_action_zoom_out: function() {
        // if (this.options.is_rendering) return SWAM.toast("Error", "rendering");
        if (this.options.zoom_level <= 0.2) return;
        this.options.zoom_level -= 0.1;
        this.renderPage(this.options.page_num);
    },

    on_pdf: function(pdf) {
        this.options.pdf_doc = pdf;
        this.$el.find("#page_count").text(this.options.pdf_doc.numPages);
        this.renderPage(1);
    },

    renderPage: function(page_num) {
        this.options.is_rendering = true;
        this.options.pdf_doc.getPage(page_num).then(page => {
            const viewport = page.getViewport({ scale: this.options.zoom_level });
            this.canvas.width = viewport.width;
            this.canvas.height = viewport.height;

            const renderContext = {
              canvasContext: this.ctx,
              viewport: viewport,
            };

            page.render(renderContext).promise.then(() => {
              this.options.is_rendering = false;
              this.$el.find("#page_num").text(this.options.page_num);
            });

        });
    },

    on_post_render: function() {
        this.canvas = this.$el.find("#pdf-canvas")[0];
        this.ctx = this.canvas.getContext("2d");
        this.loadPDF(this.options.url);
    }

});
