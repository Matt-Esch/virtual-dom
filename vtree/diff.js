var createPatch = require("./patch-op")

var isArray = require("../util-wtf/is-array")
var isVDOMNode = require("./is-virtual-dom")
var isVTextNode = require("./is-virtual-text")
var isWidget = require("./is-widget")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return b
    }

    var apply = patch[index]

    if (isWidget(a)) {
        // Update a widget
        apply = appendPatch(apply, createPatch(a, b))
    } else if (isWidget(b)) {
        // Patch in a new widget
        apply = appendPatch(apply, createPatch(a, b))
    } else if (isVTextNode(a) && isVTextNode(b)) {
        // Update a text node
        if (a.text !== b.text) {
            apply = appendPatch(apply, createPatch(a.text, b.text))
        }
    } else if (isVDOMNode(a) && isVDOMNode(b) && a.tagName === b.tagName) {
        // Update a VDOMNode
        var propsPatch = diffProps(a.properties, b.properties)
        if (propsPatch) {
            apply = appendPatch(apply, createPatch(a.properties, propsPatch))
        }

        apply = diffChildren(a, b, patch, apply, index)
    } else if (a !== b) {
        apply = appendPatch(apply, createPatch(a, b))

        // We must detect a remove/replace of widgets here so that
        // we can add patch records for any stateful widgets
        if (isVDOMNode(a) && a.hasWidgets &&
            (!isVDOMNode(b) || a.tagName !== b.tagName)) {
            destroyWidgets(a, patch, index)
        }
    }

    if (apply) {
        patch[index] = apply
    }
}

var nullProps = {}

function diffProps(a, b) {
    var diff

    for (var aKey in a) {
        if (aKey === "style") {
            var styleDiff = diffProps(a.style, b.style || nullProps)
            if (styleDiff) {
                diff = diff || {}
                diff.style = styleDiff
            }
        } else {
            var aValue = a[aKey]
            var bValue = b[aKey]

            if (typeof aValue === "function" || aValue !== bValue) {
                diff = diff || {}
                diff[aKey] = bValue
            }
        }
    }

    for (var bKey in b) {
        if (!(bKey in a)) {
            diff = diff || {}
            diff[bKey] = b[bKey]
        }
    }

    return diff
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = b.children
    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen < bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1
        walk(leftNode, rightNode, patch, index)

        if (isVDOMNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    // Excess nodes in a need to be removed
    for (; i < aLen; i++) {
        var excess = aChildren[i]
        index += 1
        patch[index] = createPatch(excess, null)
        destroyWidgets(excess, patch, index)

        if (isVDOMNode(excess) && excess.count) {
            index += excess.count
        }
    }

    // Excess nodes in b need to be added
    for (; i < bLen; i++) {
        var addition = bChildren[i]
        apply = appendPatch(apply, createPatch(null, addition))
    }

    return apply
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = createPatch(vNode, null)
        }
    } else if (isVDOMNode(vNode) && vNode.hasWidgets) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVDOMNode(child) && child.count) {
                index += child.count
            }
        }
    }
}

function appendPatch(apply, patch) {
    if (apply) {
        if (isArray(apply)) {
            apply.push(patch)
        } else {
            apply = [apply, patch]
        }

        return apply
    } else {
        return patch
    }
}
