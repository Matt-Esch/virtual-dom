var test = require("tape")
var VNode = require("../../vnode/vnode")
var VText = require("../../vnode/vtext")
var diff = require("../../vtree/diff")
var document = require("global/document")

var createElement = require("../create-element")
var patch = require("../patch")

var createElementCustom = function(vnode) {
    var created = createElement(vnode)
    created.customCreation = true
    return created
}

function assertPachedNodeIsMarked(leftNode, rightNode, assert) {
    var root = createElementCustom(leftNode)
    var patches = diff(leftNode, rightNode)
    var newRoot = patch(root, patches, { render: createElementCustom })
    assert.equal(newRoot.childNodes[0].customCreation, true)
    assert.end()
}

test("overrided createElement is used on node insertion", function (assert) {
    var leftNode = new VNode("div")
    var rightNode = new VNode("div", {}, [new VNode("div")])

    assertPachedNodeIsMarked(leftNode, rightNode, assert)
})

test("overrided createElement is used for patching vnodes", function (assert) {
    var leftNode = new VNode("div", {}, [new VNode("div")])
    var rightNode = new VNode("div", {}, [new VNode("span")])

    assertPachedNodeIsMarked(leftNode, rightNode, assert)
})

test("overrided createElement is used for patching text nodes", function (assert) {
    var leftNode = new VNode("div", {}, [new VNode("div")])
    var rightNode = new VNode("div", {}, [new VText("hello")])

    assertPachedNodeIsMarked(leftNode, rightNode, assert)
})

test("overrided createElement is used for patching widget nodes", function (assert) {
    var Widget = function (){}
    Widget.prototype.type = "Widget"
    Widget.prototype.init = function(){ return document.createElement("div") }
    Widget.prototype.update = function(previous, domNode){ return null }
    Widget.prototype.destroy = function(domNode){}

    var leftNode = new VNode("div", {}, [new VNode("div")])
    var rightNode = new VNode("div", {}, [new Widget()])

    assertPachedNodeIsMarked(leftNode, rightNode, assert)
})
