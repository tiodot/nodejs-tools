/**
 * 函数科里化
 */
function processInvocation (fn, argsArr, totalArguments) {
    if (argsArr.length >= totalArguments) return fn.apply(null, argsArr);
    return createFn(fn, argsArr, totalArguments);
}

function createFn (fn, args, totalArguments) {
    return (...params) => {
        return processInvocation(fn, [...args, ...params], totalArguments);
    };
}

function curry (fn) {
    return createFn(fn, [], fn.length);
}

module.exports = curry;