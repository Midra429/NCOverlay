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
- ~~[NHKプラス](https://plus.nhk.jp/)~~
- [TVer](https://tver.jp/)

※ 増減する可能性あり

## 拡張機能をインストール
### Google Chrome (v116以降)
- Chrome ウェブストア\
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

### Microsoft Edge (v116以降)
- Chrome ウェブストア\
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

- Microsoft Edge アドオン\
https://microsoftedge.microsoft.com/addons/detail/pglfdhpihampbbmllndglcejpnjgkkkl

### Firefox (v142以降)
- Firefox アドオン\
https://addons.mozilla.org/ja/firefox/addon/ncoverlay/

### Chromium
上記のブラウザ以外のChromiumベースのブラウザでも基本的には動作しますが、\
サイドパネル（コメントリスト）の表示ができない可能性があります。

## 不具合報告・機能提案など
- [Google フォーム](https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform)<br>
(NCOverlay経由でアクセスすると、バージョンやOSなどの情報が自動入力されます)
- GitHubの[Issues](https://github.com/Midra429/NCOverlay/issues)
- SNSアカウント宛にメッセージやメンション
  - X (Twitter): [@Midra429](https://x.com/Midra429)

---

## 開発
### 環境
- [Bun](https://bun.com/)
- [Visual Studio Code](https://code.visualstudio.com/)
- [Chrome](https://www.google.com/intl/ja/chrome/)

### 開発サーバー
```sh
# Chrome
bun run dev:chrome
```
```sh
# Firefox
bun run dev:firefox
```

### 出力
```sh
# dist/chrome-mv3
# dist/firefox-mv3
bun run build
```
```sh
# dist/chrome-mv3
bun run build:chrome
```
```sh
# dist/firefox-mv3
bun run build:firefox
```

### 出力 (ZIP)
```sh
# dist/ncoverlay-0.0.0-chrome.zip
# dist/ncoverlay-0.0.0-firefox.zip
# dist/ncoverlay-0.0.0-sources.zip
bun run zip
```
```sh
# dist/ncoverlay-0.0.0-chrome.zip
bun run zip:chrome
```
```sh
# dist/ncoverlay-0.0.0-firefox.zip
# dist/ncoverlay-0.0.0-sources.zip
bun run zip:firefox
```

## ライブラリ
- **nco-utils**<br>
[GitHub](https://github.com/Midra429/nco-utils) / [npm](https://www.npmjs.com/package/@midra/nco-utils)<br>
NCOverlay用のユーティリティライブラリ<br>
タイトル解析、自動検索、各サービスのAPI関連

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

- **nicolog**<br>
https://nicolog.ecchi.club/<br>
ニコニコ生放送のアニメコメントアーカイブ

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
