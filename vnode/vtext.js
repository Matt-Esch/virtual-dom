var version = require("./version")
var nodeType = require("./vnodetype")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version
VirtualText.prototype.type = nodeType.VirtualText
