const firebaseConfig = {
  apiKey: "AIzaSyC1zJYEip3oRCKflBEzTYBM0P7oX5DiAkM",
  authDomain: "spamvictim.firebaseapp.com",
  databaseURL: "https://spamvictim.firebaseio.com",
  projectId: "spamvictim",
  storageBucket: "spamvictim.appspot.com",
  messagingSenderId: "486537133388",
  appId: "1:486537133388:web:21e39249b75df141c223e9",
  measurementId: "${config.measurementId}",
};

firebase.initializeApp(firebaseConfig);

// Retrieve Firebase Messaging object.
const messaging = firebase.messaging();

// IDs of divs that display registration token UI or request permission UI.
const tokenDivId = "token_div";
const permissionDivId = "permission_div";

// These registration tokens come from the client FCM SDKs.
const registrationTokens = [];

// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a service worker
//   `messaging.onBackgroundMessage` handler.
messaging.onMessage((payload) => {
  console.log("Message received. ", payload);
  // Update the UI to include the received message.
  appendMessage(payload);
});

function resetUI() {
  clearMessages();
  showToken("loading...");
  // Get registration token. Initially this makes a network call, once retrieved
  // subsequent calls to getToken will return from cache.
  messaging
    .getToken({
      vapidKey:
        "BOig49-Z0yU0CJ_Gaq4_A6G1wB6ezRmi6S88fjMJyghHmnXMEYM2yN2Bm4nfynajgTsQaZmLkzYrpbFCCF1GUIU",
    })
    .then((currentToken) => {
      if (currentToken) {
        sendTokenToServer(currentToken);
        updateUIForPushEnabled(currentToken);
      } else {
        // Show permission request.
        console.log(
          "No registration token available. Request permission to generate one."
        );
        // Show permission UI.
        updateUIForPushPermissionRequired();
        setTokenSentToServer(false);
      }
    })
    .catch((err) => {
      console.log("An error occurred while retrieving token. ", err);
      showToken("Error retrieving registration token. ", err);
      setTokenSentToServer(false);
    });
}

function subscribe(topic) {
  console.log(topic);
  subscribeTokenToTopic(document.querySelector("#token").textContent, topic);
}

function showToken(currentToken) {
  // Show token in console and UI.
  const tokenElement = document.querySelector("#token");
  tokenElement.textContent = currentToken;
}

// Send the registration token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
  if (!isTokenSentToServer()) {
    console.log("Sending token to server...");
    // TODO(developer): Send the current token to your server.
    setTokenSentToServer(true);
  } else {
    console.log(
      "Token already sent to server so won't send it again " +
        "unless it changes"
    );
  }
}

function isTokenSentToServer() {
  return window.localStorage.getItem("sentToServer") === "1";
}

function setTokenSentToServer(sent) {
  window.localStorage.setItem("sentToServer", sent ? "1" : "0");
}

function showHideDiv(divId, show) {
  const div = document.querySelector("#" + divId);
  if (show) {
    div.style = "display: visible";
  } else {
    div.style = "display: none";
  }
}

function requestPermission() {
  console.log("Requesting permission...");
  Notification.requestPermission().then((permission) => {
    if (permission === "granted") {
      console.log("Notification permission granted.");
      // TODO(developer): Retrieve a registration token for use with FCM.
      // In many cases once an app has been granted notification permission,
      // it should update its UI reflecting this.
      resetUI();
    } else {
      console.log("Unable to get permission to notify.");
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
          console.log("Token deleted.");
          setTokenSentToServer(false);
          // Once token is deleted update UI.
          resetUI();
        })
        .catch((err) => {
          console.log("Unable to delete token. ", err);
        });
    })
    .catch((err) => {
      console.log("Error retrieving registration token. ", err);
      showToken("Error retrieving registration token. ", err);
    });
}

// Add a message to the messages element.
function appendMessage(payload) {
  const messagesElement = document.querySelector("#messages");
  const dataHeaderElement = document.createElement("h5");
  const dataElement = document.createElement("pre");
  dataElement.style = "overflow-x:hidden;";
  dataHeaderElement.textContent = "Received message:";
  dataElement.textContent = JSON.stringify(payload, null, 2);
  messagesElement.appendChild(dataHeaderElement);
  messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
  const messagesElement = document.querySelector("#messages");
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
  fetch("https://iid.googleapis.com/iid/v1/" + token + "/rel/topics/" + topic, {
    method: "POST",
    headers: new Headers({
      Authorization:
        "key=AAAAcUfffUw:APA91bEJqYfNiqZqr6--QFsl9v_zOi-nIVU_4UhsPKTY4irjagP7zkL8eGrbYXqBUqhHWOb0JReHZmaS5RpCgp7APbfpnExt9XcKospVrwtgxcdhK__Pm9B2IBREfzRkhiW9aUHq1174",
    }),
  })
    .then((response) => {
      if (response.status < 200 || response.status >= 400) {
        throw (
          "Error subscribing to  the following topic: " +
          response.status +
          " - " +
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
  navigator.serviceWorker.register("/sw.js").then(function (registration) {
    console.log("Registered events at scope: ", registration.scope);
  });
}

if (!navigator.onLine) {
  statusEl.innerText = "Offline";
}

function sendNotificationToTopic(){
  const notificationData = {
  title: document.querySelector("#tbxTitle").value,
  body: document.querySelector("#tbxBody").value,
  click_action: document.querySelector("#tbxClickAction").value,
  icon: document.querySelector("#tbxIcon").value,
  }
  sendNotification(notificationData, `/topics/${document.querySelector("#tbxTopic").value}`);
}

function sendNotification(notification, receiver) {
  const myHeaders = new Headers();
  myHeaders.append(
    "Authorization",
    "key=AAAAcUfffUw:APA91bEJqYfNiqZqr6--QFsl9v_zOi-nIVU_4UhsPKTY4irjagP7zkL8eGrbYXqBUqhHWOb0JReHZmaS5RpCgp7APbfpnExt9XcKospVrwtgxcdhK__Pm9B2IBREfzRkhiW9aUHq1174"
  );
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    notification,
    to: receiver,
  });

  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "manual",
  };

  fetch("https://fcm.googleapis.com/fcm/send", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
}
