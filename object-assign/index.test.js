const objectAssign = require('./index');
const assert = require('assert');


describe('object assign', () => {
    it('throw when target is not an object', () => {
        assert.throws(objectAssign.bind(null, undefined), Error, 'Object.assign cannot be called with null or undefined');
        assert.throws(objectAssign.bind(null, null), Error, 'Object.assign cannot be called with null or undefined');
    });
    it('throw on null/undefined target', () => {
        assert.throws(objectAssign.bind(null, undefined, {}), Error, 'Object.assign cannot be called with null or undefined');
        assert.throws(objectAssign.bind(null, null, {}), Error, 'Object.assign cannot be called with null or undefined');
    });
    it('not throw on null/undefined sources', () => {
        assert.doesNotThrow(objectAssign.bind(null, {}, undefined), Error, 'Object.assign cannot be called with null or undefined');
        assert.doesNotThrow(objectAssign.bind(null, {}, null), Error, 'Object.assign cannot be called with null or undefined');
        assert.doesNotThrow(objectAssign.bind(null, {}, null, undefined), Error, 'Object.assign cannot be called with null or undefined');
    });
    it('objectAssign own enumerable properties from source to target object', () => {
        assert.deepEqual(objectAssign({foo: 0}, {bar: 1}), {
            foo: 0,
            bar: 1
        });
        assert.deepEqual(objectAssign({foo: 0}, null, undefined), {foo: 0});
        assert.deepEqual(objectAssign({foo: 0}, null, undefined, {bar: 1}, null), {
            foo: 0,
            bar: 1
        });
    });
    it('support multiple sources', () => {
        assert.deepEqual(objectAssign({foo: 0}, {bar: 1}, {bar: 2}), {
            foo: 0,
            bar: 2
        });
        assert.deepEqual(objectAssign({}, {}, {foo: 1}), {foo: 1});
    });
    it('only iterate own keys', () => {
        const Unicorn = function () {};
        Unicorn.prototype.rainbows = 'many';
        const unicorn = new Unicorn();
        unicorn.bar = 1;

        assert.deepEqual(objectAssign({foo: 1}, unicorn), {
            foo: 1,
            bar: 1
        });
    });

    it('return the modified target object', () => {
        const target = {};
        const returned = objectAssign(target, {a: 1});
        assert.equal(returned, target);
    });

    it('support `Object.create(null)` objects', () => {
        const obj = Object.create(null);
        obj.foo = true;
        assert.deepEqual(objectAssign({}, obj), {foo: true});
    });

    it('preserve property order', () => {
        const letters = 'abcdefghijklmnopqrst';
        const source = {};
        letters.split('').forEach(letter => {
            source[letter] = letter;
        });
        const target = objectAssign({}, source);
        assert.equal(Object.keys(target).join(''), letters);
    });

    it('accept primitives as target', () => {
        const target = objectAssign('abcdefg', {foo: 'bar'});
        const strObj = Object('abcdefg');
        strObj.foo = 'bar';
        assert.deepEqual(target, strObj);
    });
});
