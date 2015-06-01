var test = require("tape")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")
var Node = require("../vnode/vnode")
var TextNode = require("../vnode/vtext")
var version = require("../vnode/version")
var assertEqualDom = require("./lib/assert-equal-dom.js")
var patchCount = require("./lib/patch-count.js")



// VirtualNode tests
test("Node is a function", function (assert) {
    assert.equal(typeof Node, "function")
    assert.end()
})

test("Node type and version are set", function (assert) {
    assert.equal(Node.prototype.type, "VirtualNode")
    assert.deepEqual(Node.prototype.version, version)
    assert.end()
})

test("TextNode is a function", function (assert) {
    assert.equal(typeof TextNode, "function")
    assert.end()
})

test("TextNode type and version are set", function (assert) {
    assert.equal(TextNode.prototype.type, "VirtualText")
    assert.deepEqual(TextNode.prototype.version, version)
    assert.end()
})

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



// render tests
test("render is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("render text node", function (assert) {
    var vdom = h("span", "hello")
    var dom = render(vdom)
    assert.equal(dom.tagName, "SPAN")
    assert.notOk(dom.id)
    assert.notOk(dom.className)
    assert.equal(dom.childNodes.length, 1)
    assert.equal(dom.childNodes[0].data, "hello")
    assert.end()
})

