
npm install nodemon -g


本番
npm install -g forever

forever start MuscleFriend.js


## Change logs

【v0.1.0】
まっくすが言葉を覚えるようになりました！
1 つの言葉につき複数の返答を登録できます。ランダムでどれか返します。
例えば「おは」「おきた」は「おはよー,よく寝れた？,おはよう！」のどれかを返せるようにできます。
※「一部」が入ってたらいいので「おは」を登録したら「おはよー」「おはー」などは自動的に返せます。

`$list` 今反応する言葉リスト
`$list なにか言葉`　その言葉で反応するリスト
`$add なにか言葉 ランダムで返したい言葉のカンマ区切り`　言葉を追加できます。 例: `$add あそぼ　いいよー,えー,いまはむり`
`$delete なにか言葉`　追加した言葉を消します。

編集したいときは、以下の流れで。
$list テスト


```
【V0.2.0】
・スクワットチャレンジ部屋にふさわしくなりました。
・「何回」という言葉に反応して今日の回数を教えてくれます。
・「結果」という言葉に反応して今までの結果をおしえてくれます。
・「やった」「おわった」「おわり」「おわりました」「done」に反応してその日の結果を登録してくれます。回数もつけると GOOD　例 「30回おわったよ！」
・「草」という言葉に時たま反応するようになりました。
```

【v0.2.1】
・30日チャレンジ以外のときに「何回」でエラーになっていたので修正


【v0.3.0】
・結果に今までの合計回数がでるようになりました。うっとり。
・「明日」と「何回」の組み合わせで明日の回数だけ見れるようになりました。見れるのは今日と明日だけです。
・ヘルプ機能が充実。
・$list $add $delete の結果が管理者じゃなくても隠蔽できるようになりました。ずるいからね。