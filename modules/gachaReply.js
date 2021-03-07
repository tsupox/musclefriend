const fs = require("fs");
const moment = require("moment");
const randomReply = require('./randomReply.js');
const dataFile = './data/gachaReply.json';

let gachaReply = {
    database: null,

    init: () => {
        gachaReply.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getList: () => {
        return gachaReply.database;
    },

    getReply: () => {
        return randomReply.getRandom(gachaReply.database);
    },

    addCommand: (args) => {
        //insert
        console.log('add gacha: ' + args.join(' '))

        args.forEach((a, i) => {
            gachaReply.database.push(a);
        })
        //file write
        fs.writeFileSync(dataFile, JSON.stringify(gachaReply.database));
        return true;
    },

    deleteCommand: (args) => {
        //delete
        let exist = false;
        console.log('delete command: ' + args[0])

        gachaReply.database.forEach((c, i) => {
            if (args.join(" ").match(new RegExp("^" + c + "$"))) {
                gachaReply.database.splice(i, 1)
                exist = true;
            }
        });
        if (exist) fs.writeFileSync(dataFile, JSON.stringify(gachaReply.database));
        return exist
    },

    backupJson: () => {
        let now = moment();
        fs.writeFileSync(dataFile + "_" + now.format("YYYYMMDDHHmm"), JSON.stringify(gachaReply.database))
        //TODO: S3 バックアップ
    },

}

module.exports = gachaReply
