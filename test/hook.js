var test = require("tape")

var h = require("../h.js")
var Node = require("../vnode/vnode.js")
var create = require("../create-element.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var patchCount = require("./lib/patch-count.js")

test("Stateful hooks are added to a hooks object on a node", function (assert) {
    function StatefulHook() {}
    StatefulHook.prototype.hook = function () {}
    StatefulHook.prototype.unhook = function () {}
    var statefulValue = new StatefulHook()

    function StatelessHook() {}
    StatelessHook.prototype.hook = function () {}
    var statelessValue = new StatelessHook()

    var node = new Node("div", {
        stateful: statefulValue,
        stateless: statelessValue,
        value: "not a hook"
    }, [], null, null)

    assert.equal(node.hooks.stateful, statefulValue)
    assert.equal(node.hooks.stateless, undefined)
    assert.equal(node.descendantHooks, false)
    assert.end()
})

test("Node child stateless hooks are not identified", function (assert) {
    function Prop() {}
    Prop.prototype.hook = function () {}
    var propValue = new Prop()

    var node = new Node("div", {
        "id": propValue,
        "value": "not a hook"
    }, [], undefined, undefined)

    var parentNode = new Node("div", {
        "id": "not a hook"
    }, [node], undefined, undefined)

    assert.equal(node.hooks, undefined)
    assert.equal(parentNode.hooks, undefined)
    assert.notOk(parentNode.descendantHooks)
    assert.end()
})

test("Node child stateful hooks are identified", function (assert) {
    function Prop() {}
    Prop.prototype.hook = function () {}
    Prop.prototype.unhook = function () {}
    var propValue = new Prop()

    var node = new Node("div", {
        "id": propValue,
        "value": "not a hook"
    }, [], undefined, undefined)

    var parentNode = new Node("div", {
        "id": "not a hook"
    }, [node], undefined, undefined)

    assert.equal(node.hooks.id, propValue)
    assert.equal(parentNode.hooks, undefined)
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

test("hooks get called in patch", function (assert) {
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
    assert.equal(counters.a, 1, "counters.a")
    assert.equal(counters.b, 1, "counters.b")

    assert.end()
})

test("hooks are not called on trivial diff", function (assert) {
    var counters = {
        a: 0,
        b: 0,
        c: 0
    }

    var vnode = h("div", {
        test: hook(function () {
            counters.a++
        })
    }, [
        h("div", { test: hook(function () { counters.b++ }) }),
        h("div", { test: hook(function () { counters.c++ }) })
    ])

    var rootNode = create(vnode)
    assert.equal(counters.a, 1, "counters.a")
    assert.equal(counters.b, 1, "counters.b")
    assert.equal(counters.c, 1, "counters.c")

    var patches = diff(vnode, vnode)
    assert.equal(patchCount(patches), 0)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)
    assert.equal(counters.a, 1, "counters.a patch")
    assert.equal(counters.b, 1, "counters.b patch")
    assert.equal(counters.c, 1, "counters.c patch")
    assert.end()
})

test("all hooks are unhooked", function (assert) {
    var hookCounts = {}
    var unhookCounts = {}

    function Hook(value) {
        if (!(this instanceof Hook)) {
            return new Hook(value)
        }
        this.value = value
    }

    Hook.prototype.hook = function hook() {
        var key = this.value
        if (key in hookCounts) {
            hookCounts[key]++
        } else {
            hookCounts[key] = 1;
        }
    }

    Hook.prototype.unhook = function unhook() {
        var key = this.value;
        if (key in unhookCounts) {
            unhookCounts[key]++
        } else {
            unhookCounts[key] = 1;
        }
    }

    var rootHook = Hook("rootHook")
    var childHookA = Hook("childHookA")
    var childHookB = Hook("childHookB")
    var childHookC = Hook("childHookC")
    var thunkyRootHook = Hook("thunkyRootHook")
    var thunkyChildHookA = Hook("thunkyChildHookA")
    var thunkyChildHookB = Hook("thunkyChildHookB")
    var thunkyChildHookC = Hook("thunkyChildHookC")

    function Thunky() {}

    Thunky.prototype.render = function () {
        return h("div", {
            rootHook: thunkyRootHook
        }, [
            h("div", {
                childHook: thunkyChildHookA
            }),
            h("div", {
                childHook: thunkyChildHookB
            }),
            h("div", {
                childHook: thunkyChildHookC
            })
        ])
    }

    Thunky.prototype.type = "Thunk"


    var firstTree = h("div", {
        rootHook: rootHook
    }, [
        h("div", {
            childHook: childHookA
        }),
        h("div", {
            childHook: childHookB
        }, [
            new Thunky()
        ]),
        h("div", {
            childHook: childHookC
        })
    ])

    var secondTree = h("div", {
        rootHook: rootHook
    }, [
        h("div", {
            childHook: childHookA
        }),
        h("div", {
            childHook: childHookB
        }, [
            new Thunky()
        ]),
        h("div", {
            childHook: childHookC
        })
    ])

    var thirdTree = h('span')

    var rootNode = create(firstTree)

    assertHooked();

    var firstPatches = diff(firstTree, secondTree)

    assertHooked();

    assert.strictEqual(patchCount(firstPatches), 0, "No patches for identical")
    rootNode = patch(rootNode, firstPatches)

    assertHooked();

    var secondPatches = diff(secondTree, thirdTree)

    assertHooked();

    // Expect 1 root patch, 3 unhook patches and a thunk patch
    assert.strictEqual(patchCount(secondPatches), 5, "Expect unhook patches")

    rootNode = patch(rootNode, secondPatches)

    assertUnhooked()

    assert.end()

    function assertHooked() {
        assert.strictEqual(hookCounts.rootHook, 1)
        assert.strictEqual(hookCounts.childHookA, 1)
        assert.strictEqual(hookCounts.childHookB, 1)
        assert.strictEqual(hookCounts.childHookC, 1)
        assert.strictEqual(hookCounts.thunkyRootHook, 1)
        assert.strictEqual(hookCounts.thunkyChildHookA, 1)
        assert.strictEqual(hookCounts.thunkyChildHookB, 1)
        assert.strictEqual(hookCounts.thunkyChildHookC, 1)
        assert.strictEqual(unhookCounts.rootHook, undefined)
        assert.strictEqual(unhookCounts.childHookA, undefined)
        assert.strictEqual(unhookCounts.childHookB, undefined)
        assert.strictEqual(unhookCounts.childHookC, undefined)
        assert.strictEqual(unhookCounts.thunkyRootHook, undefined)
        assert.strictEqual(unhookCounts.thunkyChildHookA, undefined)
        assert.strictEqual(unhookCounts.thunkyChildHookB, undefined)
        assert.strictEqual(unhookCounts.thunkyChildHookC, undefined)
    }

    function assertUnhooked() {
        assert.strictEqual(hookCounts.rootHook, 1)
        assert.strictEqual(hookCounts.childHookA, 1)
        assert.strictEqual(hookCounts.childHookB, 1)
        assert.strictEqual(hookCounts.childHookC, 1)
        assert.strictEqual(hookCounts.thunkyRootHook, 1)
        assert.strictEqual(hookCounts.thunkyChildHookA, 1)
        assert.strictEqual(hookCounts.thunkyChildHookB, 1)
        assert.strictEqual(hookCounts.thunkyChildHookC, 1)
        assert.strictEqual(unhookCounts.rootHook, 1)
        assert.strictEqual(unhookCounts.childHookA, 1)
        assert.strictEqual(unhookCounts.childHookB, 1)
        assert.strictEqual(unhookCounts.childHookC, 1)
        assert.strictEqual(unhookCounts.thunkyRootHook, 1)
        assert.strictEqual(unhookCounts.thunkyChildHookA, 1)
        assert.strictEqual(unhookCounts.thunkyChildHookB, 1)
        assert.strictEqual(unhookCounts.thunkyChildHookC, 1)
    }
})

function createAndPatch(prev, curr) {
    var elem = create(prev)
    var patches = diff(prev, curr)
    elem = patch(elem, patches)

    return elem
}

function Type(fn) {
    this.fn = fn
}

Type.prototype.hook = function () {
    this.fn.apply(this, arguments)
}

function hook(fn) {
    return new Type(fn)
}
