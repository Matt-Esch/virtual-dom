/*jshint maxcomplexity: 20 */
var isArray = require("x-is-array")
var isObject = require("is-object")

var VPatch = require("./vpatch")
var isVNode = require("./is-vnode")
var isVText = require("./is-vtext")
var isWidget = require("./is-widget")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    walk(a, b, patch, 0)
    return patch
}

function walk(a, b, patch, index) {
    if (a === b) {
        return
    }

    var apply = patch[index]

    if (isWidget(a)) {
        // Update a widget
        apply = appendPatch(apply, new VPatch(a, b))
    } else if (isWidget(b)) {
        // Patch in a new widget
        apply = appendPatch(apply, new VPatch(a, b))
    } else if (isVText(a) && isVText(b)) {
        // Update a text node
        if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(a.text, b.text))
        }
    } else if (isVNode(a) && isVNode(b) &&
        a.tagName === b.tagName &&
        a.namespace === b.namespace) {
        // Update a VDOMNode
        var propsPatch = diffProps(a.properties, b.properties)
        if (propsPatch) {
            apply = appendPatch(apply, new VPatch(a.properties, propsPatch))
        }

        apply = diffChildren(a, b, patch, apply, index)
    } else if (a !== b) {
        apply = appendPatch(apply, new VPatch(a, b))

        // We must detect a remove/replace of widgets here so that
        // we can add patch records for any stateful widgets
        if (isVNode(a) && a.hasWidgets &&
            (!isVNode(b) ||
                a.tagName !== b.tagName ||
                a.namespace !== b.namespace)) {
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
        var aValue = a[aKey]
		var bValue = aKey in b ? b[aKey] : nullProps

        if (isObject(aValue)) {
            if (getPrototype(bValue) !== getPrototype(aValue)) {
                diff = diff || {}
                diff[aKey] = bValue
            } else {
                var objectDiff = diffProps(aValue, bValue || nullProps)
                if (objectDiff) {
                    diff = diff || {}
                    diff[aKey] = objectDiff
                }
            }
        } else {
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

function getPrototype(value) {
    var proto = "__proto__"

    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value[proto]) {
        return value[proto]
    } else if (value.constructor) {
        return value.constructor.prototype
    }
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

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    // Excess nodes in a need to be removed
    for (; i < aLen; i++) {
        var excess = aChildren[i]
        index += 1
        patch[index] = new VPatch(excess, null)
        destroyWidgets(excess, patch, index)

        if (isVNode(excess) && excess.count) {
            index += excess.count
        }
    }

    // Excess nodes in b need to be added
    for (; i < bLen; i++) {
        var addition = bChildren[i]
        apply = appendPatch(apply, new VPatch(null, addition))
    }

    return apply
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = new VPatch(vNode, null)
        }
    } else if (isVNode(vNode) && vNode.hasWidgets) {
        var children = vNode.children
        var len = children.length
        for (var i = 0; i < len; i++) {
            var child = children[i]
            index += 1

            destroyWidgets(child, patch, index)

            if (isVNode(child) && child.count) {
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
