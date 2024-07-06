<template>
  <div class="container">
    <div class="left_contents">
      <div class="left_contents-btn">
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
            <NuxtLink
              :to="{
                name: 'detail',
                params: {
                  tweetId: tweet.tweet_id,
                  likeCount: tweet.likeCount,
                },
              }"
              class="link-style"
            >
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
import firebase from "~/plugins/firebase";

export default {
  middleware: "authenticated",
  meta: { requiresAuth: true },

  data() {
    return {
      message: "ログインができておりません",
      tweetText: "",
      tweets: [],
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
        const tweetsResponse = await this.$axios.get("/tweet");
        const likesResponse = await this.$axios.get("/like/");

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
        return { like_count: 0 };
      }
      const likeInfo = likesData[tweetId];
      return likeInfo || { like_count: 0 };
    },

    async shareTweet() {
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const idToken = await user.getIdToken();
          const uid = user.uid;
          const response = await this.$axios.post("/tweet", {
            tweet_text: this.tweetText,
            uid: uid,
            id_token: idToken,
          });
          await this.getTweets();
        } else {
          console.error("User not authenticated");
        }
      } catch (error) {
        console.error(error);
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
          await this.$axios.delete(`/tweet/${tweetId}`, {
            headers: {
              Authorization: `Bearer ${idToken}`,
              "X-User-UID": uid,
            },
          });
          await this.getTweets();
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

    async likePost(tweetId) {
      try {
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
            console.log("No existing like found. Creating new like.");

            await this.$axios.post("/like", {
              tweet_id: tweetId,
              uid: uid,
              id_token: idToken,
            });
          }

          // 各ツイートごとにいいねの数を更新
          await this.getLikeCountForTweet(tweetId, likesResponse.data.data);

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
        return 0;
      }
      return likesData[tweetId] || 0;
    },

    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("ログアウトが完了しました");
          const navigationPromise = this.$router.push("/");
          if (navigationPromise && navigationPromise.then) {
            navigationPromise
              .then(() => {
                "ログアウトが完了";
              })
              .catch((err) => {
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
  background: #776882;
  border: 1px solid #4b0082;
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

.cross-logo {
  margin-right: 30px;
  margin-left: 10px;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th,
td {
  border: 1px solid white;
  padding: 8px;
  text-align: left;
  color: white;
  box-sizing: border-box;
  border-right: none;
  border-top: none;
}

@media screen and (max-width: 767px) {
  .container {
    flex-direction: column-reverse;
  }

  .left_contents {
    width: 100%;
    display: flex;
    flex-direction: column-reverse;
  }

  .post-list {
    width: 95%;
    margin-top: 40px;
  }

  .post-form input {
    width: 90%;
  }

  th,
  td {
    border: 1px solid white;
  }

  .share_button {
    width: 90%;
  }
}
</style>
