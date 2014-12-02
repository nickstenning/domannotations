var buster = require('buster');
var assert = buster.assert;
var refute = buster.refute;
var sinon = buster.sinon;

var Annotation = require('../lib/annotation').Annotation;


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

        'runs onchange callback': function () {
            var c = sinon.spy();
            var a = new Annotation(c);
            var t = {};

            a.addTarget(t);
            assert.calledOnceWith(c, a);
        }
    },

    '#removeTarget()': {
        setUp: function () {
            this.onchange = sinon.spy();
            this.annotation = new Annotation(this.onchange);
            this.target = {};
            this.annotation.addTarget(this.target);
            this.onchange.reset();
        },

        'removes a target from the list of targets': function () {
            this.annotation.removeTarget(this.target);

            assert.equals(this.annotation.targets.length, 0);
        },

        'runs onchange callback': function () {
            this.annotation.removeTarget(this.target);

            assert.calledOnceWith(this.onchange, this.annotation);
        }
    },

    '#addBody()': {
        'adds a body to the list of bodies': function () {
            var a = new Annotation();
            var b = {};

            a.addBody(b);

            assert.same(a.bodies[0], b);
        },

        'runs onchange callback': function () {
            var c = sinon.spy();
            var a = new Annotation(c);
            var t = {};

            a.addBody(t);

            assert.calledOnceWith(c, a);
        }
    },

    '#removeBody()': {
        setUp: function () {
            this.onchange = sinon.spy();
            this.annotation = new Annotation(this.onchange);
            this.body = {};
            this.annotation.addBody(this.body);
            this.onchange.reset();
        },

        'removes a body from the list of bodies': function () {
            this.annotation.removeBody(this.body);

            assert.equals(this.annotation.bodies.length, 0);
        },

        'runs onchange callback': function () {
            this.annotation.removeBody(this.body);

            assert.calledOnceWith(this.onchange, this.annotation);
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
