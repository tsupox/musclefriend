const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
const dataFile = './data/result.json';

module.exports = {
    database: null,

    /** types */
    types: {
        "squat_30_easy": {
            name: "スクワット30日チャレンジ (beginner)",
            limit_date: 30,
            total: [20, 25, 30, null, 40, 45, 50, null, 60, 65, 70, null, 80, 85, 90, null, 100, 105, 110, null, 115, 120, 125, null, 130, 135, 140, null, 145, 150]
        },
        "squat_30_hard": {
            name: "スクワット30日チャレンジ (normal)",
            limit_date: 30,
            total: [50, 55, 60, null, 70, 75, 80, null, 100, 105, 115, null, 130, 135, 140, null, 150, 155, 160, null, 180, 185, 190, null, 220, 225, 230, null, 240, 250]
        },
        "squat_7_second": {
            name: "7秒スクワット",
            limit_date: 0,
            total: 30
        },
        "abs_roller": {
            name: "腹筋ローラー",
            limit_date: 0,
            total: 100
        }
    },

    init: () => {
        this.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getToday: (arg) => {
        let date = moment(arg);
        if (date.hour() < process.env.DAY_START_TIME) {
            // 日付変更時間
            date = date.add(-1, 'days')
        }
        return moment(date.format('YYYY-MM-DD'))    // 時刻を 0 時にする（日付計算でおかしくなるため９
    },

    getMember: (id, needTypeDetail = true) => {
        let member = CakeHash.extract(this.database, `members.{n}[id=${id}]`);
        if (member.length) {
            member = member[0];
            if (needTypeDetail) member['type_detail'] = CakeHash.get(module.exports.types, member.type);
        }
        return member;
    },

    getMemberInfo: (id) => {
        let member = module.exports.getMember(id)
        let text = `
タイプ: ${member.type_detail.name}
開始日: ${member.start_date}
`;
        let total = 0;
        member.result.forEach((r, i) => {
            text += `${r.date}: ${r.total}回　`;
            if (i % 3 == 2 && i != (member.result.length - 1)) text += `\n`
            if (r.total) total += (r.total * 1)
        });
        text += `\n合計 ${total} 回やりました！`
        return text;
    },

    howMany: (id, adjustment = 0) => {
        let member = module.exports.getMember(id)
        let start = moment(member.start_date);
        let targetDate = module.exports.getToday().add(adjustment, 'days')
        let diff = targetDate.diff(start, 'days')
        let num = (Array.isArray(member.type_detail.total) && member.type_detail.total.length > diff) ? member.type_detail.total[diff] : member.type_detail.total;
        return `${(adjustment == 1 ? '明日' : '今日')}(${targetDate.format('YYYY/MM/DD')}) は ${diff + 1} 日目 ` + (num ? num + "回です。がんばろう！" : "おやすみです。しっかり休んでね")
    },

    addResult: (id, msg_content) => {
        let member = module.exports.getMember(id, false)
        let num = msg_content.replace(/[^0-9]/g, '');
        let exists = false;

        let today = module.exports.getToday()
        member.result.forEach((r, i) => {
            let tmpDate = moment(r.date)
            if (today.diff(tmpDate, 'days') == 0) {
                member.result[i].total = num;
                exists = true;
            }
        })
        if (exists == false) {
            member.result.push({
                "date": today.format('YYYY-MM-DD'),
                "status": "done",
                "total": num
            })
        }
        member.result.sort((a, b) => {
            if (a.date > b.date) return 1
            if (a.date < b.date) return -1
            return 0
        });
        this.database.members.forEach((d, i) => {
            if (d.id == member.id) {
                this.database.members[i] = member;
            }
        })
        // file write
        fs.writeFileSync(dataFile, JSON.stringify(this.database));
        return true;
    },

    //TODO delete result
    //TODO list everyone's result

    backupJson: () => {
        let now = moment();
        fs.writeFileSync(dataFile + "_" + now.format("YYYYMMDDHHmm"), JSON.stringify(this.database))
        //TODO: S3 バックアップ
    },
}