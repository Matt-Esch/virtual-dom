var test = require("tape")

var isThunk = require("../vnode/is-thunk")
var isVNode = require("../vnode/is-vnode")
var VNode = require("../vnode/vnode")
var diff = require("../diff.js")

var patchCount = require("./lib/patch-count.js")

function Thunk(tagName) {
    this.tagName = tagName
}

Thunk.prototype.render = function () {
    return new VNode(this.tagName)
}

Thunk.prototype.type = "Thunk"

test("is thunk", function (assert) {
    var notThunk = {}
    var thunkLiteral = {
        type: "Thunk",
        render: function () {}
    }

    assert.notOk(isThunk(notThunk))
    assert.ok(isThunk(thunkLiteral))
    assert.ok(isThunk(new Thunk("div")))
    assert.end()
})

test("null or undefined previous renders thunk", function (assert) {
    var n = new Thunk("first")
    var u = new Thunk("second")
    var nullPatches = diff(null, n)
    var undefPatches = diff(undefined, u)

    assert.ok(isVNode(n.vnode))
    assert.ok(isVNode(u.vnode))
    assert.equal(n.vnode.tagName, "first")
    assert.equal(u.vnode.tagName, "second")
    assert.equal(patchCount(nullPatches), 1)
    assert.equal(patchCount(undefPatches), 1)
    assert.end()
})

test("previous thunk passed to render", function (assert) {
    var renderCount = 0

    var previousThunk = new Thunk("div")

    var nextThunk = {
        type: "Thunk",
        render: function (previous) {
            renderCount++
            assert.equal(previous, previousThunk)
            return new VNode("test")
        }
    }

    var patches = diff(previousThunk, nextThunk)

    assert.equal(renderCount, 1)
    assert.equal(patchCount(patches), 1)
    assert.ok(isVNode(nextThunk.vnode))
    assert.equal(nextThunk.vnode.tagName, "test")
    assert.end()
})