test("render div", function (assert) {
    var vdom = h()
    var dom = render(vdom)
    assert.notOk(dom.id)
    assert.notOk(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node id is applied correctly", function (assert) {
    var vdom = h("#important")
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.notOk(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node class name is applied correctly", function (assert) {
    var vdom = h(".pretty")
    var dom = render(vdom)
    assert.notOk(dom.id)
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("mixture of node/classname applied correctly", function (assert) {
    var vdom = h("#override.very", { id: "important", className: "pretty"})
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "very pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("style object is applied correctly", function (assert) {
    var vdom = h("#important.pretty", { style: {
        border: "1px solid rgb(0, 0, 0)",
        padding: "2px"
    } })
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.border, style("border", "1px solid rgb(0, 0, 0)"))
    assert.equal(dom.style.padding, style("padding", "2px"))
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("children are added", function (assert) {
    var vdom = h("div", [
        h("div", [
            "just testing",
            "multiple",
            h("b", "nodes")
        ]),
        "hello",
        h("span", "test")
    ])

    var dom = render(vdom)

    assert.equal(dom.childNodes.length, 3)

    var nodes = dom.childNodes
    assert.equal(nodes.length, 3)
    assert.equal(nodes[0].tagName, "DIV")
    assert.equal(nodes[1].data, "hello")
    assert.equal(nodes[2].tagName, "SPAN")

    var subNodes0 = nodes[0].childNodes
    assert.equal(subNodes0.length, 3)
    assert.equal(subNodes0[0].data, "just testing")
    assert.equal(subNodes0[1].data, "multiple")
    assert.equal(subNodes0[2].tagName, "B")

    var subNodes0_2 = subNodes0[2].childNodes
    assert.equal(subNodes0_2.length, 1)
    assert.equal(subNodes0_2[0].data, "nodes")

    var subNodes2 = nodes[2].childNodes
    assert.equal(subNodes2.length, 1)
    assert.equal(subNodes2[0].data, "test")
    assert.end()
})

test("incompatible children are ignored", function (assert) {
    var vdom = h("#important.pretty", {
        style: {
            "cssText": "color: red;"
        }
    }, [
        null
    ])
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText, style("cssText", "color: red;"))
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("injected document object is used", function (assert) {
    var vdom = h("div", "hello")
    var count = 0
    var doc = {
        createElement: function createElement(tagName) {
            assert.equal(tagName, "DIV")
            count++
            return { tagName: "DIV", appendChild: function (t) {
                assert.equal(t, "hello")
                count++
            } }
        },
        createTextNode: function createTextNode(text) {
            assert.equal(text, "hello")
            count++
            return text
        }
    }
    render(vdom, { document: doc })
    assert.equal(count, 3)
    assert.end()
})

test("injected warning is used", function (assert) {
    var badObject = {}
    var vdom = h("#important.pretty", {
        style: {
            cssText: "color: red;"
        }
    })

    vdom.children = [
        badObject, null
    ]

    var i = 0
    function warn(warning, node) {
        assert.equal(warning, "Item is not a valid virtual dom node")

        if (i === 0) {
            assert.equal(node, badObject)
        } else if (i === 1) {
            assert.equal(node, null)
        } else {
            assert.error("Too many warnings")
        }

        i++
    }

    var dom = render(vdom, { warn: warn })
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText, style("cssText", "color: red;"))
    assert.equal(dom.childNodes.length, 0)
    assert.equal(i, 2)
    assert.end()
})

// Complete patch tests
test("textnode update test", function (assert) {
    var hello = h("div", "hello")
    var goodbye = h("div", "goodbye")
    var rootNode = render(hello)
    var equalNode = render(goodbye)
    var patches = diff(hello, goodbye)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("textnode replace test", function (assert) {
    var hello = h("div", "hello")
    var goodbye = h("div", [h("span", "goodbye")])
    var rootNode = render(hello)
    var equalNode = render(goodbye)
    var patches = diff(hello, goodbye)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("textnode insert test", function (assert) {
    var hello = h("div", "hello")
    var again = h("span", ["hello", "again"])
    var rootNode = render(hello)
    var equalNode = render(again)
    var patches = diff(hello, again)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("textnode remove", function (assert) {
    var again = h("span", ["hello", "again"])
    var hello = h("div", "hello")
    var rootNode = render(again)
    var equalNode = render(hello)
    var patches = diff(again, hello)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("dom node update test", function (assert) {
    var hello = h("div.hello", "hello")
    var goodbye = h("div.goodbye", "goodbye")
    var rootNode = render(hello)
    var equalNode = render(goodbye)
    var patches = diff(hello, goodbye)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("dom node replace test", function (assert) {
    var hello = h("div", "hello")
    var goodbye = h("span", "goodbye")
    var rootNode = render(hello)
    var equalNode = render(goodbye)
    var patches = diff(hello, goodbye)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("dom node insert", function (assert) {
    var hello = h("div", [h("span", "hello")])
    var again = h("div", [h("span", "hello"), h("span", "again")])
    var rootNode = render(hello)
    var equalNode = render(again)
    var patches = diff(hello, again)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})

test("dom node remove", function (assert) {
    var hello = h("div", [h("span", "hello")])
    var again = h("div", [h("span", "hello"), h("span", "again")])
    var rootNode = render(again)
    var equalNode = render(hello)
    var patches = diff(again, hello)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)
    assert.end()
})


test("reuse dom node without breaking", function (assert) {
    var hSpan = h("span", "hello")
    var hello = h("div", [hSpan, hSpan, hSpan])
    var goodbye = h("div", [h("span", "hello"), hSpan, h("span", "goodbye")])
    var rootNode = render(hello)
    var equalNode = render(goodbye)
    var patches = diff(hello, goodbye)
    var newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, equalNode)

    // Undo the rendering with new trees
    hello = h("div", [hSpan, hSpan, hSpan])
    goodbye = h("div", [h("span", "hello"), hSpan, h("span", "goodbye")])
    patches = diff(goodbye, hello)
    newRoot = patch(rootNode, patches)
    assertEqualDom(assert, newRoot, rootNode)

    assert.end()
})

test("Allow empty textnode", function (assert) {
    var empty = h("span", "")
    var rootNode = render(empty)
    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].data, "")
    assert.end()
})

test("Can replace vnode with vtext", function (assert) {

    var leftNode = h("div", h("div"))
    var rightNode = h("div", "text")

    var rootNode = render(leftNode)

    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].nodeType, 1)

    var patches = diff(leftNode, rightNode)

    var newRoot = patch(rootNode, patches)

    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 1)
    assert.equal(newRoot.childNodes[0].nodeType, 3)

    assert.end()
})

// Widget tests
test("Widget is initialised on render", function (assert) {
    var initCount = 0
    var testNode = render(h("div"))
    var Widget = {
        init: function () {
            initCount++
            return testNode
        },
        update: function () {
            initCount = 1000000
        },
        type: "Widget"
    }

    var result = render(Widget)

    assert.equal(initCount, 1)
    assert.equal(result, testNode)
    assert.end()
})

test("Nested widget is initialised on render", function (assert) {
    var initCount = 0
    var testNode = render(h("div"))
    var Widget = {
        init: function () {
            initCount++
            return testNode
        },
        update: function () {
            initCount = 1000000
        },
        type: "Widget"
    }

    var vdom = h("div", [
        h("span", "text"),
        h("div.widgetContainer", [
            Widget
        ]),
        h("p", "more text")
    ])

    var result = render(vdom)

    assert.equal(initCount, 1)
    assert.equal(result.childNodes[1].childNodes[0], testNode)
    assert.end()
})

test("Patch widgets at the root", function (assert) {
    var initCount = 0
    var updateCount = 0
    var leftState = { a: 1 }
    var rightState = { a: 2 }
    var domNode

    function Widget(state) {
        this.state = state
        this.vdom = this.render(state)
    }

    Widget.prototype.init = function () {
        initCount++
        return render(this.vdom)
    }

    Widget.prototype.update = function (leftNode, dom) {
        updateCount++
        assert.equal(this.state, rightState)
        assert.equal(leftNode.state, leftState)
        assert.equal(dom, domNode)
        patch(dom, diff(leftNode.vdom, this.vdom))
    }

    Widget.prototype.render = function (state) {
        return h("div", "" + state.a)
    }

    Widget.prototype.type = "Widget"

    var leftTree = new Widget(leftState)
    var rightTree = new Widget(rightState)
    domNode = render(leftTree)
    assert.equal(initCount, 1, "initCount after left render")
    assert.equal(updateCount, 0, "updateCount after left render")

    var patches = diff(leftTree, rightTree)
    assert.equal(patchCount(patches), 1)
    assert.equal(initCount, 1, "initCount after diff")
    assert.equal(updateCount, 0, "updateCount after diff")

    var newRoot = patch(domNode, patches)
    assert.equal(initCount, 1, "initCount after patch")
    assert.equal(updateCount, 1, "updateCount after patch")

    // The patch should only update sibling value in this use case
    var expectedNode = render(rightTree)
    assert.equal(newRoot, domNode)
    assertEqualDom(assert, newRoot, expectedNode)
    assert.end()
})

test("Patch nested widgets", function (assert) {
    var initCount = 0
    var updateCount = 0
    var leftState = { a: 1 }
    var rightState = { a: 2 }
    var domNode

    function Widget(state) {
        this.state = state
        this.vdom = this.render(state)
    }

    Widget.prototype.init = function () {
        initCount++
        return render(this.vdom)
    }

    Widget.prototype.update = function (leftNode, dom) {
        updateCount++
        assert.equal(this.state, rightState)
        assert.equal(leftNode.state, leftState)
        assert.equal(dom, domNode.childNodes[1].childNodes[0])
        patch(dom, diff(leftNode.vdom, this.vdom))
    }

    Widget.prototype.render = function (state) {
        return h("div", "" + state.a)
    }

    Widget.prototype.type = "Widget"

    var leftWidget = new Widget(leftState)
    var rightWidget = new Widget(rightState)

    var leftTree = h("div", [
        h("span", "text"),
        h("div.widgetContainer", [
            leftWidget
        ]),
        h("p", "more text")
    ])

    var rightTree = h("div", [
        h("span", "text"),
        h("div.widgetContainer", [
            rightWidget
        ]),
        h("p", "more text")
    ])

    domNode = render(leftTree)
    assert.equal(initCount, 1, "initCount after left render")
    assert.equal(updateCount, 0, "updateCount after left render")

    var patches = diff(leftTree, rightTree)
    assert.equal(patchCount(patches), 1)
    assert.equal(initCount, 1, "initCount after diff")
    assert.equal(updateCount, 0, "updateCount after diff")

    var newRoot = patch(domNode, patches)
    assert.equal(initCount, 1, "initCount after patch")
    assert.equal(updateCount, 1, "updateCount after patch")

    // The patch should only update sibling value in this use case
    var expectedNode = render(rightTree)
    assert.equal(newRoot, domNode)
    assertEqualDom(assert, newRoot, expectedNode)
    assert.end()
})

test("Can replace stateful widget with vnode", function (assert) {
    var statefulWidget  = {
        init: function () {
            return render(h("div.widget"))
        },
        update: function () {},
        destroy: function () {},
        type: "Widget"
    }

    var leftNode = h("div", statefulWidget)
    var rightNode = h("div", h("div.vnode"))

    var rootNode = render(leftNode)

    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].className, 'widget')

    var patches = diff(leftNode, rightNode)

    var newRoot = patch(rootNode, patches)

    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 1)
    assert.equal(newRoot.childNodes[0].className, 'vnode')

    assert.end()
})

test("Can replace vnode with stateful widget with vnode", function (assert) {
    var statefulWidget  = {
        init: function () {
            return render(h("div.widget"))
        },
        update: function () {},
        destroy: function () {},
        type: "Widget"
    }

    var leftNode = h("div", h("div.vnode"))
    var rightNode = h("div", statefulWidget)

    var rootNode = render(leftNode)

    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].className, 'vnode')

    var patches = diff(leftNode, rightNode)

    var newRoot = patch(rootNode, patches)

    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 1)
    assert.equal(newRoot.childNodes[0].className, 'widget')

    assert.end()
})

test("Ensure children are not rendered more than once", function (assert) {
    var initCount = 0
    var updateCount = 0
    var rightState = { a: 1 }
    var domNode

    function Widget(state) {
        this.state = state
        this.vdom = this.render(state)
    }

    Widget.prototype.init = function () {
        initCount++
        return render(this.vdom)
    }

    Widget.prototype.update = function (leftNode, dom) {
        updateCount++
        patch(dom, diff(leftNode.vdom, this.vdom))
    }

    Widget.prototype.render = function (state) {
        return h("div", "" + state.a)
    }

    Widget.prototype.type = "Widget"

    var rightWidget = new Widget(rightState)

    var leftTree = h("div.container", [
        h("div")
    ])

    var rightTree = h("div.container", [
        h("section.widgetContainer", rightWidget)
    ])

    domNode = render(leftTree)
    assert.equal(initCount, 0, "initCount after left render")
    assert.equal(updateCount, 0, "updateCount after left render")

    var patches = diff(leftTree, rightTree)
    assert.equal(patchCount(patches), 1)
    assert.equal(initCount, 0, "initCount after diff")
    assert.equal(updateCount, 0, "updateCount after diff")

    var newRoot = patch(domNode, patches)
    assert.equal(initCount, 1, "initCount after patch")
    assert.equal(updateCount, 0, "updateCount after patch")

    // The patch should only update sibling value in this use case
    var expectedNode = render(rightTree)
    assert.equal(newRoot, domNode)
    assertEqualDom(assert, newRoot, expectedNode)
    assert.end()
})

test("VNode indicates stateful sibling", function (assert) {
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {},
        type: "Widget"
    }

    var pureWidget = {
        init: function () {},
        update: function () {},
        type: "Widget"
    }

    var stateful = h("div", [statefulWidget])
    var pure = h("div", [pureWidget])

    assert.ok(stateful.hasWidgets)
    assert.notOk(pure.hasWidgets)
    assert.end()
})

test("Replacing stateful widget with vnode calls destroy", function (assert) {
    var count = 0
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count++
        },
        type: "Widget"
    }

    var rootNode = render(h("div"))
    patch(rootNode, diff(statefulWidget, h("div")))
    assert.equal(count, 1)
    assert.end()
})

test("Replacing stateful widget with stateful widget", function (assert) {
    var count = 0
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count++
        },
        type: "Widget"
    }

    var newWidget = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count = 10000000
        },
        type: "Widget"
    }

    var rootNode = render(h("div"))
    var patches = diff(statefulWidget, newWidget)
    patch(rootNode, patches)
    assert.equal(count, 1)
    assert.end()
})

