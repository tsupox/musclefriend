const util = require('./util.js');

let minesweeper = {

    init: () => {
    },

    generate: (width = 8, height = 8, bomb = 8) => {
        // numbers
        let numbers = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']

        // bomb 最大値
        bomb = Math.min(bomb, (width - 1) * (height - 1))
        // board 初期化
        let board = JSON.parse(JSON.stringify((new Array(width)).fill((new Array(height)).fill(0))));

        // bomb 配置, インクリメント
        for (let i = 0; i < bomb; i++) {
            let placing = true;
            let r = -1;
            let c = -1;
            while (placing) {
                r = util.getRandom([...Array(height).keys()]);
                c = util.getRandom([...Array(width).keys()]);
                if (board[r][c] >= 0) {
                    placing = false;
                }
            }
            board[r][c] = -10000;

            for (let lr = r - 1; lr <= r + 1; ++lr) {
                if (lr < 0 || height <= lr) continue;
                for (let lc = c - 1; lc <= c + 1; ++lc) {
                    if (lc < 0 || width <= lc) continue;
                    board[lr][lc]++;
                }
            }
        }

        let spoiler = (text) => `||:${text}:||`

        let result = "";
        for (let h = 0; h < height; h++) {
            for (let w = 0; w < width; w++) {
                if (board[h][w] >= 0 && board[h][w] <= numbers.length) {
                    result += spoiler(numbers[board[h][w]])
                } else {
                    result += spoiler('bomb')
                }
            }
            result += "\n";
        }
        console.log(result)
        return result
    }
}

module.exports = minesweeper
