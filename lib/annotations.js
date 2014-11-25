var Annotation = require('./annotation').Annotation;

function Annotations() {
    this.contextDocument = null;
}

Annotations.prototype.createAnnotation = function createAnnotation() {
    var a = new Annotation();
    if (this.contextDocument) {
        a.contextDocument = this.contextDocument;
    }
    return a;
};

function polyfill(windowObj) {
    var win = windowObj || this;
    var doc = win.document;

    if (!doc.createAnnotation) {
        var instance = new Annotations();
        instance.contextDocument = doc;
        doc.createAnnotation = instance.createAnnotation;
    }
}

exports.Annotations = Annotations;
exports.polyfill = polyfill;
