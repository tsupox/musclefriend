const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const randomReply = require('../modules/randomReply.js');
const dataFile = './data/conversation.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    randomReply.database = {
        "replies": [
            "",
            "おはよー,よく寝れた？,おはよう！",
            "ねむいねー,ねちゃう？,ねていいよ,寝よ寝よ,寝ちゃおう",
            "おやすみなさいー,おやすみー,おやすみなさい,良い夢を,ゆっくり寝てね,また明日",
            "えらい！,さすが！,よくやった！,がんばったね,すばらしいっ,さいこー！",
            "おつかれさま。,おつかれー,おつおつ,おつー",
        ],
        "commands": [
            { "keyword": "おは", "replyId": 1 },
            { "keyword": "おきた", "replyId": 1 },
            { "keyword": "おきました", "replyId": 1 },
            { "keyword": "起き", "replyId": 1 },
            { "keyword": "ねむ", "replyId": 2 },
            { "keyword": "眠", "replyId": 2 },
            { "keyword": "おやすみ", "replyId": 3 },
            { "keyword": "ねる", "replyId": 3 },
            { "keyword": "寝る", "replyId": 3 },
            { "keyword": "やった", "replyId": 4 },
            { "keyword": "おわった", "replyId": 4 },
            { "keyword": "done", "replyId": 4 },
            { "keyword": "おわり", "replyId": 4 },
            { "keyword": "やりました", "replyId": 4 },
            { "keyword": "おわりました", "replyId": 4 },
            { "keyword": "疲", "replyId": 5 },
            { "keyword": "つかれた", "replyId": 5 },
        ]
    }
}

