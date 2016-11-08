app.service('$auth', function($q, $http, $rootScope) {
    var self = this

    function refreshHeaders() {
        var token = self.getToken()
        if (token)
            $http.defaults.headers.common['X-Auth-Token'] = token
        else
            $http.defaults.headers.common['X-Auth-Token'] = undefined
    }

    this.getUser = () => {
        return JSON.parse(localStorage.getItem('user'))
    }
    this.setUser = user => {
        return localStorage.setItem('user', JSON.stringify(user))
    }

    this.getToken = () => {
        return localStorage.getItem('token')
    }
    this.setToken = token => {
        if (!token)
            localStorage.removeItem('token')
        else
            localStorage.setItem('token', token)

        refreshHeaders()
    }
    this.check = () => {
        if (!Token.get()) location.href = '#/login'
    }

    this.logged = () => {
        return !!this.getToken()
    }

    this.logout = () => {
        $http.delete('/sessions').then(
            res => {
                self.setToken(null)
                location.href = '#/login'
            }
        )
    }

    refreshHeaders()
})