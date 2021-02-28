/*******************
 * MuscleFriend
 * 30日チャレンジお助けボット
 * 
 * node v12.18.3  - v8.10.0
 * npm 6.14.6  - 3.5.2
 ******************* */

"use strict";

// node requires
require('dotenv').config();
const Eris = require("eris");
const fs = require("fs");
const CakeHash = require("cake-hash");
const cron = require('node-cron');

// modules
const randomReply = require('./randomReply.js');
const memberInfo = require('./memberInfo.js');
const gachaReply = require('./gachaReply.js');

/** token */
const token = process.env.BOT_TOKEN;
/** bot */
const bot = new Eris.CommandClient(token, {}, {
    prefix: "$"
});

/** BOT Client ID */
const bot_id = process.env.BOT_USER_ID;

/** rooms */
const roomIds = process.env.ROOMS.split(' ');
/** admins (not use) */
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
        if (randomReply.existCommand(args[0])) {
            text = randomReply.getDetail(args[0]);
        }
        if (text) {
            msg.addReaction('⭕')
            return `<@!${msg.author.id}> \`\`\`${text}\`\`\``;
        } else {
            msg.addReaction('✖')
            return;
        }
    } else {
        //引数なし
        return `<@!${msg.author.id}> ` + "```" + randomReply.getList().join(' / ') + "```"
    }
}, {
    // argsRequired: true,
    description: "返してくれる言葉一覧。",
    fullDescription: "[$list] で一覧を、 [$list 言葉] でその言葉で返されるランダムな言葉の一覧を表示します。",
    usage: "なし または　対象の言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("add", (msg, args) => {
    if (args.length == 2) {
        //引数あり
        let result = randomReply.addCommand(args);
        if (result) {
            msg.addReaction('⭕');
        } else {
            msg.addReaction('✖')
        }
        return;

    } else {
        //引数なし or カンマ区切りでない
        msg.addReaction('✖')
        return `<@!${msg.author.id}> ` + "`使い方: [$add 単語　ランダムに,返答,したい,言葉,カンマ区切り]　半角カンマで区切ってください`"
    }
}, {
    argsRequired: true,
    description: "追加/修正します。",
    fullDescription: "存在しない言葉は新規登録を、すでに存在する言葉は与えられたランダム言葉で上書きします。\n今までの言葉を消したくない場合は、先に [$list 言葉] で登録されている内容を確認して、同じ言葉を再度登録する必要があります。",
    usage: "単語　ランダムに,返答,したい,言葉,カンマ区切り",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("delete", (msg, args) => {
    if (args.length == 1) {
        //引数あり
        let result = randomReply.deleteCommand(args);
        if (result) {
            msg.addReaction('⭕');
        } else {
            msg.addReaction('✖')
        }
    } else {
        //引数なし
        return "`使い方: $delete 単語`"
    }
}, {
    argsRequired: true,
    description: "削除します",
    fullDescription: "登録された言葉を削除します。",
    usage: "削除したい言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("score", async (msg, args) => {
    if (args.length == 1) {
        //引数あり
        let score = await randomReply.getNegaPosiScore(args[0]);
        msg.addReaction('⭕');
        return `\`${score}  ${args[0]}\``
    } else {
        //引数なし
        return "使い方: $score チェックしたい文章"
    }
}, {
    argsRequired: true,
    description: "ネガポジスコアをチェックします。",
    fullDescription: "文章からネガティブ／ポジティブのスコアを判定します。＋がポジティブ。－がネガティブ。",
    usage: "判定したい文章",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("gachalist", (msg, args) => {
    return `<@!${msg.author.id}> ` + "```" + gachaReply.getList().join(' / ') + "```"
}, {
    // argsRequired: true,
    description: "「ガチャ言葉」の一覧",
    fullDescription: "登録されているガチャ言葉の一覧を返します。返答率は 1%。",
    usage: "なし または　対象の言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("gachaadd", (msg, args) => {
    let result = gachaReply.addCommand(args);
    msg.addReaction('⭕');
    return;
}, {
    argsRequired: true,
    description: "「ガチャ言葉」を追加します。",
    fullDescription: "ガチャ言葉を追加します。",
    usage: "追加したいガチャ言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("gachadelete", (msg, args) => {
    let result = gachaReply.deleteCommand(args);
    if (result) {
        msg.addReaction('⭕');
    } else {
        msg.addReaction('✖')
    }
}, {
    argsRequired: true,
    description: "「ガチャ言葉」を削除します",
    fullDescription: "ガチャ言葉を削除します。完全一致で削除できます。",
    usage: "削除したいガチャ言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});



/********************
 *  ready
 ********************/
bot.on("ready", () => {
    memberInfo.init();
    randomReply.init();
    gachaReply.init();
    console.log("Ready...");
});

/********************
 *  メッセージ
 ********************/
bot.on("messageCreate", async msg => {
    if (!msg.author.bot) {
        // BOT 以外

        if (roomIds.includes(msg.channel.id)) {
            //特定チャンネルのみ

            //botへのメンションに反応
            if (msg.mentions.length > 0 && msg.mentions[0].id === bot_id) {

                let content = msg.content.replace(`<@!${msg.mentions[0].id}>`, '').replace(`<@${msg.mentions[0].id}>`, '').trim()

                //結果
                if (content.match(/(?:結果)/g)) {
                    bot.createMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id))
                }
                //今日何回
                else if (content.match(/(?:何回)/g)) {
                    let adjustment = content.match(/明日/) ? 1 : 0;
                    bot.createMessage(msg.channel.id, memberInfo.howMany(msg.author.id, adjustment))
                } else {
                    let reply = await randomReply.getReply(content)
                    if (reply.emoji) {
                        msg.addReaction(reply.emoji);
                    }
                    bot.createMessage(msg.channel.id, reply.word);
                }

                //おわったー
                if (content.match(/(?:やった|おわった|done|おわり|やりました|終わ)/g) && !content.match(/仕事/g)) {
                    let awesomeReactions = ["✨", "💯", "🎉", "👏"];
                    msg.addReaction(randomReply.getRandom(awesomeReactions));

                    //回数登録
                    memberInfo.addResult(msg.author.id, content)
                    bot.createMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id))
                }

                // TODO 開始登録
            }

            if (msg.content.match(/^草$/)) {
                if (Math.random() < 0.2) bot.createMessage(msg.channel.id, "草");
            } else if (msg.content.match(/^えらい！/)) {
                if (Math.random() < 0.2) bot.createMessage(msg.channel.id, "えらい！");
            } else if (msg.content.match(/(?:ｗ|（笑）|\(笑\))/g)) {
                if (Math.random() < 0.2) bot.createMessage(msg.channel.id, "ｗｗｗ");
            } else if (msg.content.match(/^らーまん(。)?$/g)) {
                if (Math.random() < 0.2) bot.createMessage(msg.channel.id, "らーまん");
            } else {
                if (Math.random() < 0.01) bot.createMessage(msg.channel.id, gachaReply.getReply());
            }
        }

    }
});

// バックアップ
cron.schedule('0 0 0,12 * * *', memberInfo.backupJson);
cron.schedule('0 0 0,12 * * *', randomReply.backupJson);


// Discord に接続します。
bot.connect();
