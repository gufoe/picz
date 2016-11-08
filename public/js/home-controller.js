app.controller('homeController', function($scope, $http, $auth, $location) {
    $scope.page.title = 'Home'
    $scope.page.meta = {
        description: 'The best pictures of Gianmarco Canello',
        keywords: 'pictures, images, download, free, bautiful'
    }

    $scope.pic = null
    $scope.pics = null

    var makeGallery = () => {
        var pics = []
        for (var i in $scope.pics) {
            pics[i] = {}
            copyTo($scope.pics[i], pics[i])
            pics[i]._src = pics[i].src
        }
        $('#pics').justifiedImages({
            images: pics,
            rowHeight: 250,
            maxRowHeight: 500,
            margin: 1,
            thumbnailPath: function(pic, width, height) {
                var h = parseInt(height / 100) * 100
                h += 100
                h = Math.max(100, h)
                h = Math.min(600, h)
                return pic._src[h];
            },
            getSize: function(pic) {
                return {
                    width: pic.res.w,
                    height: pic.res.h
                }
            },
            template: pic => {
                var img = $('<img/>')
                img.css('width', pic.displayWidth)
                img.css('height', pic.displayHeight)
                img.attr('src', pic.src)
                    // img.attr('title', pic.title)
                img.attr('pic', JSON.stringify(pic))
                return img[0].outerHTML
            },
        })
        $('#pics').magnificPopup({
            type: 'image',
            delegate: 'img',
            image: {
                titleSrc: (item) => {
                    var pic = JSON.parse(item.el.attr('pic'))
                    console.log(pic.title + $('<small/>').html(pic.caption)[0].outerHTML)
                    return pic.title +
                        $('<small/>').html(pic.caption)[0].outerHTML +
                        $('<small/>').html('by ' + pic.user.name)[0].outerHTML
                },
            },
            gallery: {
                enabled: true,
                preload: [0, 2],
            },
            overflowY: 'hidden',
            callbacks: {
                elementParse: item => {
                    var pic = JSON.parse(item.el.attr('pic'))
                    item.src = pic._src[600]
                }
            }
        });
    }

    var lastW = $(window).width()
    $(window).resize(() => {
        if ($(window).width() != lastW) {
            lastW = $(window).width()
            makeGallery()
        }
    })

    $http.get('/pics').then(res => {
        $scope.pics = res.data
        makeGallery()
    })

    $scope.view = ($event, pic) => {
        $event.preventDefault()
        $event.stopPropagation()
        $scope.pic = pic
        $location.path('/image/' + pic.id)
    }

    $scope.move = n => {
        var i = $scope.pics.indexOf($scope.pic)
        $scope.pic = $scope.pics[i + n]
        $location.path('/image/' + pic.id)
    }
})