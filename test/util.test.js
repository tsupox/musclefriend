const fs = require('fs')
const expect = require('chai').expect
const mockedEnv = require('mocked-env')
const mockDate = require('mockdate');
const util = require('../modules/util.js');

// set mock env
// let restore = mockedEnv({
//     "DAY_START_TIME": "5"
// })
describe('util.js', async () => {
    describe('escapeRegExp()', () => {
        it('正規表現引っかかるものに\￥追加', () => {
            let result = util.escapeRegExp('\a^b$c.d*e+f?g(h)i[j]k{l}m|n')
            expect(result).to.be.equal('a\\^b\\$c\\.d\\*e\\+f\\?g\\(h\\)i\\[j\\]k\\{l\\}m\\|n')
        });
        it('普通の文字列はそのまま返す', () => {
            let result = util.escapeRegExp('あいう')
            expect(result).to.be.equal('あいう')
        });

    });
    describe('sleep()', () => {
        it('sleep', () => {
            util.sleep(1)
        });
    });
    describe('getRandom()', () => {
        it('ランダム取得', () => {
            let result = util.getRandom(['a', 'b', 'c', 'd', 'e'])
            expect(result).to.be.oneOf(['a', 'b', 'c', 'd', 'e'])
        });
    });
});