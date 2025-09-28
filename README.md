## SHARE<br>
Twitter 風 SNSアプリ(フロントエンド）<br>

◆Top ページ<br>
<img src="https://github.com/yuri-th/sharehub/assets/117786989/6afe7101-d671-43a1-a5f6-38eb52165610" width="800"><br>

## 作成の目的

コミュニティ内で気軽につぶやけるアプリを活用して、コミュニケーションの活性化をはかる。

## アプリケーション URL<br>

http://localhost/<br>
※ログインには、名前と email、パスワードでの会員登録が必要です。<br>

## 他のリポジトリ<br>

バックエンドのリポジトリ<br>
https://github.com/yuri-th/sharehub-backend.git

## 機能一覧<br>

ユーザー認証（Firebase Authentication）/投稿の一覧表示、追加処理、削除処理/いいね機能/コメント機能/バリデーション/レスポンシブデザイン（ブレイクポイント 768px)<br>

## 使用言語、フレームワーク、DB など<br>

JavaScript/Nuxt.js/Vue.js/MySQL/Firebase<br>

## テーブル設計<br>

<img src="https://github.com/yuri-th/sharehub/assets/117786989/8a029445-75f2-47a2-84cf-ee81d7fa7718" width="589"><br>

## ER 図<br>

<img src="https://github.com/yuri-th/sharehub/assets/117786989/7b318f05-e53a-4570-aac9-d5c5eec7f5a0" width="589"><br>

## 環境構築<br>

1.プロジェクトをコピーしたいディレクトリにて「git clone <https://github.com/yuri-th/sharehub.git>」を行いプロジェクトをコピー。<br>
2.依存関係のインストール<br>
「cd sharepj」で.envのあるディレクトリに移動し以下のコマンドを実行。<br>
npm install<br>
yarn install<br>
3.環境変数の設定<br>
env.example をコピーして .env を作成<br>
Firebase設定値を入力する。<br>
4.以下のコマンドで開発サーバの起動<br>
yarn dev<br>
5.以下にアクセスしログイン画面が表示されればOK。<br>
 http://localhost:3000



##　追記事項<br>
