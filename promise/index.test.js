var Promise = require('./index');

var promise = new Promise(function (resolve, reject) {
    console.log('fn....');
    //resolve('hello world');
    setTimeout(function () {
        resolve('hello world');
        console.log('setTimeout');
    }, 3000);
}).then(function (val) {
    console.log('then: ', val);
});