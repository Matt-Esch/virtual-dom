var DataSet = require("data-set")
var globalDocument = require("global/document")

var isString = require("./lib/is-string")
var isVirtualDomNode = require("./lib/is-virtual-dom")

module.exports = render

function render(virtualDom, opts) {
    var doc = opts ? opts.document || globalDocument : globalDocument
    var warn = opts ? opts.warn : null

    if (isString(virtualDom)) {
        return doc.createTextNode(virtualDom)
    } else if (!isVirtualDomNode(virtualDom)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", virtualDom)
        }
        return null
    }

    var node = doc.createElement(virtualDom.tagName)
    applyProperties(node, virtualDom.properties)
    var children = virtualDom.children

    for (var i = 0; i < children.length; i++) {
        var childNode = render(children[i], opts)
        if (childNode) {
            node.appendChild(childNode)
        }
    }

    return node
}

function applyProperties(node, props) {
    for (var propName in props) {
        var propValue = props[propName]

        if(propName === "style") {
            if(typeof propValue === "string") {
                node.style.cssText = propValue
            } else {
                for (var s in propValue) {
                    node.style.setProperty(s, propValue[s])
                }
            }
        } else if (propName.substr(0, 5) === "data-") {
            DataSet(node)[propName.substr(5)] = propValue
        } else {
            node[propName] = propValue
        }
    }
}
