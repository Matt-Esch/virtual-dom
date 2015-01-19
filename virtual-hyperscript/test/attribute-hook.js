var test = require("tape")
var doc = require("global/document")

var attributeHook = require("../hooks/attribute-hook.js")
var h = require("../index.js")
var createElement = require("../../vdom/create-element")
var patch = require("../../vdom/patch")
var diff = require("../../vtree/diff")

test("sets and removes namespaced attribute", function (assert) {
    var namespace = 'http://ns.com/my'

    var left = h('div', {
        'myns:myattr': attributeHook(namespace, 'the value')
    })

    var right = h('div', {})

    var elem = createElement(left)

    assert.equal(elem.getAttributeNS(namespace, 'myattr'), 'the value')

    var patches = diff(left, right)

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
