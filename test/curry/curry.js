const curry = require('../../curry/curry.js');
const a = require('assert');
//moconst describe = require('describe');


describe('curry', () => {
    it('should curry in the haskell sense, taking the arity from the function', () => {
        const sum5 = (a, b, c, d, e) => {return a + b + c + d + e};
        const sum5c = curry(sum5);

        a.equal(sum5(1, 2, 3, 4, 5), sum5c(1)(2)(3)(4)(5));
    });

    it('should be pure - each new argument should not affect the overall list', function(){
        var add = curry(function(a, b){ return a + b });
        var add1 = add(1);
        var add2 = add(2);
        a.equal(add1(1), 2);
        a.equal(add1(2), 3);
        a.equal(add1(3), 4);
        a.equal(add1(4), 5);

        a.equal(add2(1), 3);
        a.equal(add2(2), 4);
        a.equal(add2(3), 5);
        a.equal(add2(4), 6);
    });

    it('should allow multiple arguments to be passed at a time', function(){
        var sum3 = curry(function(a, b, c){ return a + b + c });

        a.equal(sum3(1, 2, 3), sum3(1, 2)(3));
        a.equal(sum3(1, 2, 3), sum3(1)(2, 3));
        a.equal(sum3(1, 2, 3), sum3(1)(2)(3));
    });
    
    it('should allow 0 arg curried fns', function(){
        var noop = curry(function(){});

        a.equal(noop(), undefined);
    });
});
