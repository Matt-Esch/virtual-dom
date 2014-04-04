var version = require("./version")

module.exports = VirtualPatch

function VirtualPatch(vNode, patch) {
    this.vNode = vNode
    this.patch = patch
}

VirtualPatch.prototype.version = version.split(".")
VirtualPatch.prototype.type = "VirtualPatch"
