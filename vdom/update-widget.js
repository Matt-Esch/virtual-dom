var isWidget = require("./is-widget")

module.exports = updateWidget

function updateWidget(a, b) {
    if (isWidget(a) && isWidget(b)) {
        if ("type" in a && "type" in b) {
            return a.type === b.type
        } else {
            return a.init === b.init
        }
    }

    return false
}