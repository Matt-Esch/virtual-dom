'use strict'

var test = require("tape")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")
var Node = require("../vnode/vnode")
var assertEqualDom = require("./lib/assert-equal-dom.js")
var patchCount = require("./lib/patch-count.js")


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


// Determine if namespace is supported by the DOM
function supportsNamespace() {
    var node = render(h())
    return 'namespaceURI' in node;
}
