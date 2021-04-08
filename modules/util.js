module.exports = {
    escapeRegExp: (str) => {
        var reRegExp = /[\\^$.*+?()[\]{}|]/g,
            reHasRegExp = new RegExp(reRegExp.source);

        return (str && reHasRegExp.test(str)) ? str.replace(reRegExp, '\\$&') : str;
    },

    sleep: (time) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        });
    },

    getRandom: (array) => {
        return array[Math.floor(Math.random() * array.length)];
    },
}
