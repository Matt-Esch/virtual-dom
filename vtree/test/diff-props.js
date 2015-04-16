var test = require("tape")
var diffProps = require("../diff-props")

test("adds new properties", function(assert) {
    var propsA = {}
    var propsB = {id: 'element-id', className: 'the-class'}

    var diff = diffProps(propsA, propsB)
    assert.deepEqual(diff, {
        id: 'element-id',
        className: 'the-class'
    })

    assert.end()
})

test("removes missing properties", function(assert) {
    var propsA = {id: 'element-id', className: 'the-class'}
    var propsB = {}

    var diff = diffProps(propsA, propsB)
    assert.deepEqual(diff, {
        id: undefined,
        className: undefined
    })

    assert.end()
})

test("recursively adds new properties", function(assert) {
    var propsA = {attributes: {}}
    var propsB = {attributes: {'data-custom': 'custom', class: 'the-class'}}

    var diff = diffProps(propsA, propsB)
    assert.deepEqual(diff, {
        attributes: {
            'data-custom': 'custom',
            class: 'the-class'
        }
    })

    assert.end()
})

test("recursively removes missing properties", function(assert) {
    var propsA = {attributes: {'data-custom': 'custom', class: 'the-class'}}
    var propsB = {attributes: {}}

    var diff = diffProps(propsA, propsB)
    assert.deepEqual(diff, {
        attributes: {
            'data-custom': undefined,
            class: undefined
        }
    })

    assert.end()
})
