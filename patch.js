var render = require("./render")

var domIndex = require("./lib/dom-index")
var isArray = require("./lib/is-array")
var isString = require("./lib/is-string")

module.exports = patch

function patch(rootNode, patches) {
    var index = domIndex(rootNode, patches.a, patches)

    for (var nodeIndex in patches) {
        if (nodeIndex === "a") {
            continue
        }

        applyPatch(index[nodeIndex], patches[nodeIndex])
    }
}

function applyPatch(domNode, patchList) {
    if (!domNode || !isArray(patchList)) {
        return
    }

    for (var i = 0; i < patchList.length; i++) {
        var op = patchList[i]

        if (op.type === "remove") {
            remove(domNode)
        } else if (op.type ===  "insert") {
            insert(domNode, render(op.b))
        } else if (op.type === "replace") {
            replace(domNode, render(op.b))
        } else if (op.type === "update") {
            update(domNode, op.patch)
        }
    }
}

function remove(domNode) {
    var parent = domNode.parentNode
    if (parent) {
        parent.removeChild(domNode)
    }
}

function insert(domNode, child) {
    if (domNode.nodeType === 1) {
        domNode.appendChild(child)
    }
}

function replace(domNode, newNode) {
    var parent = domNode.parentNode
    if (parent) {
        parent.replaceChild(newNode, domNode)
    }
}

function update(domNode, patch) {
    if (isString(patch)) {
        if (domNode.nodeType === 3) {
            domNode.replaceData(patch)
        } else  {
            replace(domNode, render(patch))
        }
    } else {
        for (var prop in patch) {
            domNode[prop] = patch[prop]
        }
    }
}
