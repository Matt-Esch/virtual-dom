if (typeof document !== "undefined") {
    module.exports = document
} else {
    module.exports = require("min-document")
}