module.exports = Object.assign || function (target, source) {
    if (target === null || target === undefined) {
        throw new TypeError('Object.assign cannot be called with null or undefined');
    }
    var to = Object(target); // 针对基本类型
    var from;
    var hasOwn = Object.hasOwnProperty;
    for (var i = 1, l = arguments.length; i < l; i++) {
        from = Object(arguments[i]);
        for (var key in from) {
            if (hasOwn.call(from, key)) {
                to[key] = from[key];
            }
        }
    }
    return to;
};
// 来源: https://github.com/sindresorhus/object-assign/blob/master/index.js