module.exports = {
    escapeRegExp: (str) => {
        var reRegExp = /[\\^$.*+?()[\]{}|]/g,
            reHasRegExp = new RegExp(reRegExp.source);

        return (str && reHasRegExp.test(str)) ? str.replace(reRegExp, '\\$&') : str;
    }
}
