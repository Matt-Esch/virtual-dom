var test = require("tape")
var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var createElement = require("../create-element.js")

test("convert camel-case properties to dashes in string form", function (assert) {
    var tree = h("div", { style: { fontSize: 24 } }, 'beep')
    var elem = createElement(tree)
    assert.equal(elem.toString(), '<div style="font-size:24;">beep</div>')
    assert.end()
})
