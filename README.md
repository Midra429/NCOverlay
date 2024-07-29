# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> NCOverlay
[![GitHub Release](https://img.shields.io/github/v/release/Midra429/NCOverlay?label=Releases)](https://github.com/Midra429/NCOverlay/releases/latest)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ofhffkmglkibpkgcfhbgajghlkgplafe?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[![Firefox Add-ons](https://img.shields.io/amo/v/ncoverlay?label=Firefox%20Add-ons)](https://addons.mozilla.org/ja/firefox/addon/ncoverlay/)

[<img src="assets/badges/chrome.png" height="60px">](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[<img src="assets/badges/firefox.png" height="60px">](https://addons.mozilla.org/ja/firefox/addon/ncoverlay/)

## 概要
動画配信サービスの再生画面にニコニコのコメントを表示する拡張機能です。

## 対応している動画配信サービス
- [dアニメストア](https://animestore.docomo.ne.jp/animestore/)
- [ABEMA](https://abema.tv/)
- [バンダイチャンネル](https://www.b-ch.com/)
- [DMM TV](https://tv.dmm.com/vod/)
- [U-NEXT](https://video.unext.jp/)
- [FOD](https://fod.fujitv.co.jp/)
- [Prime Video](https://www.amazon.co.jp/gp/video/storefront/)
- [Hulu](https://www.hulu.jp/)
- [TVer](https://tver.jp/)
<!-- - [Lemino](https://lemino.docomo.ne.jp/) -->
<!-- - [Disney+](https://www.disneyplus.com/ja-jp/home) -->
<!-- - [NHKプラス](https://plus.nhk.jp/) -->

※ 増減する可能性あり

## 使い方
整備中...

<!-- コメントは自動で取得・表示されるので何もしなくてOK。\
取得したコメント数は拡張機能のアイコンに表示されます。

dアニメストア ニコニコ支店のコメントを取得・表示するには、同じブラウザでニコニコにログインしてください。

### ポップアップ
- コメントの表示/非表示
- 設定
  - 不透明度: コメントの不透明度
  - 低パフォーマンスモード
    - コメントの描画: 30FPS固定
    - サイドパネル: 自動スクロールのアニメーション無効化
  - タイトルの一致判定を緩くする
  - コメント専用動画を表示
  - ニコニコのNG設定を使用 (要ログイン)
- 表示中のコメントの元動画の確認

### サイドパネル (Chromeのみ)
- コメントの一覧表示
  - 自動スクロール
  - コマンドによる文字装飾を一部反映

詳しい使い方はこちら\
https://github.com/Midra429/NCOverlay/releases/tag/v1.1.0

### スクリーンショット
拡張機能のアイコンの右クリックメニュー > スクリーンショット\
※ 一部VODのみ対応 (ABEMA / TVer / バンダイチャンネル) -->

## インストール
### Chrome Web Store
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

### Firefox Add-ons
https://addons.mozilla.org/ja/firefox/addon/ncoverlay/

## 不具合報告・機能提案など
- [Google フォーム](https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform)\
(NCOverlay経由でアクセスすると、バージョンやOSなどの情報が自動入力されます)
- GitHubの[Issues](https://github.com/Midra429/NCOverlay/issues)
- SNSアカウント宛にメッセージやメンション
  - X (Twitter): [@Midra429](https://x.com/Midra429)

---

## 開発
### 環境
- [pnpm](https://pnpm.io/ja/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Chrome](https://www.google.com/intl/ja/chrome/)

### 開発サーバー
```sh
# Chrome
pnpm run dev
```
```sh
# Firefox
pnpm run dev:firefox
```

### 出力
```sh
# dist/chrome-mv3
pnpm run build
```
```sh
# dist/firefox-mv3
pnpm run build:firefox
```

### 出力 (ZIP)
```sh
# dist/ncoverlay-0.0.0-chrome.zip
pnpm run zip
```
```sh
# dist/ncoverlay-0.0.0-firefox.zip
# dist/ncoverlay-0.0.0-sources.zip
pnpm run zip:firefox
```

## ライブラリ
- [**nco-parser**](https://github.com/Midra429/nco-parser)\
アニメタイトルの解析や比較をするやつ
- [**nco-api**](https://github.com/Midra429/nco-api)\
NCOverlayで使うAPIをまとめたやつ

## スペシャルサンクス
- [**xpadev-net/niconicomments**](https://github.com/xpadev-net/niconicomments)
- [**しょぼいカレンダー**](https://cal.syoboi.jp/)
- [**ニコニコ実況 過去ログ API**](https://jikkyo.tsukumijima.net/)

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
