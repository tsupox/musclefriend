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

bot.registerCommand("check", (msg, args) => {
    if (args.length) {
        //引数あり
        if (randomReply.existCommand(args[0])) {
            let existed = randomReply.getDetailArray(args[0]);
            msg.addReaction('⭕')
            return `<@!${msg.author.id}> 登録済み　修正: \`$edit ${existed.keyword} ${existed.reply.split(',').join(' ')}\`　削除: \`$delete ${existed.keyword}\``;
        } else {
            msg.addReaction('⭕')
            return `<@!${msg.author.id}> 未登録　新規登録: \`$add ${args[0]} 登録したい　言葉\``;
        }
    } else {
        //引数なし
        return `<@!${msg.author.id}> 確認したい言葉を指定してください。`
    }
}, {
    // argsRequired: true,
    description: "登録済みか未登録かを確認します。",
    fullDescription: "登録済みか未登録かを確認します。また、追加時／修正時／削除時のコマンドも返します。",
    usage: "対象の言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("add", (msg, args) => {
    if (args.length >= 2) {
        if (randomReply.existCommand(args[0])) {
            let existed = randomReply.getDetailArray(args[0])
            msg.addReaction('✖');
            return `<@!${msg.author.id}> 登録済みです。 更新時の参考コマンド（追加はこの後ろに）・・・　\`$edit　${existed.keyword} ${existed.reply.split(',').join(' ')}\``

        } else {
            let result = randomReply.addCommand(args);
            if (result) {
                msg.addReaction('⭕');
            } else {
                msg.addReaction('✖')
            }
            return;
        }

    } else {
        //引数なし
        msg.addReaction('✖')
        return `<@!${msg.author.id}> ` + "`使い方: [$add 単語　ランダムに 返答　したい　言葉]　登録したい言葉をカンマもしくはスペースで区切ってください。読点「、」は区切りとなりません。`"
    }
}, {
    argsRequired: true,
    description: "追加します。",
    fullDescription: "新規登録を登録します。すでに存在する言葉は登録できません（$edit を使用してください）",
    usage: "単語　ランダムに 返答 したい 言葉",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});

bot.registerCommand("edit", (msg, args) => {
    if (args.length >= 2) {
        if (!randomReply.existCommand(args[0])) {
            msg.addReaction('✖');
            return `<@!${msg.author.id}> 未登録です。 $add コマンドを使ってください。　\`$add　${args[0]} ${args.splice(1, args.length).join(' ')}\``

        } else {
            let result = randomReply.editCommand(args);
            if (result) {
                msg.addReaction('⭕');
            } else {
                msg.addReaction('✖')
            }
            return;
        }

    } else {
        //引数なし
        msg.addReaction('✖')
        return `<@!${msg.author.id}> ` + "`使い方: [$edit 単語　修正 したい　言葉]　修正したい言葉をカンマもしくはスペースで区切ってください。`"
    }
}, {
    argsRequired: true,
    description: "修正します。",
    fullDescription: "すでに存在する言葉を上書きします。存在しない言葉は登録できません（$add を使用してください）",
    usage: "単語　ランダムに 返答 したい 言葉",
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
                // TODO 複数登録
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
