var test = require("tape")
var doc = require("global/document")

var propertyHook = require("../hooks/property-hook.js")
var h = require("../index.js")
var createElement = require("../../vdom/create-element")
var patch = require("../../vdom/patch")
var diff = require("../../vtree/diff")

test("sets and removes property", function (assert) {
    var hook1 = propertyHook('first value')
    var hook2 = propertyHook('first value')
    var hook3 = propertyHook('second value')

    var first = h('div', {'myprop': hook1})
    var second = h('div', {'myprop': hook2})
    var third = h('div', {'myprop': hook3})
    var fourth = h('div', {})

    var elem = createElement(first)
    assert.equal(elem.myprop, 'first value')

    var patches = diff(first, second)
    patch(elem, patches)
    // The value shouldn't change.
    assert.equal(elem.myprop, 'first value')

    patches = diff(second, third)
    patch(elem, patches)
    assert.equal(elem.myprop, 'second value')

    patches = diff(third, fourth)
    patch(elem, patches)
    assert.equal(elem.myprop, undefined)

    assert.end()
})

test("sets the property if previous value was not an PropertyHook", function (assert) {
    var OtherHook = function(value) {
        this.value = value
    }
    OtherHook.prototype.hook = function() {}

    var hook1 = new OtherHook('the value')
    var hook2 = propertyHook('the value')

    var first = h('div', {'myprop': hook1})
    var second = h('div', {'myprop': hook2})

    var elem = createElement(first)
    assert.equal(elem.myprop, undefined)

    patches = diff(first, second)
    patch(elem, patches)
    assert.equal(elem.myprop, 'the value')

    assert.end()
})

test("removes the property if next value is not an PropertyHook", function (assert) {
    var OtherHook = function(value) {
        this.value = value
    }
    OtherHook.prototype.hook = function() {}

    var hook1 = propertyHook('the value')
    var hook2 = new OtherHook('the value')

    var first = h('div', {'myprop': hook1})
    var second = h('div', {'myprop': hook2})

    var elem = createElement(first)
    assert.equal(elem.myprop, 'the value')

    patches = diff(first, second)
    patch(elem, patches)
    assert.equal(elem.myprop, undefined)

    assert.end()
})
