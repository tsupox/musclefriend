const readline = require('readline');
// -- 言語解析
const kuromojin = require('kuromojin');
const negaposiAnalyzer = require('negaposi-analyzer-ja');

/**
 * メイン処理
 */
const main = async () => {
    for (; ;) {
        const text = await prompt('言葉？');
        // +:positive -:negative
        let score = await kuromojin.tokenize(text).then((token) => {
            console.log(token)
            const score = negaposiAnalyzer(token);
            console.log(score)
            console.log(score + 0.015)
            return score;
        })
        console.log('');  // 改行
    }
};

/**
 * ユーザーに値を入力させる
 */
const prompt = async (msg) => {
    console.log(msg);
    const answer = await question('> ');
    return answer.trim();
};

/**
 * 標準入力を取得する
 */
const question = (question) => {
    const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        readlineInterface.question(question, (answer) => {
            resolve(answer);
            readlineInterface.close();
        });
    });
};

// 起動
(async () => {
    await main();
})();