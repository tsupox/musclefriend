const fs = require("fs");
const CakeHash = require("cake-hash");
const moment = require("moment");
const dataFile = './data/result.json';

const DAY_START_TIME = 5;

let memberInfo = {
    database: null,

    /** types */
    types: {
        "squat_30_easy": {
            name: "スクワット30日チャレンジ (beginner)",
            total: [20, 25, 30, null, 40, 45, 50, null, 60, 65, 70, null, 80, 85, 90, null, 100, 105, 110, null, 115, 120, 125, null, 130, 135, 140, null, 145, 150]
        },
        "squat_30_hard": {
            name: "スクワット30日チャレンジ (normal)",
            total: [50, 55, 60, null, 70, 75, 80, null, 100, 105, 115, null, 130, 135, 140, null, 150, 155, 160, null, 180, 185, 190, null, 220, 225, 230, null, 240, 250]
        },
        "squat_7_second": {
            name: "7秒スクワット",
        },
        "free": {
            name: "自由",
        }
    },

    init: () => {
        memberInfo.database = JSON.parse(fs.readFileSync(dataFile, "utf8"));
    },

    getToday: () => {
        let date = moment();
        if (date.hour() < DAY_START_TIME) {
            // 日付変更時間
            date = date.add(-1, 'days')
        }
        return moment(date.format('YYYY-MM-DD'))    // 時刻を 0 時にする（日付計算でおかしくなるため）
    },

    getMember: (id, needTypeDetail = true) => {
        //TODO ユーザーごとにファイルを変えるか別のデータベースにするか
        let member = CakeHash.extract(memberInfo.database, `members.{n}[id=${id}]`);
        if (member.length) {
            member = member[0];
            member.trainings.forEach((t, i) => {
                if (needTypeDetail && t.type != 'free') {
                    member.trainings[i]['type_detail'] = CakeHash.get(memberInfo.types, t.type);
                } else {
                    delete member.trainings[i].type_detail
                }
            })
        } else {
            member = null;
        }
        return member;
    },

    getMemberInfo: (id) => {
        let member = memberInfo.getMember(id)
        let text = '';
        member.trainings.forEach((t) => {
            text += `タイプ: ${t.type_detail ? t.type_detail.name : t.name}\n`;
            text += `開始日: ${t.start_date}\n`;

            let total = 0;
            t.result.forEach((r, i) => {
                if (r.status == 'done') {
                    text += `${r.date}: ${r.total}回　`;
                    if (i % 3 == 2 && i != (t.result.length - 1)) text += `\n`
                    if (r.total) total += (r.total * 1)
                }
            });
            text += `\n合計 ${total} 回やりました！\n--------------------------------\n`
        });
        return text;
    },

    howMany: (id, adjustment = 0) => {
        let member = memberInfo.getMember(id)
        let currentTraining = member.trainings.slice(-1)[0]
        if (currentTraining.type == 'free') {
            return 'このトレーニングは回数自由です。好きなだけがんばろう！'
        } else {
            let start = moment(currentTraining.start_date);
            let targetDate = memberInfo.getToday().add(adjustment, 'days')
            let diff = targetDate.diff(start, 'days')
            if (Array.isArray(currentTraining.type_detail.total) && currentTraining.type_detail.total.length > diff) {
                let num = currentTraining.type_detail.total[diff]
                return `${(adjustment == 1 ? '明日' : '今日')}(${targetDate.format('YYYY/MM/DD')}) は ${diff + 1} 日目 ` + (num ? num + " 回です。がんばろう！" : "おやすみです。しっかり休んでね")
            } else {
                return `${(adjustment == 1 ? '明日' : '今日')}(${targetDate.format('YYYY/MM/DD')}) は ${diff + 1} 日目なので ${currentTraining.type_detail.total.length} 日チャレンジ終了です！よくがんばったね。ぜひ新しいトレーニングを登録して継続してね。`
            }
        }
    },

    addResult: (id, msgContent, status = 'done') => {
        //TODO 昨日、今日、「日付」の結果登録
        let member = memberInfo.getMember(id, false)
        let currentTraining = member.trainings.slice(-1)[0]
        let num = msgContent.replace(/[^0-9]/g, '');
        let exists = false;

        let today = memberInfo.getToday()

        //checking whether today's result is already reported 
        currentTraining.result.forEach((r, i) => {
            let tmpDate = moment(r.date)
            if (today.diff(tmpDate, 'days') == 0) {
                currentTraining.result[i].total = num;
                currentTraining.result[i].memo += (' / ' + msgContent)
                exists = true;
            }
        })
        if (exists == false) {
            currentTraining.result.push({
                "date": today.format('YYYY-MM-DD'),
                "status": status,
                "total": num,
                "memo": msgContent
            })
        }
        currentTraining.result.sort((a, b) => {
            if (a.date > b.date) return 1
            if (a.date < b.date) return -1
            return 0
        });

        //overwrite
        member.trainings[member.trainings.length - 1] = currentTraining
        memberInfo.database.members.forEach((d, i) => {
            if (d.id == member.id) {
                memberInfo.database.members[i] = member;
            }
        })
        // file write
        fs.writeFileSync(dataFile, JSON.stringify(memberInfo.database));
        return true;
    },

    getTrainingTypes: () => {
        let text = '';
        Object.keys(memberInfo.types).forEach((typeId) => {
            let t = memberInfo.types[typeId]
            text += `- タイプ: ${typeId}   名前: ${t.name}\n`
        })
        return text
    },

    addNewTraining: (id, name, typeId, typeName) => {
        // validation
        if (!Object.keys(memberInfo.types).includes(typeId)) {
            return false
        }

        let member = memberInfo.getMember(id, false)

        // new member
        if (!member) {
            member = {
                "id": id,
                "name": name,
                "trainings": [
                ]
            }
        }

        let newTraining = {
            "type": typeId,
            "start_date": memberInfo.getToday().format('YYYY-MM-DD'),
            "result": [
            ]
        }
        if (typeId == "free") {
            newTraining["name"] = typeName
        } else {
            let typeDetail = CakeHash.get(memberInfo.types, typeId)
            newTraining["name"] = typeDetail.name
        }
        member.trainings.push(newTraining)

        //overwrite
        let exists = false
        memberInfo.database.members.forEach((d, i) => {
            if (d.id == member.id) {
                memberInfo.database.members[i] = member;
                exists = true
            }
        })
        if (!exists) {
            memberInfo.database.members.push(member)
        }

        // file write
        fs.writeFileSync(dataFile, JSON.stringify(memberInfo.database));
        return true;
    },

    getTodaysResults: () => {
        let today = memberInfo.getToday()
        let todaysResult = []

        memberInfo.database.members.forEach((d, i) => {

            let currentTraining = d.trainings.slice(-1)[0]
            let lastResult = currentTraining.result.slice(-1)[0]

            let m = { id: d.id, name: d.name, result: "not yet", typeName: currentTraining.name, last3days: currentTraining.result.slice(-3) }
            if (lastResult.date == today.format('YYYY-MM-DD')) {
                if (lastResult.status == 'done') {
                    m.result = 'done'
                } else if (lastResult == 'off') {
                    m.result = 'off'
                }
            }
            todaysResult.push(m)
        })
        return todaysResult
    },

    setTodayOff: (id, msgContent) => {
        return memberInfo.addResult(id, msgContent, 'off')
    },

    //TODO delete result
    //TODO list everyone's result

    backupJson: () => {
        let now = moment();
        fs.writeFileSync(dataFile + "_" + now.format("YYYYMMDDHHmm"), JSON.stringify(memberInfo.database))
        //TODO: S3 バックアップ

        //TODO: 一週間前のは削除
    },
}

module.exports = memberInfo;
