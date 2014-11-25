var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var h = require('./helpers');

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
    setUp: function () {
        this.document = h.fakeDocument();
        this.annotations = new Annotations(FakeAnnotation, this.document);
    },

    '.create()': {
        'returns a new annotation object': function () {
            var ann = this.annotations.create();
            assert.hasPrototype(ann, FakeAnnotation.prototype);
        },

        'fires an annotationcreate event': function () {
            var ann = this.annotations.create();
            assert.calledOnceWith(
                this.document.dispatchEvent,
                eventOfType('annotationcreate')
            );
        },

        'sets up appropriate change handlers': function () {
            var ann = this.annotations.create();
            this.document.dispatchEvent.reset();
            ann.onchange(ann);

            assert.calledOnceWith(
                this.document.dispatchEvent,
                eventOfType('annotationupdate')
            );
        }
    },
});

function FakeAnnotation(onchange) {
    this.onchange = onchange;
}

function eventOfType(type) {
    return sinon.match(function (value) {
        return value.type === type;
    }, "event of type '" + type + "'");
}
