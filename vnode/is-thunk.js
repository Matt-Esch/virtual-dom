var nodeType = require("./vnodetype")

module.exports = isThunk

function isThunk(t) {
    return t && t.type === nodeType.Thunk
}
