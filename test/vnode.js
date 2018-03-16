'use strict'


var test = require("tape")
var Node = require("../vnode/vnode")
var TextNode = require("../vnode/vtext")
var version = require("../vnode/version")



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
