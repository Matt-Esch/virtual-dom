var isArray = require("x-is-array")

var VPatch = require("../vnode/vpatch")
var isVNode = require("../vnode/is-vnode")
var isVText = require("../vnode/is-vtext")
var isWidget = require("../vnode/is-widget")
var isThunk = require("../vnode/is-thunk")
var handleThunk = require("../vnode/handle-thunk")

var diffProps = require("./diff-props")

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
    var applyClear = false

    if (isThunk(a) || isThunk(b)) {
        thunks(a, b, patch, index)
    } else if (b == null) {

        // If a is a widget we will add a remove patch for it
        // Otherwise any child widgets/hooks must be destroyed.
        // This prevents adding two remove patches for a widget.
        if (!isWidget(a)) {
            clearState(a, patch, index)
            apply = patch[index]
        }

        apply = appendPatch(apply, new VPatch(VPatch.REMOVE, a, b))
    } else if (isVNode(b)) {
        if (isVNode(a)) {
            if (a.tagName === b.tagName &&
                a.namespace === b.namespace &&
                a.key === b.key) {
                var propsPatch = diffProps(a.properties, b.properties)
                if (propsPatch) {
                    apply = appendPatch(apply,
                        new VPatch(VPatch.PROPS, a, propsPatch))
                }
                apply = diffChildren(a, b, patch, apply, index)
            } else {
                apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
                applyClear = true
            }
        } else {
            apply = appendPatch(apply, new VPatch(VPatch.VNODE, a, b))
            applyClear = true
        }
    } else if (isVText(b)) {
        if (!isVText(a)) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
            applyClear = true
        } else if (a.text !== b.text) {
            apply = appendPatch(apply, new VPatch(VPatch.VTEXT, a, b))
        }
    } else if (isWidget(b)) {
        if (!isWidget(a)) {
            applyClear = true
        }

        apply = appendPatch(apply, new VPatch(VPatch.WIDGET, a, b))
    }

    if (apply) {
        patch[index] = apply
    }

    if (applyClear) {
        clearState(a, patch, index)
    }
}

function diffChildren(a, b, patch, apply, index) {
    var aChildren = a.children
    var orderedSet = reorder(aChildren, b.children)
    var bChildren = orderedSet.children

    var aLen = aChildren.length
    var bLen = bChildren.length
    var len = aLen > bLen ? aLen : bLen

    for (var i = 0; i < len; i++) {
        var leftNode = aChildren[i]
        var rightNode = bChildren[i]
        index += 1

        if (!leftNode) {
            if (rightNode) {
                // Excess nodes in b need to be added
                apply = appendPatch(apply,
                    new VPatch(VPatch.INSERT, null, rightNode))
            }
        } else {
            walk(leftNode, rightNode, patch, index)
        }

        if (isVNode(leftNode) && leftNode.count) {
            index += leftNode.count
        }
    }

    if (orderedSet.moves.length > 0) {
        // Reorder nodes last
        apply = appendPatch(apply, new VPatch(
            VPatch.ORDER,
            a,
            orderedSet.moves
        ))
    }

    return apply
}

function clearState(vNode, patch, index) {
    // TODO: Make this a single walk, not two
    unhook(vNode, patch, index)
    destroyWidgets(vNode, patch, index)
}

