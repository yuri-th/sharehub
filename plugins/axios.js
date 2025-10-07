import firebase from "firebase/app";

export default function({ $axios, redirect }) {
  $axios.onRequest(async(config) => {
    let user = firebase.auth().currentUser;

    // リロード時に認証エラーがでるためFirebaseの認証状態を待つように修正(最大２秒)

    if (!user) {
      await new Promise((resolve) => {
        const unsubscribe = firebase.auth().onAuthStateChanged((authUser) => {
          unsubscribe();
          user = authUser;
          resolve();
        });

        setTimeout(resolve, 2000);
      });
    }

    if (user) {
      try {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("トークン取得エラー:", error);
      }
    }

    return config;
  });

  $axios.onError((error) => {
    if (error.response?.status === 401) {
      redirect("/login");
    }
  });
}
