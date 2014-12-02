var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var h = require('./helpers');

var Annotations = require('../lib/annotations').Annotations;
var ExpandoCache = require('../lib/annotations').ExpandoCache;
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
            ann.onchange({target: ann});

            assert.calledOnceWith(
                this.document.dispatchEvent,
                eventOfType('annotationchange')
            );
        }
    },

    '.get()': {
        'returns an empty array when no annotations have been created': function () {
            var res = this.annotations.get([]);

            assert.equals(res, []);
        },

        'returns any annotations that reference the passed nodes': function () {
            var node = {};
            var ann = this.annotations.create();
            ann.onchange({
                target: ann,
                addedTargets: [new FakeTarget([node])]
            });

            var results = this.annotations.get([node]);

            assert.equals(results.length, 1);
            assert.contains(results, ann);
        },

        'returns any annotations that reference the passed nodes (multiple annotations)': function () {
            var node = {};
            var ann1 = this.annotations.create();
            var ann2 = this.annotations.create();
            ann1.onchange({
                target: ann1,
                addedTargets: [new FakeTarget([node])]
            });
            ann2.onchange({
                target: ann2,
                addedTargets: [new FakeTarget([node])]
            });

            var results = this.annotations.get([node]);

            assert.equals(results.length, 2);
            assert.contains(results, ann1);
            assert.contains(results, ann2);
        },

        'returns any annotations that reference the passed nodes (changing targets)': function () {
            var node1 = {};
            var node2 = {};
            var ann1 = this.annotations.create();
            var ann2 = this.annotations.create();
            ann1.onchange({
                target: ann1,
                addedTargets: [new FakeTarget([node1])]
            });
            ann2.onchange({
                target: ann2,
                addedTargets: [new FakeTarget([node1])]
            });
            ann2.onchange({
                target: ann2,
                removedTargets: [new FakeTarget([node1])],
                addedTargets: [new FakeTarget([node2])]
            });

            var results = this.annotations.get([node1]);

            assert.equals(results.length, 1);
            assert.contains(results, ann1);
        }
    }
});

function FakeAnnotation(onchange) {
    this.onchange = onchange;
}

function FakeTarget(nodes) {
    this.nodes = nodes;
}

function eventOfType(type) {
    return sinon.match(function (value) {
        return value.type === type;
    }, "event of type '" + type + "'");
}
