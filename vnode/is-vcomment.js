var version = require("./version")

module.exports = isVirtualComment

function isVirtualComment(x) {
    return x && x.type === "VirtualComment" && x.version === version 
}
