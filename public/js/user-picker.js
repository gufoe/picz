
app.controller('userPickerController', function($scope, $http, $route, $uibModalInstance, args) {
	$scope.selected = []
	$scope.users = []

	if (args.selected)
		args.selected.each(u => { $scope.selected.push(u) })

	function status(type, msg) {
		if (!type || !msg) {
			$scope.status = null
			return
		}
		$scope.status = {
			type: type,
			msg: msg
		}
	}
	function err(msg) { status('danger', msg) }
	function info(msg) { status('info', msg) }
	function err(msg) { status('danger', msg) }

	$scope.search = () => {
		if ($scope.email.length < 2) {
			$scope.users = []
			return err('Please insert at least two characters.')
		}
		var query = {
			q: $scope.email
		}
		info('Searching...'+JSON.stringify(query))
		$http.get('/users', { params: query }).then(res => {
			$scope.users = res.data
			if (!$scope.users.length)
				err('No users match your query.')
			else
				status()
		})
	}

	$scope.unselected = () => {
		if (!$scope.users) return []
		var uns = []
		$scope.users.each(u => {
			if (!$scope.selected.byField('id', u.id))
			uns.push(u)
		})
		return uns
	}

	$scope.select = user => {
		var s = $scope.selected
		if (s.indexOf(user) < 0)
			s.push(user)
	}

	$scope.unselect = user => {
		var s = $scope.selected
		if ((i = s.indexOf(user)) >= 0)
			s.splice(i, 1)
	}


    $scope.done = function() {
        $uibModalInstance.close($scope.selected)
    }

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel')
    };
})

app.service('$userPicker', function($q, $http, $rootScope, $uibModal) {
    var self = this

    this.show = (callback, selected) => {
		var up = $uibModal.open({
			templateUrl: '/pages/user-picker.html',
			controller: 'userPickerController',
			resolve: {args: () => {
				return {selected: selected}
			}}
		})
		up.result.then(callback)
    }
})