var test = require("tape")
var isObject = require("is-object")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")

test("undefined props are not set in create-element", function (assert) {
    var node = h("div", { special: undefined })
    var rootNode = render(node)
    assert.ok(!("special" in rootNode))
    assert.end()
})

test("undefined removes all previous styles", function (assert) {
    var leftNode = h("div", {
        style: {
            display: "none",
            border: "1px solid #000"
        }
    })

    var rightNode = h("div", {
        style: undefined
    })

    var rootNode = createAndPatch(leftNode, rightNode)

    assert.equal(rootNode.style.display, style("display", ""))
    assert.equal(rootNode.style.border, style("border", ""))
    assert.end();
})

test("undefined style removes individual styles", function (assert) {
    var leftNode = h("div", { "style": { "display": "none" }})
    var rightNode = h("div", { "style": undefined })

    var rootNode = createAndPatch(leftNode, rightNode)

    assert.equal(rootNode.style.display, style("display", ""))
    assert.end()
})

test("undefined ignored for hooks", function (assert) {
    function CheckNodeBeforeSet(value) {
        this.value = value
    }
    CheckNodeBeforeSet.prototype.hook = function (rootNode, propName) {
        var value = this.value
        if (value !== rootNode[propName]) {
            rootNode[propName] = value
        }
    }

    var leftNode = h("input", { value: new CheckNodeBeforeSet("hello") })
    var rightNode = h("input", { value: undefined })

    var rootNode = render(leftNode)
    assert.equal(rootNode.value, "hello")

    var newRoot = patch(rootNode, diff(leftNode, rightNode))
    assert.equal(newRoot.value, "hello")

    assert.end()
})

test("undefined nulls other complex types", function (assert) {
    var leftNode = h("input", { special: {} })
    var rightNode = h("input", { special: null })

    var rootNode = render(leftNode)
    assert.ok(isObject(rootNode.special))


    var newRoot = patch(rootNode, diff(leftNode, rightNode))
    assert.equal(newRoot.special, null)

    assert.end()
})

test("null not ignored for value", function (assert) {
    var leftNode = h("input", { value: "hello" })
    var rightNode = h("input", { value: null })

    var rootNode = createAndPatch(leftNode, rightNode)

    assert.equal(rootNode.value, property("input", "value", null))
    assert.end()
})

test("null not ignored for objects", function (assert) {
    var leftNode = h("div", { "test": { "complex": "object" }})
    var rightNode = h("div", { "test": null })

    var rootNode = createAndPatch(leftNode, rightNode)

    assert.equal(rootNode.test, null)
    assert.end()
})

test("null not ignored for hooks", function (assert) {
    function CheckNodeBeforeSet(value) {
        this.value = value
    }
    CheckNodeBeforeSet.prototype.hook = function (rootNode, propName) {
        var value = this.value
        if (value !== rootNode[propName]) {
            rootNode.value = value
        }
    }

    var leftNode = h("input", { value: new CheckNodeBeforeSet("hello") })
    var rightNode = h("input", { value: null })

    var rootNode = render(leftNode)
    assert.equal(rootNode.value, "hello")

    var newRoot = patch(rootNode, diff(leftNode, rightNode))
    assert.equal(newRoot.value, property("input", "value", null))

    assert.end()
})

function createAndPatch(prev, curr) {
    var elem = render(prev)
    var patches = diff(prev, curr)
    return patch(elem, patches)
}

// Safely translates style values using the DOM in the browser
function style(name, value) {
    var node = render(h())
    node.style[name] = value
    return node.style[name]
}

// Safely transaltes node property using the DOM in the browser
function property(tag, prop, value) {
    var node = render(h(tag))
    node[prop] = value
    return node[prop]
}
