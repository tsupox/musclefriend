/*******************
 * MuscleFriend
 * 30日チャレンジお助けボット
 * 
 * node v12.18.3  - v8.10.0
 * npm 6.14.6  - 3.5.2
 ******************* */

"use strict";

require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");
const CakeHash = require("cake-hash");
const cron = require('node-cron');
const randomConversation = require('./randomConversation.js');
const memberInfo = require('./memberInfo.js');

/** token */
const token = process.env.BOT_TOKEN;
/** bot */
const bot = new Eris.CommandClient(token, {}, {
    prefix: "$"
});

/** BOT Client ID */
const bot_id = process.env.BOT_USER_ID;
/** みんなのデータ */
const filename = "./data/result.json";
// const backup = "\\\\MYNAS_1\\share1\\backup\\" + filename;//jsonBackupファイル

/** rooms */
const roomIds = process.env.ROOMS.split(' ');
const admins = process.env.ADMINS.split(' ');
const hlp_msg =
    `
!start 30easy
30 日チャレンジ beginner をやるんですね！がんばりましょう！みんなも応援してね！
!start 30
30 日チャレンジ、みんなと一緒に頑張りましょう！
!start 7
7 秒スクワット！頑張りましょう～！
!done
えらい！！！
!howmany
XXX さんは今日 X 日目、 Y 回です。頑張りましょう！

// (๑╹ω╹๑ ) ＜ コマンド一覧だよ！

// ≪ 確認 コマンド ≫ ------------------------------------------------
// ？お題　　　　　　　　　　今回のお題表示
// ？リスト　　　　　　　　　お題抽選リスト（参考：！追加、！削除）
// ？作品　[お題]　　　　　　過去の作品全表示（例：？作品　ロボット ）
// ？作品　[お題]　[@ユーザ] そのユーザの過去の作品表示（例：？作品　ロボット　@つぽ#6599 ）
// ？過去　　　　　　　　　　過去のお題一覧を表示
// ？過去　[お題]　　　　　　そのお題の投稿者一覧を表示

// ≪ 登録削除 コマンド ≫ --------------------------------------------
// ！追加　[お題]　　お題抽選リストへの追加
// ！削除　[お題]　　お題抽選リストからの削除（自分のみ）
// ！黒歴史　[お題]　過去に投稿した作品の削除

// ≪ odaichan へのメンション ≫ --------------------------------------
// @odaichan へのメンションで絵を投稿するとその時のお題に紐づけて投稿できます
// ？作品 コマンドで見れるようになるよ！

// ※？お題　？作品 コマンドは他のルームでも使えます。
// ※お題リストには5件まで登録できます。
`;

bot.registerCommand("list", (msg, args) => {
    if (args.length) {
        //引数あり
        let text = "";
        if (randomConversation.existCommand(args[0])) {
            text = randomConversation.getDetail(args[0]);
        }
        return text || "その言葉はまだ登録されてないよ";
    } else {
        //引数なし
        return randomConversation.getList().join(' / ')
    }
}, {
    description: "返してくれる言葉一覧。",
    fullDescription: "登録されている言葉からランダムで返します。",
    usage: "<text>"
});

bot.registerCommand("add", (msg, args) => {
    if (args.length == 2) {
        //引数あり
        randomConversation.addCommand(args);
        return "おぼえました！"
    } else {
        //引数なし
        return "使い方: $add 単語　ランダムに,発生,したい,言葉,カンマ区切り"
    }
}, {
    description: "追加/修正します。",
    fullDescription: "",
    usage: "<text>"
});

bot.registerCommand("delete", (msg, args) => {
    if (args.length == 1) {
        //引数あり
        let result = randomConversation.deleteCommand(args);
        return result ? "さくじょしました！" : "そんなの登録されてなかったかも"
    } else {
        //引数なし
        return "使い方: $delete 単語"
    }
}, {
    description: "削除します",
    fullDescription: "",
    usage: "<text>"
});




/********************
 *  ready
 ********************/
bot.on("ready", () => {
    memberInfo.init();
    randomConversation.init();
    console.log("Ready...");
});

/********************
 *  メッセージ
 ********************/
bot.on("messageCreate", msg => {
    if (!msg.author.bot) {
        // BOT 以外
        // bot.createMessage(msg.channel.id, `${msg.author.mention} テスト`);

        if (roomIds.includes(msg.channel.id)) {
            //特定チャンネルのみ

            //botへのメンションに反応
            if (msg.mentions.length > 0 && msg.mentions[0].id === bot_id) {

                let content = msg.content.replace(`<@!${msg.mentions[0].id}>`, '').trim()
                if (randomConversation.existCommand(content)) {
                    bot.createMessage(msg.channel.id, randomConversation.getWord(content));
                }
                //結果
                else if (content.match(/(?:結果)/g)) {
                    bot.createMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id))
                }
                //今日何回
                else if (content.match(/(?:何回)/g)) {
                    bot.createMessage(msg.channel.id, memberInfo.howMany(msg.author.id))
                }
                else {
                    bot.createMessage(msg.channel.id, randomConversation.getRandom(["なんかいった？", "ねたらいいよ", "(・_・)？", "ごめん聞いてなかった", "なんて？", "はーい", "それは知らない", "わかんない", "えー？！", "ふむふむ？", "うーんと"]));
                }

                //おわったー
                if (content.match(/(?:やった|おわった|done|おわり|やりました|おわりました)/g)) {
                    let awesomeReactions = ["✨", "💯", "🎉", "👏"];
                    msg.addReaction(randomConversation.getRandom(awesomeReactions));

                    //回数登録
                    memberInfo.addResult(msg.author.id, content)
                    bot.createMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id))
                }

                // TODO 開始登録
                // TODO 希望機能登録　…　リポジトリ「課題」に登録
            }

            if (msg.content.match(/^草$/)) {
                if (Math.random() < 0.2) bot.createMessage(msg.channel.id, "草");
            }

        }

    }
});

// バックアップ
cron.schedule('0 0 0,12 * * *', memberInfo.backupJson);
cron.schedule('0 0 0,12 * * *', randomConversation.backupJson);


// Discord に接続します。
bot.connect();
