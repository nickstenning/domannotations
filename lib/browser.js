var Annotation = require('./annotation').Annotation;
var Annotations = require('./annotations').Annotations;

function polyfill(windowObj) {
    var win = windowObj || this;
    var doc = win.document;

    if (!doc.createAnnotation) {
        var instance = new Annotations(Annotation, doc);
        doc.createAnnotation = instance.create.bind(instance);
        doc.getAnnotations = instance.get.bind(instance);
        doc.removeAnnotation = instance.remove.bind(instance);
    }
}

exports.polyfill = polyfill;
