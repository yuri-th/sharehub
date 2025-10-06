<template>
  <div class="detail">
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
      <!-- <div class="post-form">
        <p>シェア</p>
        <input type="text" />
        <div class="share_button">
          <button type="submit">シェアする</button>
        </div>
      </div> -->
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
              @click="likePost()"
            />
            <span v-if="tweet !== null">{{ likeCount ?? 0 }}</span>
            <img
              src="/images/cross.png"
              alt="cross-logo"
              class="cross-logo"
              @click="deleteTweet()"
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
          <button @click="shareComment()">コメント</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase/app";
import { getAuthHeaders } from "~/utils/auth";

export default {
  middleware: "authenticated",
  meta: { requiresAuth: true },
  data() {
    return {
      tweet: null,
      likeCount: 0,
      commentText: "",
      comments: [],
    };
  },

  async mounted() {
    await this.loadData();
  },

  methods: {
    async loadData() {
      try {
        const tweetId = this.$route.params.tweetId;

        if (!tweetId) {
          alert("ツイートIDが見つかりません");
          this.$router.push("/");
          return;
        }

        await Promise.all([
          this.getTweetData(tweetId),
          this.getLikeCount(tweetId),
          this.getComments(tweetId),
        ]);
      } catch (error) {
        console.error("Error loading data:", error);
        alert("データの読み込みに失敗しました");
      }
    },

    async getTweetData(tweetId) {
      try {
        const response = await this.$axios.get(`/tweet/${tweetId}`);
        const tweetData = response.data.data;

        if (tweetData) {
          this.tweet = {
            tweet_id: tweetData.id,
            tweet_text: tweetData.tweet_text,
            user_name: tweetData.user_name,
          };
        }
      } catch (error) {
        console.error("Error getting tweet data:", error);
        throw error;
      }
    },

    async getLikeCount(tweetId) {
      try {
        const response = await this.$axios.get("/like");
        const tweetLikeInfo = response.data.data[tweetId];
        this.likeCount = tweetLikeInfo ? tweetLikeInfo.like_count : 0;
      } catch (error) {
        console.error("Error fetching like count:", error);
        this.likeCount = 0;
      }
    },

    async getComments(tweetId) {
      try {
        const response = await this.$axios.get(`/comment/?tweet_id=${tweetId}`);
        this.comments = response.data.data.reverse();
      } catch (error) {
        console.error("Error getting comments:", error);
        this.comments = [];
      }
    },

    async likePost() {
      if (!this.tweet) return;

      try {
        const { headers } = await getAuthHeaders();
        const user = firebase.auth().currentUser;
        const user_name = user.displayName;

        const likesResponse = await this.$axios.get("/like");
        const existingLike = Object.entries(likesResponse.data.data).find(
          ([tweetIdKey, like]) => {
            return (
              like.users.includes(user_name) &&
              tweetIdKey == this.tweet.tweet_id
            );
          }
        );

        if (existingLike) {
          await this.$axios.delete(`/like/${existingLike[0]}`, { headers });
        } else {
          await this.$axios.post(
            "/like",
            { tweet_id: this.tweet.tweet_id },
            { headers }
          );
        }

        await this.getLikeCount(this.tweet.tweet_id);
      } catch (error) {
        console.error("Error liking post:", error);
        alert("いいね処理に失敗しました");
      }
    },

    async deleteTweet() {
      if (!this.tweet) return;

      if (!confirm("本当に削除しますか？")) {
        return;
      }

      try {
        const { headers } = await getAuthHeaders();
        await this.$axios.delete(`/tweet/${this.tweet.tweet_id}`, { headers });
        alert("削除しました");
        this.$router.push("/");
      } catch (error) {
        if (error.response?.status === 403) {
          alert("投稿者以外削除できません");
        } else {
          console.error("Error deleting tweet:", error);
          alert("削除に失敗しました");
        }
      }
    },

    async shareComment() {
      if (!this.tweet) return;

      if (!this.commentText.trim()) {
        alert("コメントを入力してください");
        return;
      }

      try {
        const { headers } = await getAuthHeaders();
        const user = firebase.auth().currentUser;

        await this.$axios.post(
          "/comment",
          {
            tweet_id: this.tweet.tweet_id,
            comment: this.commentText,
          },
          { headers }
        );

        // コメントを先頭に追加
        this.comments.unshift({
          user_name: user.displayName,
          comment: this.commentText,
        });

        this.commentText = "";
      } catch (error) {
        console.error("Error sharing comment:", error);
        alert("コメントの投稿に失敗しました");
      }
    },

    logout() {
      firebase
        .auth()
        .signOut()
        .then(() => {
          alert("ログアウトしました");
          this.$router.push("/");
        })
        .catch((error) => {
          console.error(error);
          alert("ログアウトに失敗しました");
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

/* .post-form input {
  border: 1px solid white;
  background-color: transparent;
  padding: 8px;
  color: white;
  outline: none;
  border-radius: 10px;
  width: 80%;
  height: 100px;
} */

/* .share_button {
  width: 85%;
  text-align: right;
}

.share_button button {
  background: #776882;
  color: white;
  padding: 10px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
} */

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
  border: 1px solid white;
  padding: 8px;
  text-align: left;
  color: white;
  box-sizing: border-box;
  border-right: none;
  border-top: none;
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
  background: #776882;
  border: 1px solid #4b0082;
  color: white;
  padding: 10px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  margin-top: 10px;
}

@media screen and (max-width: 767px) {
  .detail {
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

  /* .post-form input {
    width: 90%;
  } */

  th,
  td {
    border: 1px solid white;
  }

  /* .share_button {
    width: 90%;
  } */

  .comment-form input {
    width: 95%;
  }
}
</style>
