var Events = {
    CREATE: 'annotationcreate',
    REMOVE: 'annotationremove',
    CHANGE: 'annotationchange'
};

function Annotations(Annotation, contextDocument) {
    var contextDocument = contextDocument;
    var cache = new ExpandoCache('AnnotatedNodes');

    this.create = function create() {
      var a = new Annotation(handleChange);

      dispatchEvent(contextDocument, Events.CREATE, {target: a});
      return a;
    };

    this.get = function get(nodes) {
        var annotations = nodes.map(arity(cache.get, 1), cache);
        return uniq(compact(flatten(annotations)));
    };

    this.remove = function remove(annotation) {
        var nodes = getNodesFromTargets(annotation.targets);
        nodes.forEach(removeFromNode.bind(null, annotation));
        dispatchEvent(contextDocument, Events.REMOVE, {target: annotation});
    };

    function addToNode(obj, node) {
        var set = cache.get(node, []);
        if (set.indexOf(obj) === -1) {
            set.push(obj);
            cache.set(node, set);
        }
    }

    function removeFromNode(obj, node) {
        var set = cache.get(node, []).filter(function (o) {
            return obj !== o;
        });
        cache.set(node, set);
    }

    function handleChange(record) {
        if ('removedTargets' in record) {
            removeAnnotationFromTargets(record.removedTargets, record.target);
        }

        if ('addedTargets' in record) {
            addAnnotationToTargets(record.addedTargets, record.target);
        }

        dispatchEvent(contextDocument, Events.CHANGE, record);
    }

    function getNodesFromTargets(targets) {
        return flatten(pluck(targets, 'nodes'));
    }

    function addAnnotationToTargets(targets, ann) {
        var nodes = getNodesFromTargets(targets);
        var addAnnotationToNode = addToNode.bind(null, ann);
        nodes.forEach(addAnnotationToNode);
    }

    function removeAnnotationFromTargets(targets, ann) {
        var nodes = getNodesFromTargets(targets);
        var removeAnnotationFromNode = removeFromNode.bind(null, ann);
        nodes.forEach(removeAnnotationFromNode);
    }
}

function ExpandoCache(prefix) {
    var expando = prefix + (-new Date());
    var cache = {};
    var guid = 0;

    this.set = function set(node, val) {
        var id = node[expando];
        if (typeof id === 'undefined') {
            id = guid++;
        }
        node[expando] = id;

        cache[id] = val;
    };

    this.get = function get(node, fallback) {
        var id = node[expando];
        if (typeof id === 'undefined') {
            return fallback;
        }

        return cache[id];
    };

    this.del = function del(node) {
        var id = node[expando];
        if (typeof id === 'undefined') {
            return;
        }

        delete cache[id];
    };
}

function dispatchEvent(doc, type, detail) {
    if (!doc) {
        return;
    }

    var ev = doc.createEvent('CustomEvent');
    ev.initCustomEvent(type, false, false, detail);

    doc.dispatchEvent(ev);
}

// Array Helpers

function uniq(arr) {
    return arr.reduce(function (c, o) {
        if (!contains(c, o)) {
            c.push(o);
        }
        return c;
    }, []);
}

function pluck(arr, prop) {
    return arr.map(function (o) { return o[prop] });
}

function flatten(arr) {
    return arr.reduce(function (c, o) {
        if (Array.isArray(o)) {
            o = flatten(o);
        }
        return c.concat(o);
    }, []);
}

function compact(arr) {
    return arr.reduce(function (c, o) {
        if (typeof o !== 'undefined') {
            c.push(o);
        }
        return c;
    }, []);
}

function contains(arr, obj) {
    return arr.indexOf(obj) > -1;
}

function arity(fn, count) {
    return function () {
        var args = [].slice.call(arguments, 0, count);
        return fn.apply(this, args);
    };
}

exports.Annotations = Annotations;
