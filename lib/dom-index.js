// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

module.exports = domIndex

function domIndex(rootNode, tree, patches, index) {
    var indices = []

    for (var key in patches) {
        if (key !== "a") {
            indices.push(key)
        }
    }

    if (indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, patches, index, indices)
    }
}

function recurse(rootNode, tree, patches, index, k) {
    index = index || {}


    if (rootNode) {
        if (tree.index in patches) {
            index[tree.index] = rootNode
        }

        if (tree.children) {
            var childNodes = rootNode.childNodes
            for (var i = 0; i < tree.children.length; i++) {
                var nextChild = tree.children[i + 1]
                var nextIndex = nextChild ? nextChild.index : Infinity

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(k, tree.index, nextIndex)) {
                    recurse(childNodes[i], tree.children[i], patches, index, k)
                }
            }
        }
    }

    return index
}

// Binary search for an index in the interval [left, right)
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex < maxIndex) {
        currentIndex = ((maxIndex - minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (currentItem < left) {
            minIndex = currentIndex
        } else  if (currentItem >= right) {
            maxIndex = currentIndex
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a < b
}
