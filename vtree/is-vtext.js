var version = require("./version")
var major = version[0]

module.exports = isVirtualText

function isVirtualText(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualText" && x.version[0] === major
}
