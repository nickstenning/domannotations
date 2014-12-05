var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var h = require('./helpers');

var Annotation = require('../lib/annotation').Annotation;
var Annotations = require('../lib/annotations').Annotations;

buster.testCase('Annotations', {
    setUp: function () {
        this.document = h.fakeDocument();
        this.annotations = new Annotations(FakeAnnotation, this.document);
    },

    '.create()': {
        'returns a new annotation object': function () {
            var ann = this.annotations.create();
            assert.hasPrototype(ann, FakeAnnotation.prototype);
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
            ann.change({
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
            ann1.change({
                addedTargets: [new FakeTarget([node])]
            });
            ann2.change({
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
            ann1.change({
                addedTargets: [new FakeTarget([node1])]
            });
            ann2.change({
                addedTargets: [new FakeTarget([node1])]
            });
            ann2.change({
                removedTargets: [new FakeTarget([node1])],
                addedTargets: [new FakeTarget([node2])]
            });

            var results = this.annotations.get([node1]);

            assert.equals(results.length, 1);
            assert.contains(results, ann1);
        },

        'returns any annotations that reference the passed nodes (non-matching nodes)': function () {
            var node1 = {};
            var node2 = {};
            var ann = this.annotations.create();
            ann.change({
                addedTargets: [new FakeTarget([node1])]
            });

            var results = this.annotations.get([node1, node2]);

            assert.equals(results.length, 1);
            assert.contains(results, ann);
        },
    },

    '.remove()': {
        'setUp': function () {
            this.annotations = new Annotations(Annotation, this.document);
            this.node = {};
            this.ann = this.annotations.create();
            this.ann.addTarget(new FakeTarget([this.node]));
        },

        'removes that annotation from the referenced nodes': function () {
            this.annotations.remove(this.ann);

            var results = this.annotations.get([this.node]);
            assert.equals(results.length, 0);
        },

        'removes that annotation from the referenced nodes (multiple nodes)': function () {
            node2 = {};
            this.ann.addTarget(new FakeTarget([node2]));

            this.annotations.remove(this.ann);

            var results = this.annotations.get([this.node]);
            assert.equals(results.length, 0);
            results = this.annotations.get([node2]);
            assert.equals(results.length, 0);
        },
    },

    'events': {
        'creating an annotation': {
            'fires an annotationcreate event': function () {
                var ann = this.annotations.create();

                assert.calledOnceWith(
                    this.document.dispatchEvent,
                    sinon.match
                    .has('type', 'annotationcreate')
                    .and(sinon.match
                    .has('detail', sinon.match({target: ann})))
                );
            }
        },

        'changing an annotation': {
            'setUp': function () {
                this.ann = this.annotations.create();
                this.document.dispatchEvent.reset();
            },

            'fires an annotationchange event': function () {
                this.ann.change();

                assert.calledOnceWith(
                    this.document.dispatchEvent,
                    sinon.match
                    .has('type', 'annotationchange')
                    .and(sinon.match
                    .has('detail', sinon.match({target: this.ann})))
                );
            },

            'forwards event detail from the annotation': function () {
                this.ann.change({foo: 'bar'});

                assert.calledOnceWith(
                    this.document.dispatchEvent,
                    sinon.match
                    .has('detail', sinon.match({foo: 'bar'}))
                );
            }
        },

        'removing an annotation': {
            'setUp': function () {
                this.ann = this.annotations.create();
                this.document.dispatchEvent.reset();
            },

            'fires an annotationremove event': function () {
                this.annotations.remove(this.ann);

                assert.calledOnceWith(
                    this.document.dispatchEvent,
                    sinon.match
                    .has('type', 'annotationremove')
                    .and(sinon.match
                    .has('detail', sinon.match({target: this.ann})))
                );
            },
        }
    }
});

function FakeAnnotation(onchange) {
    this._onchange = onchange;
    this.targets = [];
}

FakeAnnotation.prototype.change = function change(obj) {
    obj = obj || {};
    obj.target = this;
    this._onchange(obj);
};

function FakeTarget(nodes) {
    this.nodes = nodes;
}

function eventOfType(type) {
    return sinon.match(function (value) {
        return value.type === type;
    }, "event of type '" + type + "'");
}

function eventWithDetail(detail) {
    return sinon.match(function (value) {
        return sinon.match.has('detail', sinon.match(value));
    }, "event with detail matching '" + JSON.stringify(detail) + "'");
}
