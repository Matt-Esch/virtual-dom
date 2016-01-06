var test = require("tape")
var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var createElement = require("../create-element.js")

test("convert camel-case properties to dashes in string form", function (assert) {
    var tree = h("div", { style: { fontSize: '100px' } }, 'beep')
    var elem = createElement(tree)
    var str = elem.outerHTML || elem.toString()
    assert.equal(
        str.replace(/:\s+/g,':').replace(/;\s+/g,';'),
        '<div style="font-size:100px;">beep</div>'
    )
    assert.equal(elem.style['font-size'], '100px')
    assert.end()
})
