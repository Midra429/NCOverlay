# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> NCOverlay

[![GitHub Release](https://img.shields.io/github/v/release/Midra429/NCOverlay?label=Releases)](https://github.com/Midra429/NCOverlay/releases)
[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/ofhffkmglkibpkgcfhbgajghlkgplafe?label=Chrome%20Web%20Store)](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[![Firefox Add-ons](https://img.shields.io/amo/v/ncoverlay?label=Firefox%20Add-ons)](https://addons.mozilla.org/ja/firefox/addon/ncoverlay/)

[<img src="assets/badges/chrome.png" height="60px">](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)
[<img src="assets/badges/firefox.png" height="60px">](https://addons.mozilla.org/ja/firefox/addon/ncoverlay/)

## 概要

動画配信サービスの再生画面にニコニコのコメントを表示する拡張機能です。<br>

## 対応している動画配信サービス

- [dアニメストア](https://animestore.docomo.ne.jp/animestore/)
- [Amazon Prime Video](https://www.amazon.co.jp/gp/video/storefront/)
- [ABEMA](https://abema.tv/)
- [Disney+](https://www.disneyplus.com/ja-jp/home)
- [TVer](https://tver.jp/)
- [バンダイチャンネル](https://www.b-ch.com/)
- [U-NEXT](https://video.unext.jp/)
- [DMM TV](https://tv.dmm.com/vod/)
- [Hulu](https://www.hulu.jp/)
- [Lemino](https://lemino.docomo.ne.jp/)

※ 増減する可能性あり

## 使い方
コメントは自動で取得・表示されるので何もしなくてOK。<br>
取得したコメント数は拡張機能のアイコンに表示されます。<br>

dアニメストア ニコニコ支店のコメントを取得・表示するには、同じブラウザでニコニコにログインしてください。<br>

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

詳しい使い方はこちら<br>
https://github.com/Midra429/NCOverlay/releases/tag/v1.1.0

### スクリーンショット
拡張機能のアイコンの右クリックメニュー > スクリーンショット<br>
※ 一部VODのみ対応 (ABEMA / TVer / バンダイチャンネル)

## インストール

### Chrome Web Store
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

### Firefox Add-ons
https://addons.mozilla.org/ja/firefox/addon/ncoverlay/

## 不具合報告・機能提案など
- [Google フォーム](https://docs.google.com/forms/d/e/1FAIpQLSerDl7pYEmaXv0_bBMDOT2DfJllzP1kdesDIRaDBM8sOAzHGw/viewform)<br>
NCOverlay経由でアクセスすると、バージョンやOSなどの情報が自動入力されます
- GitHubの[Issues](https://github.com/Midra429/NCOverlay/issues)
- SNSアカウント宛にメッセージやメンション
  - X (Twitter): [@Midra429](https://x.com/Midra429)
  - Bluesky: [Midra](https://bsky.app/profile/did:plc:rnbmtecarezy7txgy3pbbprf)

---

## 開発
```sh
pnpm run build
```

### 出力
```
dist
  ├ extension-*****             開発用
  ├ NCOverlay_v0.0.0-*****      minified
  └ NCOverlay_v0.0.0-*****.zip  ストア用, minified
```

### 使用ライブラリ
- [xpadev-net/niconicomments](https://github.com/xpadev-net/niconicomments)<br>
  コメントを描画するやつ。これなかったら多分作ってない。
- [geolonia/japanese-numeral](https://github.com/geolonia/japanese-numeral)<br>
  数字 ↔ 漢数字を相互変換するやつ。

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
