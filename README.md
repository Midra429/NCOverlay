# <sub><img src="assets/icon.png" width="30px" height="30px"></sub> NCOverlay

[<img src="assets/badges/chrome.png" height="60px">](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe)

## 概要

動画配信サービスの再生画面にニコニコのコメントを表示する拡張機能です。<br>
今現在はアニメのみ対応。

## 対応している動画配信サービス

- [Amazon Prime Video](https://www.amazon.co.jp/gp/video/storefront/)
- [dアニメストア](https://animestore.docomo.ne.jp/animestore/)
- [ABEMA](https://abema.tv/video/genre/animation)
- [Disney+](https://www.disneyplus.com/ja-jp/home)

<small>※ 増減する可能性あり</small>

## 使い方
コメントは自動で取得・表示されるので何もしなくてOK。<br>
取得したコメント数は拡張機能のアイコンに表示されます。<br>

ニコニコにログインしていると、dアニメストア ニコニコ支店のコメントも取得・表示されます。

### ポップアップ
- コメントの表示/非表示
- 設定
  - 不透明度: コメントの不透明度
  - 低パフォーマンスモード: 負荷が低くなるかも？
    - コメントの描画: 60FPS → 30FPS
    - サイドパネル: 自動スクロールのアニメーション無効化
- 表示中のコメントの元動画の確認

### サイドパネル
- コメントの一覧表示
  - 自動スクロール
  - コマンドによる文字装飾を一部反映

詳しい使い方はこちら<br>
https://github.com/Midra429/NCOverlay/releases/tag/v1.1.0

## インストール

### Chrome Web Store (推奨)
https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe

### 手動
1. [Releases](https://github.com/Midra429/NCOverlay/releases) から最新バージョンのZIPファイルをダウンロード
2. ダウンロードしたファイルを `chrome://extensions` (デベロッパー モード: ON) にドラッグ&ドロップ

## 不具合報告・機能提案など
- [GitHub > Issues](https://github.com/Midra429/NCOverlay/issues)
- [Chrome Web Store](https://chromewebstore.google.com/detail/ofhffkmglkibpkgcfhbgajghlkgplafe) > サポート
- [X (@Midra429)](https://x.com/Midra429) に [メンション](https://x.com/intent/tweet?screen_name=Midra429) や [DM](https://x.com/messages/compose?recipient_id=1052566817279864837)

---

## 開発
```sh
pnpm run build
```

### Output
```
dist
  ├ extension             開発用
  ├ NCOverlay_v0.0.0      minified
  └ NCOverlay_v0.0.0.zip  ストア用, minified
```

### 使用ライブラリ
- [xpadev-net/niconicomments](https://github.com/xpadev-net/niconicomments)<br>
  コメントを描画するやつ。これなかったら多分作ってない。
- [geolonia/japanese-numeral](https://github.com/geolonia/japanese-numeral)<br>
  数字 ↔ 漢数字を相互変換するやつ。

## ライセンス
当ライセンスは [MIT](LICENSE.txt) ライセンスの規約に基づいて付与されています。
