var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;

var Annotation = require('../lib/annotation').Annotation;
var Annotations = require('../lib/annotations').Annotations;

buster.testCase('Annotations', {
    '.polyfill()': {
        'makes the public functions available in the given global context': function () {
            var myglobal = {
                document: {}
            };
            Annotations.polyfill(myglobal);

            assert.isFunction(myglobal.document.createAnnotation);
        }
    },
    '.createAnnotation()': {
        'returns a new annotation object': function () {
            var ann = Annotations.createAnnotation();
            assert.hasPrototype(ann, Annotation.prototype);
        }
    },
});
