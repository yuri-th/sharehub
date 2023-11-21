import firebase from "~/plugins/firebase";

export default async function ({ store, route, redirect }) {
  // Firebase AuthのonAuthStateChangedを使用してVuexストアを更新
  await new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        store.commit("setUser", user);
      } else {
        store.commit("setUser", null);
      }
      resolve();
    });
  });

  const requiresAuth = route.meta.some((meta) => meta.requiresAuth);
  const user = firebase.auth().currentUser;

  if (requiresAuth && !user) {
    redirect("/login");
  }
}