test("Replacing stateful widget with pure widget", function (assert) {
    var count = 0
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count++
        },
        type: "Widget"
    }

    var newWidget = {
        init: function () {},
        update: function () {},
        type: "Widget"
    }

    var rootNode = render(h("div"))
    patch(rootNode, diff(statefulWidget, newWidget))
    assert.equal(count, 1)
    assert.end()
})

test("Removing stateful widget calls destroy", function (assert) {
    var count = 0
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count++
        },
        type: "Widget"
    }

    var rootNode = render(h("div"))
    patch(rootNode, diff(statefulWidget, null))
    assert.equal(count, 1)
    assert.end()
})

test("Patching parent destroys stateful sibling", function (assert) {
    var count = 0
    var widgetRoot = render(h("span"))
    var statefulWidget  = {
        init: function () {
            return widgetRoot
        },
        update: function () {
            assert.error()
        },
        destroy: function (domNode) {
            assert.equal(domNode, widgetRoot)
            count++
        },
        type: "Widget"
    }

    var deepTree = h("div", [
        "hello",
        h("span", "test"),
        h("div", [
            h("article", [statefulWidget])
        ]),
        h("div", [
            h("div", "test")
        ])
    ])

    var rootNode

    rootNode = render(deepTree)
    patch(rootNode, diff(deepTree, null))
    assert.equal(count, 1)

    rootNode = render(deepTree)
    patch(rootNode, diff(deepTree, h("span")))
    assert.equal(count, 2)

    rootNode = render(deepTree)
    patch(rootNode, diff(deepTree, h("div")))
    assert.equal(count, 3)

    assert.end()
})

