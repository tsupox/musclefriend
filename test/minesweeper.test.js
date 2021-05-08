const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const minesweeper = require('../modules/minesweeper.js');

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })

describe('minesweeper.js', () => {
    describe('generate()', () => {
        it('マインスイーパー作成', () => {
            let result = minesweeper.generate()
            expect(result).to.include('||:bomb:||')
            var count = (result.match(/bomb/g) || []).length;
            expect(count).to.equal(8)
        });
        it('マインスイーパー作成 ギリギリOK', () => {
            let result = minesweeper.generate(10, 10, 81)
            var count = (result.match(/bomb/g) || []).length;
            expect(count).to.equal(81)
        });
        it('マインスイーパー作成 ギリギリアウト', () => {
            let result = minesweeper.generate(10, 10, 82)
            var count = (result.match(/bomb/g) || []).length;
            expect(count).to.equal(81)
        });
        it('マインスイーパー作成 小さい', () => {
            let result = minesweeper.generate(4, 4, 2)
            var count = (result.match(/bomb/g) || []).length;
            expect(count).to.equal(2)
        });
    });
});