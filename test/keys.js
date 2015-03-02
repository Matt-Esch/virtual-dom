var test = require("tape")

var h = require("../h.js")
var diff = require("../diff.js")
var patch = require("../patch.js")
var render = require("../create-element.js")

var patchCount = require("./lib/patch-count.js")
var assertEqualDom = require("./lib/assert-equal-dom.js")
var nodesFromArray = require("./lib/nodes-from-array.js")
var assertChildNodesFromArray = require("./lib/assert-childNodes-from-array.js")

var VPatch = require("../vnode/vpatch.js")

test("keys get reordered", function (assert) {
    var leftNode = nodesFromArray(["1", "2", "3", "4", "test", "6", "good", "7"])
    var rightNode = nodesFromArray(["7", "4", "3", "2", "6", "test", "good", "1"])

    var rootNode = render(leftNode)

    var childNodes = []
    for (var i = 0; i < rootNode.childNodes.length; i++) {
        childNodes.push(rootNode.childNodes[i])
    }

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)
    assertReorderEquals(assert, patches, {
        removes: [
            {from: 0, key: '1'},
            {from: 0, key: '2'},
            {from: 1, key: '4'},
            {from: 2, key: '6'},
            {from: 3, key: '7'}
        ],
        inserts: [
            {to: 0, key: '7'},
            {to: 1, key: '4'},
            {to: 3, key: '2'},
            {to: 4, key: '6'},
            {to: 7, key: '1'}
        ]
    })

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.equal(newRoot.childNodes[7], childNodes[0])
    assert.equal(newRoot.childNodes[3], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[1], childNodes[3])
    assert.equal(newRoot.childNodes[5], childNodes[4])
    assert.equal(newRoot.childNodes[4], childNodes[5])
    assert.equal(newRoot.childNodes[6], childNodes[6])
    assert.equal(newRoot.childNodes[0], childNodes[7])
    assert.end()
})

test("mix keys without keys", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div", { key: 1 })
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)
    assertReorderEquals(assert, patches, {
        removes: [{from: 0, key: '1'}],
        inserts: [{to: 7, key: '1'}]
    })

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.equal(newRoot.childNodes[0], childNodes[1])
    assert.equal(newRoot.childNodes[1], childNodes[2])
    assert.equal(newRoot.childNodes[2], childNodes[3])
    assert.equal(newRoot.childNodes[3], childNodes[4])
    assert.equal(newRoot.childNodes[4], childNodes[5])
    assert.equal(newRoot.childNodes[5], childNodes[6])
    assert.equal(newRoot.childNodes[6], childNodes[7])
    assert.equal(newRoot.childNodes[7], childNodes[0])
    assert.end()
})

test("avoid unnecessary reordering", function (assert) {
    var leftNode = h("div", [
        h("div"),
        h("div", { key: 1 }),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div", { key: 1 }),
        h("div")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 0)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.end()
})

test("missing key gets replaced", function (assert) {
    var leftNode = h("div", [
        h("div", { key: 1 }),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
    ])

    var rightNode = h("div", [
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div"),
        h("div")
    ])

    var rootNode = render(leftNode)

    var childNodes = []
    for (var i = 0; i < rootNode.childNodes.length; i++) {
        childNodes.push(rootNode.childNodes[i])
    }

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assert.notEqual(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[3], childNodes[3])
    assert.equal(newRoot.childNodes[4], childNodes[4])
    assert.equal(newRoot.childNodes[5], childNodes[5])
    assert.equal(newRoot.childNodes[6], childNodes[6])
    assert.equal(newRoot.childNodes[7], childNodes[7])
    assert.end()
})

test("widgets can be keyed", function (assert) {
    function DivWidget(key, state) {
        this.key = key
        this.state = state
    }

    DivWidget.prototype.init = function () {
        return render(h("div", this.state))
    }

    DivWidget.prototype.update = function (rootNode, prev) {
        if (this.state !== prev.state) {
            return render(h("div", this.state))
        }
    }

    DivWidget.prototype.type = "Widget"

    var leftNode = h("div", [
        new DivWidget("1", "a"),
        new DivWidget("2", "b"),
        new DivWidget("3", "c")
    ])

    var rightNode = h("div", [
        new DivWidget("3", "c"),
        new DivWidget("2", "b"),
        new DivWidget("1", "a")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)


    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 4)    // 1 reorder and 3 update patches

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, rootNode.childNodes.length)

    assertEqualDom(assert, newRoot.childNodes[0], childNodes[2])
    assertEqualDom(assert, newRoot.childNodes[1], childNodes[1])
    assertEqualDom(assert, newRoot.childNodes[2], childNodes[0])
    assert.end()
})

