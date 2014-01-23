module.exports = VirtualDOMNode

function VirtualDOMNode(tagName, properties, children) {
    this.tagName = tagName
    this.properties = properties
    this.children = children
}