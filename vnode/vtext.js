var version = require("./version")

module.exports = VirtualText

function VirtualText(text) {
    this.text = String(text)

    // this allows diffs to be send over the wire in pure json
    this.version = version
    this.type = "VirtualText"
}

VirtualText.prototype.version = version
VirtualText.prototype.type = "VirtualText"
