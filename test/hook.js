var test = require("tape")

var Node = require("../vtree/vnode.js")

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
