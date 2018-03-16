'use strict'


var test = require("tape")
var h = require("../h.js")
var Node = require("../vnode/vnode")


// h tests

test("h is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("defaults to div node", function (assert) {
    var node = h()
    assertNode(assert, node, "DIV")
    assert.end()
})

test("can use class selector", function (assert) {
    var node = h("div.pretty")
    assertNode(assert, node, "DIV", { className: "pretty" })
    assert.end()
})

test("can use non-ascii class selector", function (assert) {
    var node = h("div.ΑΒΓΔΕΖ")
    assertNode(assert, node, "DIV", { className: "ΑΒΓΔΕΖ" })
    assert.end()
})

test("class selectors combine with className property", function (assert) {
    var node = h("div.very", { className: "pretty" })
    assertNode(assert, node, "DIV", { className: "very pretty" })
    assert.end()
})

test("can use id selector", function (assert) {
    var node = h("div#important")
    assertNode(assert, node, "DIV", { id: "important" })
    assert.end()
})

test("can use non-ascii id selector", function (assert) {
    var node = h("div#ΑΒΓΔΕΖ")
    assertNode(assert, node, "DIV", { id: "ΑΒΓΔΕΖ" })
    assert.end()
})

test("properties id overrides selector id", function (assert) {
    var node = h("div#very", { id: "important" })
    assertNode(assert, node, "DIV", { id: "important" })
    assert.end()
})

test("defaults to div when using selectors", function (assert) {
    var node1 = h("#important")
    var node2 = h(".pretty")
    var node3 = h("#important.pretty")
    var node4 = h(".pretty#important")

    assertNode(assert, node1, "DIV", { id: "important" })
    assertNode(assert, node2, "DIV", { className: "pretty" })
    assertNode(assert, node3, "DIV", { id: "important", className: "pretty" })
    assertNode(assert, node4, "DIV", { id: "important", className: "pretty" })
    assert.end()
})

test("second argument can be children", function (assert) {
    var node1 = h("#important.pretty", "test")
    var node2 = h("#important.pretty", ["test"])
    var node3 = h("#important.pretty", h("p", "testing"))
    var node4 = h("#important.pretty", [h("p", "testing")])

    var props = { id: "important", className: "pretty" }

    assertNode(assert, node1, "DIV", props, ["test"])
    assertNode(assert, node2, "DIV", props, ["test"])
    assertNode(assert, node3, "DIV", props, [["P", {}, ["testing"]]])
    assertNode(assert, node4, "DIV", props, [["P", {}, ["testing"]]])
    assert.end()
})

test("third argument can be child or children", function (assert) {
    var node1 = h("#important.pretty", { a: "b" }, "test")
    var node2 = h("#important.pretty", { a: "b" }, ["test"])
    var node3 = h("#important.pretty", { a: "b" }, h("p", "testing"))
    var node4 = h("#important.pretty", { a: "b" }, [h("p", "testing")])

    var props = { a: "b", id: "important", className: "pretty" }

    assertNode(assert, node1, "DIV", props, ["test"])
    assertNode(assert, node2, "DIV", props, ["test"])
    assertNode(assert, node3, "DIV", props, [["P", {}, ["testing"]]])
    assertNode(assert, node4, "DIV", props, [["P", {}, ["testing"]]])
    assert.end()
})

function assertNode(assert, node, tagName, properties, children) {
    properties = properties || {}
    children = children || []

    assert.ok(node instanceof Node, "node is a VirtualNode")
    assert.equal(node.tagName, tagName, "tag names are equal")
    assert.deepEqual(node.properties, properties, "propeties are equal")
    assert.equal(node.children.length, children.length, "child count equal")
    for (var i = 0; i < children.length; i++) {
        var child = children[i]

        if (typeof child === "string") {
            assert.equal(node.children[i].text, child)
        } else {
            assertNode(assert,
                node.children[i],
                child[0],
                child[1],
                child[2])
        }
    }
}



