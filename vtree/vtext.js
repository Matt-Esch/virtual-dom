var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)
}

VirtualText.prototype.version = version.split(".")
VirtualText.prototype.type = "VirtualText"
