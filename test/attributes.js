var test = require("tape")

var h = require("../h.js")
var createElement = require("../create-element.js")
var diff = require("../diff.js")
var patch = require("../patch.js")

test("attributes can be set", function (assert) {
    var leftTree = h("div")

    var rightTree = h("div",{
        attributes: {
            src: "test.jpg"
        }
    })

    var rootNode = createElement(leftTree)
    var patches = diff(leftTree, rightTree)

    var newRootNode = patch(rootNode, patches)

    assert.equal(newRootNode.getAttribute("src"), "test.jpg")
    assert.end()
})

test("individual attributes can be unset", function (assert) {
    var leftTree = h("div", {
        attributes: {
            a: "1",
            b: "2",
            c: "3"
        }
    })

    var rightTree = h("div", {
        attributes: {
            a: "1",
            c: "3"
        }
    })

    var rootNode = createElement(leftTree)
    var patches = diff(leftTree, rightTree)

    var newRootNode = patch(rootNode, patches)

    assert.equal(newRootNode, rootNode)
    assert.equal(newRootNode.getAttribute("a"), "1")
    assert.ok(newRootNode.getAttribute("b") == null)
    assert.equal(newRootNode.getAttribute("c"), "3")
    assert.end()
})

test("attributes can be completely unset", function (assert) {
    var leftTree = h("div", {
        attributes: {
            a: "1",
            b: "2",
            c: "3"
        }
    })

    var rightTree = h("div")

    var rootNode = createElement(leftTree)
    var patches = diff(leftTree, rightTree)


    var newRootNode = patch(rootNode, patches)

    assert.equal(newRootNode, rootNode)
    assert.ok(newRootNode.getAttribute("a") == null)
    assert.ok(newRootNode.getAttribute("b") == null)
    assert.ok(newRootNode.getAttribute("c") == null)
    assert.end()
})
