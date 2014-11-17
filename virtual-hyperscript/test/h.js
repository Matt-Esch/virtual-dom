var test = require("tape")
var DataSet = require("data-set")

var h = require("../index")

test("h is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("h returns a vnode", function (assert) {
    assert.equal(h("div").tagName, "div")

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

test("h with data-", function (assert) {
    var node = h("div", { "data-foo": "bar" })

    assert.ok(node.properties["data-foo"])

    var hook = node.properties["data-foo"]
    var elem = {}
    hook.hook(elem, "data-foo")
    assert.equal(DataSet(elem).foo, "bar")

    assert.end()
})

test("h with ev-", function (assert) {
    var node = h("div", { "ev-foo": "bar" })

    assert.ok(node.properties["ev-foo"])

    var hook = node.properties["ev-foo"]
    var elem = {}
    hook.hook(elem, "ev-foo")
    assert.equal(DataSet(elem).foo, "bar")

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

    assert.equal(node.children[0].tagName, "span")

    assert.end()
})

test("h with children", function (assert) {
    var node = h("div", [h("span")])

    assert.equal(node.children[0].tagName, "span")

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
    assert.throws(function () {
        h("div", null, { foreign: "object" })
    }, /Unexpected virtual child/)
    assert.throws(function () {
        h("div", [{ foreign: "object" }])
    }, /Unexpected virtual child/)

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

    assert.equal(node.tagName, "div")

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
