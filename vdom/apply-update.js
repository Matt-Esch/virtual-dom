var DataSet = require("data-set")

var render = require("./create-element")
var isWidget = require("../vtree/is-widget")
var isString = require("../util-wtf/is-string")
var isVNode = require("../vtree/is-virtual-dom")
var updateWidget = require("./update-widget")

module.exports = applyUpdate

function applyUpdate(patchOp, domNode, renderOptions) {
    var vNode = patchOp.vNode
    var patch = patchOp.patch

    if (patch === null || patch === undefined) {
        return removeNode(domNode, vNode)
    } else if (vNode === null || patch === undefined) {
        return insertNode(domNode, patch, renderOptions)
    } else if (isString(patch)) {
        return stringPatch(domNode, vNode, patch, renderOptions)
    } else if (isWidget(patch)) {
        return widgetPatch(domNode, vNode, patch, renderOptions)
    } else if (isVNode(patch)) {
        return vNodePatch(domNode, vNode, patch, renderOptions)
    } else {
        return propPatch(domNode, patch)
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidget(domNode, vNode);

    return null
}

function insertNode(parentNode, vNode, renderOptions) {
    var newNode = render(vNode, renderOptions)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, newString, renderOptions) {
    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, newString)
        return domNode
    }

    var parentNode = domNode.parentNode
    var newNode = render(newString, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function widgetPatch(domNode, leftVNode, widgetUpdate, renderOptions) {
    if (isWidget(leftVNode)) {
        if (updateWidget(leftVNode, widgetUpdate)) {
            var updatedNode = widgetUpdate.update(leftVNode, domNode)
            return updatedNode || domNode
        }
    }

    var parentNode = domNode.parentNode
    var newWidget = render(widgetUpdate, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newWidget, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newWidget
}

function vNodePatch(domNode, leftVNode, rightVNode, renderOptions) {
    var parentNode = domNode.parentNode
    var newNode = render(rightVNode, renderOptions)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidget(domNode, leftVNode)

    return newNode
}

function propPatch(domNode, patch) {
    for (var prop in patch) {
        if (prop === "style") {
            var stylePatch = patch.style
            var domStyle = domNode.style
            for (var s in stylePatch) {
                domStyle[s] = stylePatch[s]
            }
        } else {
            var patchValue = patch[prop]

            if (typeof patchValue === "function") {
                patchValue(domNode, prop)
            } else if (prop.substr(0, 5) === "data-") {
                DataSet(domNode)[prop.substr(5)] = patchValue
            } else {
                domNode[prop] = patchValue
            }
        }
    }

    return domNode
}


function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}
