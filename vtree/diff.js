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
        hooks(b, patch, index)
        return
    }

    var apply = patch[index]

    if (isWidget(a) || isWidget(b)) {
        // Update/patch a widget
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
        var propsPatch = diffProps(a.properties, b.properties, b.hooks)
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

function diffProps(a, b, hooks) {
    var diff

    for (var aKey in a) {
        if (!(aKey in b)) {
            continue
        }

        var aValue = a[aKey]
        var bValue = b[aKey]

        if (hooks && aKey in hooks) {
            diff = diff || {}
            diff[aKey] = bValue
        } else {
            if (isObject(aValue) && isObject(bValue)) {
                if (getPrototype(bValue) !== getPrototype(aValue)) {
                    diff = diff || {}
                    diff[aKey] = bValue
                } else {
                    var objectDiff = diffProps(aValue, bValue)
                    if (objectDiff) {
                        diff = diff || {}
                        diff[aKey] = objectDiff
                    }
                }
            } else if (aValue !== bValue && bValue !== undefined) {
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
    if (Object.getPrototypeOf) {
        return Object.getPrototypeOf(value)
    } else if (value.__proto__) {
        return value.__proto__
    } else if (value.constructor) {
        return value.constructor.prototype
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var bChildren = b.children
    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    var ordered = reorder(aChildren, bChildren, len)

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = ordered[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply, new VPatch(null, rightNode))
            }
        } else if (!rightNode) {
            if (leftNode) {
                // Excess nodes in a need to be removed
                patch[index] = new VPatch(leftNode, null)
                destroyWidgets(leftNode, patch, index)
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
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

// Execute hooks when two nodes are identical
function hooks(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = new VPatch(vNode.hooks, vNode.hooks)
        }

        if (vNode.descendantHooks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                hooks(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    }
}

// List diff
function reorder(aChildren, bChildren, len) {
    var aKeys = keyIndex(aChildren) // O(N)

    if (!aKeys) {
        return bChildren
    }

    var bKeys = keyIndex(bChildren) // O(M)

    if (!bKeys) {
        return bChildren
    }

    var aMatch, bMatch

    for (var key in aKeys) { // O(N)
        if (key in bKeys) {
            if (!aMatch) {
                aMatch = {}
                bMatch = {}
            }

            var aIndex = aKeys[key]
            var bIndex = bKeys[key]
            aMatch[aIndex] = bIndex
            bMatch[bIndex] = aIndex
        }
    }

    if (!aMatch) {
        return bChildren
    }

    var shuffle = []
    var freeIndex = 0

    for (var i = 0; i < len; i++) {
        var move = aMatch[i]
        if (move !== undefined) {
            shuffle[i] = bChildren[move]
        } else {
            while (freeIndex in bMatch) {
                freeIndex++
            }
            shuffle[i] = bChildren[freeIndex++]
        }
    }

    return shuffle
}

function keyIndex(children) {
    var i, keys

    for (i = 0; i < children.length; i++) {
        var child = children[i]

        if (child.key !== undefined) {
            keys = keys || {}
            keys[child.key] = i
        }
    }

    return keys
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
