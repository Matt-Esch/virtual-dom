var VirtualDOMNode = require("./virtual-dom-node")
var VirtualTextNode = require("./virtual-text-node")

var isVDOMNode = require("./lib/is-virtual-dom")
var isVTextNode = require("./lib/is-virtual-text")
var isWidget = require("./lib/is-widget")

module.exports = diff

function diff(a, b) {
    var patch = { a: a }
    // index a so we can implicitly reference
    indexTree(a)
    walk(a, b, patch)
    return patch
}

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
        } else if (isWidget(tree)) {
            tree = tree.init(tree)  // calling init with self should clone
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

var remove = [{ type: "remove" }]

function walk(a, b, patch) {
    var apply

    if (a === b) {
        return b
    }

    if (updateWidget(a, b)) {
        apply = [{ "type": "update", widget: a, patch: b }]
        b = a
    } else if (isVDOMNode(a) && isVDOMNode(b) && a.tagName === b.tagName) {
        var propsPatch = diffProps(a.properties, b.properties)
        if (diffProps) {
            apply = [{
                type: "update",
                patch: propsPatch
            }]
        }

        var aChildren = a.children
        var bChildren = b.children
        var aLen = aChildren.length
        var bLen = bChildren.length
        var len = aLen < bLen ? aLen : bLen

        for (var i = 0; i < len; i++) {
            var rightNode = bChildren[i]
            var newRight = walk(aChildren[i], rightNode, patch)

            if (rightNode !== newRight) {
                b[i] = newRight
            }
        }

        // Excess nodes in a need to be removed
        for (; i < aLen; i++) {
            var excess = aChildren[i]
            if (isWidget(excess)) {
                patch[excess.index] = [{
                    type: "remove",
                    widget: excess
                }]
            } else {
                patch[aChildren[i].index] = remove
            }
        }

        // Excess nodes in b need to be added
        for (; i < bLen; i++) {
            apply = apply || []
            var addition = bChildren[i]
            if (isWidget(addition)) {
                apply.push({
                    type: "insert",
                    widget: addition
                })
            } else {
                apply.push({
                    type: "insert",
                    b: addition
                })
            }
        }
    } else if (isVTextNode(a) && isVTextNode(b) && a.text !== b.text) {
        apply = [{ type: "update", patch: b.text }]
    } else if (a !== b) {
        if (isWidget(b)) {
            apply = [{ type: "replace", widget: b }]
        } else {
            apply = [{ type: "replace", b: b }]
        }
    }

    if (apply) {
        patch[a.index] = apply
    }

    return b
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

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("type" in a && "type" in b) {
            return a.type === b.type
        } else {
            return a.init === b.init
        }
    }

    return false
}
