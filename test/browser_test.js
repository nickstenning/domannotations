var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;

var polyfill = require('../lib/browser').polyfill;

buster.testCase('polyfill', {
    'makes the public functions available in the given global context': function () {
        var myglobal = {
            document: {}
        };
        polyfill(myglobal);

        assert.isFunction(myglobal.document.createAnnotation);
    }
});
