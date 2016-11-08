app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/pages/home.html',
            controller: 'homeController'
        })
        .when('/image/:id', {
            templateUrl: '/pages/home.html',
            controller: 'homeController'
        })
        // Login/signup
        .when('/login', {
            templateUrl: '/pages/login.html',
            controller: 'loginController'
        })
        // Upload new images
        .when('/upload', {
            templateUrl: '/pages/upload.html',
            controller: 'uploadController'
        })

    $locationProvider.html5Mode(true)
})

app.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
    return {
        responseError: (response) => {
            $rootScope.$broadcast({
                401: AUTH_EVENTS.notAuthenticated,
                403: AUTH_EVENTS.notAuthorized
            }[response.status], response)
            return $q.reject(response)
        }
    }
})

app.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor')
})

app.directive("ngFiles", [function() {
    return {
        scope: {
            ngFiles: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(event) {
                scope.$apply(function() {
                    scope.ngFiles = event.target.files
                })
            })
        }
    }
}])

app.directive("ngFile", [function() {
    return {
        scope: {
            ngFile: "="
        },
        link: function(scope, element, attributes) {
            element.bind("change", function(event) {
                scope.$apply(function() {
                    scope.ngFile = event.target.files[0]
                })
            })
        }
    }
}])

app.filter('bytes', function() {
    return function(bytes, precision) {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-'
        if (typeof precision === 'undefined') precision = 1
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024))
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number]
    }
})

app.filter('datify', function() {
    return function(date) {
        return new Date(date)
    }
})

app.controller('mainController', function($scope, $http, $auth, $location, AUTH_EVENTS, $userPicker) {
    $scope.config = {
        title: 'Picz'
    }
    $scope.page = {
        title: null,
        meta: null,
    }
    $scope.logged = $auth.logged
    $scope.logout = $auth.logout
    $scope.user = () => {
        return $auth.getUser()
    }
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        $auth.setToken(null)
        $location.path('/login');
    })

    $scope.isMenu = path => {
        if ($location.path() == path)
            return true
        return false
    }
})

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
            rowHeight: 200,
            maxRowHeight: 400,
            margin: 1,
            thumbnailPath: function(pic, width, height) {
                var h = parseInt(height / 100) * 100
                h+= 100
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
                img.attr('title', pic.title + $('<small/>').html(pic.caption)[0].outerHTML)
                img.attr('pic', JSON.stringify(pic))
                return img[0].outerHTML
            },
        })
        $('#pics').magnificPopup({
            type: 'image',
            delegate: 'img',
            titleSrc: 'title',
            gallery: {
                enabled: true
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

app.controller('uploadController', function($scope, $http, $auth, $location) {
    $scope.form = {}
    $scope.page.title = 'Upload'
    $scope.page.meta = null

    function status(msg, err) {
        $scope.status = null
        if (!msg) return
        $scope.status = {
            message: msg,
            type: err ? 'danger' : 'info'
        }
    }
    $scope.$watch('form.image', () => {
        if (!$scope.form.image) return

        var reader = new FileReader();
        reader.onload = function(e) {
            $('#image-preview').attr('src', e.target.result);
        }
        reader.readAsDataURL($scope.form.image);
    })

    $scope.upload = () => {
        $scope.page.title = 'Upload'
        $scope.page.meta = null

        var opts = {
            headers: {
                'Content-Type': undefined
            },
        }
        status('Uploading...')
        $http.post('/pics', objToFormData($scope.form), opts).then(
            res => {
                status('Done!')
                $location.path('/')
            },
            res => {
                status('Upload failed: ' + res.data.error, true)
            }
        )
    }
})