test("Widget update can replace domNode", function (assert) {
    var widgetInit = render(h("span.init"))
    var widgetUpdate = render(h("span.update"))

    function Widget () {}
    Widget.prototype.init = function () {
        return widgetInit
    }
    Widget.prototype.update = function () {
        return widgetUpdate
    }
    Widget.prototype.destroy = function () {}
    Widget.prototype.type = "Widget"

    var initTree = h("div.init", [new Widget])
    var updateTree = h("div.update", [new Widget])
    var rootNode

    rootNode = render(initTree)
    assert.equal(rootNode.childNodes[0], widgetInit)

    patch(rootNode, diff(initTree, updateTree))

    assert.equal(rootNode.childNodes[0], widgetUpdate)
    assert.end()
})

test("Destroy widget nested in removed thunk", function (assert) {
    var count = 0
    var widgetRoot = render(h(".widget"))
    var statefulWidget  = {
        init: function () {
            return widgetRoot
        },
        update: function () {
            assert.error()
        },
        destroy: function (domNode) {
            assert.equal(domNode, widgetRoot)
            count++
        },
        type: "Widget"
    }
    var vnode = h(".wrapper", statefulWidget)

    function Thunk() {}

    Thunk.prototype.render = function () {
        return vnode
    }

    Thunk.prototype.type = "Thunk"

    var thunkTree = h(".page", [
        h(".section", [
            new Thunk()
        ])
    ])

    var empty = h(".empty")

    var rootNode = render(thunkTree)
    patch(rootNode, diff(thunkTree, empty))
    assert.equal(count, 1)

    assert.end()
})

