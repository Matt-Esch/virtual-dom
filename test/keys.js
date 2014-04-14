var test = require("tape")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")

var patchCount = require("./lib/patch-count.js")

test("keys get reordered", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }),
        h("div", { key: 2 }),
        h("div", { key: 3 }),
        h("div", { key: 4 }),
        h("div", { key: "test" }),
        h("div", { key: 6 }),
        h("div", { key: "good" }),
        h("div", { key: "7" })
    ])

    var rightNode = h("div", [
        h("div", { key: "7" }),
        h("div", { key: 4 }),
        h("div", { key: 3 }),
        h("div", { key: 2 }),
        h("div", { key: 6 }),
        h("div", { key: "test" }),
        h("div", { key: "good" }),
        h("div", { key: 1 })
    ])

    var rootNode = render(leftNode)

    var childNodes = []
    for (var i = 0; i < rootNode.childNodes.length; i++) {
        childNodes.push(rootNode.childNodes[i])
    }

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(rootNode.childNodes.length, newRoot.childNodes.length)

    assert.equal(childNodes[0], newRoot.childNodes[7])
    assert.equal(childNodes[1], newRoot.childNodes[3])
    assert.equal(childNodes[2], newRoot.childNodes[2])
    assert.equal(childNodes[3], newRoot.childNodes[1])
    assert.equal(childNodes[4], newRoot.childNodes[5])
    assert.equal(childNodes[5], newRoot.childNodes[4])
    assert.equal(childNodes[6], newRoot.childNodes[6])
    assert.equal(childNodes[7], newRoot.childNodes[0])
    assert.end()
})