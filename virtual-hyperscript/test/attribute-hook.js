var test = require("tape")
var doc = require("global/document")

var attributeHook = require("../hooks/attribute-hook.js")
var h = require("../index.js")
var createElement = require("../../vdom/create-element")
var patch = require("../../vdom/patch")
var diff = require("../../vtree/diff")

test("sets and removes namespaced attribute", function (assert) {
    var namespace = 'http://ns.com/my'

    var hook1 = attributeHook(namespace, 'first value')
    var hook2 = attributeHook(namespace, 'first value')
    var hook3 = attributeHook(namespace, 'second value')

    var first = h('div', {'myns:myattr': hook1})
    var second = h('div', {'myns:myattr': hook2})
    var third = h('div', {'myns:myattr': hook3})
    var fourth = h('div', {})

    var elem = createElement(first)
    assert.equal(elem.getAttributeNS(namespace, 'myattr'), 'first value')

    var patches = diff(first, second)
    patch(elem, patches)
    // The value shouldn't change.
    assert.equal(elem.getAttributeNS(namespace, 'myattr'), 'first value')

    patches = diff(second, third)
    patch(elem, patches)
    assert.equal(elem.getAttributeNS(namespace, 'myattr'), 'second value')

    patches = diff(third, fourth)
    patch(elem, patches)
    assert.equal(elem.getAttributeNS(namespace, 'myattr'), blankAttributeNS())

    assert.end()
})

function blankAttributeNS() {
    // Most browsers conform to the latest version of the DOM spec,
    // which requires `getAttributeNS` to return `null` when the attribute
    // doesn't exist, but some browsers (including phantomjs) implement the
    // old version of the spec and return an empty string instead, see:
    // https://developer.mozilla.org/en-US/docs/Web/API/element.getAttributeNS#Return_value
    var div = doc.createElement("div")
    return div.getAttributeNS(null, "foo")
}
