module.exports = isWidget

function isWidget(w) {
    return w && typeof w.init === "function" && typeof w.update === "function"
}
