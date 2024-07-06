<template>
  <div class="contents_with">
    <header class="header">
      <nuxt-link to="/">
        <img src="/images/logo.png" alt="Logo" class="logo" />
      </nuxt-link>
      <nav>
        <ul class="header-nav">
          <li><nuxt-link to="/register">新規登録</nuxt-link></li>
          <li><nuxt-link to="/login">ログイン</nuxt-link></li>
        </ul>
      </nav>
    </header>
    <nuxt />
    <footer>
      <!-- 共通のフッター -->
    </footer>
  </div>
</template>

<style scoped>
.contents_with {
  background-color: #4b0082;
  padding: 30px;
  box-sizing: border-box;
  color: white;
}

.logo {
  max-width: 150px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 100px;
}
.header-nav {
  display: flex;
  gap: 30px;
  list-style: none;
}

.header-nav a {
  color: inherit;
  text-decoration: none;
}

/* メディアクエリ */
@media screen and (max-width: 767px) {
  .header-nav {
    gap: 10px;
  }

  .header-nav li {
    font-size: 0.9rem;
  }
}
</style>
