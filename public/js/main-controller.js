app.controller('mainController', function($scope, $http, $auth, $location, AUTH_EVENTS, $status) {
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
        $status.error('User disconnected')
        $location.path('/login');
    })

    $scope.isMenu = path => {
        if ($location.path() == path)
            return true
        return false
    }
})