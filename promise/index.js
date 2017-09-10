function Promise(fn) {
    this._state = 'pending';
    this._deferreds = [];
    this._value = null;

    var self = this;

    try {
        fn(resolve, resolve);
    }
    catch (e) {
        reject(e)
    }

    function resolve(newValue) {
        try {
            self._state = 'fulfilled';
            self._value = newValue;
            finale();
        } catch (e) {
            reject(e);
        }
    }

    function reject(newValue) {
        self._state = 'rejected';
        self._value = newValue;
        finale();
    }

    function finale() {
        for (var i = 0, len = self._deferreds.length; i < len; i++)
            handle(self._deferreds[i])
        self._deferreds = null;
    }

}

Promise.prototype.then = function (onFulfilled, onRejected) {
    var promise = this;
    return new Promise(function (resolve, reject) {
        handle({
            resolve: resolve,
            reject: reject,
            onFulfilled: onFulfilled,
            onRejected: onRejected,
            promise: promise
        });
    });
};

function handle(deferred) {
    var promise = deferred.promise;
    if (promise._state === 'pending') {
        promise._deferreds.push(deferred);
        return;
    }
    nextTick(function () {
        var cb = promise._state === 'fulfilled' ? deferred.onFulfilled : deferred.onRejected;
        // if (!cb) {
        //     (promise._state === 'fulfilled' ? deferred.resolve : deferred.reject)(promise._value);
        //     return;
        // }
        try {
            deferred.resolve(cb(promise._value));
        }
        catch (e) {
            deferred.reject(e);
        }
    })
}

function nextTick(fn) {
    setTimeout(fn, 0);
}

module.exports = Promise;