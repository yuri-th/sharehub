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
        <tr v-for="tweet in tweets" :key="tweet.tweet_id">
          <td>
            <img
              src="/images/heart.png"
              alt="heart-logo"
              class="heart-logo"
              @click="likePost(tweet.tweet_id)"
            />
            <span>{{ tweet.likeCount }}</span>
            <img
              src="/images/cross.png"
              alt="cross-logo"
              class="cross-logo"
              @click="deleteTweet(tweet.tweet_id)"
            />
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
      likesData: [],
      likeCount: 0,
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
        const tweetsResponse = await axios.get(
          "http://127.0.0.1:8000/api/tweet"
        );
        const likesResponse = await this.$axios.get(
          "http://127.0.0.1:8000/api/like/"
        );

        // レスポンスデータの構造を確認
        console.log(tweetsResponse.data.data);
        console.log(likesResponse.data.data);

        const tweetsWithLikes = await Promise.all(
          tweetsResponse.data.data.map(async (tweet) => {
            const { __ob__, ...data } = tweet;
            const likeData = await this.getLikeDataForTweet(
              tweet.tweet_id,
              likesResponse.data.data
            );
            data.likeCount = likeData.like_count;
            return data;
          })
        );

        // ツイートデータを逆転して更新
        this.tweets = tweetsWithLikes.reverse();
      } catch (error) {
        console.error(error);
      }
    },

    async getLikeDataForTweet(tweetId, likesData) {
      if (!likesData) {
        console.error("Likes data is undefined or null");
        return { like_count: 0 }; // もしくは適切なデフォルト値
      }

      console.log("likesData:", likesData);

      const likeInfo = likesData[tweetId];

      console.log("likeInfo:", likeInfo);
      return likeInfo || { like_count: 0 };
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

    async deleteTweet(tweetId) {
      console.log("deleteTweet method called");
      console.log("tweetId:", tweetId);

      // 最初にtweetIdが存在するか確認
      if (!tweetId) {
        console.error("Invalid tweet ID");
        return;
      }

      console.log("Type of tweetId:", typeof tweetId);

      // tweetの中身を確認
      console.log("Tweet Object:", tweetId);

      console.log(
        "API Request URL:",
        `http://127.0.0.1:8000/api/tweet/${tweetId}`
      );

      try {
        console.log("tweetId:", tweetId);
        const user = firebase.auth().currentUser;

        if (user) {
          const idToken = await user.getIdToken();

          // ユーザーの UID を取得
          const uid = user.uid;

          // ツイート削除のAPIリクエスト
          const response = await axios.delete(
            `http://127.0.0.1:8000/api/tweet/${tweetId}`,
            {
              headers: {
                Authorization: `Bearer ${idToken}`,
                "X-User-UID": uid, // ユーザーの UID をヘッダーに追加
              },
            }
          );

          // ツイートが正常に削除された場合の処理
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

    async likePost(tweetId) {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;
          const user_name = user.displayName;

          // ここで likesResponse を定義する
          const likesResponse = await this.$axios.get(
            "http://127.0.0.1:8000/api/like/"
          );

          console.log("User Name in Frontend:", user_name);
          console.log("tweetId:", tweetId);
          console.log("Likes Data in Frontend:", likesResponse.data.data);

          console.log("likesResponse.data.data:", likesResponse.data.data);

          // いいねのデータ内で user_name と tweet_id を比較して存在を確認
          const existingLike = Object.entries(likesResponse.data.data).find(
            ([tweetIdKey, like]) => {
              console.log("like:", like); // デバッグ用のログ
              console.log("like.users:", like.users);
              console.log("like.tweet_id:", tweetIdKey); // tweet_id として扱うキー
              return like.users.includes(user_name) && tweetIdKey == tweetId; // tweet_id として扱うキー
            }
          );

          console.log("existingLike:", existingLike);

          if (existingLike) {
            // いいねを削除する
            await this.$axios
              .delete(`http://127.0.0.1:8000/api/like/${existingLike[0]}`, {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                  "X-User-UID": uid,
                },
              })
              .catch((error) => console.error("DELETE Request Error:", error));
          } else {
            console.log("No existing like found. Creating new like.");

            // いいねのボタンがクリックされたときに、バックエンドにいいねの情報を送信する
            await this.$axios.post("http://127.0.0.1:8000/api/like/", {
              tweet_id: tweetId,
              uid: uid,
              id_token: idToken,
            });
          }
          console.log("After deleting like");

          // 各ツイートごとにいいねの数を更新
          await this.getLikeCountForTweet(tweetId, likesResponse.data.data);

          // ツイートを再取得
          await this.getTweets();
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    },

    getLikeCountForTweet(tweetId, likesData) {
      if (!likesData) {
        console.error("Likes data is undefined or null");
        return 0; // もしくは適切なデフォルト値
      }

      // likesData オブジェクト内に tweetId があるか確認し、あればその値を返す
      return likesData[tweetId] || 0;
    },

    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("ログアウトが完了しました");
          // ログアウト後のリダイレクト
          const navigationPromise = this.$router.push("/");
          if (navigationPromise && navigationPromise.then) {
            // Promiseがある場合のみthenメソッドを呼び出す
            navigationPromise
              .then(() => {
                "ログアウトが完了";
              })
              .catch((err) => {
                // エラーハンドリング
                if (err.name !== "NavigationDuplicated") {
                  throw err;
                }
              });
          }
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