describe('randomReply.js', async () => {
    describe('getRandom()', () => {
        it('ランダム取得', () => {
            let result = randomReply.getRandom(['a', 'b', 'c', 'd', 'e'])
            expect(result).to.be.oneOf(['a', 'b', 'c', 'd', 'e'])
        });
    });
    describe('joinArgs()', () => {
        it('連結　引数が文字列', () => {
            let result = randomReply.joinArgs('aaa')
            expect(result).to.be.equal('aaa')
        });
        it('連結　引数が配列かつ全角カンマあり', () => {
            let result = randomReply.joinArgs(['a', 'b', 'c', 'd', 'e，f'])
            expect(result).to.be.equal('b,c,d,e,f')
        });

    });
    describe('getList()', () => {
        it('登録ランダム返信一覧取得', () => {
            setDatabase()
            let result = randomReply.getList()
            expect(result).to.have.deep.equals([
                "[おは] - 1",
                "[おきた] - 1",
                "[おきました] - 1",
                "[起き] - 1",
                "[ねむ] - 2",
                "[眠] - 2",
                "[おやすみ] - 3",
                "[ねる] - 3",
                "[寝る] - 3",
                "[やった] - 4",
                "[おわった] - 4",
                "[done] - 4",
                "[おわり] - 4",
                "[やりました] - 4",
                "[おわりました] - 4",
                "[疲] - 5",
                "[つかれた] - 5"
            ])
        });
    });
    describe('getDetail()', () => {
        it('登録ランダム返信詳細取得', () => {
            setDatabase()
            let result = randomReply.getDetail("起きた")
            expect(result).to.have.equals("[起き] - 1   おはよー,よく寝れた？,おはよう！")
        });
    });
    describe('getDetailArray()', () => {
        it('登録ランダム返信詳細「配列」取得', () => {
            setDatabase()
            let result = randomReply.getDetailArray("起きた")
            expect(result).to.have.deep.equals({ keyword: "起き", replyId: 1, reply: "おはよー,よく寝れた？,おはよう！" })
        });
    });
    describe('existCommand()', () => {
        it('存在するとき', () => {
            setDatabase()
            let result = randomReply.existCommand("起きた")
            expect(result).to.be.true
        });
        it('存在しないとき', () => {
            setDatabase()
            let result = randomReply.existCommand("テスト")
            expect(result).to.be.false
        });
    });
    describe('getNegaPosiScore()', () => {
        it('ネガポジ判定', async () => {
            setDatabase()
            let result = await randomReply.getNegaPosiScore("今日は嬉しいことがあった")
            expect(result).to.be.above(0) // 0.14269585714285712
        });
    });
    describe('getReply()', () => {
        it('登録済みのランダム返信', async () => {
            setDatabase()
            let result = await randomReply.getReply("おはよう")
            expect(result.word).to.be.oneOf(["おはよー", "よく寝れた？", "おはよう！"])
            expect(result.emoji).to.be.empty
        });
        it('未登録のランダム返信 - ポジティブ', async () => {
            setDatabase()
            let result = await randomReply.getReply("今日は嬉しいことがあった")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("😄")
        });
        it('未登録のランダム返信 - ネガティブ', async () => {
            setDatabase()
            let result = await randomReply.getReply("今日は悲しいことがあった")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("😟")
        });
        it('未登録のランダム返信 - どちらでもない', async () => {
            setDatabase()
            let result = await randomReply.getReply("カチカチ山")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("🙄")
        });
    });
    describe('addCommand()', () => {
        it('ランダム返信登録 - 新規登録(カンマ)', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.addCommand(["テスト", "全角で登録,テスト返信"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength + 1)
            expect(randomReply.database.replies[repliesLength]).to.deep.equal("全角で登録,テスト返信")
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength + 1)
            expect(randomReply.database.commands[commandsLength]).to.deep.equal({ keyword: 'テスト', replyId: repliesLength })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
        it('ランダム返信登録 - 新規登録(スペース区切り)', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.addCommand(["テスト", "スペースで登録", "テスト返信２"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength + 1)
            expect(randomReply.database.replies[repliesLength]).to.deep.equal("スペースで登録,テスト返信２")
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength + 1)
            expect(randomReply.database.commands[commandsLength]).to.deep.equal({ keyword: 'テスト', replyId: repliesLength })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
        it('ランダム返信登録 - すでに存在するランダム返信へのに対応する言葉追加 - 存在しないインデックス', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.addCommand(["存在しないインデックス", "100"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength)
        });
        it('ランダム返信登録 - すでに存在するランダム返信に対応する言葉追加 - 存在するインデックス', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.addCommand(["存在するインデックス", "5"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength + 1)
            expect(randomReply.database.commands[commandsLength]).to.deep.equal({ keyword: '存在するインデックス', replyId: "5" })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
    });
    describe('editCommand()', () => {
        it('ランダム返信登録 - 更新（カンマ）', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.editCommand(["おやすみ", "テスト２,テスト3"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.replies[3]).to.deep.equal("テスト２,テスト3")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
        it('ランダム返信登録 - 更新（スペース区切り）', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.editCommand(["おわった", "テスト４", "テスト5"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.replies[4]).to.deep.equal("テスト４,テスト5")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
        it('ランダム返信登録 - 存在しない', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.editCommand(["存在しない言葉", "存在しない言葉を登録", "テスト返信"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength)
        });
    })
    describe('deleteCommand()', () => {
        it('ランダム返信削除 - 言葉が存在する場合', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.deleteCommand(["おやすみ"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength - 1)
            expect(randomReply.database.commands[commandsLength]).to.not.deep.equal({ "keyword": "おやすみ", "replyId": 3 })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomReply.database)
        });
        it('ランダム返信削除 - 言葉が存在しない場合', () => {
            setDatabase()
            let repliesLength = randomReply.database.replies.length
            let commandsLength = randomReply.database.commands.length

            let result = randomReply.deleteCommand(["存在しない言葉"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(randomReply.database.replies).to.have.lengthOf(repliesLength)
            expect(randomReply.database.commands).to.have.lengthOf(commandsLength)
        });
    });
});