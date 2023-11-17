<template>
  <div class="register">
    <h3>新規登録</h3>
    <input v-model="name" type="text" placeholder="ユーザーネーム" required />
    <br />
    <input v-model="email" type="email" placeholder="メールアドレス" required />
    <br />
    <input v-model="password" type="password" placeholder="パスワード
    " required />
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
      name: null,
      email: null,
      password: null,
    };
  },
  methods: {
    register() {
      if (!this.name || !this.email || !this.password) {
        alert("ユーザーネーム、メールアドレスまたはパスワードが入力されていません。");
        return;
      }
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email, this.password)
        .then((data) => {
          data.user.sendEmailVerification().then(() => {
            this.$router.replace("/confirm");
          });
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/invalid-email":
              alert("メールアドレスの形式が違います。");
              break;
            case "auth/email-already-in-use":
              alert("このメールアドレスはすでに使われています。");
              break;
            case "auth/weak-password":
              alert("パスワードは6文字以上で入力してください。");
              break;
            default:
              alert("エラーが起きました。しばらくしてから再度お試しください。");
              break;
          }
        });
    },
  },
};
</script>

<style scoped>
.register{
  width: 30%;
  margin: 0 auto;
  text-align: center;
  background: white;
  padding: 20px;
  border-radius: 5px;
}

.register input{
  font-size: 0.8rem;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 8px;
  outline: none;
  border: solid 1px;
  width: 70%;
}

h3{
  font-size: 1rem;
  color: black;
}

.register_btn{
  background: #9400d3;
  color: white;
  padding: 8px 15px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}

</style>
