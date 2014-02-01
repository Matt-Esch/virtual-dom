module.exports = domIndex

function domIndex(rootNode, tree, patches, index) {
    index = index || {}


    if (rootNode) {
        if (tree.index in patches) {
            index[tree.index] = rootNode
        }

        if (tree.children) {
            var childNodes = rootNode.childNodes
            for (var i = 0; i < tree.children.length; i++) {
                domIndex(childNodes[i], tree.children[i], patches, index)
            }
        }
    }

    return index
}
