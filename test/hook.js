var test = require("tape")

var h = require("../h.js")
var Node = require("../vtree/vnode.js")
var create = require("../create-element.js")

test("Hooks are added to a hooks array on a node", function (assert) {
    function Prop() {}
    Prop.prototype.hook = function () {}

    var node = new Node("div", {
        "id": new Prop(),
        "value": "not a hook"
    }, [], null, null)

    assert.equal(node.hooks.length, 1)
    assert.equal(node.hooks[0], "id")
    assert.equal(node.descendantHooks, false)
    assert.end()
})

test("Node child hooks are identified", function (assert) {
    function Prop() {}
    Prop.prototype.hook = function () {}

    var node = new Node("div", {
        "id": new Prop(),
        "value": "not a hook"
    }, [], null, null)

    var parentNode = new Node("div", {
        "id": "not a hook"
    }, [node], null, null)

    assert.equal(node.hooks.length, 1)
    assert.equal(node.hooks[0], "id")
    assert.equal(parentNode.hooks, null)
    assert.ok(parentNode.descendantHooks)
    assert.end()
})

test("hooks get called in render", function (assert) {
    var counter = 0
    var vtree = h("div", {
        "some-key": hook(function (elem, prop) {
            counter++
            assert.equal(prop, "some-key")
            assert.equal(elem.tagName, "DIV")

            elem.className = "bar"
        })
    })

    var elem = create(vtree)
    assert.equal(elem.className, "bar")
    assert.equal(counter, 1)

    assert.end()
})

function hook(fn) {
    function Type() {}
    Type.prototype.hook = fn

    return new Type()
}
