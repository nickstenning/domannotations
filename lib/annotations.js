var Annotation = require('./annotation').Annotation;

var Annotations = {};

Annotations.contextDocument = null;

Annotations.createAnnotation = function createAnnotation() {
    return new Annotation();
};

Annotations.polyfill = function (windowObj) {
    var win = windowObj || this;
    var doc = win.document;

    if (!doc.createAnnotation) {
        Annotations.contextDocument = doc;
        doc.createAnnotation = Annotations.createAnnotation;
    }
};

exports.Annotations = Annotations;
