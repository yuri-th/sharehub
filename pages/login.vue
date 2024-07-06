<template>
  <div class="login">
    <h3>ログイン</h3>
    <input v-model="email" type="email" placeholder="メールアドレス" required />
    <br />
    <input
      v-model="password"
      type="password"
      placeholder="パスワード"
      required
    />
    <br />
    <button @click="login" class="login_btn">ログイン</button>
    <br />
  </div>
</template>

<script>
import firebase from "~/plugins/firebase";
export default {
  layout: "pattern01",
  data() {
    return {
      email: null,
      password: null,
    };
  },
  methods: {
    login() {
      if (!this.email || !this.password) {
        alert("メールアドレスまたはパスワードが入力されていません。");
        return;
      }
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then((userCredential) => {
          const user = userCredential.user;
          return userCredential.user.getIdToken();
        })
        .then((idToken) => {
          // idTokenをサーバーサイドに送信
          this.sendTokenToServer(idToken);
          const currentUser = firebase.auth().currentUser;

          if (currentUser) {
            console.log("ユーザーの表示名:", currentUser.displayName);
          }

          alert("ログインが完了しました");
          this.$router.push("/");
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/invalid-email":
              alert("メールアドレスの形式が違います。");
              break;
            case "auth/user-disabled":
              alert("ユーザーが無効になっています。");
              break;
            case "auth/user-not-found":
              alert("ユーザーが存在しません。");
              break;
            case "auth/wrong-password":
              alert("パスワードが間違っております。");
              break;
            default:
              alert("エラーが起きました。しばらくしてから再度お試しください。");
              break;
          }
        });
    },
    async sendTokenToServer(idToken) {
      const currentUser = firebase.auth().currentUser;

      if (currentUser) {
        const uid = currentUser.uid;
        try {
          const response = await this.$axios.post("/login/", {
            email: this.email,
            password: this.password,
            idToken: idToken,
            uid: uid,
          });
          console.log(response.data);
        } catch (error) {
          if (error.response) {
            console.error(error.response.data);
          } else {
            console.error("An error occurred:", error.message);
          }
        }
      }
    },
  },
};
</script>

<style scoped>
.login {
  width: 30%;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 5px;
}

.login input {
  font-size: 0.8rem;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  outline: none;
  border: solid 1px;
  width: 70%;
}

h3 {
  font-size: 1rem;
  color: black;
}

.login_btn {
  background: #776882;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
  border: 1px solid #4b0082;
}

@media screen and (max-width: 767px) {
  .login {
    width: 90%;
  }

  .login input{
    width: 90%;
  }
}

</style>
