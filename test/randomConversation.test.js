const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const randomConversation = require('../randomConversation.js');
const dataFile = './data/conversation.json';

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

const setDatabase = () => {
    randomConversation.database = {
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

describe('randomConversation.js', async () => {
    describe('getRandom()', () => {
        it('ランダム取得', () => {
            let result = randomConversation.getRandom(['a', 'b', 'c', 'd', 'e'])
            expect(result).to.be.oneOf(['a', 'b', 'c', 'd', 'e'])
        });
    });
    describe('getList()', () => {
        it('登録ランダム返信一覧取得', () => {
            setDatabase()
            let result = randomConversation.getList()
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
            let result = randomConversation.getDetail("起きた")
            expect(result).to.have.equals("[起き] - 1   おはよー,よく寝れた？,おはよう！")
        });
    });
    describe('existCommand()', () => {
        it('存在するとき', () => {
            setDatabase()
            let result = randomConversation.existCommand("起きた")
            expect(result).to.be.true
        });
        it('存在しないとき', () => {
            setDatabase()
            let result = randomConversation.existCommand("テスト")
            expect(result).to.be.false
        });
    });
    describe('getNegaPosiScore()', () => {
        it('ネガポジ判定', async () => {
            setDatabase()
            let result = await randomConversation.getNegaPosiScore("今日は嬉しいことがあった")
            expect(result).to.be.above(0) // 0.14269585714285712
        });
    });
    describe('getReply()', () => {
        it('登録済みのランダム返信', async () => {
            setDatabase()
            let result = await randomConversation.getReply("おはよう")
            expect(result.word).to.be.oneOf(["おはよー", "よく寝れた？", "おはよう！"])
            expect(result.emoji).to.be.empty
        });
        it('未登録のランダム返信 - ポジティブ', async () => {
            setDatabase()
            let result = await randomConversation.getReply("今日は嬉しいことがあった")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("😄")
        });
        it('未登録のランダム返信 - ネガティブ', async () => {
            setDatabase()
            let result = await randomConversation.getReply("今日は悲しいことがあった")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("😟")
        });
        it('未登録のランダム返信 - どちらでもない', async () => {
            setDatabase()
            let result = await randomConversation.getReply("カチカチ山")
            expect(result.word).to.not.be.empty
            expect(result.emoji).to.be.equal("🙄")
        });
    });
    describe('addCommand()', () => {
        it('ランダム返信登録 - 新規登録', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.addCommand(["テスト", "全角で登録,テスト返信"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength + 1)
            expect(randomConversation.database.replies[repliesLength]).to.deep.equal("全角で登録,テスト返信")
            expect(randomConversation.database.commands).to.have.lengthOf(commandsLength + 1)
            expect(randomConversation.database.commands[commandsLength]).to.deep.equal({ keyword: 'テスト', replyId: repliesLength })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomConversation.database)
        });
        it('ランダム返信登録 - 更新', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.addCommand(["おやすみ", "テスト２,テスト3"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength)
            expect(randomConversation.database.replies[3]).to.deep.equal("テスト２,テスト3")
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomConversation.database)
        });
        it('ランダム返信登録 - すでに存在するランダム返信へのに対応する言葉追加 - 存在しないインデックス', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.addCommand(["存在しないインデックス", "100"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength)
            expect(randomConversation.database.commands).to.have.lengthOf(commandsLength)
        });
        it('ランダム返信登録 - すでに存在するランダム返信に対応する言葉追加 - 存在するインデックス', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.addCommand(["存在するインデックス", "5"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength)
            expect(randomConversation.database.commands).to.have.lengthOf(commandsLength + 1)
            expect(randomConversation.database.commands[commandsLength]).to.deep.equal({ keyword: '存在するインデックス', replyId: "5" })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomConversation.database)
        });
    });
    describe('deleteCommand()', () => {
        it('ランダム返信削除 - 言葉が存在する場合', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.deleteCommand(["おやすみ"])
            // assert result
            expect(result).to.be.true
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength)
            expect(randomConversation.database.commands).to.have.lengthOf(commandsLength - 1)
            expect(randomConversation.database.commands[commandsLength]).to.not.deep.equal({ "keyword": "おやすみ", "replyId": 3 })
            // assert file data
            let resultFile = JSON.parse(fs.readFileSync(dataFile, "utf8"));
            expect(resultFile).to.deep.equals(randomConversation.database)
        });
        it('ランダム返信削除 - 言葉が存在しない場合', () => {
            setDatabase()
            let repliesLength = randomConversation.database.replies.length
            let commandsLength = randomConversation.database.commands.length

            let result = randomConversation.deleteCommand(["存在しない言葉"])
            // assert result
            expect(result).to.be.false
            // assert variable
            expect(randomConversation.database.replies).to.have.lengthOf(repliesLength)
            expect(randomConversation.database.commands).to.have.lengthOf(commandsLength)
        });
    });
});