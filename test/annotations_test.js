var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;

var h = require('./helpers');

var Annotation = require('../lib/annotation').Annotation;
var Annotations = require('../lib/annotations').Annotations;
var polyfill = require('../lib/annotations').polyfill;

buster.testCase('polyfill', {
    'makes the public functions available in the given global context': function () {
        var myglobal = {
            document: {}
        };
        polyfill(myglobal);

        assert.isFunction(myglobal.document.createAnnotation);
    }
});

buster.testCase('Annotations', {
    '.createAnnotation()': {
        'returns a new annotation object': function () {
            var ann = Annotations.createAnnotation();
            assert.hasPrototype(ann, Annotation.prototype);
        },

        'sets the annotation contextDocument': function () {
            var d = h.fakeDocument();
            Annotations.contextDocument = d;

            var ann = Annotations.createAnnotation();
            assert.same(ann.contextDocument, d);
        }
    },
});
