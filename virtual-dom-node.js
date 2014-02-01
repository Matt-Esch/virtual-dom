var version = require("./version")

module.exports = VirtualDOMNode

function VirtualDOMNode(tagName, properties, children) {
    this.tagName = tagName
    this.properties = properties
    this.children = children
}

VirtualDOMNode.prototype.version = version.split(".")
VirtualDOMNode.prototype.type = "VirtualDOMNode"
