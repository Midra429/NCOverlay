# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> NCOverlay
[![GitHub Release](https://img.shields.io/github/v/release/Midra429/NCOverlay?label=Releases)](https://github.com/Midra429/NCOverlay/releases/latest)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ofhffkmglkibpkgcfhbgajghlkgplafe?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[![Firefox Add-ons](https://img.shields.io/amo/v/ncoverlay?label=Firefox%20Add-ons)](https://addons.mozilla.org/ja/firefox/addon/ncoverlay/)

[<img src="assets/badges/chrome.png" height="60px">](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[<img src="assets/badges/edge.png" height="60px">](https://microsoftedge.microsoft.com/addons/detail/pglfdhpihampbbmllndglcejpnjgkkkl)
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
- [Netflix](https://www.netflix.com/)
- [Hulu](https://www.hulu.jp/)
- [ニコニコ動画](https://www.nicovideo.jp/)
- [NHKプラス](https://plus.nhk.jp/)
- [TVer](https://tver.jp/)

※ 増減する可能性あり

<!-- ## 使い方 -->
<!-- 整備中... -->

## インストール
### Chrome Web Store
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

### Edge Add-ons
https://microsoftedge.microsoft.com/addons/detail/pglfdhpihampbbmllndglcejpnjgkkkl

### Firefox Add-ons
https://addons.mozilla.org/ja/firefox/addon/ncoverlay/

## 不具合報告・機能提案など
- [Google フォーム](https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform)<br>
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
- **nco-parser**<br>
[GitHub](https://github.com/Midra429/nco-parser) / [npm](https://www.npmjs.com/package/@midra/nco-parser)<br>
アニメタイトルの解析や比較をするやつ

- **nco-api**<br>
[GitHub](https://github.com/Midra429/nco-api) / [npm](https://www.npmjs.com/package/@midra/nco-api)<br>
NCOverlayで使うAPIをまとめたやつ

## スペシャルサンクス
- **xpadev-net/niconicomments**<br>
[GitHub](https://github.com/xpadev-net/niconicomments) / [npm](https://www.npmjs.com/package/@xpadev-net/niconicomments)<br>
コメント描画

- **しょぼいカレンダー**<br>
https://docs.cal.syoboi.jp/spec/json.php/<br>
番組検索、放送時間取得

- **ニコニコ実況 過去ログ API**<br>
https://jikkyo.tsukumijima.net/<br>
ニコニコ実況の過去ログ

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
