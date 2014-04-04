var render = require("../create-element")
var isWidget = require("./is-widget")
var isString = require("./is-string")
var isObject = require("./is-object")
var isVNode = require("./is-virtual-dom")
var updateWidget = require("./update-widget")

module.exports = createPatch

function createPatch(vNode, patch) {
    return new PatchOp(vNode, patch)
}

function PatchOp(vNode, patch) {
    this.vNode = vNode
    this.patch = patch
}

PatchOp.prototype.apply = applyUpdate

function applyUpdate(domNode, renderOptions) {
    var vNode = this.vNode
    var patch = this.patch

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
        var patchValue = patch[prop]

        if (isObject(patchValue)) {
            var domValue = domNode[prop]
            for (var key in patchValue) {
                domValue[key] = patchValue[key]
            }
        } else if (typeof patchValue === "function") {
            patchValue(domNode, prop)
        } else {
            domNode[prop] = patchValue
        }
    }

    return domNode
}


function destroyWidget(domNode, w) {
    if (typeof w.destroy === "function" && isWidget(w)) {
        w.destroy(domNode)
    }
}
