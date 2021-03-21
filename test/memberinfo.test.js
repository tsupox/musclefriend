const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const memberInfo = require('../modules/memberInfo.js');
const { exception } = require('console');
const dataFile = './data/result.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    memberInfo.database =
    {
        "members": [
            {

                "id": "1",
                "name": "test2",
                "trainings": [
                    {
                        "type": "squat_30_easy",
                        "name": "スクワット30日チャレンジ (normal)",
                        "start_date": "2021-02-14",
                        "result": [
                            { "date": "2021-02-14", "status": "done", "total": 20 },
                            { "date": "2021-02-15", "status": "done", "total": 30, "memo": "30 done" },
                            { "date": "2021-02-16", "status": "off", "total": null, "memo": "今日はお休み" },
                            { "date": "2021-02-20", "status": "done", "total": "40", "memo": "40回おわったー" },
                            { "date": "2021-02-21", "status": "done", "total": "50", "memo": "50 done!" },
                        ]
                    }
                ]
            },
            {
                "id": "2",
                "name": "test",
                "regularCheck": false,
                "trainings": [
                    {
                        "type": "squat_30_easy",
                        "name": "スクワット30日チャレンジ (normal)",
                        "start_date": "2021-02-14",
                        "result": [
                            { "date": "2021-02-14", "status": "done", "total": 20 },
                            { "date": "2021-02-15", "status": "done", "total": 30 },
                            { "date": "2021-02-20", "status": "done", "total": "40" },
                            { "date": "2021-02-21", "status": "done", "total": "50" },
                        ]
                    },
                    {
                        "type": "free",
                        "name": "なわとび",
                        "start_date": "2021-02-22",
                        "result": [
                            { "date": "2021-02-22", "status": "done", "total": "8" },
                            { "date": "2021-02-23", "status": "done", "total": "" },
                        ]
                    }
                ]
            },
        ]
    }
}
// TODO: (コメントも残したい)
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
            let result = memberInfo.getMember('2')  //id: 2 
            expect(result.id).to.equal('2')
            expect(result.trainings[0]).to.have.property('type_detail')
            expect(result.trainings[1]).to.not.have.property('type_detail')
        });
        it('id 指定　存在しないとき', () => {
            setDatabase()
            let result = memberInfo.getMember('10')  //id: 10
            expect(result).to.equal(null)
        });
        it('id 指定　存在するとき - needTypeDetail = false', () => {
            setDatabase()
            let result = memberInfo.getMember('2', false)  //id: 2
            expect(result.id).to.equal('2')
            expect(result.trainings[0]).to.not.have.property('type_detail')
            expect(result.trainings[1]).to.not.have.property('type_detail')
        });
    });
    describe('getMemberInfo()', () => {
        it('結果取得', () => {
            setDatabase()
            let result = memberInfo.getMemberInfo('2')  //id: 2 
            expect(result).to.equal(
                `タイプ: スクワット30日チャレンジ (beginner)
開始日: 2021-02-14
2021-02-14: 20回　2021-02-15: 30回　2021-02-20: 40回　
2021-02-21: 50回　
合計 140 回やりました！
--------------------------------
タイプ: なわとび
開始日: 2021-02-22
2021-02-22: 8回　2021-02-23: 回　
合計 8 回やりました！
--------------------------------
`
            )
        });
        it('今のトレーニングのみの結果取得', () => {
            setDatabase()
            let result = memberInfo.getMemberInfo('2', true)  //id: 2 
            expect(result).to.equal(
                `タイプ: なわとび
開始日: 2021-02-22
2021-02-22: 8回　2021-02-23: 回　
合計 8 回やりました！
--------------------------------
`
            )
        });
    });
    describe('howMany()', () => {
        it('今日何回？', () => {
            setDatabase()
            mockDate.set('2021-02-27')
            let result = memberInfo.howMany('1')  //id: 1
            expect(result).to.equal('今日(2021/02/27) は 14 日目 85 回です。がんばろう！')
            mockDate.reset()
        });
        it('明日何回？', () => {
            setDatabase()
            mockDate.set('2021-02-27')
            let result = memberInfo.howMany('1', 1)  //id: 1
            expect(result).to.equal('明日(2021/02/28) は 15 日目 90 回です。がんばろう！')
            mockDate.reset()
        });
        it('今日何回？ - 30 日チャレンジ終了後', () => {
            setDatabase()
            mockDate.set('2021-03-16')
            let result = memberInfo.howMany('1')  //id: 1
            expect(result).to.equal('今日(2021/03/16) は 31 日目なので 30 日チャレンジ終了です！よくがんばったね。ぜひ新しいトレーニングを登録して継続してね。')
            mockDate.reset()
        });
        it('今日何回？ - 対応してない', () => {
            setDatabase()
            mockDate.set('2021-02-27')
            let result = memberInfo.howMany('2')  //id: 2 
            expect(result).to.equal('このトレーニングは回数自由です。好きなだけがんばろう！')
            mockDate.reset()
        });

    });
    describe('addResult()', () => {
        it('その日初めての登録', () => {
            setDatabase()
            mockDate.set('2021-02-19')
            let result = memberInfo.addResult('1', "90回終わりました")  //id: 1
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result).to.have.lengthOf(6)
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result[3]).to.deep.equal({ date: '2021-02-19', status: 'done', total: '90', memo: '90回終わりました' })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)

            mockDate.reset()
        });
        it('上書き登録', () => {
            setDatabase()
            mockDate.set('2021-02-15')
            let result = memberInfo.addResult('1', "90回終わりました")  //id: 1
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result).to.have.lengthOf(5)
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result[1]).to.deep.equal({ date: '2021-02-15', status: 'done', total: '90', memo: '30 done / 90回終わりました' })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)
        });
    });
    describe('getTrainingTypes()', () => {
        it('トレーニングタイプ取得', () => {
            let result = memberInfo.getTrainingTypes()
            expect(result).to.equal(
                `- タイプ: squat_30_easy   名前: スクワット30日チャレンジ (beginner)
- タイプ: squat_30_hard   名前: スクワット30日チャレンジ (normal)
- タイプ: squat_7_second   名前: 7秒スクワット
- タイプ: free   名前: 自由
`
            )

        });
    });
    describe('addNewTraining()', () => {
        it('対象外のトレーニングタイプ', () => {
            let result = memberInfo.addNewTraining('3', 'new_member', 'test', 'テスト')
            expect(result).to.be.false
            expect(memberInfo.database.members.slice(-1)[0].id).to.not.equal("3")
        });
        it('新規メンバーのトレーニング登録 / 30日チャレンジ', () => {
            setDatabase()
            mockDate.set('2021-03-12')
            let result = memberInfo.addNewTraining('3', 'new_member', 'squat_30_hard', 'テスト')
            expect(result).to.be.true
            expect(memberInfo.database.members).to.have.lengthOf(3)
            expect(memberInfo.database.members.slice(-1)[0]).to.deep.equal(
                {
                    "id": "3",
                    "name": "new_member",
                    "trainings": [
                        {
                            "name": "スクワット30日チャレンジ (normal)",
                            "type": "squat_30_hard",
                            "start_date": "2021-03-12",
                            "result": []
                        }
                    ]
                }
            )
            mockDate.reset()
        });
        it('既存メンバーの新しいトレーニング登録 / free', () => {
            setDatabase()
            mockDate.set('2021-03-12')
            let result = memberInfo.addNewTraining('2', 'test2', 'free', '新しいトレーニング')
            expect(result).to.be.true
            expect(memberInfo.database.members).to.have.lengthOf(2)
            expect(memberInfo.database.members[1].trainings).to.have.lengthOf(3)
            expect(memberInfo.database.members[1].trainings.slice(-1)[0]).to.deep.equal(
                {
                    "type": "free",
                    "start_date": "2021-03-12",
                    "result": [],
                    "name": "新しいトレーニング"
                }
            )
            mockDate.reset()
        });
    });
    describe('getTodaysResults()', () => {
        it('今日の全員の結果取得', () => {
            setDatabase()
            mockDate.set('2021-02-23')
            let result = memberInfo.getTodaysResults()
            expect(result).to.deep.equal([
                {
                    id: '1',
                    name: 'test2',
                    result: 'not yet',
                    typeName: 'スクワット30日チャレンジ (normal)',
                    regularCheck: true  //要素がない場合は true で返却
                },
                {
                    id: '2',
                    name: 'test',
                    result: 'done',
                    typeName: 'なわとび',
                    regularCheck: false
                }]
            );
        });
        it('off の確認', () => {
            setDatabase()
            mockDate.set('2021-02-23')
            memberInfo.setTodayOff('1', "今日はお休み")  //id: 1
            let result = memberInfo.getTodaysResults()
            expect(result).to.deep.equal([
                {
                    id: '1',
                    name: 'test2',
                    result: 'off',
                    typeName: 'スクワット30日チャレンジ (normal)',
                    regularCheck: true
                },
                {
                    id: '2',
                    name: 'test',
                    result: 'done',
                    typeName: 'なわとび',
                    regularCheck: false
                }]
            );
        });
    });
    describe('setTodayOff()', () => {
        it('今日はやらない宣言', () => {
            setDatabase()
            mockDate.set('2021-02-19')
            let result = memberInfo.setTodayOff('1', "今日はお休み")  //id: 1
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result).to.have.lengthOf(6)
            expect(memberInfo.database.members[0].trainings.slice(-1)[0].result[3]).to.deep.equal({ date: '2021-02-19', status: 'off', total: '', memo: '今日はお休み' })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)

            mockDate.reset()
        });
    })
    describe('setRegularCheckOnOff()', () => {
        it('今後の定期チェックは不要です', () => {
            setDatabase()
            let result = memberInfo.setRegularCheckOnOff('1', false)  //id: 1
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].regularCheck).to.be.false
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)
        });
        it('今後の定期チェックをお願いします', () => {
            setDatabase()
            let result = memberInfo.setRegularCheckOnOff('1', true)  //id: 1
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(memberInfo.database.members[0].regularCheck).to.be.true
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberInfo.database)
        });
    })
});
