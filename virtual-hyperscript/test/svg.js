var test = require("tape")

var svg = require("../svg")

test("svg returns a vnode", function (assert) {
    assert.equal(svg("circle").tagName, "circle")
    assert.equal(svg("circle").namespace, "http://www.w3.org/2000/svg")

    assert.end()
})

test("svg with text", function (assert) {
    var node = svg("circle", "dat text")

    assert.equal(node.children[0].text, "dat text")

    assert.end()
})

test("svg with properties", function (assert) {
    var node = svg("circle", { width: "40px" })

    assert.strictEqual(node.properties.attributes.width, "40px")

    assert.end()
})
