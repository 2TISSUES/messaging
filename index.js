const firebaseConfig = {
	apiKey: 'AIzaSyA_IdsEDIKqTzRQH7O_gXdAsRg5cC8Syjo',
	authDomain: 'ep-poc-messaging.firebaseapp.com',
	databaseURL:
		'https://ep-poc-messaging-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'ep-poc-messaging',
	storageBucket: 'ep-poc-messaging.appspot.com',
	messagingSenderId: '120694852415',
	appId: '1:120694852415:web:9ca451bf2a1d6e9828618a',
	measurementId: 'G-4SJ5QG8Z45',
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

// IDs of divs that display registration token UI or request permission UI.
const tokenDivId = 'token_div';
const permissionDivId = 'permission_div';

// These registration tokens come from the client FCM SDKs.
const registrationTokens = [];

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
messaging.onMessage((payload) => {
	console.log('Message received. ', payload);
	// Update the UI to include the received message.
	appendMessage(payload);
});

function resetUI() {
	clearMessages();
	showToken('loading...');
	// Get registration token. Initially this makes a network call, once retrieved
	// subsequent calls to getToken will return from cache.
	messaging
		.getToken({
			vapidKey:
				'BFq7Rb3iED656-KjVSNUArkkKGpgmGEctJpIs0tEDcAkiDHZrXf9IdGEbhRkplnAxbxtvd6pg3YLBnOsIYI03iI',
		})
		.then((currentToken) => {
			if (currentToken) {
				sendTokenToServer(currentToken);
				updateUIForPushEnabled(currentToken);
			} else {
				// Show permission request.
				console.log(
					'No registration token available. Request permission to generate one.',
				);
				// Show permission UI.
				updateUIForPushPermissionRequired();
				setTokenSentToServer(false);
			}
		})
		.catch((err) => {
			console.log('An error occurred while retrieving token. ', err);
			showToken('Error retrieving registration token. ', err);
			setTokenSentToServer(false);
		});
}

function subscribe(event) {
	const btn = event.target.parentNode;
	console.log(btn.name);
	console.log(btn.style.backgroundColor);

	if (btn.style.backgroundColor === 'gray') {
		btn.style.backgroundColor = 'green';
		subscribeTokenToTopic(
			document.querySelector('#token').textContent,
			btn.name,
		);
	} else {
		btn.style.backgroundColor = 'gray';
		unsubscribeFromTopic(btn.name, [
			document.querySelector('#token').textContent,
		]);
	}
}

function showToken(currentToken) {
	// Show token in console and UI.
	const tokenElement = document.querySelector('#token');
	tokenElement.textContent = currentToken;
}

// Send the registration token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
	if (!isTokenSentToServer()) {
		console.log('Sending token to server...');
		// TODO(developer): Send the current token to your server.
		setTokenSentToServer(true);
	} else {
		console.log(
			"Token already sent to server so won't send it again " +
				'unless it changes',
		);
	}
}

function isTokenSentToServer() {
	return window.localStorage.getItem('sentToServer') === '1';
}

function setTokenSentToServer(sent) {
	window.localStorage.setItem('sentToServer', sent ? '1' : '0');
}

function showHideDiv(divId, show) {
	const div = document.querySelector('#' + divId);
	if (show) {
		div.style = 'display: visible';
	} else {
		div.style = 'display: none';
	}
}

function requestPermission() {
	console.log('Requesting permission...');
	Notification.requestPermission().then((permission) => {
		if (permission === 'granted') {
			console.log('Notification permission granted.');
			// TODO(developer): Retrieve a registration token for use with FCM.
			// In many cases once an app has been granted notification permission,
			// it should update its UI reflecting this.
			resetUI();
		} else {
			console.log('Unable to get permission to notify.');
		}
	});
}

function deleteToken() {
	// Delete registration token.
	messaging
		.getToken()
		.then((currentToken) => {
			messaging
				.deleteToken(currentToken)
				.then(() => {
					console.log('Token deleted.');
					setTokenSentToServer(false);
					// Once token is deleted update UI.
					resetUI();
				})
				.catch((err) => {
					console.log('Unable to delete token. ', err);
				});
		})
		.catch((err) => {
			console.log('Error retrieving registration token. ', err);
			showToken('Error retrieving registration token. ', err);
		});
}

