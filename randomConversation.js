const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
// -- 言語解析
const kuromojin = require('kuromojin');
const negaposiAnalyzer = require('negaposi-analyzer-ja');

const dataFile = './data/conversation.json';

let database = null;
let replies = {
    normal: [
        "なんかいった？", "(・_・)？", "ごめん聞いてなかった", "なんて？", "はーい",
        "それは知らない", "わかんない", "えー？！", "ふむふむ？", "うーんと", "それで？",
        "なるほど", "どういうこと？", `...？！`, "へぇ", "ふーん", "(゜∀。)", "(・∀・)", "(｡>﹏<｡)"
    ],
    positive: [
        "それはすごい", "それほんとそう", "さっすが！", "知らなかった", "すごいね～", "すごーい", "センスいいね～", "そうなんだ", "そっか", "ほう？",
        "なるほど", "うんうん", "ほぅほぅ", "すごいね", "はーい", "(*´ω｀*)", "(；´Д｀)", "たしかに",
    ],
    negative: [
        "ひぃ", "そり", "それはひどい", "ご愁傷さまです", "なむなむ", "そうだよねぇ", "つらい", "( ；∀；)", "＼(^o^)／", "｡ﾟ(ﾟ´Д｀ﾟ)ﾟ｡", "(；´Д｀)", "( T_T)＼(^-^ )",
    ],
    answer: [
        "はい", "うん", "うーん", "いいえ", "どうだろう", "他の人にも聞いて見て", "わかんない", "(・_・)？", "ちょっとだけ", "はい", "うぃ", "知らなかった", ""
    ]
};

//TODO UT いるな・・・
module.exports = {

    init: () => {
        this.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
        this.replies = replies;
    },

    getRandom: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    getList: () => {
        let list = [];
        this.database.commands.forEach((c) => {
            // list.push(`[${c.keyword}] - ${c.replyId}   ${this.database.replies[c.replyId]}`);
            list.push(`[${c.keyword}] - ${c.replyId}`); //TODO list は多くなってきたので DM に変更
        });
        return list;
    },

    getDetail: (keyword) => {
        let text = "";
        this.database.commands.forEach((c) => {
            if (keyword.match(new RegExp(c.keyword, 'g'))) {
                text = `[${c.keyword}] - ${c.replyId}   ${this.database.replies[c.replyId]}`;
            }
        });
        return text;
    },

    existCommand: (keyword) => {
        let commands = CakeHash.extract(this.database.commands, '{n}.keyword');
        let result = keyword.match(new RegExp(commands.join('|'), 'g'))
        return result !== null;
    },

    getNegaPosiPoint: async (text) => {
        // +:positive -:negative
        let score = await kuromojin.tokenize(text).then((token) => {
            const score = negaposiAnalyzer(token);
            return score;
        });
        return score;
    },

    getWord: async (keyword) => {
        let word = "";

        if (module.exports.existCommand(keyword)) {
            // 登録済みの言葉
            this.database.commands.forEach((c) => {
                if (keyword.match(new RegExp(c.keyword, 'g'))) {
                    let replies = this.database.replies[c.replyId].split(",");
                    word = module.exports.getRandom(replies);
                }
            });
        }

        if (word == "") {
            // 取れなかったとき
            let wordList = this.replies.normal;
            if (keyword.match(/(?:？|\?)$/g)) {
                // question
                wordList = wordList.concat(this.replies.answer)
            } else {
                // 取れなかったときはネガポジ判断をして登録
                let point = await module.exports.getNegaPosiPoint(keyword);
                console.log(`${point}  ${keyword}`)
                if (point != 0) {
                    let negaPoji = point > 0 ? 'positive' : 'negative';
                    wordList = wordList.concat(this.replies[negaPoji])
                }
            }
            word = module.exports.getRandom(wordList);
        }
        return word;
    },

    addCommand: (args) => {
        if (/\d/.test(args[1])) {
            // 引数が数字のみ - すでに存在するランダム返信へのコマンド追加
            console.log('add command but exist reply: ' + args.join(' '))   //TODO 監査ログに変更（他も全部）

            let randomReplyId = args[1].trim()
            if (this.database.replies[randomReplyId] === undefined) {
                // 存在しないランダム返信
                return false;
            }
            //コマンド
            let save = {
                keyword: args[0],
                replyId: randomReplyId
            };
            this.database.commands.push(save);

        } else if (!module.exports.existCommand(args[0])) {
            //insert
            console.log('add command: ' + args.join(' '))

            //ランダム返信
            this.database.replies.push(args[1]);
            //コマンド
            let save = {
                keyword: args[0],
                replyId: this.database.replies.length - 1
            };
            this.database.commands.push(save);

        } else {
            //edit reply
            console.log('edit reply: ' + args.join(' '))

            this.database.commands.forEach((c) => {
                if (args[0].match(new RegExp(c.keyword))) {
                    //ランダム返信
                    this.database.replies[c.replyId] = args[1];
                }
            });
        }
        //file write
        fs.writeFileSync(dataFile, JSON.stringify(this.database));
        return true;
    },

    deleteCommand: (args) => {
        if (module.exports.existCommand(args[0])) {
            //delete
            console.log('delete command: ' + args.join(' '))

            this.database.commands.forEach((c, i) => {
                if (args[0].match(new RegExp(c.keyword))) {
                    this.database.commands.splice(i, 1)
                }
            });
            fs.writeFileSync(dataFile, JSON.stringify(this.database));
            return true;
        } else {
            return false;
        }
    },

    backupJson: () => {
        let now = moment();
        fs.writeFileSync(dataFile + "_" + now.format("YYYYMMDDHHmm"), JSON.stringify(this.database))
        //TODO: S3 バックアップ
    },

}