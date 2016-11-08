app.service('$status', function() {
	$alerts = $('#alerts')
    this.add = (message, type, timeout) => {
		var $alert = $('<div/>')
		$alert.addClass('alert')
		$alert.addClass('alert-'+type)
		$alert.html(message)
		$alerts.append($alert)
		setTimeout(() => {
			$alert.fadeOut(1000, () => {
				$alert.remove()
			})
		}, timeout*1000)
    }

	this.info = (message, timeout) => {
		this.add(message, 'info', timeout ? timeout : 1)
	}

	this.error = (message, timeout) => {
		this.add(message, 'danger', timeout ? timeout : 5)
	}

	this.warning = (message, timeout) => {
		this.add(message, 'warning', timeout ? timeout : 2)
	}

	this.success = (message, timeout) => {
		this.add(message, 'success', timeout ? timeout : 2)
	}
})