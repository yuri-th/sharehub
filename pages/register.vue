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
import axios from "axios";
import firebase from "~/plugins/firebase";
export default {
  layout: "pattern01",

  data() {
    return {
      name: null,
      email: null,
      password: null,
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
        // データをログに出力（Firebaseユーザー登録前）
        console.log("Firebaseユーザー登録前のデータ:", {
          name: this.name,
          email: this.email,
          password: this.password,
        });

        // Firebaseでユーザーを登録
        const userCredential = await firebase
          .auth()
          .createUserWithEmailAndPassword(this.email, this.password);

        // ユーザーに表示名を設定
        await userCredential.user.updateProfile({
          displayName: this.name,
        });

        const user = userCredential.user;

        // Firebaseユーザー登録が成功したら、Laravel APIを呼び出してユーザー情報を保存
        await this.saveUserToLaravelApi(user);

        // その後の処理を行う（例: ユーザー登録成功のメッセージを表示、リダイレクトなど）

        // データをログに出力（Firebaseユーザー登録後）
        console.log("Firebaseユーザー登録後のデータ:", {
          name: user.displayName,
          email: this.email,
          password: this.password,
        });

        this.handleFirebaseRegistration(user);
      } catch (error) {
        console.error("Firebaseユーザー登録エラー:", error.message);
        console.error("Firebaseユーザー登録エラー:", r.t0.message);
        console.error("Firebaseからのエラー詳細:", r.t0);
        alert("ユーザー登録に失敗しました。");
      }
    },

    async saveUserToLaravelApi(firebaseUser) {
      try {
        // LaravelのAPIエンドポイントにユーザー情報を送信
        const response = await axios.post("http://127.0.0.1:8000/api/share/", {
          name: this.name,
          email: this.email,
          firebase_uid: firebaseUser.uid,
          // 他に保存したい情報があればここに追加
        });

        console.log(response.data); // レスポンスをコンソールに表示（必要に応じて）
      } catch (error) {
        console.error(
          "Laravel APIへのユーザー情報保存エラー:",
          error.response ? error.response.data : error.message
        ); // エラーレスポンスをコンソールに表示（必要に応じて）
        throw error; // エラーが発生したら再スロー
      }
    },

    handleFirebaseRegistration(user) {
      // Firebaseユーザー登録後の処理を行う
      // 例: メッセージの表示、リダイレクトなど
      console.log("Firebaseユーザー登録成功:", user);
      this.$router.push("/login");
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
  background: #9400d3;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}
</style>
