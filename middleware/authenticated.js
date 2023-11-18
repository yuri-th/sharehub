import firebase from "~/plugins/firebase";

export default function ({ route, redirect }) {
  const requiresAuth = route.meta.some((meta) => meta.requiresAuth);
  const user = firebase.auth().currentUser;

  if (requiresAuth && !user) {
    redirect("/login");
  }
}
