var createPatch = require("./lib/patch-op")

var isArray = require("./lib/is-array")
var isVDOMNode = require("./lib/is-virtual-dom")
var isVTextNode = require("./lib/is-virtual-text")
var isWidget = require("./lib/is-widget")

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
        apply = appendPatch(apply, createPatch(a, b))
    } else if (isWidget(b)) {
        apply = appendPatch(apply, createPatch(a, b))
     } else if (isVTextNode(a) && isVTextNode(b)) {
        if (a.text !== b.text) {
            apply = appendPatch(apply, createPatch(a.text, b.text))
        }
    } else if (isVDOMNode(a) && isVDOMNode(b) && a.tagName === b.tagName) {
        var propsPatch = diffProps(a.properties, b.properties)
        if (propsPatch) {
            apply = appendPatch(apply, createPatch(a.properties, b.properties))
        }

        apply = diffChildren(a, b, patch, apply, index)
    } else if (a !== b) {
        apply = appendPatch(apply, createPatch(a, b))
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
        leftNode && (index += leftNode.count || 0)
    }

    // Excess nodes in a need to be removed
    for (; i < aLen; i++) {
        var excess = aChildren[i]
        index += 1
        patch[index] = createPatch(excess, null)
        excess && (index += excess.count || 0)
    }

    // Excess nodes in b need to be added
    for (; i < bLen; i++) {
        var addition = bChildren[i]
        apply = appendPatch(apply, createPatch(null, addition))
    }

    return apply
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