test("Create element respects namespace", function (assert) {
    if (!supportsNamespace()) {
        assert.skip("browser doesn't support namespaces");
        return assert.end();
    }

    var svgURI = "http://www.w3.org/2000/svg"
    var vnode = new Node("svg", {}, [], null, svgURI)
    var node = render(vnode)

    assert.equal(node.tagName, "svg")
    assert.equal(node.namespaceURI, svgURI)
    assert.end()
})

test("Different namespaces creates a patch", function (assert) {
    if (!supportsNamespace()) {
        assert.skip("browser doesn't support namespaces");
        return assert.end();
    }

    var leftNode = new Node("div", {}, [], null, "testing")
    var rightNode = new Node("div", {}, [], null, "undefined")

    var rootNode = render(leftNode)
    assert.equal(rootNode.tagName, "div")
    assert.equal(rootNode.namespaceURI, "testing")

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    rootNode = patch(rootNode, patches)

    assert.equal(rootNode.tagName, "div")
    assert.equal(rootNode.namespaceURI, "undefined")

    assert.end()
})

// Safely translates style values using the DOM in the browser
function style(name, value) {
    var node = render(h())
    node.style[name] = value
    return node.style[name]
}

// Determine if namespace is supported by the DOM
function supportsNamespace() {
    var node = render(h())
    return 'namespaceURI' in node;
}

