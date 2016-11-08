app.controller('uploadController', function($scope, $http, $auth, $location) {
    $scope.form = {}
    $scope.page.title = 'Upload'
    $scope.page.meta = null

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
        $status.info('Uploading...')
        $http.post('/pics', objToFormData($scope.form), opts).then(
            res => {
                $status.success('Image uploaded!')
                $location.path('/')
            },
            res => {
                $status.error('Upload failed: ' + res.data.error, true)
            }
        )
    }
})