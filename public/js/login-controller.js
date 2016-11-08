
app.controller('loginController', function($scope, $http, $auth, $location, $status) {
    $scope.page.title = 'Login'
    $scope.page.meta = {
        description: 'Sign in the website to upload your images and share them with the world',
        keywords: 'login, signup, register, pictures, images, download, free, bautiful'
    }

    $scope.sign_up = false
    $scope.form = {}

    $scope.signup = () => {
        if (!$scope.form.email || !$scope.form.password || !$scope.form.name) {
            $status.error('Fields not valid.')
            return
        }

        $status.info('Signing up...', null)
        $http.post('/users', $scope.form).then(
            res => {
                $scope.signin()
            },
            res => {
                $status.error(res.data.error)
            }
        )
    }

    $scope.signin = () => {
        if (!$scope.form.email || !$scope.form.password) {
            $status.error('Fields not valid.')
            return
        }

        $status.info('Signing in...', null)
        $http.post('/sessions', $scope.form).then(
            res => {
                $auth.setToken(res.data.token)
                $auth.setUser(res.data.user)
                $status.success('Logged in!')
                $location.path('/')
            },
            res => {
                $status.error(res.data.error)
            }
        )
    }
})