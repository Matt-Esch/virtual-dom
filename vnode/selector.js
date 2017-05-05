module.exports = function selector (node) {
    return node.tagName.toLowerCase()
        + (node.properties.id ? '#' + node.properties.id : '')
        + (node.properties.className ? '.' + node.properties.className.trim().replace(/ +/g, '.') : '')
}
