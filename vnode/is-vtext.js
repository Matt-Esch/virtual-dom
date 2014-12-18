var version = require("./version")
var nodeType = require("./vnodetype")

module.exports = isVirtualText

function isVirtualText(x) {
    return x && x.type === nodeType.VirtualText && x.version === version
}
