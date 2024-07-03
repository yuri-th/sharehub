<template>
  <div class="confirm">
    <h2>仮登録完了</h2>
    <p>仮登録が完了しました。メールをご確認ください。</p>
    <button @click="goToHome" class="back_btn">戻る</button>
  </div>
</template>

<script>
export default {
  layout: "pattern01",
  methods: {
    goToHome() {
      this.$router.push("/");
    },
  },
};
</script>

<style scoped>
.confirm {
  text-align: center;
}
.back_btn {
  background: #9400d3;
  color: white;
  padding: 8px 30px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}
</style>
