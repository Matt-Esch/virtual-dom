var test = require("tape")
var doc = require("global/document")

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

test("svg properties are set", function (assert) {
    var node = svg("circle.test", {
        style: {
            border: "1px solid #000"
        },
        width: "40px"
    })

    assert.strictEqual(node.properties.attributes.width, "40px")
    assert.strictEqual(node.properties.width, undefined)
    assert.strictEqual(
        node.properties.style.border,
        safeStyle("boder", "1px solid #000")
    )

    assert.end()
})

function safeStyle(property, value) {
    var div = doc.createElement("div")
    div.style[property] = value
    return div.style[property]
}
