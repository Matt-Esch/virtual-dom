var test = require("tape")
var EvStore = require('ev-store')

var h = require("../index")

test("h is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("h returns a vnode", function (assert) {
    assert.equal(h("div").tagName, "DIV")

    assert.end()
})

test("h defaults tagName to uppercase", function (assert) {
    assert.equal(h("").tagName, "DIV")
    assert.equal(h("div").tagName, "DIV")
    assert.end()
})

test("h preserves tagName case if namespace is given", function (assert) {
    assert.equal(h("test", { namespace: "http://www.w3.org/XML/1998/namespace" }).tagName, "test")
    assert.end()
})

test("h has props", function (assert) {
    assert.equal(h("div", {
        foo: "bar"
    }).properties.foo, "bar")

    assert.end()
})

test("h with text", function (assert) {
    var node = h("div", "text")

    assert.equal(node.children[0].text, "text")

    assert.end()
})

test("h with key", function (assert) {
    var node = h("div", { key: "bar" })

    assert.equal(node.key, "bar")

    assert.end()
})


test("h with ev-", function (assert) {
    var node = h("div", { "ev-foo": "bar" })

    assert.ok(node.properties["ev-foo"])

    var hook = node.properties["ev-foo"]
    var elem = {}
    hook.hook(elem, "ev-foo")
    assert.equal(EvStore(elem).foo, "bar")

    assert.end()
})

test("input.value soft hook", function (assert) {
    var node = h("input", { value: "text" })

    assert.equal(typeof node.properties.value, "object")
    var elem = {}
    node.properties.value.hook(elem, "value")

    assert.equal(elem.value, "text")

    assert.end()
})

test("h with child", function (assert) {
    var node = h("div", h("span"))

    assert.equal(node.children[0].tagName, "SPAN")

    assert.end()
})

test("h with children", function (assert) {
    var node = h("div", [h("span")])

    assert.equal(node.children[0].tagName, "SPAN")

    assert.end()
})

test("h with null", function (assert) {
    var node = h("div", null)
    var node2 = h("div", [null])

    assert.equal(node.children.length, 0)
    assert.equal(node2.children.length, 0)

    assert.end()
})

test("h with undefined", function (assert) {
    var node = h("div", undefined)
    var node2 = h("div", [undefined])

    assert.equal(node.children.length, 0)
    assert.equal(node2.children.length, 0)

    assert.end()
})

test("h with foreign object", function (assert) {
    var errorSingleChild

    try {
        h("div", null, { foreign: "object" })
    } catch (e) {
        errorSingleChild = e
    }

    var errorChildren

    try {
        h("div", [{ foreign: "object" }])
    } catch (e) {
        errorChildren = e
    }

    assert.ok(errorSingleChild);
    assert.ok(/Unexpected virtual child/.test(errorSingleChild.message))

    assert.ok(errorChildren);
    assert.ok(/Unexpected virtual child/.test(errorChildren.message))

    assert.end()
})

test("h with class", function (assert) {
    var node = h(".foo")

    assert.equal(node.properties.className, "foo")

    assert.end()
})

test("h with id", function (assert) {
    var node = h("#foo")

    assert.equal(node.properties.id, "foo")

    assert.end()
})

test("h with empty string", function (assert) {
    var node = h("")

    assert.equal(node.tagName, "DIV")

    assert.end()
})

test("h with two classes", function (assert) {
    var node = h(".foo", { className: "bar" })

    assert.equal(node.properties.className, "foo bar")

    assert.end()
})

test("h with two ids", function (assert) {
    var node = h("#foo", { id: "bar" })

    assert.equal(node.properties.id, "bar")

    assert.end()
})
