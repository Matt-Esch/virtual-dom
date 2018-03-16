'use strict'


var test = require("tape")
var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")
var assertEqualDom = require("./lib/assert-equal-dom.js")



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
