const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
// -- 言語解析
const kuromojin = require('kuromojin');
const negaposiAnalyzer = require('negaposi-analyzer-ja');

const dataFile = './data/conversation.json';

let randomConversation = {
    database: null,
    preparedReplies: {
        normal: [
            "なんかいった？", "(・_・)？", "ごめん聞いてなかった", "なんて？", "はーい",
            "それは知らない", "わかんない", "えー？！", "ふむふむ？", "うーんと", "それで？",
            "なるほど", "どういうこと？", `...？！`, "へぇ", "ふーん", "(・∀・)", "(｡>﹏<｡)"
        ],
        positive: [
            "それはすごい", "それほんとそう", "さっすが！", "知らなかった", "すごいね～", "すごーい", "センスいいね～", "そうなんだ", "そっか", "ほう？",
            "なるほど", "うんうん", "ほぅほぅ", "すごいね", "はーい", "(*´ω｀*)", "たしかに",
        ],
        negative: [
            "ひぃ", "そり", "それはひどい", "ご愁傷さまです", "なむなむ", "そうだよねぇ", "つらい", "( ；∀；)", "＼(^o^)／", "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡", "(；´Д｀)", "( T_T)＼(^-^ )", "(゜∀。)",
        ],
        answer: [
            "はい", "うん", "うーん", "いいえ", "どうだろう", "他の人にも聞いて見て", "わかんない", "(・_・)？", "ちょっとだけ", "はい", "うぃ", "知らない",
        ]
    },

    init: () => {
        randomConversation.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getRandom: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    getList: () => {
        let list = [];
        randomConversation.database.commands.forEach((c) => {
            // list.push(`[${c.keyword}] - ${c.replyId}   ${randomConversation.database.replies[c.replyId]}`);
            list.push(`[${c.keyword}] - ${c.replyId}`); //TODO list は多くなってきたので DM に変更
        });
        return list;
    },

    getDetail: (keyword) => {
        let text = "";
        randomConversation.database.commands.forEach((c) => {
            if (keyword.match(new RegExp(c.keyword, 'g'))) {
                text = `[${c.keyword}] - ${c.replyId}   ${randomConversation.database.replies[c.replyId]}`;
            }
        });
        return text;
    },

    existCommand: (keyword) => {
        let commands = CakeHash.extract(randomConversation.database.commands, '{n}.keyword');
        let result = keyword.match(new RegExp(commands.join('|'), 'g'))
        return result !== null;
    },

    getNegaPosiScore: async (text) => {
        // +:positive -:negative
        let score = await kuromojin.tokenize(text).then((token) => {
            const score = negaposiAnalyzer(token);
            return score;
        });
        return score;
    },

    getReply: async (keyword) => {
        let result = {
            word: "",
            emoji: "",
        }

        if (randomConversation.existCommand(keyword)) {
            // 登録済みの言葉
            randomConversation.database.commands.forEach((c) => {
                if (keyword.match(new RegExp(c.keyword, 'g'))) {
                    let replies = randomConversation.database.replies[c.replyId].split(",");
                    result.word = randomConversation.getRandom(replies);
                }
            });
        }

        if (result.word == "") {
            // 取れなかったとき
            let wordList = randomConversation.preparedReplies.normal;
            if (keyword.match(/(?:？|\?)$/g)) {
                // question
                wordList = randomConversation.preparedReplies.answer
            } else {
                // 取れなかったときはネガポジ判断をして登録
                let score = await randomConversation.getNegaPosiScore(keyword);
                console.log(`${score}  ${keyword}`)
                if (score != 0) {
                    let negaPoji = score > 0 ? 'positive' : 'negative';
                    result.emoji = score > 0 ? "😄" : "😟";
                    wordList = randomConversation.preparedReplies[negaPoji]
                } else {
                    result.emoji = "🙄" // 😐
                }
            }
            result.word = randomConversation.getRandom(wordList);
        }
        return result;
    },

    addCommand: (args) => {
        if (/^\d+$/.test(args[1])) {
            // 引数が数字のみ - すでに存在するランダム返信に対応する言葉追加
            console.log('add command but exist reply: ' + args.join(' '))   //TODO 監査ログに変更（他も全部）

            let randomReplyId = args[1].trim()
            if (randomConversation.database.replies[randomReplyId] === undefined) {
                // 存在しないランダム返信
                return false;
            }
            //コマンド
            let save = {
                keyword: args[0],
                replyId: randomReplyId
            };
            randomConversation.database.commands.push(save);

        } else if (!randomConversation.existCommand(args[0])) {
            //insert
            console.log('add command: ' + args.join(' '))

            //ランダム返信
            randomConversation.database.replies.push(args[1]);
            //コマンド
            let save = {
                keyword: args[0],
                replyId: randomConversation.database.replies.length - 1
            };
            randomConversation.database.commands.push(save);

        } else {
            //edit reply
            console.log('edit reply: ' + args.join(' '))

            randomConversation.database.commands.forEach((c) => {
                if (args[0].match(new RegExp(c.keyword))) {
                    //ランダム返信
                    randomConversation.database.replies[c.replyId] = args[1];
                }
            });
        }
        //file write
        fs.writeFileSync(dataFile, JSON.stringify(randomConversation.database));
        return true;
    },

    deleteCommand: (args) => {
        if (randomConversation.existCommand(args[0])) {
            //delete
            console.log('delete command: ' + args.join(' '))

            randomConversation.database.commands.forEach((c, i) => {
                if (args[0].match(new RegExp(c.keyword))) {
                    randomConversation.database.commands.splice(i, 1)
                }
            });
            fs.writeFileSync(dataFile, JSON.stringify(randomConversation.database));
            return true;
        } else {
            return false;
        }
    },

    backupJson: () => {
        let now = moment();
        fs.writeFileSync(dataFile + "_" + now.format("YYYYMMDDHHmm"), JSON.stringify(randomConversation.database))
        //TODO: S3 バックアップ
    },

}

module.exports = randomConversation
