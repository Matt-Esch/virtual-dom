var isWidget = require("../vnode/is-widget.js")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("id" in a && "id" in b) {
            return a.id === b.id
        } else {
            return a.init === b.init
        }
    }

    return false
}
