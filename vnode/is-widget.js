var nodeType = require("./vnodetype")

module.exports = isWidget

function isWidget(w) {
    return w && w.type === nodeType.Widget
}
