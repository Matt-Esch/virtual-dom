var version = require("./version")

module.exports = VirtualTextNode

function VirtualTextNode(text) {
    this.text = String(text)
}

VirtualTextNode.prototype.version = version.split(".")
VirtualTextNode.prototype.type = "VirtualTextNode"
