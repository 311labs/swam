
window.animateElement = function($el, animation) {
    var anim_name = "animate__" + animation;
    $el.one("animationend", function(){ $el.removeClass("animate__animated").removeClass(anim_name);})
    $el.addClass("animate__animated").addClass(anim_name);
}