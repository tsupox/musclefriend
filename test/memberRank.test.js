const fs = require('fs')
const expect = require('chai').expect
// const mockedEnv = require('mocked-env')
// const mockDate = require('mockdate');
const memberRank = require('../modules/memberRank.js');
const { exception } = require('console');
const dataFile = './data/rank.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    memberRank.database =
    {
        "members": [
            {

                "id": "1",
                "name": "test2",
                "counter": 100
            },
            {
                "id": "2",
                "name": "test",
                "counter": 200
            }
        ]
    }
}
// TODO: (コメントも残したい)
describe('memberRank.js', () => {
    describe('getMember()', () => {
        it('id 指定　存在するとき', () => {
            setDatabase()
            let result = memberRank.getMember('2')  //id: 2
            expect(result.id).to.equal('2')
            expect(result.counter).to.equal(200)
        });
        it('id 指定　存在しないとき', () => {
            setDatabase()
            let result = memberRank.getMember('10')  //id: 10
            expect(result).to.equal(null)
        });
    });
    describe('getCounter()', () => {
        it('id 指定　存在するとき', () => {
            setDatabase()
            let result = memberRank.getCounter('2')  //id: 2
            expect(result).to.equal(200)
        });
        it('id 指定　存在しないとき', () => {
            setDatabase()
            let result = memberRank.getCounter('10')  //id: 10
            expect(result).to.equal(0)
        });
    });
    describe('increase()', () => {
        it('すでに存在するIDのカウントアップ', () => {
            setDatabase()
            let result = memberRank.increase('1', 'test1')  //id: 1
            // assert result
            expect(result).to.equal(101)
            // assert variable
            expect(memberRank.database.members[0].counter).to.equal(101)
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberRank.database)
        });
        it('存在しないIDのカウントアップ', () => {
            setDatabase()
            let result = memberRank.increase('200', 'test_add')  //id: 200
            // assert result
            expect(result).to.equal(1)
            // assert variable
            expect(memberRank.database.members[2].counter).to.equal(1)
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(memberRank.database)
        });
    });
    describe('backupJson()', () => {
        it('S3 & 同フォルダに json ファイルバックアップ', () => {
            setDatabase()
            let result = memberRank.backupJson()
            // assert result
            expect(result).to.be.string
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(result, "utf8"));
            expect(resultFile).to.deep.equals(memberRank.database)
        })
    })
});
