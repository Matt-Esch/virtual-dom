// Maps a virtual DOM tree onto a real DOM tree in an efficient manner.
// We don't want to read all of the DOM nodes in the tree so we use
// the in-order tree indexing to eliminate recursion down certain branches.
// We only recurse into a DOM node if we know that it contains a child of
// interest.

module.exports = domIndex

function domIndex(rootNode, tree, indices, index) {
    if (!indices || indices.length === 0) {
        return {}
    } else {
        indices.sort(ascending)
        return recurse(rootNode, tree, indices, index, indices)
    }
}

function recurse(rootNode, tree, indices, index) {
    index = index || {}


    if (rootNode) {
        if (indexInRange(indices, tree.index, tree.index)) {
            index[tree.index] = rootNode
        }

        if (tree.children) {
            var childNodes = rootNode.childNodes
            var nextChild
            var nextIndex
            for (var i = 0; i < tree.children.length; i++) {
                var child = nextChild || tree.children[i]
                var cIndex = nextIndex + 1 || child.index
                nextChild = tree.children[i + 1]
                nextIndex = nextChild ? nextChild.index - 1 : Infinity

                // skip recursion down the tree if there are no nodes down here
                if (indexInRange(indices, cIndex, nextIndex)) {
                    recurse(childNodes[i], child, indices, index)
                }
            }
        }
    }

    return index
}

// Binary search for an index in the interval [left, right]
function indexInRange(indices, left, right) {
    if (indices.length === 0) {
        return false
    }

    var minIndex = 0
    var maxIndex = indices.length - 1
    var currentIndex
    var currentItem

    while (minIndex <= maxIndex) {
        currentIndex = ((maxIndex + minIndex) / 2) >> 0
        currentItem = indices[currentIndex]

        if (minIndex === maxIndex) {
            return currentItem >= left && currentItem <= right
        } else if (currentItem < left) {
            minIndex = currentIndex + 1
        } else  if (currentItem > right) {
            maxIndex = currentIndex - 1
        } else {
            return true
        }
    }

    return false;
}

function ascending(a, b) {
    return a > b
}
