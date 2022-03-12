let mount_play = () => {
	div_play.style.display = "block"
	let tablebody = document.getElementById("tablebody");

	// update interface
	let render = () => {
		td_phase.innerHTML = phase
		if (theta !== null) { td_theta.innerHTML = theta.toLocaleString() }
		if (delta !== null) { td_delta.innerHTML = delta.toLocaleString() }
		if (gamma !== null) { td_gamma.innerHTML = gamma.toLocaleString() }
		if (sigma !== null) { td_sigma.innerHTML = sigma.toLocaleString() }

		if (_recorder !== null) {
      threshold = _recorder.threshold
      instability = _recorder.instability
      measurecount = _recorder.measurecount
			if (instability !== null && threshold !== null) {
				td_update.innerHTML = `${measurecount.toLocaleString()} / 2000 -> ${instability.toLocaleString()} / ${threshold.toLocaleString()}`
			}
		}
		td_sigma.style.color = sigma === null ? '' : abs(sigma) < 10 ? 'lightgreen' : 'red'
		window.requestAnimationFrame(render)
	}
	window.requestAnimationFrame(render)

	// retrieve role
	if (role === "player") { // run player logic
	  let id = null
		player()
	} else if (role === "organizer") { // run organizer logic
		td_role.innerHTML = `${role}`
		organizer()
	}

	// update interface for role
	if (role === "player") {
		tr_update.style.display = "none"
		// tr_peaks.style.display = "none"
	}
	if (role === "organizer") {
		tr_phase.style.display = "none"
		tr_gamma.style.display = "none"
	}
}
