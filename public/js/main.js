app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
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

app.controller('mainController', function($scope, $http, $auth, $location, AUTH_EVENTS, $userPicker) {
    $scope.config = {
        title: 'Picz'
    }
    $scope.logged = $auth.logged
    $scope.logout = $auth.logout
    $scope.message = 'mainc'
    $scope.user = () => {
        return $auth.getUser()
    }
    $scope.$on(AUTH_EVENTS.notAuthenticated, function(event) {
        $auth.setToken(null)
        location.href = '#/login'
    })

    $scope.isMenu = path => {
        if ($location.path() == path)
            return true
        return false
    }

})

app.controller('homeController', function($scope, $http, $auth) {
    $http.get('/pics').then(res => {
        $scope.pics = res.data

        setTimeout(() => {
            var $pics = $('#pics')
            $pics.imagesLoaded(() => {
                $pics.masonry({
                    itemSelector : '.box'
                })
            })
        })
    })

    $scope.view = ($event, pic) => {
        $event.preventDefault()
        $event.stopPropagation()
        $scope.pic = pic
    }

    $scope.move = n => {
        console.log(n)
        var i = $scope.pics.indexOf($scope.pic)
        $scope.pic = $scope.pics[i + n]
    }
})

app.controller('uploadController', function($scope, $http, $auth) {
    $scope.form = {}
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
        console.log($scope.form.image)

        var reader = new FileReader();
        reader.onload = function (e) {
            console.log(e.target)
            $('#image-preview').attr('src', e.target.result);
        }
        reader.readAsDataURL($scope.form.image);
    })

    $scope.upload = () => {
        var opts = {
            headers: {'Content-Type': undefined},
        }
        status('Uploading...')
        $http.post('/pics', objToFormData($scope.form), opts).then(
            res => {
                status('Done!')
                location.href = '#/'
                console.log(res)
            },
            res => {
                console.log(res)
                status('Upload failed: '+res.data.error, true)
            },
            event => { console.log(event) }
        )
    }
})