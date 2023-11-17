<template>
  <div class="contents_with">
    <header class="header">
      <nuxt-link to="/">
        <img src="/images/logo.png" alt="Logo" class="logo" />
      </nuxt-link>
    </header>
    <nuxt />
    <footer>
      <!-- 共通のフッター -->
    </footer>
  </div>
</template>

<style scoped>
.contents_with {
  background-color: #000033;
  padding-top: 20px;
  padding-left: 20px;
  box-sizing: border-box;
}

.logo {
  max-width: 150px;
}
</style>
