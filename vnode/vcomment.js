var version = require("./version")

module.exports = VirtualComment

function VirtualComment(comment) {
    this.comment = String(comment)
}

VirtualComment.prototype.version = version
VirtualComment.prototype.type = "VirtualComment"
