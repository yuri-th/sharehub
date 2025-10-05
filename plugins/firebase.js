import firebase from "firebase";
import "firebase/auth";

export default (context, inject) => {
  const { $config } = context;

  if (!firebase.apps.length && $config.firebase) {
    firebase.initializeApp($config.firebase);
  }

  // firebaseオブジェクトをVueインスタンスに注入
  inject("firebase", firebase);
};

export { firebase };
