var version = require("../version")
var major = version[0]

module.exports = isVirtualTextNode

function isVirtualTextNode(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualTextNode" && x.version[0] === major
}
