var version = require("./version")
var isVDOM = require("./is-virtual-dom")
var isWidget = require("./is-widget")

module.exports = VirtualDOMNode

function VirtualDOMNode(tagName, properties, children) {
    this.tagName = tagName
    this.properties = properties
    this.children = children
    this.count = countDescendants(children)
    this.hasWidgets = hasWidgets(children)
}

VirtualDOMNode.prototype.version = version.split(".")
VirtualDOMNode.prototype.type = "VirtualDOMNode"

function countDescendants(children) {
    if (!children) {
        return 0
    }

    var count = children.length || 0
    var descendants = 0

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isVDOM(child)) {
            descendants += child.count || 0
        }
    }

    return count + descendants
}

function hasWidgets(children) {
    if (!children) {
        return false
    }

    var count = children.length

    for (var i = 0; i < count; i++) {
        var child = children[i]
        if (isWidget(child)) {
            if (typeof child.destroy === "function") {
                return true
            }
        } else if (isVDOM(child) && child.hasWidgets) {
            return true
        }
    }

    return false
}
