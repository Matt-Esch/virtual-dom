// NOT WORKING, just the general outline

var deepEqual = require("deep-equal")

var isVDOMNode = require("./lib/is-virtual-dom")
var isVTextNode = require("./lib/is-virtual-text")

module.exports = diff

function diff(a, b) {
    var patch = {}
    // index a and b so we can implicitly reference
    indexTree(a)
    walk(a, b, patch)
    return patch
}

// Index the tree in-order (we should be able to avoid this)
function indexTree(tree, index) {
    index = index || 0
    tree.index = index

    if (tree.children) {
        for (var i = 0; i < tree.children.length; i++) {
            index = indexTree(tree.children[i], index + 1)
        }
    }

    return tree.index
}

var remove = { type: "remove" }

function walk(a, b, patch) {
    var apply

    if (isVDOMNode(a) && isVDOMNode(b)) {
        if (a.tagName === b.tagName) {
            if (!deepEqual(a.properties, b.properties)) {
                apply = [{ type: "update", b: b }]
            }

            var aChildren = a.children
            var bChildren = b.children
            var aLen = aChildren.length
            var bLen = bChildren.length
            var len = aLen < bLen ? aLen : bLen


            for (var i = 0; i < len; i++) {
                walk(aChildren[i], bChildren[i], patch)
            }

            // Excess nodes in a need to be removed
            for (; i < aLen; i++) {
                patch[aChildren[i].index] = [remove]
            }

            // Excess nodes in b need to be added
            for (; i < bLen; i++) {
                apply = apply || []
                apply.push({
                    type: "insert",
                    b: bChildren[i]
                })
            }
        } else {
            apply = [{ type: "replace", b: b }]
        }
    } else if (isVTextNode(a) && isVTextNode(b) && a.text !== b.text) {
        apply = [{ type: "update", b: b }]
    } else if (a !== b) {
        apply = [{ type: "replace", b: b }]
    }

    if (apply) {
        patch[a.index] = apply
    }
}
