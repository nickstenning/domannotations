var ANNOTATION_TYPE = 'oa:Annotation';

var Events = {
    CREATE: 'annotationcreate',
    REMOVE: 'annotationremove',
    UPDATE: 'annotationupdate'
};

function Annotation () {
    this._new = true;
    this.contextDocument = null;
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

Annotation.prototype._changed = function _changed() {
    var eventType = Events.UPDATE;
    if (this._new) {
        this._new = false;
        eventType = Events.CREATE;
    }
    dispatchEvent(this.contextDocument, eventType);
};

function dispatchEvent(doc, type) {
    if (!doc) {
        return;
    }

    var ev = doc.createEvent('CustomEvent');
    ev.initCustomEvent(type, false, false);

    doc.dispatchEvent(ev);
}

exports.Annotation = Annotation;
