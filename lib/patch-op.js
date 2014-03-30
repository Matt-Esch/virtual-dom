var render = require("../render")
var isWidget = require("./is-widget")
var isString = require("./is-string")
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

function applyUpdate(domNode) {
    var vNode = this.vNode
    var patch = this.patch

    if (patch == null) {
        return removeNode(domNode, vNode)
    } else if (vNode == null) {
        return insertNode(domNode, patch)
    } else if (isString(patch)) {
        return stringPatch(domNode, vNode, patch)
    } else if (isWidget(patch)) {
        return widgetPatch(domNode, vNode, patch)
    } else if (isVNode(patch)) {
        return vNodePatch(domNode, vNode, patch)
    } else {
        return propPatch(domNode, patch)
    }
}

function removeNode(domNode, vNode) {
    var parentNode = domNode.parentNode

    if (parentNode) {
        parentNode.removeChild(domNode)
    }

    destroyWidgets(vNode);

    return null
}

function insertNode(parentNode, vNode) {
    var newNode = render(vNode)

    if (parentNode) {
        parentNode.appendChild(newNode)
    }

    return parentNode
}

function stringPatch(domNode, leftVNode, newString) {
    if (domNode.nodeType === 3) {
        domNode.replaceData(0, domNode.length, newString)
        return domNode
    }

    var parentNode = domNode.parentNode
    var newNode = render(newString)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidgets(leftVNode)

    return newNode
}

function widgetPatch(domNode, leftVNode, widgetUpdate) {
    if (isWidget(leftVNode)) {
        if (updateWidget(leftVNode, widgetUpdate)) {
            var updatedNode = widgetUpdate.update(leftVNode, domNode)
            return updatedNode || domNode
        }
    }

    var parentNode = domNode.parentNode
    var newWidget = render(widgetUpdate)

    if (parentNode) {
        parentNode.replaceChild(newWidget, domNode)
    }

    destroyWidgets(leftVNode)

    return newWidget
}

function vNodePatch(domNode, leftVNode, rightVNode) {
    var parentNode = domNode.parentNode
    var newNode = render(rightVNode)

    if (parentNode) {
        parentNode.replaceChild(newNode, domNode)
    }

    destroyWidgets(leftVNode)

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
            } else {
                domNode[prop] = patchValue
            }
        }
    }

    return domNode
}

function destroyWidgets(w) {
    if (isWidget(w)) {
        w.destroy()
    } else if (isVNode(w)) {
        var children = w.children
        for (var i = 0; i < children.length; i++) {
            destroyWidgets(children[i])
        }
    }
}
