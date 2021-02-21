const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
const dataFile = './data/conversation.json';

module.exports = {
    database: null,

    init: () => {
        this.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getRandom: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    getList: () => {
        let list = [];
        this.database.commands.forEach((c) => {
            // list.push(`[${c.keyword}] - ${c.replyId}   ${this.database.replies[c.replyId]}`);
            list.push(`[${c.keyword}] - ${c.replyId}`);
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

    getWord: (keyword) => {
        let word = "";
        this.database.commands.forEach((c) => {
            if (keyword.match(new RegExp(c.keyword, 'g'))) {
                let replies = this.database.replies[c.replyId].split(",");
                word = module.exports.getRandom(replies);
            }
        });
        return word;
    },

    addCommand: (args) => {
        if (/\d/.test(args[1])) {
            // 引数が数字のみ - すでに存在するランダム返信へのコマンド追加
            console.log('add command but exist reply: ' + args.join(' '))

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