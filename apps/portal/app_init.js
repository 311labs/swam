window.ACS = {};
ACS.Pages = {};
ACS.View = {};

window.template_root = "apps.portal";


$(document).ready(function() {
  // window.removeEventListener("error", window.preapp_error_handler);

        var rx = /INPUT|SELECT|TEXTAREA/i;
        $(document).bind("keydown keypress", function(e) {
            if (e.which == 8) { // 8 == backspace
                if (!rx.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
                    e.preventDefault();
                }
            }
        });


  try {
    $("div.pre-loader-msg").text("INIT...");
    window.app = new ACS.App();
    $("div.pre-loader-msg").text("STARTING...");
    window.app.start();
  } catch(err) {
      console.log(err);
      if (!window.last_error) {
        $("div.pre-loader-msg").text("ERROR..." + err);
      } else {
        $("div.pre-loader-msg").text("ERROR..." + window.last_error.message);
      }
  }

});