// PROVIDED CODE BELOW (LINES 1 - 80) DO NOT REMOVE

// The store will hold all information needed globally
let store = {
	track_id: undefined,
	player_id: undefined,
	race_id: undefined,
}

// We need our javascript to wait until the DOM is loaded
document.addEventListener("DOMContentLoaded", function() {
	onPageLoad()
	setupClickHandlers()
})

async function onPageLoad() {
	try {
		await getTracks()
			.then(tracks => {
				const html = renderTrackCards(tracks)
				renderAt('#tracks', html)
			})

		await getRacers()
			.then((racers) => {
				const html = renderRacerCars(racers)
				renderAt('#racers', html)
			})
	} catch(error) {
		console.log("Problem getting tracks and racers ::", error.message)
		console.error(error)
	}
}

function setupClickHandlers() {
	document.addEventListener('click', function(event) {
		const { target } = event

		// Race track form field
		if (target.matches('.card.track')) {
			handleSelectTrack(target)
		}

		// Podracer form field
		if (target.matches('.card.podracer')) {
			handleSelectPodRacer(target)
		}

		// Submit create race form
		if (target.matches('#submit-create-race')) {
			event.preventDefault()
	
			// start race
			handleCreateRace()
		}

		// Handle acceleration click
		if (target.matches('#gas-peddle')) {
			handleAccelerate()
		}

	}, false)
}

async function delay(ms) {
	try {
		return await new Promise(resolve => setTimeout(resolve, ms));
	} catch(error) {
		console.log("an error shouldn't be possible here")
		console.log(error)
	}
}
// ^ PROVIDED CODE ^ DO NOT REMOVE

// This async function controls the flow of the race, add the logic and error handling
async function handleCreateRace() {
	// render starting UI
	renderAt('#race', renderRaceStartView())

	// TODO - Get player_id and track_id from the store
	let player_id = store.player_id;
	let track_id = store.track_id;
	
	// const race = TODO - invoke the API call to create the race, then save the result
	const race = async () => await createRace(player_id, track_id);

	let raceObj = await race();

	// TODO - update the store with the race id
	// For the API to work properly, the race id should be race id - 1
	store.race_id = raceObj.ID - 1;
	
	// The race has been created, now start the countdown
	// TODO - call the async function runCountdown
	await runCountdown()
	// TODO - call the async function startRace
	await  startRace(store.race_id)
	// TODO - call the async function runRace
	await runRace(store.race_id)
}

function runRace(raceID) {
	return new Promise(resolve => {
	// TODO - use Javascript's built in setInterval method to get race info every 500ms
		const raceInfo = setInterval(async () => {
			//raceID = store.race_id;
			let race = await getRace(store.race_id);
			/*
				TODO - if the race info status property is "in-progress", update the leaderboard by calling:
				renderAt('#leaderBoard', raceProgress(res.positions))
			*/
			if (race.status === 'in-progress') {
				renderAt('#leaderBoard', raceProgress(race.positions))
				/*
				TODO - if the race info status property is "finished", run the following:

				clearInterval(raceInterval) // to stop the interval from repeating
				renderAt('#race', resultsView(res.positions)) // to render the results view
				resolve(res) // resolve the promise
			*/
			} else if (race.status === 'finished') {
				clearInterval(raceInfo);
				resultsView(race.positions);
				resolve(race);
			}
		})
	}, 500)
	// remember to add error handling for the Promise
		.catch(error => console.log('Error in runRace() --> ', error))
}

async function runCountdown() {
	try {
		// wait for the DOM to load
		await delay(1000)
		let timer = 3

		return new Promise(resolve => {
			// TODO - use Javascript's built in setInterval method to count down once per second
			let CountdownInterval = setInterval(() => {
				// run this DOM manipulation to decrement the countdown for the user
				document.getElementById('big-numbers').innerHTML = --timer;
				// TODO - if the countdown is done, clear the interval, resolve the promise, and return
				if ( timer === 0 ) {
					clearInterval(CountdownInterval);
					resolve();
					return;
				}
			}, 1000);
		})
	} catch(error) {
		console.log('Error in runCountdown() --> ', error);
	}
}

