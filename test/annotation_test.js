var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var Annotation = require('../lib/annotation').Annotation;

function FakeEvent() {}

FakeEvent.prototype.initCustomEvent = function initCustomEvent(type, bubbles, cancelable, detail) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.detail = detail;
};

function fakeDocument() {
    return {
        createEvent: function () {
            return new FakeEvent();
        },
        dispatchEvent: sinon.spy()
    };
}

function eventOfType(type) {
    return sinon.match(function (value) {
        return value.type === type;
    }, "event of type '" + type + "'");
}

buster.testCase('Annotation', {
    'constructor': {
        'makes an annotation with no targets': function () {
            var a = new Annotation();

            assert.equals(a.targets.length, 0);
        }
    },

    '#addTarget()': {
        'adds a target to the list of targets': function () {
            var a = new Annotation();
            var t = {};

            a.addTarget(t);

            assert.same(a.targets[0], t);
        },

        'triggers annotationcreate event if new': function () {
            var a = new Annotation();
            var d = fakeDocument();
            var t = {};

            a.contextDocument = d;
            a.addTarget(t);

            assert.calledOnceWith(
                d.dispatchEvent,
                eventOfType('annotationcreate')
            );
        },

        'triggers annotationupdate event if not new': function () {
            var a = new Annotation();
            var d = fakeDocument();
            var t1 = {};
            var t2 = {};

            a.contextDocument = d;
            a.addTarget(t1);
            d.dispatchEvent.reset();
            a.addTarget(t2);

            assert.calledOnceWith(
                d.dispatchEvent,
                eventOfType('annotationupdate')
            );
        }
    },

    '#removeTarget()': {
        setUp: function () {
            this.annotation = new Annotation();
            this.document = fakeDocument();
            this.target = {};

            this.annotation.addTarget(this.target);
            this.annotation.contextDocument = this.document;
        },

        'removes a target from the list of targets': function () {
            this.annotation.removeTarget(this.target);

            assert.equals(this.annotation.targets.length, 0);
        },

        'triggers annotationupdate events when nodes are removed': function () {
            this.annotation.removeTarget(this.target);

            assert.calledOnceWith(
                this.document.dispatchEvent,
                eventOfType('annotationupdate')
            );
        }
    },

    '#addBody()': {
        'adds a body to the list of bodies': function () {
            var a = new Annotation();
            var b = {};

            a.addBody(b);

            assert.same(a.bodies[0], b);
        },

        'triggers annotationcreate event if new': function () {
            var a = new Annotation();
            var d = fakeDocument();
            var t = {};

            a.contextDocument = d;
            a.addBody(t);

            assert.calledOnceWith(
                d.dispatchEvent,
                eventOfType('annotationcreate')
            );
        },

        'triggers annotationupdate event if not new': function () {
            var a = new Annotation();
            var d = fakeDocument();
            var b1 = {};
            var b2 = {};

            a.contextDocument = d;
            a.addBody(b1);
            d.dispatchEvent.reset();
            a.addBody(b2);

            assert.calledOnceWith(
                d.dispatchEvent,
                eventOfType('annotationupdate')
            );
        }
    },

    '#removeBody()': {
        setUp: function () {
            this.annotation = new Annotation();
            this.body = {};
            this.annotation.addBody(this.body);
        },

        'removes a body from the list of bodies': function () {
            this.annotation.removeBody(this.body);

            assert.equals(this.annotation.bodies.length, 0);
        },

        'triggers annotationupdate events on target nodes': function () {
            var d = fakeDocument();

            this.annotation.contextDocument = d;
            this.annotation.removeBody(this.body);

            assert.calledOnceWith(
                d.dispatchEvent,
                eventOfType('annotationupdate')
            );
        }
    },

    '#toJSON()': {
        setUp: function () {
            this.annotation = new Annotation();
        },

        'has a @type of oa:Annotation': function () {
            var res = this.annotation.toJSON();

            assert.equals(res['@type'], 'oa:Annotation');
        },

        'contains a single body if there is only one': function () {
            var b = {};
            this.annotation.addBody(b);

            var res = this.annotation.toJSON();

            assert.same(res.body, b);
        },

        'contains multiple bodies if needed': function () {
            var b1 = {};
            var b2 = {};
            this.annotation.addBody(b1);
            this.annotation.addBody(b2);

            var res = this.annotation.toJSON();

            assert.same(res.body[0], b1);
            assert.same(res.body[1], b2);
        },

        'contains a single target if there is only one': function () {
            var t = {};
            this.annotation.addTarget(t);

            var res = this.annotation.toJSON();

            assert.same(res.target, t);
        },

        'contains multiple targets if needed': function () {
            var t1 = {};
            var t2 = {};
            this.annotation.addTarget(t1);
            this.annotation.addTarget(t2);

            var res = this.annotation.toJSON();

            assert.same(res.target[0], t1);
            assert.same(res.target[1], t2);
        }
    }
});
