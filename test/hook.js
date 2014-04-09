var test = require("tape")

var h = require("../h.js")
var Node = require("../vtree/vnode.js")
var create = require("../create-element.js")
var diff = require("../diff.js")
var patch = require("../patch.js")

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

test("functions are not hooks in render", function (assert) {
    var counter = 0
    var fakeHook = function () {
        counter++
    }
    var vtree = h("div", {
        "someProp": fakeHook
    })

    var elem = create(vtree)
    assert.equal(elem.someProp, fakeHook)
    assert.equal(counter, 0)

    assert.end()
})

test("hook get called in patch", function (assert) {
    var counter = 0
    var prev = h("div")
    var curr = h("div", {
        "some-key": hook(function (elem, prop) {
            counter++
            assert.equal(prop, "some-key")
            assert.equal(elem.tagName, "DIV")

            elem.className = "bar"
        })
    })

    var elem = createAndPatch(prev, curr)
    assert.equal(elem.className, "bar")
    assert.equal(counter, 1)

    assert.end()
})

test("functions are not hooks in render", function (assert) {
    var counter = 0
    var fakeHook = function () {
        counter++
    }

    var prev = h("div")
    var curr = h("div", { someProp: fakeHook })

    var elem = createAndPatch(prev, curr)
    assert.equal(elem.someProp, fakeHook)
    assert.equal(counter, 0)

    assert.end()
})

test("two different hooks", function (assert) {
    var counters = { a: 0, b: 0 }
    var prev = h("div", { propA: hook(function () {
        counters.a++
    }) })
    var curr = h("div", { propB: hook(function () {
        counters.b++
    }) })

    var elem = createAndPatch(prev, curr)
    assert.equal(elem.propA, undefined)
    assert.equal(elem.propB, undefined)
    assert.equal(counters.a, 1)
    assert.equal(counters.b, 1)

    assert.end()
})

test("two hooks on same property", function (assert) {
    var counters = { a: 0, b: 0 }
    var prev = h("div", { propA: hook(function () {
        counters.a++
    }) })
    var curr = h("div", { propA: hook(function () {
        counters.b++
    }) })

    var elem = createAndPatch(prev, curr)
    assert.equal(elem.propA, undefined)
    assert.equal(counters.a, 1)
    assert.equal(counters.b, 1)

    assert.end()
})

test("two hooks of same interface", function (assert) {
    function Hook(key) {
        this.key = key
    }
    Hook.prototype.hook = function () {
        counters[this.key]++
    }

    var counters = { a: 0, b: 0 }
    var prev = h("div", { propA: new Hook("a") })
    var curr = h("div", { propA: new Hook("b") })

    var elem = createAndPatch(prev, curr)
    assert.equal(elem.propA, undefined)
    assert.equal(counters.a, 1)
    assert.equal(counters.b, 1)

    assert.end()
})

function createAndPatch(prev, curr) {
    var elem = create(prev)
    var patches = diff(prev, curr)
    elem = patch(elem, patches)

    return elem
}

function hook(fn) {
    function Type() {}
    Type.prototype.hook = fn

    return new Type()
}
