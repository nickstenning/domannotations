var Annotation = require('./annotation').Annotation;

var Events = {
    CREATE: 'annotationcreate',
    REMOVE: 'annotationremove',
    CHANGE: 'annotationchange'
};

function Annotations(annotationCtor, contextDocument) {
    this.annotationCtor = annotationCtor;
    this.contextDocument = contextDocument;
    this._cache = new Cache('Annotations');
}

Annotations.prototype.create = function create() {
    var a = new this.annotationCtor(this._handleChange.bind(this));
    this._cache.put(a);
    dispatchEvent(this.contextDocument, Events.CREATE);
    return a;
};

Annotations.prototype.get = function get(nodes) {
    var results = [];
    for (var i = 0, len = nodes.length; i < len; i++) {
        var node = nodes[i];
        results.push.apply(results, this._cache.dereference(node));
    }
    return results;
};

Annotations.prototype._handleChange = function _handleChange(ann) {
    // Removed targets will now contain stale references, so this annotation
    // needs a new internal ID. We achieve this by removing it from the cache
    // and adding it again.
    this._cache.del(ann);
    this._cache.put(ann);
    // Ensure that every node has an up-to-date expando
    for (var i = 0, len = ann.nodes.length; i < len; i++) {
        this._cache.reference(ann, ann.nodes[i]);
    }
    dispatchEvent(this.contextDocument, Events.CHANGE);
};


function Cache(prefix) {
    this._expando = prefix + (-new Date());
    this._cache = {};
    this._id = 0;
}

Cache.prototype.put = function put(obj) {
    var id = obj[this._expando];
    if (typeof id === 'undefined') {
        id = this._id++;
    }
    obj[this._expando] = id;
    this._cache[id] = obj;
    return id;
};

Cache.prototype.get = function get(id) {
    return this._cache[id];
};

Cache.prototype.del = function del(obj) {
    var id = obj[this._expando];
    if (typeof id === 'undefined') {
        return;
    }
    delete this._cache[id];
    delete obj[this._expando];
};

Cache.prototype.reference = function reference(obj, other) {
    var id = this.put(obj);
    if (!other[this._expando]) {
        other[this._expando] = [];
    }
    var fresh = [];
    var current = other[this._expando];
    // Clear out any references we find to objects that have been removed from
    // the cache.
    for (var i = 0, len = current.length; i < len; i++) {
        if (current[i] in this._cache) {
            fresh.push(current[i]);
        }
    }
    fresh.push(id);
    other[this._expando] = fresh;
    return id;
};

Cache.prototype.dereference = function dereference(other) {
    var results = [];
    var ids = other[this._expando];
    if (!ids) {
        return results;
    }
    for (var obj, i = 0, len = ids.length; i < len; i++) {
        obj = this.get(ids[i]);
        if (typeof obj !== 'undefined') {
            results.push(obj);
        }
    }
    return results;
};

function polyfill(windowObj) {
    var win = windowObj || this;
    var doc = win.document;

    if (!doc.createAnnotation) {
        var instance = new Annotations(Annotation, doc);
        doc.createAnnotation = instance.create;
        doc.getAnnotations = instance.get;
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
exports.Cache = Cache;
exports.polyfill = polyfill;
