var test = require("tape")
var document = require("global/document")

var h = require("../h")
var diff = require("../diff")
var patch = require("../patch")
var render = require("../create-element")

var patchCount = require("./lib/patch-count")


test("style patches correctly", function (assert) {
    var leftNode = h("div", {
        style: {
            border: "1px solid #000"
        }
    })

    var rightNode = h("div", {
        style: {
            padding: "5px"
        }
    })

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1);

    var rootNode = render(leftNode)
    assert.equal(rootNode.style.border, style("border", "1px solid #000"))

    var newRoot = patch(rootNode, patches)
    assert.equal(rootNode, newRoot)

    assert.equal(newRoot.style.padding, style("padding", "5px"))
    assert.equal(newRoot.style.border, style("border", ""))

    assert.end()
})

function style(name, setValue) {
    var div = document.createElement("div")
    div.style[name] = setValue
    return div.style[name]
}

