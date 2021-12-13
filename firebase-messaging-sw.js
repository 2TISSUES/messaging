console.log('fcm sw loaded!')

// Import and configure the Firebase SDK
// These scripts are made available when the app is served or deployed on Firebase Hosting
// If you do not serve/host your project using Firebase Hosting see https://firebase.google.com/docs/web/setup

importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.0/firebase-messaging-compat.js');


firebase.initializeApp({
  apiKey: "AIzaSyC1zJYEip3oRCKflBEzTYBM0P7oX5DiAkM",
  authDomain: "spamvictim.firebaseapp.com",
  databaseURL: "https://spamvictim.firebaseio.com",
  projectId: "spamvictim",
  storageBucket: "spamvictim.appspot.com",
  messagingSenderId: "486537133388",
  appId: "1:486537133388:web:21e39249b75df141c223e9",
  measurementId: "${config.measurementId}",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
	console.log(
		'[firebase-messaging-sw.js] Received background message ',
		payload,
	);
	// Customize notification here
	const notificationTitle = 'Background Message Title';
	const notificationOptions = {
		body: 'Background Message body.',
		icon: 'firebase-logo.png',
	};

	self.registration.showNotification(notificationTitle, notificationOptions);
});