var test = require("tape")
var createElement = require("vdom/create-element")
var patch = require("vdom/patch")
var diff = require("vtree/diff")
var DataSet = require("data-set")
var h = require("../index.js")


test("h with events", function (assert) {
    function one() {}

    var left = h(".foo", {
        "ev-click": one
    })

    var right = h(".bar", {})

    var elem = createElement(left)

    var ds1 = DataSet(elem)
    assert.ok(ds1)
    assert.equal(ds1.click, one)

    var patches = diff(left, right)

    patch(elem, patches)

    var ds2 = DataSet(elem)
    assert.ok(ds2)
    assert.equal(ds1, ds2)
    assert.equal(ds2.click, undefined)

    assert.end()
})
