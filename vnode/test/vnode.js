var test = require("tape")

var VNode = require("../vnode")

test("node.tagName is stored in uppercase", function (assert) {
    node = new VNode("div")
    assert.equal(node.tagName, "DIV")
    assert.end()
})