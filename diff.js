// NOT WORKING, just the general outline

var deepEqual = require("deep-equal")

var isVirtualDomNode = require("./lib/is-virtual-dom")

module.exports = diff

function diff(a, b) {
    // index a and b so we can implicitly reference
    indexTree(a)
    indexTree(b)
    return walk(a, b)
}

// Index the tree in-order
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


function walk(a, b, patch) {
    patch = patch || []

    if (isVirtualDomNode(a) && isVirtualDomNode(b)) {
        if (a.tagName === b.tagName) {
            if (!deepEqual(a.properties, b.properties)) {
                patch.push({ type: "update", a: a.index, b: b.index })
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
                patch.push({ type: "delete", a: aChildren[i].index })
            }

            // Excess nodes in b need to be added
            for (; i < bLen; i++) {
                patch.push({
                    type: "insert",
                    a: a.index,
                    b: bChildren[i].index
                })
            }
        } else {
            patch.push({ type: "replace", a: a.index, b: b.index })
        }
    } else if (a !== b) {
        patch.push({ type: "replace", a: a.index, b: b.index })
    }
}
