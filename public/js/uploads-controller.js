app.controller('uploadsController', function($scope, $http, $auth, $location, $status) {
    $scope.page.title = 'My Pics'
    $scope.page.meta = null

    $scope.refresh = () => {
        $http.get('/pics/?user_id=' + $scope.user().id).then(res => {
            $scope.pics = res.data
        })
    }

    $scope.delete = pic => {
        $status.warning('Deleting image ' + pic.title + '...')
        $http.delete('/pics/' + pic.id).then(res => {
            $status.success('Image deleted!')
            $scope.refresh()
        })
    }
})