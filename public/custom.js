
$(() => {
    $(".btn, a").click(function(){
        var el = $(this).blur()
    })
})

$(() => {
    $('.navbar-collapse, .navbar-brand').click(function(){
        $(".navbar-collapse").collapse('hide');
    })
})