// Add a message to the messages element.
function appendMessage(payload) {
	const messagesElement = document.querySelector('#messages');
	const dataHeaderElement = document.createElement('h5');
	const dataElement = document.createElement('pre');
	dataElement.style = 'overflow-x:hidden;';
	dataHeaderElement.textContent = 'Received message:';
	dataElement.textContent = JSON.stringify(payload, null, 2);
	messagesElement.appendChild(dataHeaderElement);
	messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
	const messagesElement = document.querySelector('#messages');
	while (messagesElement.hasChildNodes()) {
		messagesElement.removeChild(messagesElement.lastChild);
	}
}

function updateUIForPushEnabled(currentToken) {
	showHideDiv(tokenDivId, true);
	showHideDiv(permissionDivId, false);
	showToken(currentToken);
}

function updateUIForPushPermissionRequired() {
	showHideDiv(tokenDivId, false);
	showHideDiv(permissionDivId, true);
}

function subscribeTokenToTopic(token, topic) {
	fetch('https://iid.googleapis.com/iid/v1/' + token + '/rel/topics/' + topic, {
		method: 'POST',
		headers: new Headers({
			Authorization:
				'key=AAAAHBn5Sz8:APA91bHgSvSN2g-wJ8KA-yF28eqKt6MGucOW2ItPgXdN-H5RG4CG_4QoSbjaP-9ZKGJx0e9zzSdGSKPm3_yvnM94IjAJuhgJ9VSexyiwBr9i2fcCcSl3eE_cqPXmHePAH5WBZIQTM7b_',
		}),
	})
		.then((response) => {
			if (response.status < 200 || response.status >= 400) {
				throw (
					'Error subscribing to  the following topic: ' +
					response.status +
					' - ' +
					response.text()
				);
			} else {
				console.log('Successfully subscribed to "' + topic + '"');
			}
		})
		.catch((error) => {
			console.error(error);
		});
}

resetUI();

if (navigator.serviceWorker != null) {
	navigator.serviceWorker.register('/sw.js').then(function (registration) {
		console.log('Registered events at scope: ', registration.scope);
	});
}

if (!navigator.onLine) {
	statusEl.innerText = 'Offline';
}

function sendNotificationToTopic() {
	const notificationData = {
		title: document.querySelector('#tbxTitle').value,
		body: document.querySelector('#tbxBody').value,
		click_action: document.querySelector('#tbxClickAction').value,
		icon: document.querySelector('#tbxIcon').value,
	};
	sendNotification(
		notificationData,
		`/topics/${document.querySelector('#tbxTopic').value}`,
	);
}

function sendNotification(notification, receiver) {
	const myHeaders = new Headers();
	myHeaders.append(
		'Authorization',
		'key=AAAAHBn5Sz8:APA91bHgSvSN2g-wJ8KA-yF28eqKt6MGucOW2ItPgXdN-H5RG4CG_4QoSbjaP-9ZKGJx0e9zzSdGSKPm3_yvnM94IjAJuhgJ9VSexyiwBr9i2fcCcSl3eE_cqPXmHePAH5WBZIQTM7b_',
	);
	myHeaders.append('Content-Type', 'application/json');

	const raw = JSON.stringify({
		notification,
		to: receiver,
	});

	const requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'manual',
	};

	fetch('https://fcm.googleapis.com/fcm/send', requestOptions)
		.then((response) => response.text())
		.then((result) => console.log(result))
		.catch((error) => console.log('error', error));
}

function unsubscribeFromTopic(topic, tokens) {
	var myHeaders = new Headers();
	myHeaders.append(
		'Authorization',
		'key=AAAAHBn5Sz8:APA91bHgSvSN2g-wJ8KA-yF28eqKt6MGucOW2ItPgXdN-H5RG4CG_4QoSbjaP-9ZKGJx0e9zzSdGSKPm3_yvnM94IjAJuhgJ9VSexyiwBr9i2fcCcSl3eE_cqPXmHePAH5WBZIQTM7b_',
	);
	myHeaders.append('Content-Type', 'application/json');

	var raw = JSON.stringify({
		to: `/topics/${topic}`,
		registration_tokens: tokens,
	});

	var requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow',
	};

	fetch('https://iid.googleapis.com/iid/v1:batchRemove', requestOptions)
		.then((response) => response.text())
		.then((result) => console.log(result))
		.catch((error) => console.log('error', error));
}

firebase
	.auth()
	.signInAnonymously()
	.then(() => {
		console.log('signed in');
	})
	.catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		console.log(errorCode, errorMessage);
	});

firebase.auth().onAuthStateChanged((user) => {
	if (user) {
		// User is signed in, see docs for a list of available properties
		// https://firebase.google.com/docs/reference/js/firebase.User
		var uid = user.uid;
		console.log(uid);
	} else {
		// User is signed out
		// ...
		console.log('user signed out');
	}
});
