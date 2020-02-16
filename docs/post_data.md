送信データ仕様
==

# file（全ファイル共通）
- id        : データ送信時のタイムスタンプ
- num       : 同時送信したナンバリング
- name      : ファイル名
- extension : ファイル拡張子
- type      : ファイル種類（image,audio,video...）
- mime      : mime情報
- modi      : ファイル修正のタイムスタンプ
- date      : ファイル作成のタイムスタンプ

- gps       : postしたgps値を取得（任意）

# image
- width       : 画像の幅
- height      : 画像の縦

- orientation : exif内の回転値
- rotate      : 操作した回転値

- trim_top    : 切り抜きのtop座標
- trim_left   : 切り抜きのleft座標
- trim_width  : 切り抜きの幅
- trim_height : 切り抜きの縦

- exif        : EXIF情報(json)
  - orientation
  - gps


# audio
- time : 音声の長さ（秒）


# video
- time : 動画の長さ（秒）
