var test = require("tape")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")

var patchCount = require("./lib/patch-count.js")
var assertEqualDom = require("./lib/assert-equal-dom.js")

test("keys get reordered", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }, "1"),
        h("div", { key: 2 }, "2"),
        h("div", { key: 3 }, "3"),
        h("div", { key: 4 }, "4"),
        h("div", { key: "test" }, "test"),
        h("div", { key: 6 }, "6"),
        h("div", { key: "good" }, "good"),
        h("div", { key: "7" }, "7")
    ])

    var rightNode = h("div", [
        h("div", { key: "7" }, "7"),
        h("div", { key: 4 }, "4"),
        h("div", { key: 3 }, "3"),
        h("div", { key: 2 }, "2"),
        h("div", { key: 6 }, "6"),
        h("div", { key: "test" }, "test"),
        h("div", { key: "good" }, "good"),
        h("div", { key: 1 }, "1")
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

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.equal(newRoot.childNodes[7], childNodes[0])
    assert.equal(newRoot.childNodes[3], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[1], childNodes[3])
    assert.equal(newRoot.childNodes[5], childNodes[4])
    assert.equal(newRoot.childNodes[4], childNodes[5])
    assert.equal(newRoot.childNodes[6], childNodes[6])
    assert.equal(newRoot.childNodes[0], childNodes[7])
    assert.end()
})

test("mix keys without keys", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div", { key: 1 })
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.equal(newRoot.childNodes[0], childNodes[1])
    assert.equal(newRoot.childNodes[1], childNodes[2])
    assert.equal(newRoot.childNodes[2], childNodes[3])
    assert.equal(newRoot.childNodes[3], childNodes[4])
    assert.equal(newRoot.childNodes[4], childNodes[5])
    assert.equal(newRoot.childNodes[5], childNodes[6])
    assert.equal(newRoot.childNodes[6], childNodes[7])
    assert.equal(newRoot.childNodes[7], childNodes[0])
    assert.end()
})

test("avoid unnecessary reordering", function (assert) {
    var leftNode = h("div", [
        h("div"),
        h("div", { key: 1 }),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div", { key: 1 }),
        h("div")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 0)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.end()
})

test("missing key gets replaced", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
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

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.notEqual(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[3], childNodes[3])
    assert.equal(newRoot.childNodes[4], childNodes[4])
    assert.equal(newRoot.childNodes[5], childNodes[5])
    assert.equal(newRoot.childNodes[6], childNodes[6])
    assert.equal(newRoot.childNodes[7], childNodes[7])
    assert.end()
})

test("widgets can be keyed", function (assert) {
    function DivWidget(key, state) {
        this.key = key
        this.state = state
    }

    DivWidget.prototype.init = function () {
        return render(h("div", this.state))
    }

    DivWidget.prototype.update = function (rootNode, prev) {
        if (this.state !== prev.state) {
            return render(h("div", this.state))
        }
    }

    DivWidget.prototype.type = "Widget"

    var leftNode = h("div", [
        new DivWidget("1", "a"),
        new DivWidget("2", "b"),
        new DivWidget("3", "c")
    ])

    var rightNode = h("div", [
        new DivWidget("3", "c"),
        new DivWidget("2", "b"),
        new DivWidget("1", "a")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)


    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 4)    // 1 reorder and 3 update patches

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assertEqualDom(assert, newRoot.childNodes[0], childNodes[2])
    assertEqualDom(assert, newRoot.childNodes[1], childNodes[1])
    assertEqualDom(assert, newRoot.childNodes[2], childNodes[0])
    assert.end()
})

test("delete key at the start", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 2)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 2)

    assert.equal(newRoot.childNodes[0], childNodes[1])
    assert.equal(newRoot.childNodes[1], childNodes[2])
    assert.end()
})

test("add key to start", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 3)

    assert.equal(newRoot.childNodes[1], childNodes[0])
    assert.equal(newRoot.childNodes[2], childNodes[1])
    assert.end()
})

test("delete key at the end", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 2)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 2)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.end()
})

test("add key to end", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 3)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.end()
})

test("add to end and delete from center & reverse", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c"),
        h("div", { key: "d" }, "d")
    ])

    var rightNode = h("div", [
        h("div", { key: "e" }, "e"),
        h("div", { key: "d" }, "d"),
        h("div", { key: "c" }, "c"),
        h("div", { key: "a" }, "a")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 2)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 4)

    assert.equal(newRoot.childNodes[1], childNodes[3])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[3], childNodes[0])
    assert.end()
})

test("adding multiple widgets", function (assert) {
    function FooWidget(foo) {
        this.foo = foo
        this.counter = 0
        this.key = foo
    }

    FooWidget.prototype.init = function () {
        return render(h("div", String(this.foo)))
    }

    FooWidget.prototype.update = function (prev, elem) {
        this.counter = prev.counter + 1
        elem.textContent = this.foo + this.counter
    }

    FooWidget.prototype.type = "Widget"

    var firstTree = h("div", [])
    var rootNode = render(firstTree)

    assert.equal(rootNode.tagName, "DIV")

    var secondTree = h("div", [
        new FooWidget("foo")
    ])
    rootNode = patch(rootNode, diff(firstTree, secondTree))

    assert.equal(rootNode.tagName, "DIV")
    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].tagName, "DIV")
    assert.equal(rootNode.childNodes[0].childNodes[0].data, "foo")

    var thirdTree = h("div", [
        new FooWidget("foo"),
        new FooWidget("bar")
    ])
    rootNode = patch(rootNode, diff(secondTree, thirdTree))

    assert.equal(rootNode.tagName, "DIV")
    assert.equal(rootNode.childNodes.length, 2)

    assert.end()
})

function childNodesArray(node) {
    var childNodes = []
    for (var i = 0; i < node.childNodes.length; i++) {
        childNodes.push(node.childNodes[i])
    }
    return childNodes
}
