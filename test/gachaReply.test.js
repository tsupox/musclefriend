const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const gachaReply = require('../modules/gachaReply.js');
const dataFile = './data/gachaReply.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    gachaReply.database = [
        "テスト1", "テスト2", "テスト3", "([.]*.)"
    ]
}

describe('gachaReply.js', () => {
    describe('getList()', () => {
        it('登録ガチャ言葉一覧取得', () => {
            setDatabase()
            let result = gachaReply.getList()
            expect(result).to.have.deep.equals(["テスト1", "テスト2", "テスト3", "([.]*.)"])
        });
    });
    describe('getReply()', () => {
        it('登録済みのガチャ言葉', () => {
            setDatabase()
            let result = gachaReply.getReply()
            expect(result).to.be.oneOf(["テスト1", "テスト2", "テスト3", "([.]*.)"])
        });
    });
    describe('addCommand()', () => {
        it('ガチャ言葉登録 - 新規登録', () => {
            setDatabase()
            let gachaLength = gachaReply.database.length

            let result = gachaReply.addCommand(["テストテスト", "テストー"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(gachaReply.database).to.have.lengthOf(gachaLength + 1)
            console.log(gachaReply.database)
            expect(gachaReply.database[gachaLength]).to.deep.equal("テストテスト テストー")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(gachaReply.database)
        });
    });
    describe('deleteCommand()', () => {
        it('ガチャ言葉削除 - 言葉が存在する場合', () => {
            setDatabase()
            let gachaLength = gachaReply.database.length

            let result = gachaReply.deleteCommand(["テスト2"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(gachaReply.database).to.have.lengthOf(gachaLength - 1)
            expect(gachaReply.database[1]).to.not.deep.equal("テスト2")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(gachaReply.database)
        });
        it('ガチャ言葉削除 - エスケープが必要な文字', () => {
            setDatabase()
            let gachaLength = gachaReply.database.length

            let result = gachaReply.deleteCommand(["([.]*.)"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(gachaReply.database).to.have.lengthOf(gachaLength - 1)
            expect(gachaReply.database[1]).to.not.deep.equal("([.]*.)")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(gachaReply.database)
        });
        it('ガチャ言葉削除 - 言葉が存在しない場合', () => {
            setDatabase()
            let gachaLength = gachaReply.database.length

            let result = gachaReply.deleteCommand(["存在しない言葉"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(gachaReply.database).to.have.lengthOf(gachaLength)
        });
    });
    describe('backupJson()', () => {
        it('S3 & 同フォルダに json ファイルバックアップ', () => {
            setDatabase()
            let result = gachaReply.backupJson()
            // assert result
            expect(result).to.be.string
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(result, "utf8"));
            expect(resultFile).to.deep.equals(gachaReply.database)
        })
    })
});