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
const util = require('./modules/util.js');
const randomReply = require('./modules/randomReply.js');
const memberInfo = require('./modules/memberInfo.js');
const gachaReply = require('./modules/gachaReply.js');

/** token */
const token = process.env.BOT_TOKEN;
/** bot */
const bot = new Eris.CommandClient(token, {}, {
    prefix: "$"
});

/** BOT Client ID */
const bot_id = process.env.BOT_USER_ID;

/** admins (not use) */
const ADMINS = process.env.ADMINS.split(' ');

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

// **************
// ランダム返信用コマンド
// **************
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

// **************
// ネガポジスコア確認用コマンド
// **************
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

// **************
// ガチャ言葉用コマンド
// **************
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

// **************
// トレーニング開始登録用コマンド
// **************
bot.registerCommand("trainingadd", (msg, args) => {
    //id, name, typeId, typeName) => {
    if (args.length >= 1) {
        if (args.length == 1) {
            args.push('トレーニング')
        }
        const typeName = args.splice(1).join('')
        let result = memberInfo.addNewTraining(msg.author.id, msg.author.username, args[0], typeName)
        if (result) {
            msg.addReaction('⭕');
        } else {
            msg.addReaction('✖')
            return `<@!${msg.author.id}> ` + "`使い方: [$trainingadd トレーニングタイプ（以下から選択）　トレーニング名]　\n" + memberInfo.getTrainingTypes() + "`"
        }

    } else {
        //引数なし
        msg.addReaction('✖')
        return `<@!${msg.author.id}> ` + "`使い方: [$trainingadd トレーニングタイプ（以下から選択）　トレーニング名（free の場合のみ)]　\n" + memberInfo.getTrainingTypes() + "`"
    }
}, {
    argsRequired: true,
    description: "トレーニング開始を申告します。",
    fullDescription: "新しいトレーニング開始を申告します。",
    usage: "トレーニングタイプ　トレーニング名称（free の場合のみ)",
    reactionButtonTimeout: 600000,
    reactionButtons: [
        deleteCommandResult
    ],
});



// BOT からメッセージ送信
const sendMessage = (channelId, message, sleepTime) => {
    if (sleepTime == null) sleepTime = (Math.floor(Math.random() * 7) + 3.5) * 100; //ms

    bot.sendChannelTyping(channelId).then(() => {
        return util.sleep(sleepTime)
    }).then(() => {
        bot.createMessage(channelId, message)
    })
}

// トレーニングチェック
let checkDoneOrNot = (randomWords) => {
    sendMessage(process.env.TWEET_ROOM, randomReply.getRandom(randomWords))
    let todaysResults = memberInfo.getTodaysResults()
    util.sleep(3000).then(() => {
        todaysResults.forEach(async (tr) => {
            if (tr.result == 'not yet') {
                bot.getDMChannel(tr.id).then((privateChannel) => {
                    bot.createMessage(privateChannel.id,
                        `${tr.name}さん、まだ今日は ${tr.typeName} やってないみたいだけど、やらないの？\n今日はやらない日なら「今日はお休み」って教えてね。詳細結果は「結果」と聞いてね`
                    )
                }, () => {
                    console.log(`DM Channel 取得失敗 [id: ${tr.id}]`)
                })
            }
        })
    })
}

/********************
 *  ready
 ********************/
bot.on("ready", () => {
    memberInfo.init();
    randomReply.init();
    gachaReply.init();
    console.log("Ready...");

    // トレーニング状況確認＆はっぱかけ
    let checkTime = process.env.CHECK_TRAINING_TIME;
    if (checkTime && /^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(checkTime)) {
        let ct = checkTime.split(':')
        cron.schedule(`${ct[2]} ${ct[1]} ${ct[0]} * * *`, () => {
            let randomWords = ['そろそろチェックの時間かなー', 'あ、時間だ', 'さーてそろそろ確認しまーす', 'ちぇっくちぇっく', '確認するよー', '今日も順調かな？', '今日はみんなやってるかなぁ', 'さて…']
            checkDoneOrNot(randomWords)
        })
    }
});

/********************
 * 誰かの発言時
 ********************/
bot.on("messageCreate", async msg => {
    if (!msg.author.bot) {
        // BOT 以外

        if (msg.content.substring(0, 1) !== '$') {
            // コマンド以外

            let mention = msg.mentions.length > 0 && msg.mentions[0].id === bot_id;
            let privateMsg = msg.channel.hasOwnProperty('recipient');

            let content = msg.content;
            if (mention) {
                //botへのメンションに反応
                content = msg.content.replace(`<@!${msg.mentions[0].id}>`, '').replace(`<@${msg.mentions[0].id}>`, '').trim()
            }

            //DM かメンションのみ
            if (mention || privateMsg) {
                //結果
                if (content.match(/(?:結果)/g)) {
                    sendMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id, mention == true))   // メンションのときは今の結果のみ
                }

                //今日何回
                else if (content.match(/(?:何回)/g)) {
                    let adjustment = content.match(/明日/) ? 1 : 0;
                    sendMessage(msg.channel.id, memberInfo.howMany(msg.author.id, adjustment))
                }

                //今日はお休み
                else if (content.match(/(?:今日|きょう)はお?(?:休み|やすみ)/g)) {
                    memberInfo.setTodayOff(msg.author.id, content)
                    sendMessage(msg.channel.id, randomReply.getRandom(['わかった', 'しっかりやすんでね～', '了解～', 'おっけー', 'OK!', ':ok_hand:', ':man_gesturing_ok: ']))
                }

                //ランダム返信
                else {
                    randomReply.getReply(content).then((reply) => {
                        if (reply.emoji) {
                            util.sleep(200).then(() => {
                                msg.addReaction(reply.emoji);
                            })
                        }
                        sendMessage(msg.channel.id, reply.word)
                    })
                }

                //おわったー
                if (content.match(/(?:やった|おわった|done|おわり|やりました|終わ)/g) && !content.match(/仕事/g)) {
                    let awesomeReactions = ["✨", "💯", "🎉", "👏"];
                    msg.addReaction(randomReply.getRandom(awesomeReactions));

                    //回数登録
                    memberInfo.addResult(msg.author.id, content)
                    sendMessage(msg.channel.id, memberInfo.getMemberInfo(msg.author.id))
                }
            }

            else {
                // チャンネルのときのみ

                // 勝手に反応
                if (msg.content.match(/^草$/)) {
                    if (Math.random() < 0.2) sendMessage(msg.channel.id, "草");
                } else if (msg.content.match(/^えらい！/)) {
                    if (Math.random() < 0.2) sendMessage(msg.channel.id, "えらい！");
                } else if (msg.content.match(/(?:ｗ|（笑）|\(笑\))/g)) {
                    if (Math.random() < 0.2) sendMessage(msg.channel.id, "ｗｗｗ");
                } else {
                    if (Math.random() < 0.01) sendMessage(msg.channel.id, gachaReply.getReply());
                }
            }

        }
    }
});

// バックアップ
cron.schedule('0 0 0,12 * * *', memberInfo.backupJson);
cron.schedule('0 0 0,12 * * *', randomReply.backupJson);
cron.schedule('0 0 0,12 * * *', gachaReply.backupJson);


// Discord に接続します。
bot.connect();
