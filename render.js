var DataSet = require("data-set")
var globalDocument = require("global/document")

var isString = require("./lib/is-string")
var VirtualDOMNode = require("./virtual-dom-node")

module.exports = render

function render(virtualDom, opts) {
    var doc = opts ? opts.document || globalDocument : globalDocument

    if (isString(virtualDom)) {
        return doc.createTextNode(virtualDom)
    } else if (!virtualDom instanceof VirtualDOMNode) {
        return null
    }

    var node = doc.createElement(virtualDom.tagName)
    applyProperties(node, virtualDom.properties)
    var children = virtualDom.children

    for (var i = 0; i < children.length; i++) {
        node.appendChild(render(children[i]))
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
