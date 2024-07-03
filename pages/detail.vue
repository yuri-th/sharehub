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
          <th>コメント一覧</th>
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
    this.loadData();
  },

  mounted() {
    // this.loadData();
    // this.getComments();
  },

  methods: {
    async loadData() {
      try {
        const user = firebase.auth().currentUser;
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

        if (!this.comments || this.comments !== storedComments) {
          await this.getComments(tweetId);
        }

        console.log("Comments:", this.comments);

        // 取得したデータをローカルストレージに保存
        localStorage.setItem("storedTweetId", tweetId);
        localStorage.setItem("storedTweet", JSON.stringify(this.tweet));
        localStorage.setItem("storedLikeCount", this.likeCount);
        localStorage.setItem("storedComments", JSON.stringify(this.comments));
      } catch (error) {
        console.error("Error loading data:", error);
        this.error = "Failed to load data";
      }
    },

    async getTweetData(tweetId) {
      try {
        const response = await this.$axios.get(`/tweet/${tweetId}`);
        const tweetData = response.data.data;

        if (tweetData && tweetData.tweet_text !== undefined) {
          this.tweet = {
            tweet_text: tweetData.tweet_text,
            user_name: tweetData.user_name,
            tweet_id: tweetData.id,
          };
        } else {
          console.log("Tweet Text not found");
        }
      } catch (error) {
        console.error("Error getting tweet data:", error);
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
        const response = await this.$axios.get(`/tweet/${tweetId}`);
        const tweetData = response.data.data;

        if (tweetData && tweetData.tweet_text !== undefined) {
          this.tweet = {
            tweet_text: tweetData.tweet_text,
            user_name: tweetData.user_name,
            tweet_id: tweetData.id,
          };
        } else {
          console.log("Tweet Text not found");
        }
      } catch (error) {
        console.error("Error getting tweet data:", error);
      }
    },

    async likePost(tweetId) {
      try {
        console.log("likePost called with tweetId:", tweetId);
        console.log("tweet:", this.tweet);

        const user = firebase.auth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;
          const user_name = user.displayName;
          const likesResponse = await this.$axios.get("/like");
          const existingLike = Object.entries(likesResponse.data.data).find(
            ([tweetIdKey, like]) => {
              return like.users.includes(user_name) && tweetIdKey == tweetId;
            }
          );

          if (existingLike) {
            await this.$axios
              .delete(`/like/${existingLike[0]}`, {
                headers: {
                  Authorization: `Bearer ${idToken}`,
                  "X-User-UID": uid,
                },
              })
              .catch((error) => console.error("DELETE Request Error:", error));
          } else {
            await this.$axios.post("/like", {
              tweet_id: tweetId,
              uid: uid,
              id_token: idToken,
            });
          }
          await this.getLikeCountForTweet(tweetId, likesResponse.data.data);
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error("Error liking post:", error);
      }
    },

    async getLikeCountForTweet(tweetId) {
      this.likeCount = await this.fetchLikeCount(tweetId);
    },

    async fetchLikeCount(tweetId) {
      try {
        const likesResponse = await this.$axios.get(`/like`);
        const tweetLikeInfo = likesResponse.data.data[tweetId];

        if (tweetLikeInfo) {
          return tweetLikeInfo.like_count;
        } else {
          return 0;
        }
      } catch (error) {
        console.error("Error fetching like count:", error);
        return 0;
      }
    },

    async deleteTweet(tweetId) {
      if (!tweetId) {
        console.error("Invalid tweet ID");
        return;
      }

      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;
          const response = await this.$axios.delete(`/tweet/${tweetId}`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "X-User-UID": uid,
            },
          });

          console.log("Tweet deleted:", response.data);

          this.$router.push({ path: "/" });
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert("投稿者以外削除できません");
        } else {
          console.error("Error deleting tweet:", error);
        }
      }
    },

    // async deleteCommentsForTweet(tweetId) {
    //   try {
    //     const user = firebase.auth().currentUser;

    // if (user) {
    //   const idToken = await user.getIdToken();
    //   const uid = user.uid;

    //   console.log('Deleting comments for tweetId:', tweetId); // デバッグ用ログ

    //   const response = await this.$axios.delete(`/comment/${tweetId}`, {
    //     headers: {
    //       Authorization: `Bearer ${idToken}`,
    //       "X-User-UID": uid,
    //     },
    //   });
    //   console.log('Comments deleted:', response.data);
    //   } else {
    //   console.error("User not authenticated");
    //   }
    //   } catch (error) {
    //     console.error("Error deleting comments:", error);
    //   }
    // },

    // async deleteLikesForTweet(tweetId) {
    //   try {
    //     const response = await this.$axios.delete(
    //       `/like/?tweet_id=${tweetId}`
    //     );
    //   } catch (error) {
    //     console.error("Error deleting likes:", error);
    //   }
    // },

    async getComments(tweetId) {
      try {
        const commentsResponse = await this.$axios.get(
          `/comment/?tweet_id=${tweetId}`
        );
        const allComments = commentsResponse.data.data
          .reverse()
          .map((comment) => ({
            user_name: comment.user_name,
            comment: comment.comment,
            tweet_id: comment.tweet_id,
          }));

        // ツイートごとにコメントを取得
        const tweetComments = {};
        allComments.forEach((comment) => {
          const currentTweetId = comment.tweet_id;

          if (!(currentTweetId in tweetComments)) {
            tweetComments[currentTweetId] = [];
          }
          tweetComments[currentTweetId].push(comment);
        });

        // 現在のツイートのコメントのみを this.comments に設定
        this.comments = tweetComments[tweetId] || [];
        console.log("Parsed comments:", this.comments); // デバッグ用ログ

        // ローカルストレージにすべてのコメントデータを保存する
        localStorage.setItem("storedComments", JSON.stringify(allComments));
      } catch (error) {
        console.error(error);
      }
    },

    async shareComment(tweetId) {
      try {
        const user = firebase.auth().currentUser;

        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;
          const response = await this.$axios.post("/comment", {
            uid: uid,
            id_token: idToken,
            tweet_id: tweetId,
            comment: this.commentText,
          });

          // 新しいコメントをthis.commentsに追加
          const newComment = {
            user_name: user.displayName,
            comment: this.commentText,
            tweet_id: tweetId,
          };
          this.comments.unshift(newComment);

          console.log("Comment added:", response.data);
          this.commentText = "";
        } else {
          console.error("User not authenticated");
        }
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
