'use strict'


var test = require("tape")
var h = require("../h.js")
var render = require("../create-element.js")


// render tests
test("render is a function", function (assert) {
    assert.equal(typeof h, "function")
    assert.end()
})

test("render text node", function (assert) {
    var vdom = h("span", "hello")
    var dom = render(vdom)
    assert.equal(dom.tagName, "SPAN")
    assert.notOk(dom.id)
    assert.notOk(dom.className)
    assert.equal(dom.childNodes.length, 1)
    assert.equal(dom.childNodes[0].data, "hello")
    assert.end()
})

test("render div", function (assert) {
    var vdom = h()
    var dom = render(vdom)
    assert.notOk(dom.id)
    assert.notOk(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node id is applied correctly", function (assert) {
    var vdom = h("#important")
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.notOk(dom.className)
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("node class name is applied correctly", function (assert) {
    var vdom = h(".pretty")
    var dom = render(vdom)
    assert.notOk(dom.id)
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("mixture of node/classname applied correctly", function (assert) {
    var vdom = h("#override.very", { id: "important", className: "pretty"})
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "very pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("input value is applied correctly", function (assert) {
    var vdom = h("input", {type: 'range', value: 110, max: 200})
    var dom = render(vdom)
    assert.equal(dom.value, '110')
    assert.end()
})

test("style object is applied correctly", function (assert) {
    var vdom = h("#important.pretty", { style: {
        border: "1px solid rgb(0, 0, 0)",
        padding: "2px"
    } })
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.border, style("border", "1px solid rgb(0, 0, 0)"))
    assert.equal(dom.style.padding, style("padding", "2px"))
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("children are added", function (assert) {
    var vdom = h("div", [
        h("div", [
            "just testing",
            "multiple",
            h("b", "nodes")
        ]),
        "hello",
        h("span", "test")
    ])

    var dom = render(vdom)

    assert.equal(dom.childNodes.length, 3)

    var nodes = dom.childNodes
    assert.equal(nodes.length, 3)
    assert.equal(nodes[0].tagName, "DIV")
    assert.equal(nodes[1].data, "hello")
    assert.equal(nodes[2].tagName, "SPAN")

    var subNodes0 = nodes[0].childNodes
    assert.equal(subNodes0.length, 3)
    assert.equal(subNodes0[0].data, "just testing")
    assert.equal(subNodes0[1].data, "multiple")
    assert.equal(subNodes0[2].tagName, "B")

    var subNodes0_2 = subNodes0[2].childNodes
    assert.equal(subNodes0_2.length, 1)
    assert.equal(subNodes0_2[0].data, "nodes")

    var subNodes2 = nodes[2].childNodes
    assert.equal(subNodes2.length, 1)
    assert.equal(subNodes2[0].data, "test")
    assert.end()
})

test("incompatible children are ignored", function (assert) {
    var vdom = h("#important.pretty", {
        style: {
            "cssText": "color: red;"
        }
    }, [
        null
    ])
    var dom = render(vdom)
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText, style("cssText", "color: red;"))
    assert.equal(dom.childNodes.length, 0)
    assert.end()
})

test("injected document object is used", function (assert) {
    var vdom = h("div", "hello")
    var count = 0
    var doc = {
        createElement: function createElement(tagName) {
            assert.equal(tagName, "DIV")
            count++
            return { tagName: "DIV", appendChild: function (t) {
                assert.equal(t, "hello")
                count++
            } }
        },
        createTextNode: function createTextNode(text) {
            assert.equal(text, "hello")
            count++
            return text
        }
    }
    render(vdom, { document: doc })
    assert.equal(count, 3)
    assert.end()
})

test("injected warning is used", function (assert) {
    var badObject = {}
    var vdom = h("#important.pretty", {
        style: {
            cssText: "color: red;"
        }
    })

    vdom.children = [
        badObject, null
    ]

    var i = 0
    function warn(warning, node) {
        assert.equal(warning, "Item is not a valid virtual dom node")

        if (i === 0) {
            assert.equal(node, badObject)
        } else if (i === 1) {
            assert.equal(node, null)
        } else {
            assert.error("Too many warnings")
        }

        i++
    }

    var dom = render(vdom, { warn: warn })
    assert.equal(dom.id, "important")
    assert.equal(dom.className, "pretty")
    assert.equal(dom.tagName, "DIV")
    assert.equal(dom.style.cssText, style("cssText", "color: red;"))
    assert.equal(dom.childNodes.length, 0)
    assert.equal(i, 2)
    assert.end()
})


// Safely translates style values using the DOM in the browser
function style(name, value) {
    var node = render(h())
    node.style[name] = value
    return node.style[name]
}
