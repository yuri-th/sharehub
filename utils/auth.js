import firebase from "firebase/app";

/**
 * 認証ヘッダーを取得
 * @returns {Object} idToken
 */

export async function getAuthHeaders() {
  const user = firebase.auth().currentUser;

  if (!user) {
    throw new Error("ユーザーが認証されていません");
  }

  const idToken = await user.getIdToken();

  return {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    idToken,
  };
}

/**
 * 現在のユーザー名を取得
 * @returns {String} ユーザー名
 */
// export function getCurrentUserName() {
//   const user = firebase.auth().currentUser;
//   return user?.displayName || "ゲスト";
// }
