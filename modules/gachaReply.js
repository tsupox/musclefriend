require('dotenv').config();
const fs = require("fs");
const moment = require("moment");
const util = require('./util.js');
var AWS = require("aws-sdk");
const fileName = 'gachaReply.json';
const dataFile = './data/' + fileName;

AWS.config.apiVersions = {
    s3: '2006-03-01',
};


let gachaReply = {
    database: null,

    init: () => {
        gachaReply.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getList: () => {
        return gachaReply.database;
    },

    getReply: () => {
        return util.getRandom(gachaReply.database);
    },

    addCommand: (args) => {
        //insert
        console.log('add gacha: ' + args.join(' '))

        gachaReply.database.push(args.join(' '));

        //file write
        fs.writeFileSync(dataFile, JSON.stringify(gachaReply.database));
        return true;
    },

    deleteCommand: (args) => {
        //delete
        let exist = false;
        console.log('delete command: ' + args.join(' '))

        gachaReply.database.forEach((c, i) => {
            if (args.join(" ").match(new RegExp("^" + util.escapeRegExp(c) + "$"))) {
                gachaReply.database.splice(i, 1)
                exist = true;
            }
        });
        if (exist) fs.writeFileSync(dataFile, JSON.stringify(gachaReply.database));
        return exist
    },

    backupJson: () => {
        if (process.env.AWS_ACCESS_KEY_ID) {
            // S3 Backup
            let s3 = new AWS.S3();
            let params = {
                Body: JSON.stringify(gachaReply.database),
                Bucket: process.env.AWS_S3_BUCKET,
                Key: fileName,
            };
            s3.putObject(params, function (err, data) {
                if (err) console.log(err, err.stack);
            }).promise()
        }
        // 従来のバックアップ
        let now = moment();
        let backupFileName = dataFile + "_" + now.format("YYYYMMDDHHmm");
        fs.writeFileSync(backupFileName, JSON.stringify(gachaReply.database))

        //TODO: 一週間前のは削除

        return backupFileName;
    }

}

module.exports = gachaReply
