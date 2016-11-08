app.config(function($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {
            templateUrl: '/pages/home.html',
            controller: 'homeController'
        })
        .when('/uploads', {
            templateUrl: '/pages/uploads.html',
            controller: 'uploadsController'
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
