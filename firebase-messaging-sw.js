console.log('fcm sw loaded!');

// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

importScripts(
	'https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js',
);
importScripts(
	'https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js',
);

firebase.initializeApp({
	apiKey: 'AIzaSyA_IdsEDIKqTzRQH7O_gXdAsRg5cC8Syjo',
	authDomain: 'ep-poc-messaging.firebaseapp.com',
	databaseURL:
		'https://ep-poc-messaging-default-rtdb.europe-west1.firebasedatabase.app',
	projectId: 'ep-poc-messaging',
	storageBucket: 'ep-poc-messaging.appspot.com',
	messagingSenderId: '120694852415',
	appId: '1:120694852415:web:9ca451bf2a1d6e9828618a',
	measurementId: 'G-4SJ5QG8Z45',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
	console.log(
		'[firebase-messaging-sw.js] Received background message ',
		payload,
	);
	// Customize notification here
	const notification = JSON.parse(payload.data.notification);
	const notificationTitle = notification.title;
	const notificationOptions = {
		body: notification.body,
	};

	return self.registration.showNotification(
		notificationTitle,
		notificationOptions,
	);
});
