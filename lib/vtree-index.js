var VirtualDOMNode = require("../virtual-dom-node")
var VirtualTextNode = require("../virtual-text-node")
var isVDOMNode = require("./is-virtual-dom.js")
var isVTextNode = require("./is-virtual-text")

module.exports = indexTree

// Index the tree in-order
function indexTree(tree, index, parent, c) {
    if (tree.index === 0 && !parent) {
        // The tree has already been indexed once
        return
    } else if (tree.index >= 0 && parent) {
        // This node has been indexed somewhere else in the tree, so clone
        if (isVDOMNode(tree)) {
            tree = parent[c] = new VirtualDOMNode(
                tree.tagName,
                tree.properties,
                tree.children)
        } else if (isVTextNode(tree)) {
            tree = parent[c] = new VirtualTextNode(tree.text)
        }
    }

    index = index || 0
    tree.index = index

    if (tree.children) {
        for (var i = 0; i < tree.children.length; i++) {
            index = indexTree(tree.children[i], index + 1, tree, i)
        }
    }

    return tree.index
}
