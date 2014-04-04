var test = require("tape")
var DataSet = require("data-set")
var document = require("global/document")

var h = require("../h")
var diff = require("../diff")
var patch = require("../patch")
var Node = require("../virtual-dom-node")
var createElement = require("../create-element")
// var tags = require("./tags.json")
var version = require("../version")
var doc = typeof document !== "undefined" ? document : require("min-document")

function render(virtualDom, opts) {
  opts = opts || {}
  opts.document = opts.document || doc
  return createElement(virtualDom, opts)
}

// VirtualDOMNode tests
test("Node is a function", function (assert) {
    assert.equal(typeof Node, "function")
    assert.end()
})

test("Node type and version are set", function (assert) {
    assert.equal(Node.prototype.type, "VirtualDOMNode")
    assert.deepEqual(Node.prototype.version, version.split("."))
    assert.end()
})

// h tests

test("h is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("defaults to div node", function (assert) {
    var node = h()
    assertNode(assert, node, "div")
    assert.end()
})


/*

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
}) */

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
    assert.false(dom.id)
    assert.false(dom.className)
    assert.equal(dom.childNodes.length, 1)
    assert.equal(dom.childNodes[0].data, "hello")
    assert.end()
})

test("render div", function (assert) {
    var vdom = h()
    var dom = render(vdom)
    assert.false(dom.id)
    assert.false(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node id is applied correctly", function (assert) {
    var vdom = h("#important")
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.false(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node class name is applied correctly", function (assert) {
    var vdom = h(".pretty")
    var dom = render(vdom)
    assert.false(dom.id)
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

test("data-set is applied correctly", function (assert) {
    var vdom = h("div", { "data-id": "12345" })
    var dom = render(vdom)
    var data = DataSet(dom)
    assert.false(dom.id)
    assert.false(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.equal(data.id, "12345")
    assert.end()
})

test("style string is applied correctly", function (assert) {
    var vdom = h("#important.pretty", { style: "color: red;" })
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText.trim(), "color: red;")
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
    assert.equal(dom.style.border, "1px solid rgb(0, 0, 0)")
    assert.equal(dom.style.padding, "2px")
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
    var vdom = h("#important.pretty", { style: "color: red;" }, [
        {}, null
    ])
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText.trim(), "color: red;")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("injected document object is used", function (assert) {
    var vdom = h("div", "hello")
    var count = 0
    var doc = {
        createElement: function createElement(tagName) {
            assert.equal(tagName, "div")
            count++
            return { tagName: "div", appendChild: function (t) {
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
    var vdom = h("#important.pretty", { style: "color: red;" }, [
        badObject, null
    ])

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
    assert.equal(dom.style.cssText.trim(), "color: red;")
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

test("dom node style", function (assert) {
    var a = h("div", { style: { foo: "bar", bar: "oops" } })
    var b = h("div", { style: { foo: "baz", bar: "oops" } })
    var rootNode = render(a)
    assert.equal(rootNode.style.foo, "bar")
    assert.equal(rootNode.style.bar, "oops")
    var s1 = rootNode.style
    var equalNode = render(b)
    assert.equal(equalNode.style.foo, "baz")
    var newRoot = patch(rootNode, diff(a, b))
    var s2 = newRoot.style
    assertEqualDom(assert, newRoot, equalNode)
    assert.equal(newRoot.style.foo, "baz")
    assert.equal(newRoot.style.bar, "oops")
    assert.equal(s1, s2)
    assert.end()
})

test("dom node dataset", function (assert) {
    var a = h("div", { dataset: { foo: "bar", bar: "oops" } })
    var b = h("div", { dataset: { foo: "baz", bar: "oops" } })
    var rootNode = render(a)
    var d1 = rootNode.dataset
    assert.equal(rootNode.dataset.foo, "bar")
    assert.equal(rootNode.dataset.bar, "oops")
    var equalNode = render(b)
    var newRoot = patch(rootNode, diff(a, b))
    var d2 = newRoot.dataset
    assertEqualDom(assert, newRoot, equalNode)
    assert.equal(newRoot.dataset.foo, "baz")
    assert.equal(newRoot.dataset.bar, "oops")
    assert.equal(d1, d2)
    assert.end()
})

test("dom node attributes", function (assert) {
    var a = h("div", { attributes: { foo: "bar", bar: "oops" } })
    var b = h("div", { attributes: { foo: "baz", bar: "oops" } })
    var rootNode = render(a)
    var a1 = rootNode.attributes
    var equalNode = render(b)
    var newRoot = patch(rootNode, diff(a, b))
    var a2 = newRoot.attributes
    assertEqualDom(assert, newRoot, equalNode)
    assert.equal(newRoot.attributes.foo, "baz")
    assert.equal(newRoot.attributes.bar, "oops")
    assert.equal(a1, a2)
    assert.end()
})

test("dom data- attributes", function (assert) {
    function Left() {
        this.left = 4
    }
    Left.prototype.foo = function () { return this.left }

    function Right() {
        this.right = 5
    }
    Right.prototype.foo = function () { return this.right }

    var a = h("div", { "data-foo": new Left() })
    var b = h("div", { "data-foo": new Right() })
    var rootNode = render(a)
    var foo1 = DataSet(rootNode).foo
    var equalNode = render(b)
    var foo2 = DataSet(equalNode).foo
    var newRoot = patch(rootNode, diff(a, b))
    var foo3 = DataSet(newRoot).foo
    assertEqualDom(assert, newRoot, equalNode)

    assert.equal(foo1.left, 4)
    assert.equal(foo1.foo(), 4)
    assert.equal(foo2.right, 5)
    assert.equal(foo2.foo(), 5)
    assert.equal(foo3.right, 5)
    assert.equal(foo3.foo && foo3.foo(), 5)

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


// Widget tests
test("Widget is initialised on render", function (assert) {
    var initCount = 0
    var testNode = render(h("div"))
    var Widget = {
        init: function () {
            initCount++
            return testNode
        }
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
        }
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

    var leftTree = new Widget(leftState)
    var rightTree = new Widget(rightState)
    domNode = render(leftTree)
    assert.equal(initCount, 1, "initCount after left render")
    assert.equal(updateCount, 0, "updateCount after left render")

    var patches = diff(leftTree, rightTree)
    assert.equal(Object.keys(patches).length, 2)
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
    assert.equal(Object.keys(patches).length, 2)
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

test("VNode indicates stateful sibling", function (assert) {
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {}
    }

    var pureWidget = {
        init: function () {},
        update: function () {}
    }

    var stateful = h("div", [statefulWidget])
    var pure = h("div", [pureWidget])

    assert.true(stateful.hasWidgets)
    assert.false(pure.hasWidgets)
    assert.end()
})

test("Replacing stateful widget with vnode calls destroy", function (assert) {
    var count = 0
    var statefulWidget  = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count++
        }
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
        }
    }

    var newWidget = {
        init: function () {},
        update: function () {},
        destroy: function () {
            count = 10000000
        }
    }

    var rootNode = render(h("div"))
    patch(rootNode, diff(statefulWidget, newWidget))
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
        }
    }

    var newWidget = {
        init: function () {},
        update: function () {}
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
        }
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
        }
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

function assertEqualDom(assert, a, b) {
    assert.ok(areEqual(a, b) && areEqual(b, a), "Dom structures are equal")
}

function areEqual(a, b) {
    for (var key in a) {
        if (key !== "parentNode" &&
            key !== "parentElement" &&
            key !== "defaultView" &&
            key !== "ownerElement" &&
            key !== "nextElementSibling" &&
            key !== "nextSibling" &&
            key !== "previousElementSibling" &&
            key !== "previousSibling" &&
            key !== "document" &&
            key !== "window" &&
            key !== "frames" &&
            key !== "top" &&
            key !== "parent" &&
            key !== "self" &&
            key !== "outerHTML" &&
            key !== "innerHTML"
        ) {
            if (key === "ownerDocument") return a[key] === b[key]
            if (typeof a === "object" || typeof a === "function") {
                if (!areEqual(a[key], b[key])) {
                    return false
                }
            } else {
                if (a !== b) {
                    return false
                }
            }
        }
    }

    return true
}
