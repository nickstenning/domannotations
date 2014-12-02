var ANNOTATION_TYPE = 'oa:Annotation';

function Annotation (onchange) {
    this._onchange = onchange;
    this.targets = [];
    this.bodies = [];
}

Annotation.prototype.addBody = function addBody(b) {
    this.bodies.push(b);
    this._changed();
};

Annotation.prototype.removeBody = function addBody(b) {
    var index = this.bodies.indexOf(b);
    if (index !== -1) {
        this.bodies.splice(index, 1);
        this._changed();
    }
};

Annotation.prototype.addTarget = function addTarget(t) {
    this.targets.push(t);
    this._changed();
};

Annotation.prototype.removeTarget = function addTarget(t) {
    var index = this.targets.indexOf(t);
    if (index !== -1) {
        this.targets.splice(index, 1);
        this._changed();
    }
};

Annotation.prototype.toJSON = function toJSON() {
    var res = {};
    res['@type'] = ANNOTATION_TYPE;

    if (this.bodies.length === 1) {
        res.body = this.bodies[0];
    } else if (this.bodies.length > 1) {
        res.body = this.bodies.slice(0);
    }

    if (this.targets.length === 1) {
        res.target = this.targets[0];
    } else if (this.targets.length > 1) {
        res.target = this.targets.slice(0);
    }

    return res;
};

Annotation.prototype._getNodes = function _getNodes() {
    var res = [];
    for (var i = 0, len = this.targets.length; i < len; i++) {
        var target = this.targets[i];
        if (typeof target.nodes === 'undefined') {
            continue;
        }
        res.push.apply(res, target.nodes);
    }
    return res;
};

Annotation.prototype._changed = function _changed() {
    if (typeof this._onchange === 'function') {
        this._onchange(this);
    }
};

exports.Annotation = Annotation;
