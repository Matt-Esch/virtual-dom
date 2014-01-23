var test = require("tape")

var h = require("../h")
var Node = require("../virtual-dom-node")
var tags = require("./tags.json")

test("h is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("defaults to div node", function (assert) {
    var node = h()
    assertNode(assert, node, "div")
    assert.end()
})

test("works with basic html tag types", function (assert) {
    var nodes = []

    tags.forEach(function (tag) {
        nodes.push(h(tag))
    })

    for (var i = 0; i < nodes.length; i++) {
        assertNode(assert, nodes[i], tags[i])
    }

    assert.end()
})

test("forces lowercase tag names", function (assert) {
    var nodes = []

    tags.forEach(function (tag) {
        nodes.push(h(tag.toUpperCase()))
    })

    for (var i = 0; i < nodes.length; i++) {
        assertNode(assert, nodes[i], tags[i])
    }

    assert.end()
})

test("can use class selector", function (assert) {
    var node = h("div.pretty")
    assertNode(assert, node, "div", { className: "pretty" })
    assert.end()
})

test("class selectors combine with className property", function (assert) {
    var node = h("div.very", { className: "pretty" })
    assertNode(assert, node, "div", { className: "very pretty" })
    assert.end()
})

test("can use id selector", function (assert) {
    var node = h("div.pretty")
    assertNode(assert, node, "div", { className: "pretty" })
    assert.end()
})

test("properties id overrides selector id", function (assert) {
    var node = h("div#very", { id: "important" })
    assertNode(assert, node, "div", { id: "important" })
    assert.end()
})

test("defaults to div when using selectors", function (assert) {
    var node1 = h("#important")
    var node2 = h(".pretty")
    var node3 = h("#important.pretty")
    var node4 = h(".pretty#important")

    assertNode(assert, node1, "div", { id: "important" })
    assertNode(assert, node2, "div", { className: "pretty" })
    assertNode(assert, node3, "div", { id: "important", className: "pretty" })
    assertNode(assert, node4, "div", { id: "important", className: "pretty" })
    assert.end()
})

test("properties object doesn't mutate", function (assert) {
    var props = { a: "b" }
    var node = h(".pretty", props)
    assertNode(assert, node, "div", { a: "b", className: "pretty" })
    assert.notEqual(props, node.properties)
    assert.equal(props.className, undefined)
    assert.end()
})

test("child array doesn't mutate", function (assert) {
    var children = ["test"]
    var node = h("div", children)
    assertNode(assert, node, "div", {}, children)
    children.push("no mutate")
    assert.notEqual(children, node.children)
    assertNode(assert, node, "div", {}, ["test"])
    assert.end()
})

test("second argument can be children", function (assert) {
    var node1 = h("#important.pretty", "test")
    var node2 = h("#important.pretty", ["test"])
    var node3 = h("#important.pretty", h("p", "testing"))
    var node4 = h("#important.pretty", [h("p", "testing")])

    var props = { id: "important", className: "pretty" }

    assertNode(assert, node1, "div", props, ["test"])
    assertNode(assert, node2, "div", props, ["test"])
    assertNode(assert, node3, "div", props, [["p", {}, ["testing"]]])
    assertNode(assert, node4, "div", props, [["p", {}, ["testing"]]])
    assert.end()
})

test("third argument can be child or children", function (assert) {
    var node1 = h("#important.pretty", { a: "b" }, "test")
    var node2 = h("#important.pretty", { a: "b" }, ["test"])
    var node3 = h("#important.pretty", { a: "b" }, h("p", "testing"))
    var node4 = h("#important.pretty", { a: "b" }, [h("p", "testing")])

    var props = { a: "b", id: "important", className: "pretty" }

    assertNode(assert, node1, "div", props, ["test"])
    assertNode(assert, node2, "div", props, ["test"])
    assertNode(assert, node3, "div", props, [["p", {}, ["testing"]]])
    assertNode(assert, node4, "div", props, [["p", {}, ["testing"]]])
    assert.end()
})

function assertNode(assert, node, tagName, properties, children) {
    properties = properties || {}
    children = children || []

    assert.true(node instanceof Node, "node is a VirtualDOMNode")
    assert.equal(node.tagName, tagName, "tag names are equal")
    assert.deepEqual(node.properties, properties, "propeties are equal")
    assert.equal(node.children.length, children.length, "child count equal")
    for (var i = 0; i < children.length; i++) {
        var child = children[i]

        if (typeof child === "string") {
            assert.equal(node.children[i], child)
        } else {
            assertNode(assert,
                node.children[i],
                child[0],
                child[1],
                child[2])
        }
    }
}

