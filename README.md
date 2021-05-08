# まっするふれんど

30日チャレンジの結果を登録するように作った discord 用 BOT です。
その後、言葉を少し返すようになりました。

愛称は「まっするくん」


## できること
- トレーニングの開始登録と「今日やった回数」の登録
  - 30日チャレンジ（normal / beginner）「今日の回数」の確認
  - 時間になったときにその日にトレーニングの記録がない場合、 DM で確認します
  - 記録用 json は S3 バックアップ
- メンション / DM した際、言葉に反応して返事
- 時々勝手に喋ります (1% の割合)
- 与えられた候補内でルーレットをします
- マインスイーパーを作成します

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
modules/ ... モジュール
├ gachaReply.js ... ガチャ言葉（低確率で勝手にしゃべる言葉）の登録・確認用モジュール
├ memberInfo.js ... スクワット30日チャンレンジ登録・確認用モジュール
├ minesweeper.js ... Discord 用のマインスイーパーを作成するモジュール
└ randomConversation.js ... 言葉に反応してランダムで返事を返すモジュール
data/ ... 保存データ
├ conversation.json ... 登録済みの反応する言葉一覧
├ gachaReply.json ... ガチャ言葉一覧
└ result.json ... 30日チャレンジ結果一覧しくは時々おしゃべりさせる用モジュール
test/ ... UT ファイル
changelog.md ... 変更履歴
README.md ... このファイル
sample.env ... 環境変数サンプルファイル
test.js ... ネガポジ判定詳細確認用プログラム (CLI)
```


## テスト

Using expect by chai.

※ data ディレクトリ内のファイルを書き換えるので注意

See;
[Expect / Should \- Chai :  https://www.chaijs.com/api/bdd/](https://www.chaijs.com/api/bdd/)

```
npm test
  // or
npm install -g mocha
mocha
mocha test/memberinfo.test.js
mocha test/randomConversation.test.js
mocha test/gachaReply.test.js
mocha test/minesweeper.test.js
  // or
npm install -g jest-cli
jest
jest test/memberinfo.test.js
jest test/randomConversation.test.js
jest test/gachaReply.test.js
jest test/minesweeper.test.js
```