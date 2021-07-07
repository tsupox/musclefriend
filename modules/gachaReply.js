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
        let aws_config = { access_key: process.env.AWS_ACCESS_KEY_ID, s3_bucket: process.env.AWS_S3_BUCKET }
        return util.backupJson(gachaReply.database, fileName, dataFile, aws_config)
    },

}

module.exports = gachaReply