test("delete key at the start", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    // just a remove patch
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 2)

    assert.equal(newRoot.childNodes[0], childNodes[1])
    assert.equal(newRoot.childNodes[1], childNodes[2])
    assert.end()
})

test("add key to start", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 3)

    assert.equal(newRoot.childNodes[1], childNodes[0])
    assert.equal(newRoot.childNodes[2], childNodes[1])
    assert.end()
})

test("delete key at the end", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    // just a remove patch
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 2)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.end()
})

test("add key to end", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b")
    ])

    var rightNode = h("div", [
        h("div", { key: "a" }, "a"),
        h("div", { key: "b" }, "b"),
        h("div", { key: "c" }, "c")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 1)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 3)

    assert.equal(newRoot.childNodes[0], childNodes[0])
    assert.equal(newRoot.childNodes[1], childNodes[1])
    assert.end()
})

test("add to end and delete from center & reverse", function (assert) {
    var leftNode = h("div", [
        h("div", { key: "a", id: "a" }, "a"),
        h("div", { key: "b", id: "b" }, "b"),
        h("div", { key: "c", id: "c" }, "c"),
        h("div", { key: "d", id: "d" }, "d")
    ])

    var rightNode = h("div", [
        h("div", { key: "e", id: "e" }, "e"),
        h("div", { key: "d", id: "d" }, "d"),
        h("div", { key: "c", id: "c" }, "c"),
        h("div", { key: "a", id: "a" }, "a")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)
    assert.equal(patchCount(patches), 2)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 4)

    assert.equal(newRoot.childNodes[1], childNodes[3])
    assert.equal(newRoot.childNodes[2], childNodes[2])
    assert.equal(newRoot.childNodes[3], childNodes[0])
    assert.end()
})

test("add to front and remove", function (assert) {
    var leftNode = h("ul", [
        h("li", { key: "c" }, "c"),
        h("li", { key: "d" }, "d")
    ])

    var rightNode = h("ul", [
        h("li", { key: "a" }, "a"),
        h("li", { key: "b" }, "b"),
        h("li", { key: "c" }, "c"),
        h("li", { key: "e" }, "e")
    ])

    var rootNode = render(leftNode)
    var childNodes = childNodesArray(rootNode)

    var patches = diff(leftNode, rightNode)

    var newRoot = patch(rootNode, patches)
    assert.equal(newRoot, rootNode)

    assert.equal(newRoot.childNodes.length, 4)

    assert.equal(newRoot.childNodes[2], childNodes[0])
    assert.end()
})

test("adding multiple widgets", function (assert) {
    function FooWidget(foo) {
        this.foo = foo
        this.counter = 0
        this.key = foo
    }

    FooWidget.prototype.init = function () {
        return render(h("div", String(this.foo)))
    }

    FooWidget.prototype.update = function (prev, elem) {
        this.counter = prev.counter + 1
        elem.textContent = this.foo + this.counter
    }

    FooWidget.prototype.type = "Widget"

    var firstTree = h("div", [])
    var rootNode = render(firstTree)

    assert.equal(rootNode.tagName, "DIV")

    var secondTree = h("div", [
        new FooWidget("foo")
    ])
    rootNode = patch(rootNode, diff(firstTree, secondTree))

    assert.equal(rootNode.tagName, "DIV")
    assert.equal(rootNode.childNodes.length, 1)
    assert.equal(rootNode.childNodes[0].tagName, "DIV")
    assert.equal(rootNode.childNodes[0].childNodes[0].data, "foo")

    var thirdTree = h("div", [
        new FooWidget("foo"),
        new FooWidget("bar")
    ])
    rootNode = patch(rootNode, diff(secondTree, thirdTree))

    assert.equal(rootNode.tagName, "DIV")
    assert.equal(rootNode.childNodes.length, 2)

    assert.end()
})

var itemHelpers = {
    item: function (key) {
        key = key.toString()
        return h('div', { key: key, id: key }, ["" + key])
    },

    container: function (children) {
        return h('div', children)
    },

    itemsInContainer: function () {
        return {
            from: function (start) {
                return {
                    to: function (end) {
                        function withPredicate(predicate) {
                            var items = []
                            for (var i = start; i <= end; i++) {
                                if (!predicate(i)) continue
                                items.push(itemHelpers.item(i))
                            }
                            return itemHelpers.container(items)
                        }
                        return {
                            by: function (increment) {
                                return withPredicate(function (i) {
                                    return (i - start) % increment === 0
                                })
                            },
                            withPredicate: withPredicate
                        }
                    }
                }
            }
        }
    },

    expectTextOfChild: function (assert, rootNode, childNo, text) {
        assert.equal(rootNode.childNodes[childNo].id, text)
    }
}

