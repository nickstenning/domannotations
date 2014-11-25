var Annotation = require('./annotation').Annotation;

var Events = {
    CREATE: 'annotationcreate',
    REMOVE: 'annotationremove',
    UPDATE: 'annotationupdate'
};

function Annotations(annotationCtor, contextDocument) {
    this.annotationCtor = annotationCtor;
    this.contextDocument = contextDocument;
}

Annotations.prototype.create = function create() {
    var a = new this.annotationCtor(this._handleChange);
    dispatchEvent(this.contextDocument, Events.CREATE);
    return a;
};

Annotations.prototype._handleChange = function _handleChange(ann) {
    dispatchEvent(this.contextDocument, Events.UPDATE);
};

function polyfill(windowObj) {
    var win = windowObj || this;
    var doc = win.document;

    if (!doc.createAnnotation) {
        var instance = new Annotations(Annotation, doc);
        doc.createAnnotation = instance.create;
    }
}

function dispatchEvent(doc, type) {
    if (!doc) {
        return;
    }

    var ev = doc.createEvent('CustomEvent');
    ev.initCustomEvent(type, false, false);

    doc.dispatchEvent(ev);
}

exports.Annotations = Annotations;
exports.polyfill = polyfill;
