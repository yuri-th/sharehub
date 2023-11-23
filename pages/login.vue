<template>
  <div class="login">
    <h3>ログイン</h3>
    <input v-model="email" type="email" placeholder="メールアドレス" required />
    <br />
    <input
      v-model="password"
      type="password"
      placeholder="パスワード
    "
      required
    />
    <br />
    <button @click="login" class="login_btn">ログイン</button>
    <br />
  </div>
</template>

<script>
import axios from "axios";
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
          // ログイン成功時にIDトークンを取得
          return userCredential.user.getIdToken();
        })
        .then((idToken) => {
          // idTokenをサーバーサイドに送信
          this.sendTokenToServer(idToken);

          // ログインが完了した旨をユーザーに通知
          alert("ログインが完了しました");

          // ログイン後の画面にリダイレクト
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
    async sendUserDataToServer(user, idToken) {
      try {
        // ユーザー情報をサーバーサイドに送信
        const response = await axios.post("http://127.0.0.1:8000/api/share/", {
          idToken: idToken,
          name: user.displayName,
          email: user.email,
          uid: user.uid,
        });

        console.log(response.data);
      } catch (error) {
        console.error("Error in sendUserDataToServer:", error);
        console.error("Error response:", error.response); // 追加

        if (error.response && error.response.data) {
          console.error("Error response data:", error.response.data);
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
  background: #9400d3;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}
</style>
