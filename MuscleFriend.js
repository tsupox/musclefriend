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

/** メンションユーザー取得 */
const getMentionedUser = (msg_content) => {
    let exec = /^<@!([0-9]{17,19})>/.exec(msg_content)
    return (exec && exec.length > 1) ? exec[1] : null;
};

const deleteCommandResult = {
    emoji: '🗑',
    type: 'edit',
    response: (msg, args, user) => {
        let mentionedUserId = getMentionedUser(msg.content)
        if (mentionedUserId == user.id) msg.delete()
    }
};

bot.registerCommand("list", (msg, args) => {
    if (args.length) {
        //引数あり
        let text = "";
        if (randomConversation.existCommand(args[0])) {
            text = randomConversation.getDetail(args[0]);
        }
        if (text) {
            msg.addReaction('⭕')
            return `<@!${msg.author.id}> ${text}`;
        } else {
            msg.addReaction('✖')
            return;
        }
    } else {
        //引数なし
        return `<@!${msg.author.id}> ` + randomConversation.getList().join(' / ')
    }
}, {
    // argsRequired: true,
    description: "返してくれる言葉一覧。",
    fullDescription: "[$list] で一覧を、 [$list 言葉] でその言葉で返されるランダムな言葉の一覧を表示します。",
    usage: "なし または　対象の言葉",
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("add", (msg, args) => {
    if (args.length == 2) {
        //引数あり
        randomConversation.addCommand(args);
        msg.addReaction('⭕');
        return;
    } else {
        //引数なし or カンマ区切りでない
        msg.addReaction('✖')
        return `<@!${msg.author.id}> ` + "使い方: [$add 単語　ランダムに,返答,したい,言葉,カンマ区切り]　半角カンマで区切ってください"
    }
}, {
    argsRequired: true,
    description: "追加/修正します。",
    fullDescription: "存在しない言葉は新規登録を、すでに存在する言葉は与えられたランダム言葉で上書きします。\n今までの言葉を消したくない場合は、先に [$list 言葉] で登録されている内容を確認して、同じ言葉を再度登録する必要があります。",
    usage: "単語　ランダムに,返答,したい,言葉,カンマ区切り",
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("delete", (msg, args) => {
    if (args.length == 1) {
        //引数あり
        let result = randomConversation.deleteCommand(args);
        if (result) {
            msg.addReaction('⭕');
        } else {
            msg.addReaction('✖')
        }
    } else {
        //引数なし
        return "使い方: $delete 単語"
    }
}, {
    argsRequired: true,
    description: "削除します",
    fullDescription: "登録された言葉を削除します。",
    usage: "削除したい言葉",
    reactionButtons: [
        deleteCommandResult
    ],
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
                    let adjustment = content.match(/明日/) ? 1 : 0;
                    bot.createMessage(msg.channel.id, memberInfo.howMany(msg.author.id, adjustment))
                }
                else {
                    bot.createMessage(msg.channel.id, randomConversation.getRandom(["なんかいった？", "ねたらいいよ", "(・_・)？", "ごめん聞いてなかった", "なんて？", "はーい", "それは知らない", "わかんない", "えー？！", "ふむふむ？", "うーんと"]));
                }

                //おわったー
                if (content.match(/(?:やった|おわった|done|おわり|やりました|終わ)/g)) {
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
