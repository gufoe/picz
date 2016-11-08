
app.controller('loginController', function($scope, $http, $auth) {
    $scope.page.title = 'Login'
    $scope.page.meta = {
        description: 'Sign in the website to upload your images and share them with the world',
        keywords: 'login, signup, register, pictures, images, download, free, bautiful'
    }

    function update(status, error) {
        $scope.status = status
        $scope.error = error
    }

    $scope.sign_up = false
    $scope.form = {}

    $scope.signup = () => {
        if (!$scope.form.email || !$scope.form.password || !$scope.form.name) {
            update(null, 'Fields not valid.')
            return
        }

        update('Signing up...', null)
        $http.post('/users', $scope.form).then(
            res => {
                $scope.signin()
            },
            res => {
                update(null, res.data.error)
            }
        )
    }

    $scope.signin = () => {
        if (!$scope.form.email || !$scope.form.password) {
            update(null, 'Fields not valid.')
            return
        }

        update('Signing in...', null)
        $http.post('/sessions', $scope.form).then(
            res => {
                $auth.setToken(res.data.token)
                $auth.setUser(res.data.user)
                location.href = '#/'
            },
            res => {
                update(null, res.data.error)
            }
        )
    }
})