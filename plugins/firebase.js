import firebase from "firebase";

if (!firebase.apps.length) {
  firebase.initializeApp({
    apiKey: "AIzaSyDwcYLPbvigOl_NfUFVOYrkmAHhK7ASNFY",
    authDomain: "sharehub-e2ee3.firebaseapp.com",
    projectId: "sharehub-e2ee3",
    storageBucket: "sharehub-e2ee3.appspot.com",
    messagingSenderId: "1005609207632",
    appId: "1:1005609207632:web:467dc2facd913a285b8e55",
    measurementId: "G-6T07J2H3ZD",
  });
}

export default firebase;
