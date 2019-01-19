function kvAnimate() {
    $('.blockItem').each(function(id, el) {
        var random = (Math.floor(Math.random() * 100) + 1) / 100
        $(this).css({ opacity: random })
    })
}
kvAnimate()

var Interval = setInterval(kvAnimate, 1500)