test('3 elements in a container, insert an element after each', function (assert) {
    var threeItems = itemHelpers.itemsInContainer().from(0).to(4).by(2)
    var sixItems = itemHelpers.itemsInContainer().from(0).to(5).by(1)

    var rootNode = render(threeItems)
    rootNode = patch(rootNode, diff(threeItems, sixItems))

    for (var i = 0; i <= 5; i++) {
        itemHelpers.expectTextOfChild(assert, rootNode, i, i.toString())
    }

    assert.end()
})

test('10 elements in a container, remove every second element', function(assert) {
    var  fiveItems = itemHelpers.itemsInContainer().from(0).to(9).by(2)
    var tenItems = itemHelpers.itemsInContainer().from(0).to(9).by(1)

    var rootNode = render(tenItems)
    var patches = diff(tenItems, fiveItems)

    // 5 remove patches only
    assert.equal(patchCount(patches), 5)

    rootNode = patch(rootNode, patches)

    for (var i = 0; i < 5; i++) {
        itemHelpers.expectTextOfChild(assert, rootNode, i, (i * 2).toString())
    }

    assert.end()
})

test('3 elements in a container, add 3 elements after each', function (assert) {
    var first = itemHelpers.itemsInContainer().from(0).to(11).by(4)
    var second = itemHelpers.itemsInContainer().from(0).to(11).by(1)

    // Assert indices before
    assert.strictEqual(first.children.length, 3)

    var rootNode = render(first)

    for (var i = 0; i < 3; i++) {
        itemHelpers.expectTextOfChild(assert, rootNode, i, (4*i).toString())
    }

    // Assert indices after
    assert.strictEqual(second.children.length, 12)

    var newRoot = patch(rootNode, diff(first, second))

    for (var j = 0; j < 12; j++) {
        itemHelpers.expectTextOfChild(assert, newRoot, j, j.toString())
    }

    assert.end()
})

test('10 in container, add 1 after every 2nd element', function (assert) {
    function skipEveryThird(i) {
        return i % 3 === 0 || i % 3 === 1
    }

    var first = itemHelpers
        .itemsInContainer()
        .from(0)
        .to(14)
        .withPredicate(skipEveryThird)

    var second = itemHelpers.itemsInContainer().from(0).to(14).by(1)

    // Assert indices before
    assert.strictEqual(first.children.length, 10)

    var rootNode = render(first)
    var expectedIndices = [0, 1, 3, 4, 6, 7, 9, 10, 12, 13]

    for (var i = 0; i < 10; i++) {
        itemHelpers.expectTextOfChild(
            assert, rootNode, i, expectedIndices[i].toString()
        )
    }

    // Assert indices after
    assert.strictEqual(second.children.length, 15)

    var patches = diff(first, second)

    var newRoot = patch(rootNode, patches)

    for (var j = 0; j < 15; j++) {
        itemHelpers.expectTextOfChild(assert, newRoot, j, j.toString())
    }

    assert.end()
})

test('move a single element to the end', function (assert) {
    var start = nodesFromArray([0, 5, 1, 2, 3, 4])
    var end = nodesFromArray([0, 1, 2, 3, 4, 5])

    var patches = diff(start, end)

    assertReorderEquals(assert, patches, {
        removes: [{key: '5', from: 1}],
        inserts: [{key: '5', to: 5}]
    })
    assert.end()
})

test('move a single element to a later position', function (assert) {
    var start = nodesFromArray([0, 4, 1, 2, 3, 5])
    var end = nodesFromArray([0, 1, 2, 3, 4, 5])

    var patches = diff(start, end)

    assertReorderEquals(assert, patches, {
        removes: [{ key: '4', from: 1 }],
        inserts: [{ key: '4', to: 4 }]
    })
    assert.end()
})

test('remove a single element from early in the list', function (assert) {
    var start = nodesFromArray([0, 1, 2, 3, 4])
    var end = nodesFromArray([0, 2, 3, 4])

    var patches = diff(start, end)

    var reorderPatch = getReorderPatch(patches)
    assert.strictEqual(reorderPatch, null)
    assert.end()
})

