var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var h = require('./helpers');

var Annotations = require('../lib/annotations').Annotations;
var Cache = require('../lib/annotations').Cache;
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
            // Simulate adding a target and triggering the onchange handler
            ann.nodes = [node];
            ann.onchange(ann);

            var results = this.annotations.get([node]);

            assert.equals(results.length, 1);
            assert.contains(results, ann);
        },

        'returns any annotations that reference the passed nodes (multiple annotations)': function () {
            var node = {};
            var ann1 = this.annotations.create();
            var ann2 = this.annotations.create();
            ann1.nodes = [node];
            ann1.onchange(ann1);
            ann2.nodes = [node];
            ann2.onchange(ann2);

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
            ann1.nodes = [node1];
            ann1.onchange(ann1);
            ann2.nodes = [node1];
            ann2.onchange(ann2);
            ann2.nodes = [node2];
            ann2.onchange(ann2);

            var results = this.annotations.get([node1]);

            assert.equals(results.length, 1);
            assert.contains(results, ann1);
        }
    }
});

buster.testCase('Cache', {
    'setUp': function () {
        this.cache = new Cache('test');
    },

    '#put()': {
        'returns an object id': function () {
            var id = this.cache.put({});
            assert.defined(id);
        },
        'ensures the object id is unique': function () {
            var id1 = this.cache.put({});
            var id2 = this.cache.put({});
            refute.equals(id1, id2);
        },
        'is idempotent': function () {
            var o = {};
            var id1 = this.cache.put(o);
            var id2 = this.cache.put(o);
            assert.equals(id1, id2);
        }
    },

    '#get()': {
        'setUp': function () {
            this.obj = {};
            this.id = this.cache.put(this.obj);
        },
        'returns undefined when the object is not stored': function () {
            refute.defined(this.cache.get('123'));
        },
        'returns the stored object': function () {
            var res = this.cache.get(this.id);
            assert.same(res, this.obj);
        }
    },

    '#del()': {
        'setUp': function () {
            this.obj = {};
            this.id = this.cache.put(this.obj);
        },
        'removes the passed object from the cache': function () {
            var o = {};
            var id = this.cache.put(o);
            this.cache.del(o);
            refute.defined(this.cache.get(id));
        },
        'ensures that the object gets a new id if added again': function () {
            var o = {};
            var id1 = this.cache.put(o);
            this.cache.del(o);
            var id2 = this.cache.put(o);
            refute.equals(id1, id2);
        }
    },

    '#reference()': {
        'setUp': function () {
            this.obj = {};
            this.id = this.cache.put(this.obj);
        },
        'returns an object id': function () {
            var id = this.cache.reference(this.obj, {});

            assert.equals(id, this.id);
        },
        'adds a property to the passed object containing the id': function () {
            var other = {};

            this.cache.reference(this.obj, other);

            var expando = Object.keys(other)[0];
            assert.contains(other[expando], this.id);
        },
        'adds to already-defined references': function () {
            var obj2 = {};
            var other = {};

            var id2 = this.cache.put(obj2);
            this.cache.reference(this.obj, other);
            this.cache.reference(obj2, other);

            var expando = Object.keys(other)[0];
            assert.contains(other[expando], this.id);
            assert.contains(other[expando], id2);
        },
        'removes invalid references': function () {
            var obj2 = {};
            var other = {};

            this.cache.reference(this.obj, other);
            this.cache.del(this.obj);
            var id2 = this.cache.reference(obj2, other);

            var expando = Object.keys(other)[0];
            assert.equals(other[expando].length, 1);
            assert.contains(other[expando], id2);
        }
    },

    '#dereference': {
        'setUp': function () {
            this.obj1 = {};
            this.obj2 = {};
            this.other = {};
            this.cache.reference(this.obj1, this.other);
            this.cache.reference(this.obj2, this.other);
        },
        'returns an array of referenced objects': function () {
            var res = this.cache.dereference(this.other);

            assert.equals(res.length, 2);
            assert.contains(res, this.obj1);
            assert.contains(res, this.obj2);
        },
        'only returns objects that still exist in the cache': function () {
            this.cache.del(this.obj2);
            var res = this.cache.dereference(this.other);

            assert.equals(res.length, 1);
            assert.contains(res, this.obj1);
        }
    }
});

function FakeAnnotation(onchange) {
    this.onchange = onchange;
    this.nodes = [];
}

function eventOfType(type) {
    return sinon.match(function (value) {
        return value.type === type;
    }, "event of type '" + type + "'");
}
