var version = require("./version")
var nodeType = require("./vnodetype")

module.exports = isVirtualNode

function isVirtualNode(x) {
    return x && x.type === nodeType.VirtualNode && x.version === version
}