test('move an element to a position after a removed element', function (assert) {
    var start = nodesFromArray([0, 1, 2, 3, 4, 5])
    var end = nodesFromArray([0, 2, 3, 5, 4])

    var patches = diff(start, end)

    assertReorderEquals(assert, patches, {
        removes: [
            {from: 1, key: null},
            {from: 4, key: '5'}
        ],
        inserts: [{to: 3, key: '5'}]
    })
    assert.end()
})

test('mixed keys move from i>0 to i<length-1', function (assert) {
    var start = nodesFromArray([undefined, undefined, 'key', undefined, undefined, undefined])
    var end = nodesFromArray([undefined, undefined, undefined, undefined, 'key', undefined])

    var patches = diff(start, end)

    assertReorderEquals(assert, patches, {
        removes: [{from: 2, key: 'key'}],
        inserts: [{to: 4, key: 'key'}]
    })
    assert.end()
})

/*
keyTest(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42],
    [41, 3, 34, 36, 1, 40, 39, 7, 37, 14, 23, 26, 15, 6, 25, 24, 19, 8, 9, 22, 29, 27, 38, 35, 11, 20, 33, 31, 17, 32, 4, 28, 12, 2, 10, 0, 42, 21, 5, 16, 30, 18, 13]
)
*/

keyTest(
    [,8289652839303017,21512342290952802,6586509908083826,,7,8,9,2,5,6,1,,4,2379920135717839,26182894385419786,],
    [,1,2,3,4,5,6,7,8,9,]
)

automateTests({
    numTests: 1000,
    minLength: 5,
    maxLength: 12,
    minMutations: 15,
    maxMutations: 20,
    keyRatio: 0.8,
    mutations: [addKeyed, addNonKeyed, remove, swap, reverse, move]
})

function addKeyed(list) {
    list.push(('' + Math.random()).substring(2))

    return list
}

function addNonKeyed(list) {
    list.push(undefined)
    return list
}

function remove(list) {
    var index = Math.floor(Math.random() * list.length)

    list.splice(index, 1)

    return list
}

function swap(list) {
    var index1 = Math.floor(Math.random() * list.length)
    var index2 = Math.floor(Math.random() * list.length)

    var item1 = list[index1]
    list[index1] = list[index2]
    list[index2] = item1

    return list
}

function reverse(list) {
    return list.reverse()
}

function move(list) {
    var from = Math.floor(Math.random() * list.length)
    var to = Math.floor(Math.random() * list.length)

    list.splice(to, 0, list.splice(from, 1)[0])

    return list
}

function automateTests(options) {
    options = options || {}

    var numTests = options.numTests || 10
    var minLength = options.minLength || 5
    var maxLength = options.maxLength || 10
    var minMutations = options.minMutations || 3
    var maxMutations = options.maxMutations || 5
    var keyRatio = options.keyRatio || 1
    var mutations = options.mutations || []

    while (numTests--) {
        var length = Math.ceil(Math.random() * (maxLength - minLength)) + minLength
        var count = 0
        var end = []

        do {
            var isKeyed = Math.random() < keyRatio
            end[count] = isKeyed ? count : undefined
        }
        while (++count < length)

        var start = end.slice()

        if (mutations.length) {
            var numMutations = Math.ceil(Math.random() * (maxMutations - minMutations)) + minMutations
            while (numMutations--) {
                var mutation = mutations[Math.floor(Math.random() * mutations.length)]
                start = mutation(start)
            }
        }

        keyTest(start, end)
    }
}

function keyTest(itemsA, itemsB) {
    test(
        'keyTest([' + itemsA.join() + '], [' + itemsB.join() + '])',
        assertKeys
    )

    function assertKeys(assert) {
        var nodesA = nodesFromArray(itemsA)
        var nodesB = nodesFromArray(itemsB)

        var patches = diff(nodesA, nodesB)

        var rootNode = render(nodesA)
        patch(rootNode, patches)

        var childNodes = rootNode.childNodes

        assertChildNodesFromArray(assert, itemsB, childNodes)


        assert.end()
    }
}

function childNodesArray(node) {
    var childNodes = []
    for (var i = 0; i < node.childNodes.length; i++) {
        childNodes.push(node.childNodes[i])
    }
    return childNodes
}

function getReorderPatch(patches) {
    for (var key in patches) {
        if (key !== "a" && patches.hasOwnProperty(key)) {
            var patch = patches[key]
            if (patch.type === VPatch.ORDER) {
                return patch
            }
        }
    }

    return null
}

function assertReorderEquals(assert, patches, expected) {
    var reorderPatch = getReorderPatch(patches)

    assert.deepEqual(reorderPatch.patch, expected)
}
