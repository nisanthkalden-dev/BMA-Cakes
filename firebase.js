// ============================
// BMA CAKES - Firebase Config
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyDnuNOg6pmeYFc3subWmbEB8W1a3cDi4hc",
  authDomain: "bma-cakes.firebaseapp.com",
  projectId: "bma-cakes",
  storageBucket: "bma-cakes.firebasestorage.app"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
