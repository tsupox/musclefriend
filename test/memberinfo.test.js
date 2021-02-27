const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const memberInfo = require('../memberInfo.js');
const dataFile = './data/result.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    memberInfo.database =
    {
        "members": [{
            "id": "1",
            "name:": "test",
            "type": "squat_30_easy",
            "start_date": "2021-02-14",
            "result": [
                { "date": "2021-02-14", "status": "done", "total": 20 },
                { "date": "2021-02-15", "status": "done", "total": 30 },
                { "date": "2021-02-20", "status": "done", "total": 40 },
                { "date": "2021-02-21", "status": "done", "total": 50 },
            ]
        }]
    }
}

describe('memberInfo.js', () => {
    describe('getToday()', () => {
        it('日付が 4:59 のときは昨日', () => {
            mockDate.set('2021-02-27 04:59')
            let result = memberInfo.getToday().format('YYYY-MM-DD')
            expect(result).to.equal('2021-02-26')
            mockDate.reset()
        });
        it('日付が 5:00 のときは今日', () => {
            mockDate.set('2021-02-27 05:00')
            let result = memberInfo.getToday().format('YYYY-MM-DD')
            expect(result).to.equal('2021-02-27')
            mockDate.reset()
        });
    });
    describe('getMember()', () => {
        it('id 指定　存在するとき', () => {
            setDatabase()
            let result = memberInfo.getMember('1')
            expect(result.id).to.equal('1')
            expect(result).to.have.property('type_detail')
        });
        it('id 指定　存在しないとき', () => {
            setDatabase()
            let result = memberInfo.getMember('2')
            expect(result).to.have.lengthOf(0)
        });
        it('id 指定　存在するとき - needTypeDetail = false', () => {
            setDatabase()
            let result = memberInfo.getMember('1', false)
            expect(result.id).to.equal('1')
            expect(result).to.not.have.property('type_detail')
        });
    });
    describe('getMemberInfo()', () => {
        it('結果取得', () => {
            setDatabase()
            let result = memberInfo.getMemberInfo('1')
            expect(result).to.equal("\nタイプ: スクワット30日チャレンジ (beginner)\n開始日: 2021-02-14\n" +
                "2021-02-14: 20回　2021-02-15: 30回　2021-02-20: 40回　\n" +
                "2021-02-21: 50回　\n" +
                "合計 140 回やりました！")
        });
    });
    describe('howMany()', () => {
        it('今日何回？', () => {
            setDatabase()
            mockDate.set('2021-02-27')
            let result = memberInfo.howMany(1)
            expect(result).to.equal('今日(2021/02/27) は 14 日目 85回です。がんばろう！')
            mockDate.reset()
        });
        it('明日何回？', () => {
            setDatabase()
            mockDate.set('2021-02-27')
            let result = memberInfo.howMany(1, 1)
            expect(result).to.equal('明日(2021/02/28) は 15 日目 90回です。がんばろう！')
            mockDate.reset()
        });

    });
    describe('addResult()', () => {
        it('新規登録', () => {
            setDatabase()
            mockDate.set('2021-02-19')
            let result = memberInfo.addResult(1, "90回終わりました")
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].result).to.have.lengthOf(5)
            expect(memberInfo.database.members[0].result[2]).to.deep.equal({ date: '2021-02-19', status: 'done', total: '90' })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)

            mockDate.reset()
        });
        it('上書き登録', () => {
            setDatabase()
            mockDate.set('2021-02-15')
            let result = memberInfo.addResult(1, "90回終わりました")
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].result).to.have.lengthOf(4)
            expect(memberInfo.database.members[0].result[1]).to.deep.equal({ date: '2021-02-15', status: 'done', total: '90' })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)
        });
    });
});
