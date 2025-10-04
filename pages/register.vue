<template>
  <div class="register">
    <h3>新規登録</h3>
    <input v-model="name" type="text" placeholder="ユーザーネーム" required />
    <br />
    <input v-model="email" type="email" placeholder="メールアドレス" required />
    <br />
    <input
      v-model="password"
      type="password"
      placeholder="パスワード"
      required
    />
    <br />
    <button @click.prevent="register" class="register_btn">新規登録</button>
    <br />
  </div>
</template>

<script>
import firebase from "~/plugins/firebase";

export default {
  layout: "pattern01",

  data() {
    return {
      name: "",
      email: "",
      password: "",
    };
  },

  methods: {
    async register() {
      if (!this.name || !this.email || !this.password) {
        alert(
          "ユーザーネーム、メールアドレスまたはパスワードが入力されていません。"
        );
        return;
      }

      try {
        // Firebaseでユーザーを登録
        const userCredential = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password);

        await userCredential.user.updateProfile({
          displayName: this.name,
        });

        const user = userCredential.user;

        // Laravelにユーザー情報を保存
        await this.saveUserToLaravelApi(user);

        alert("登録が完了しました");
        this.$router.push("/login");
      } catch (error) {
        console.error("ユーザー登録エラー:", error.message);

        if (error.code === "auth/email-already-in-use") {
          alert("このメールアドレスは既に使用されています。");
        } else if (error.code === "auth/weak-password") {
          alert("パスワードは6文字以上で設定してください。");
        } else if (error.code === "auth/invalid-email") {
          alert("メールアドレスの形式が正しくありません。");
        } else {
          alert("ユーザー登録に失敗しました。");
        }
      }
    },

    async saveUserToLaravelApi(firebaseUser) {
      try {
        const idToken = await firebaseUser.getIdToken();
        const uid = firebaseUser.uid;

        await this.$axios.post(
          "/share",
          {
            name: this.name,
            email: this.email,
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "X-User-UID": uid,
            },
          }
        );
      } catch (error) {
        console.error(
          "Laravel登録エラー:",
          error.response?.data || error.message
        );
        throw error;
      }
    },
  },
};
</script>

<style scoped>
.register {
  width: 30%;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 5px;
}

.register input {
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

.register_btn {
  background: #776882;
  border: 1px solid #4b0082;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}

@media screen and (max-width: 767px) {
  .register {
    width: 90%;
  }

  .register input {
    width: 90%;
  }
}
</style>
