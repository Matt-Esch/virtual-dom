var isString = require("x-is-string")

var applyProperties = require("./apply-properties")

var isWidget = require("../vtree/is-widget")
var isVNode = require("../vtree/is-vnode")

var render = require("./create-element")
var updateWidget = require("./update-widget")

module.exports = applyPatch

function applyPatch(vpatch, domNode, renderOptions) {
    var vNode = vpatch.vNode
    var patch = vpatch.patch

    if (patch == null) {
        return removeNode(domNode, vNode)
    } else if (vNode == null) {
        return insertNode(domNode, patch, renderOptions)
    } else if (isString(patch)) {
        return stringPatch(domNode, vNode, patch, renderOptions)
    } else if (isWidget(patch)) {
        return widgetPatch(domNode, vNode, patch, renderOptions)
    } else if (isVNode(patch)) {
        return vNodePatch(domNode, vNode, patch, renderOptions)
    } else {
        applyProperties(domNode, patch, vNode.propeties)
        return domNode
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

function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}
