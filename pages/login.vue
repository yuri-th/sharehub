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
import { getAuthHeaders } from "~/utils/auth";

export default {
  layout: "pattern01",

  data() {
    return {
      email: "",
      password: "",
    };
  },

  methods: {
    async login() {
      if (!this.email || !this.password) {
        alert("メールアドレスまたはパスワードが入力されていません。");
        return;
      }

      try {
        await firebase
          .auth()
          .signInWithEmailAndPassword(this.email, this.password);

        await this.sendUserToServer();

        alert("ログインが完了しました");
        this.$router.push("/");
      } catch (error) {}
    },

    async sendUserToServer() {
      try {
        const { headers } = await getAuthHeaders();
        const currentUser = firebase.auth().currentUser;
        const userName =
          currentUser.displayName ||
          currentUser.email.split("@")[0] ||
          "ユーザー";

        await this.$axios.post(
          "/login",
          {
            email: currentUser.email,
            name: userName,
          },
          { headers }
        );
      } catch (error) {
        console.error("サーバーエラー:", error.response?.data);
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

  .login input {
    width: 90%;
  }
}
</style>
