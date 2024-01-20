<template>
  <div class="detail">
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
        <input type="text" />
        <div class="share_button">
          <button type="submit">シェアする</button>
        </div>
      </div>
    </div>
    <div class="post-list">
      <table>
        <tr>
          <th>コメント</th>
        </tr>
        <tr>
          <td>
            <img
              src="/images/heart.png"
              alt="heart-logo"
              class="heart-logo"
              @click="likePost(tweet.tweet_id)"
            />
            <span v-if="tweet !== null">{{ likeCount ?? 0 }}</span>
            <img
              src="/images/cross.png"
              alt="cross-logo"
              class="cross-logo"
              @click="deleteTweet(tweet.tweet_id)"
            />
            <p v-if="tweet && tweet.user_name && tweet.tweet_text">
              {{ tweet.user_name }}:{{ tweet.tweet_text }}
            </p>
            <p v-else>No tweet data available.</p>
          </td>
        </tr>
        <tr>
          <th>コメント</th>
        </tr>
        <tr v-for="(comment, index) in comments" :key="index">
          <td>
            <p>{{ comment.user_name }}:{{ comment.comment }}</p>
          </td>
        </tr>
      </table>
      <div class="comment-form">
        <input type="text" v-model="commentText" />
        <div class="comment_button">
          <button @click="shareComment(tweet.tweet_id)">コメント</button>
        </div>
      </div>
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
      tweet: null,
      likeCount: 0,
      commentText: "",
      comments: [],
    };
  },

  created() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        this.message = "ログイン済みです";
      }
    });

    console.log("tweetId in created:", this.$route.params.tweetId);
    this.loadData();
    console.log("Comments Data:", this.comments);
  },

  mounted() {
    console.log("tweetId in beforeMount:", this.$route.params.tweetId);
    this.loadData();
    console.log("Comments Data:", this.comments);
  },

  methods: {
    async loadData() {
      try {
        const user = firebase.auth().currentUser;

        // tweetId の取得
        const tweetId =
          this.$route.params.tweetId || localStorage.getItem("storedTweetId");

        // ローカルストレージから保存されたデータを取得
        const storedTweet = localStorage.getItem("storedTweet");
        const storedLikeCount = localStorage.getItem("storedLikeCount");
        const storedComments = localStorage.getItem("storedComments");

        // ツイートデータが取得されていない場合、またはローカルストレージのデータと異なる場合のみ取得する
        if (
          !this.tweet ||
          this.tweet.tweet_id !== tweetId ||
          this.tweet !== storedTweet
        ) {
          await this.getTweetData(tweetId);
        }

        if (!this.likeCount || this.likeCount !== storedLikeCount) {
          await this.getLikeCountForTweet(tweetId);
        }

        // コメントのデータも同様に取得;
        // if (!this.comments || this.comments !== storedComments) {
        //   await this.getComments();
        //   this.$nextTick(() => {
        //     console.log("Comments after next tick:", this.comments);
        //   });
        // }

        // コメントのデータも同様に取得;
        await this.getComments(); // コメントのデータを取得する

        // コメントが正しくセットされているか確認
        console.log("Comments:", this.comments);

        // 取得したデータをローカルストレージに保存
        localStorage.setItem("storedTweetId", tweetId);
        localStorage.setItem("storedTweet", JSON.stringify(this.tweet));
        localStorage.setItem("storedLikeCount", this.likeCount);
        localStorage.setItem("storedComments", JSON.stringify(this.comments));
      } catch (error) {
        console.error("Error loading data:", error);
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
    async getTweetData(tweetId) {
      try {
        console.log("this.$route.params.tweetId:", this.$route.params.tweetId);
        const response = await this.$axios.get(
          `http://127.0.0.1:8000/api/tweet/${tweetId}`
        );
        console.log("API Response:", response.data);
        console.log("getTweetData(tweetId):", tweetId);

        const tweetData = response.data.data;

        // tweetData が存在し、tweet_text プロパティが存在するか確認
        if (tweetData && tweetData.tweet_text !== undefined) {
          // ツイートのデータをセット
          this.tweet = {
            tweet_text: tweetData.tweet_text,
            user_name: tweetData.user_name,
            tweet_id: tweetData.id,
            // 他のツイート情報も同様に追加
          };
          console.log("Tweet Text:", tweetData.tweet_text);
        } else {
          console.log("Tweet Text not found");
        }
        console.log(
          "this.tweet after getTweetData:",
          JSON.stringify(this.tweet, null, 2)
        );
      } catch (error) {
        console.error("Error getting tweet data:", error);
      }
    },

    async likePost(tweetId) {
      console.log("likePost called with tweetId:", tweetId);
      console.log("this.tweet before likePost:", this.tweet);
      console.log("tweet.tweet_id in likePost:", this.tweet.tweet_id);
      try {
        console.log("likePost called with tweetId:", tweetId); // ログを追加
        console.log("tweet:", this.tweet); // ログを追加

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
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    },

    async getLikeCountForTweet(tweetId) {
      // ツイートごとのいいねの数を更新
      this.likeCount = await this.fetchLikeCount(tweetId);
    },

    async fetchLikeCount(tweetId) {
      try {
        const likesResponse = await this.$axios.get(
          `http://127.0.0.1:8000/api/like/`
        );

        // レスポンスデータの構造を確認
        console.log("likesResponse.data:", likesResponse.data);

        // ツイートIDに基づいていいねの情報を取得
        const tweetLikeInfo = likesResponse.data.data[tweetId];
        console.log("tweetLikeInfo:", tweetLikeInfo);

        if (tweetLikeInfo) {
          console.log("Like count for tweet:", tweetLikeInfo.like_count);
          return tweetLikeInfo.like_count;
        } else {
          console.log("Like info not found for tweet");
          return 0;
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
        return 0;
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

          // ツイートに関連するコメントといいねも削除する
          await this.deleteCommentsForTweet(tweetId);
          await this.deleteLikesForTweet(tweetId);

          // ツイートを再取得せずに、インデックスページにリダイレクト
          this.$router.push({ path: "/" });
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        // エラー処理
        console.error(error);
      }
    },

    async deleteCommentsForTweet(tweetId) {
      try {
        const response = await this.$axios.delete(
          `http://127.0.0.1:8000/api/comment/?tweet_id=${tweetId}`
        );
        console.log("Comments deleted:", response.data);
      } catch (error) {
        console.error("Error deleting comments:", error);
      }
    },

    async deleteLikesForTweet(tweetId) {
      try {
        const response = await this.$axios.delete(
          `http://127.0.0.1:8000/api/like/?tweet_id=${tweetId}`
        );
        console.log("Likes deleted:", response.data);
      } catch (error) {
        console.error("Error deleting likes:", error);
      }
    },
    async shareComment(tweetId) {
      console.log("tweetId:", tweetId);
      try {
        const user = firebase.auth().currentUser;

        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;

          const response = await axios.post(
            "http://127.0.0.1:8000/api/comment/",
            {
              uid: uid,
              id_token: idToken,
              tweet_id: tweetId,
              comment: this.commentText,
            }
          );

          //正常に投稿された場合の処理
          console.log(response.data);
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        // エラー処理
        console.error(error);
      }
    },

    async getComments() {
      try {
        const tweetId = this.$route.params.tweetId;

        const commentsResponse = await axios.get(
          `http://127.0.0.1:8000/api/comment/?tweet_id=${tweetId}`
        );

        console.log("commentsResponse:", commentsResponse.data.data);

        // コメントデータをtweetsにセット
        this.comments = commentsResponse.data.data.reverse().map((comment) => ({
          user_name: comment.user_name,
          comment: comment.comment,
          tweet_id: comment.tweet_id,
        }));

        console.log(this.comments);

        // ツイートIDごとにコメントを分類
        const tweetComments = {};
        this.comments.forEach((comment) => {
          const currentTweetId = comment.tweet_id;

          if (!(currentTweetId in tweetComments)) {
            tweetComments[currentTweetId] = [];
          }

          tweetComments[currentTweetId].push(comment);
        });

        // 分類されたコメントをthis.commentsにセット
        this.comments = tweetComments[tweetId] || [];
      } catch (error) {
        console.error(error);
      }
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

.detail {
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

.comment-form {
  margin-top: 30px;
  text-align: center;
}
.comment-form input {
  border: 1px solid white;
  background-color: transparent;
  padding: 8px;
  color: white;
  outline: none;
  border-radius: 10px;
  width: 90%;
  height: 100px;
}

.comment_button {
  width: 95%;
  text-align: right;
}

.comment_button button {
  background: #9400d3;
  color: white;
  padding: 10px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}
</style>