function handleSelectPodRacer(target) {
	console.log("selected a pod", target.id);
	console.log("logtest id -->", target.id);							// DELETE LATER
	console.log('driver_name -->', target.driver_name); 				// DELETE LATER

	// remove class selected from all racer options
	const selected = document.querySelector('#racers .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected racer to the store
	store.player_id = target.id;
}

function handleSelectTrack(target) {
	console.log("selected a track", target.id)
	//console.log("logtest id -->", target.id)           				// DELETE LATER
	//console.log("logtest name -->", target.name)						// DELETE LATER
	//console.log('logtest segment -->', target.segments[0])			// DELETE LATER

	// remove class selected from all track options
	const selected = document.querySelector('#tracks .selected')
	if(selected) {
		selected.classList.remove('selected')
	}

	// add class selected to current target
	target.classList.add('selected')

	// TODO - save the selected track id to the store
	store.track_id = target.id;
}

async function handleAccelerate(target) {
	console.log("accelerate button clicked")
	// TODO - Invoke the API call to accelerate
	await accelerate((store.race_id))
}

// HTML VIEWS ------------------------------------------------
// Provided code - do not remove

function renderRacerCars(racers) {
	if (!racers.length) {
		return `
			<h4>Loading Racers...</4>
		`
	}

	const results = racers.map(renderRacerCard).join('')

	return `
		<ul id="racers">
			${results}
		</ul>
	`
}

function renderRacerCard(racer) {
	const { id, driver_name, top_speed, acceleration, handling } = racer

	return `
		<li class="card podracer" id="${id}">
			<h3>Driver : ${driver_name}</h3>
			<p>Top Speed: ${top_speed}</p>
			<p>Acceleration: ${acceleration}</p>
			<p>Handling ${handling}</p>
		</li>
	`
}

function renderTrackCards(tracks) {
	//console.log(tracks)																// DELETE later
	if (!tracks.length) {
		return `
			<h4>Loading Tracks...</4>
		`
	}

	const results = tracks.map(renderTrackCard).join('')

	return `
		<ul id="tracks">
			${results}
		</ul>
	`
}

function renderTrackCard(track) {
	const { id, name , segments} = track

	return `
		<li id="${id}" class="card track">
			<h3>${name}</h3>
			<p>Segments: ${segments.length}</p>
		</li>
	`
}

function renderCountdown(count) {
	return `
		<h2>Race Starts In...</h2>
		<p id="big-numbers">${count}</p>
	`
}

function renderRaceStartView(track, racers) {
	return `
		<header>
			<h1>Race: ${store.track_id}</h1> 
		</header>
		<main id="two-columns">
			<section id="leaderBoard">
				${renderCountdown(3)}
			</section>

			<section id="accelerate">
				<h2>Directions</h2>
				<p>Click the button as fast as you can to make your racer go faster!</p>
				<button id="gas-peddle">Click Me To Win!</button>
			</section>
		</main>
		<footer></footer>
	`
}

function resultsView(positions) {
	positions.sort((a, b) => (a.final_position > b.final_position) ? 1 : -1)

	return `
		<header>
			<h1>Race Results</h1>
		</header>
		<main>
			${raceProgress(positions)}
			<a href="/race">Start a new race</a>
		</main>
	`
}

function raceProgress(positions) {
	let userPlayer = positions.find(e => e.id == store.player_id)
	userPlayer.driver_name += " (you)"

	positions = positions.sort((a, b) => (a.segment > b.segment) ? -1 : 1)
	let count = 1

	const results = positions.map(p => {
		return `
			<tr>
				<td>
					<h3>${count++} - ${p.driver_name}</h3>
				</td>
			</tr>
		`
	})

	return `
		<main>
			<h3>Leaderboard</h3>
			<section id="leaderBoard">
				${results}
			</section>
		</main>
	`
}

function renderAt(element, html) {
	const node = document.querySelector(element)

	node.innerHTML = html
}

// ^ Provided code ^ do not remove


// API CALLS ------------------------------------------------

const SERVER = 'http://localhost:8000'

function defaultFetchOpts() {
	return {
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json',
			'Access-Control-Allow-Origin' : SERVER,
		},
	}
}

// TODO - Make a fetch call (with error handling!) to each of the following API endpoints 

async function getTracks() {
	// GET request to `${SERVER}/api/tracks`
	// List of all TRACKS
	try {
		const fetchTracks = await fetch (`${SERVER}/api/tracks`)
		console.log('getTracks = fetched...')										// DELETE LATER
		const fTracks = fetchTracks.json();
		console.log(fTracks)														// DELETE LATER
		return fTracks;
	} catch (error) {
		console.log('Error in getTracks()-Request --> ' + error)
	}

	
}

async function getRacers() {
	// GET request to `${SERVER}/api/cars`
	// List of all RACERS
	try {
		const fetchRacers = await fetch(`${SERVER}/api/cars`);
		console.log('getRacers = fetched...');										// DELETE LATER
		const fRacers = fetchRacers.json();
		console.log(fRacers)														// DELETE LATER
		// console.log(fRacers[0].driver_name)										// DELETE LATER
		return fRacers;
	} catch (error) {
		console.log('Error in getRacers()-Request --> ' + error)
	}

}

function createRace(player_id, track_id) {
	player_id = parseInt(player_id)
	track_id = parseInt(track_id)
	const body = { player_id, track_id }
	// create a RACE
	return fetch(`${SERVER}/api/races`, {
		method: 'POST',
		...defaultFetchOpts(),
		dataType: 'jsonp',
		body: JSON.stringify(body)
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with createRace(player_id, track_id) request::", err))
}

async function getRace(id) {
	// GET request to `${SERVER}/api/races/${id}`
	// Information about a SINGLE RACE
	try {
		const fetchRace = await fetch(`${SERVER}/api/races/${id}`);
		console.log('getRace = fetched...');										// DELETE LATER
		const fRace = fetchRace.json();
		console.log(fRace)															// DELETE LATER
		return fRace;
	} catch (error) {
		console.log('Error in getRace(id)-Request --> ' + error)
	}

}

function startRace(id) {
	// start a RACE
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
	})
	.then(res => res.json())
	.catch(err => console.log("Problem with startRace(id) request::", err))
}

function accelerate(id) {
	// POST request to `${SERVER}/api/races/${id}/accelerate`
	// options parameter provided as defaultFetchOpts
	// no body or datatype needed for this request
	return fetch(`${SERVER}/api/races/${id}/start`, {
		method: 'POST',
		...defaultFetchOpts(),
		body: ''
	})
	.catch(err => console.log("Problem with accelerate(id) request::", err))
}
