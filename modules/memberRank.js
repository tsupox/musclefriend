require('dotenv').config();
const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
const util = require('./util');
const fileName = 'rank.json';
const dataFile = './data/' + fileName;

const DAY_START_TIME = 5;

//TODO 全体的にサーバーIDを考慮しないとおかしくなりそう。

let memberRank = {
    database: null,

    init: () => {
        memberRank.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getMember: (userId) => {
        let member = CakeHash.extract(memberRank.database, `members.{n}[id=${userId}]`);

        if (member != null && member.length) {
            member = member[0];
        } else {
            member = null;
        }
        return member;
    },

    getCounter: (userId) => {
        let member = memberRank.getMember(userId)
        return member ? member.counter : 0
    },

    increase: (userId, name) => {
        let member = memberRank.getMember(userId)

        // new member
        if (!member) {
            member = {
                "id": userId,
                "name": name,
                "counter": 0
            }
            memberRank.database.members.push(member)
        }

        // increase
        member.counter++

        //overwrite
        memberRank.database.members.forEach((d, i) => {
            if (d.id == member.id) {
                memberRank.database.members[i] = member;
            }
        })
        // file write
        fs.writeFileSync(dataFile, JSON.stringify(memberRank.database));
        return member.counter;
    },

    backupJson: () => {
        let aws_config = { access_key: process.env.AWS_ACCESS_KEY_ID, s3_bucket: process.env.AWS_S3_BUCKET }
        return util.backupJson(memberRank.database, fileName, dataFile, aws_config)
    },
}

module.exports = memberRank;
