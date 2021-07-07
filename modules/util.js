var AWS = require("aws-sdk");
const moment = require("moment");
const fs = require("fs");

AWS.config.apiVersions = {
    s3: '2006-03-01',
};

module.exports = {
    escapeRegExp: (str) => {
        var reRegExp = /[\\^$.*+?()[\]{}|]/g,
            reHasRegExp = new RegExp(reRegExp.source);

        return (str && reHasRegExp.test(str)) ? str.replace(reRegExp, '\\$&') : str;
    },

    sleep: (time) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },

    getRandom: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },

    backupJson: (jsonData, fileName, dataFile, aws_config) => {
        if (aws_config != null && aws_config.access_key) {
            // S3 Backup
            let s3 = new AWS.S3();
            let params = {
                Body: JSON.stringify(jsonData),
                Bucket: aws_config.s3_bucket,
                Key: fileName,
            };
            s3.putObject(params, function (err, data) {
                if (err) console.log(err, err.stack);
            }).promise()
        }
        // 従来のバックアップ
        let now = moment();
        let backupFileName = dataFile + "_" + now.format("YYYYMMDDHHmm");
        fs.writeFileSync(backupFileName, JSON.stringify(jsonData))

        //TODO: 一週間前のは削除

        return backupFileName;
    },
}