// Patch records for all destroyed widgets must be added because we need
// a DOM node reference for the destroy function
function destroyWidgets(vNode, patch, index) {
    if (isWidget(vNode)) {
        if (typeof vNode.destroy === "function") {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(VPatch.REMOVE, vNode, null)
            )
        }
    } else if (isVNode(vNode) && (vNode.hasWidgets || vNode.hasThunks)) {
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
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

// Create a sub-patch for thunks
function thunks(a, b, patch, index) {
    var nodes = handleThunk(a, b)
    var thunkPatch = diff(nodes.a, nodes.b)
    if (hasPatches(thunkPatch)) {
        patch[index] = new VPatch(VPatch.THUNK, null, thunkPatch)
    }
}

function hasPatches(patch) {
    for (var index in patch) {
        if (index !== "a") {
            return true
        }
    }

    return false
}

// Execute hooks when two nodes are identical
function unhook(vNode, patch, index) {
    if (isVNode(vNode)) {
        if (vNode.hooks) {
            patch[index] = appendPatch(
                patch[index],
                new VPatch(
                    VPatch.PROPS,
                    vNode,
                    undefinedKeys(vNode.hooks)
                )
            )
        }

        if (vNode.descendantHooks || vNode.hasThunks) {
            var children = vNode.children
            var len = children.length
            for (var i = 0; i < len; i++) {
                var child = children[i]
                index += 1

                unhook(child, patch, index)

                if (isVNode(child) && child.count) {
                    index += child.count
                }
            }
        }
    } else if (isThunk(vNode)) {
        thunks(vNode, null, patch, index)
    }
}

function undefinedKeys(obj) {
    var result = {}

    for (var key in obj) {
        result[key] = undefined
    }

    return result
}

// List diff, naive left to right reordering
function reorder(aChildren, bChildren) {
    var bKeys = keyIndex(bChildren)

    if (!bKeys) {
        return {
            children: bChildren,
            moves: []
        }
    }

    var aKeys = keyIndex(aChildren)

    if (!aKeys) {
        return {
            children: bChildren,
            moves: []
        }
    }

    var newChildren = []

    var bIndex = 0
    var findNextIndex = true

    // Iterate through a and match a node in b
    for (var i = 0 ; i < aChildren.length; i++) {
        var aItem = aChildren[i]

        while (findNextIndex && bIndex < bChildren.length) {
            var bItem = bChildren[bIndex]
            if (bItem && !bItem.key) {
                findNextIndex = false
            } else {
                bIndex++
            }
        }

        if (aItem.key) {
            if (bKeys.hasOwnProperty(aItem.key)) {
                // Match up the old keys
                newChildren.push(bChildren[bKeys[aItem.key]])
            } else {
                // Remove old keyed items
                newChildren.push(null)
            }
        } else {
            // Match the item in a with the next free item in b
            newChildren.push(bChildren[bIndex])
            bIndex += 1
            findNextIndex = true
        }
    }

    // Iterate through b and append and new keys
    for (var j = 0; j < bChildren.length; j++) {
        var newItem = bChildren[j]

        if (newItem.key) {
            if (!aKeys.hasOwnProperty(newItem.key)) {
                // Add any new keyed items
                newChildren.push(newItem)
            }
        } else if (j >= bIndex) {
            // Add any leftover non-keyed items
            newChildren.push(newItem)
        }
    }

    // Simulate swaps left to right to generate moves for keyed items
    // Note that by this point, new items have been inserted, but the old
    // items have  NOT been removed. This is effectively a bubble sort.
    var simulate = newChildren.slice()
    var simulateIndex = 0
    var moves = []
    var sorted = false

    while (!sorted) {
        simulateIndex = 0
        sorted = true

        for (var k = 0; k < bChildren.length; k++) {
            var wantedItem = bChildren[k]
            var simulateItem = simulate[simulateIndex]

            // Find the next item to match
            while (simulateItem === null && simulateIndex < simulate.length) {
                simulateItem = simulate[++simulateIndex]
            }

            if (simulateItem.key !== wantedItem.key) {
                if (wantedItem.key) {
                    moves.push(
                        moveItem(simulate, simulateIndex, wantedItem.key)
                    )
                } else {
                    // Move the current item to the end
                    moves.push({
                        from: simulateIndex,
                        to: simulate.length
                    })
                    simulate.splice(
                        simulate.length,
                        0,
                        simulate.splice(simulateIndex, 1)[0]
                    )
                }
                sorted = false
                break
            } else {
                simulateIndex++
            }
        }
    }

    return {
        children: newChildren,
        moves: moves
    }
}

// TODO: We really want to make this more efficient
// Finding the current index of any key in the array could be
// faster.
function moveItem(array, toIndex, itemKey) {
    for (var i = 0; i < array.length; i++) {
        var node = array[i]

        if (node && node.key === itemKey) {
            break
        }
    }

    array.splice(toIndex, 0, array.splice(i, 1)[0])

    return {
        from: i,
        to: toIndex
    }
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
