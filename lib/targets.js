var R = require('ramda');

function TextTarget(range) {
    this.nodes = textNodesBetween(
        range.commonAncestorContainer,
        range.startContainer,
        range.endContainer
    );
    this._startOffset = range.startOffset;
    this._endOffset = range.endOffset;
    this._source = range.commonAncestorContainer.ownerDocument.location.href;
}

TextTarget.prototype.toString = function toString() {
    return textInNodes(this.nodes, this._startOffset, this._endOffset);
};

TextTarget.prototype.toJSON = function toJSON() {
    return {
        '@id': 'urn:uuid:a-real-uuid-here',
        '@type': 'oa:SpecificResource',
        'source': this._source,
        'selector': {
            '@id': 'urn:uuid:a-real-uuid-here',
            '@type': 'oa:TextQuoteSelector',
            'exact': this.toString()
        }
    };
};

function textNodesBetween(ancestor, start, end) {
    var pastStart = false, reachedEnd = false;
    var result = [];

    function getTextNodes(node) {
        var isEnd = false;
        if (node === start) {
            pastStart = true;
        }
        if (node === end) {
            reachedEnd = isEnd = true;
        }
        if (node.nodeType === 3) {
            if (pastStart && (!reachedEnd || isEnd)) {
                result.push(node);
            }
        } else {
            R.forEach(getTextNodes, node.childNodes);
        }
    }

    getTextNodes(ancestor);
    return result;
}

function textInNodes(nodes, startOffset, endOffset) {
    if (nodes.length === 1) {
        endOffset -= startOffset;
    }

    function selectedText(t, i) {
        if (i === 0) {
            t = t.slice(startOffset);
        }
        if (i === nodes.length - 1) {
            t = t.slice(0, endOffset);
        }
        return t;
    }

    var toText = R.pipe(
        R.map(R.prop('textContent')),
        R.map.idx(selectedText)
    );

    return toText(nodes).join('');
}

exports.TextTarget = TextTarget;
