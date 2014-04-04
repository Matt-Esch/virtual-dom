var version = require("../version")
var major = version[0]

module.exports = isVirtualDomNode

function isVirtualDomNode(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualDOMNode" && x.version[0] === major
}
