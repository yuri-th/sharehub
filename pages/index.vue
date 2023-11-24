<template>
  <div class="container">
    <div class="left_contents">
      <NuxtLink to="/" class="link-style">
        <div class="home-icon">
          <img src="/images/home.png" alt="home-logo" class="home-logo" />
          <p>ホーム</p>
        </div>
      </NuxtLink>
      <div class="logout-icon" @click="logout">
        <img src="/images/logout.png" alt="logout-logo" class="logout-logo" />
        <p>ログアウト</p>
      </div>
      <div class="post-form">
        <p>シェア</p>
        <input type="text" v-model="tweetText" />
        <div class="share_button">
          <button @click="shareTweet">シェアする</button>
        </div>
      </div>
    </div>
    <div class="post-list">
      <table>
        <tr>
          <th>ホーム</th>
        </tr>
        <tr v-for="tweet in tweets" :key="tweet.id">
          <td>
            <img src="/images/heart.png" alt="heart-logo" class="heart-logo" />
            <img src="/images/cross.png" alt="cross-logo" class="cross-logo" />
            <NuxtLink to="/detail" class="link-style">
              <img
                src="/images/detail.png"
                alt="detail-logo"
                class="detail-logo"
              />
            </NuxtLink>
            <p>{{ tweet.user_name }}:{{ tweet.tweet_text }}</p>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import firebase from "~/plugins/firebase";

export default {
  middleware: "authenticated",
  meta: { requiresAuth: true },

  data() {
    return {
      message: "ログインができておりません",
      tweetText: "",
      tweets: [], // ツイートのリストを保持するデータプロパティを追加
    };
  },

  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.message = "ログイン済みです";
      }
    });
  },

  async fetch() {
    await this.getTweets();
  },

  methods: {
    async getTweets() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/tweet");
        this.tweets = response.data.data.reverse(); // ツイートデータを逆転して更新
      } catch (error) {
        console.error(error);
      }
    },

    async shareTweet() {
      try {
        const user = firebase.auth().currentUser;

        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;

          const response = await axios.post(
            "http://127.0.0.1:8000/api/tweet/",
            {
              tweet_text: this.tweetText,
              uid: uid,
              id_token: idToken,
            }
          );

          // ツイートが正常に投稿された場合の処理
          console.log(response.data);
          await this.getTweets(); // ツイートを再取得
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        // エラー処理
        console.error(error);
      }
    },

    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("ログアウトが完了しました");
          this.$router.replace("/");
        });
    },
  },
};
</script>

<style scoped>
.contents_with[data-v-314f53c6] {
  padding: 0 !important;
}

.link-style {
  text-decoration: none;
  color: inherit;
}

.container {
  display: flex;
  color: white;
}

.left_contents {
  width: 30%;
}

.home-icon,
.logout-icon {
  display: flex;
  align-items: center;
  gap: 5px;
}

.home-icon p,
.logout-icon p {
  color: white;
}

.home-logo,
.logout-logo {
  width: 30px;
}

.post-form input {
  border: 1px solid white;
  background-color: transparent;
  padding: 8px;
  color: white;
  outline: none;
  border-radius: 10px;
  width: 80%;
  height: 100px;
}

.share_button {
  width: 85%;
  text-align: right;
}

.share_button button {
  background: #9400d3;
  color: white;
  padding: 10px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}

.post-list {
  margin-top: -65px;
  width: 70%;
}

.heart-logo,
.cross-logo,
.detail-logo {
  width: 20px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid white; /* セルの線を白で引く */
  padding: 8px; /* 適切なパディングを追加 */
  text-align: left; /* セルのテキストを左寄せにする（必要に応じて調整） */
  color: white; /* テキストの色を白に設定 */
  box-sizing: border-box;
  border-right: none; /* 右の線を削除 */
  border-top: none; /* 上の線を削除 */
}
</style>
