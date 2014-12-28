var test = require("tape")
var EvStore = require("ev-store")

var h = require("../index.js")
var createElement = require("../../vdom/create-element")
var patch = require("../../vdom/patch")
var diff = require("../../vtree/diff")

test("h with events", function (assert) {
    function one() {}

    var left = h(".foo", {
        "ev-click": one
    })

    var right = h(".bar", {})

    var elem = createElement(left)

    var ds1 = EvStore(elem)
    assert.ok(ds1)
    assert.equal(ds1.click, one)

    var patches = diff(left, right)

    patch(elem, patches)

    var ds2 = EvStore(elem)
    assert.ok(ds2)
    assert.equal(ds1, ds2)
    assert.equal(ds2.click, undefined)

    assert.end()
})
