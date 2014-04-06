var version = require("./version")

module.exports = isVirtualText

function isVirtualText(x) {
    if (!x) {
        return false;
    }

    return x.type === "VirtualText" && x.version === version
}
