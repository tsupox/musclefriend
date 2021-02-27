# まっするふれんど

30日チャレンジの結果を登録するように作った discord 用 BOT です。
その後、言葉を少し返すようになりました。

愛称は「まっするくん」


## できること
- 30日チャレンジ（normal / beginner）の「今日の回数」の確認と「今日やった回数」の登録
- メンションした際、言葉に反応して返事
- 時々勝手に喋ります


## How to install
```
npm install nodemon -g
npm install
cp sample.env .env
vi .env
npm start
```

### 本番環境
```
npm install -g forever
forever start MuscleFriend.js
```

## 構成
```
MuscleFriend.js ... ボット本体
memberInfo.js ... スクワット30日チャンレンジ登録・確認用モジュール
randomConversation.js ... 言葉に反応して/もしくは時々おしゃべりさせる用モジュール
changelog.md ... 変更履歴
README.md ... このファイル
sample.env ... 環境変数サンプルファイル
data/ ... 保存データ
├ conversation.json ... 登録済みの反応する言葉一覧
└ result.json ... 30日チャレンジ結果一覧
```
