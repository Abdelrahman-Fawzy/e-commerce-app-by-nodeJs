$(function () {

    // confirm delete
    $('a.confirmation').on('click', function() {
        if(!confirm("confirm deletion")) return false
    });

    // change active class on the nav bar links
    var setDefaultActive = function() {
        var path = window.location.pathname;
        console.log(path)
        var element = $(`.navbar-nav li a[href="${path}"]`);
        element.addClass("active").parent().siblings().removeClass('active');
    }();
    
    $('[data-fancybox="galleryProducts"]').fancybox({
        // Options will go here
    });
})