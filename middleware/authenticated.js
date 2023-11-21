import firebase from "~/plugins/firebase";

export default function ({ route, redirect }) {
  const requiresAuth = route.meta.some((meta) => meta.requiresAuth);

  // Firebaseのユーザーのログイン状態を監視
  firebase.auth().onAuthStateChanged((user) => {
    if (requiresAuth && !user) {
      redirect("/login");
    }
  });
}
