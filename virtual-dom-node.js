var version = require("./version")

module.exports = VirtualDOMNode

function VirtualDOMNode(tagName, properties, children) {
    this.tagName = tagName
    this.properties = properties
    this.children = children
    this.count = countDescendants(children)
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
        if (child) {
            descendants += child.count || 0
        }
    }

    return count + descendants
}
