import firebase from "~/plugins/firebase";

/**
 * 認証ヘッダーを取得
 * @returns {Object} headers, uid を含むオブジェクト
 */

export async function getAuthHeaders() {
  const user = firebase.auth().currentUser;

  if (!user) {
    throw new Error("ユーザーが認証されていません");
  }

  const idToken = await user.getIdToken();
  const uid = user.uid;

  return {
    headers: {
      Authorization: `Bearer ${idToken}`,
      "X-User-UID": uid,
    },
    uid,
    idToken,
  };
}

/**
 * 現在のユーザー名を取得
 * @returns {String} ユーザー名
 */
export function getCurrentUserName() {
  const user = firebase.auth().currentUser;
  return user?.displayName || "ゲスト";
}
