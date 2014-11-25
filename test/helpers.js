var buster = require('buster');
var sinon = buster.sinon;

function FakeEvent() {}

FakeEvent.prototype.initCustomEvent = function initCustomEvent(type, bubbles, cancelable, detail) {
    this.type = type;
    this.bubbles = bubbles;
    this.cancelable = cancelable;
    this.detail = detail;
};

function fakeDocument() {
    return {
        createEvent: function () {
            return new FakeEvent();
        },
        dispatchEvent: sinon.spy()
    };
}

exports.FakeEvent = FakeEvent;
exports.fakeDocument = fakeDocument;
