var DataSet = require("data-set")

var isVirtualDomNode = require("./lib/is-virtual-dom")
var isVirtualTextNode = require("./lib/is-virtual-text")
var isString = require("./lib/is-string")
var isObject = require("./lib/is-object")

module.exports = render

function render(virtualDom, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    if (virtualDom && typeof virtualDom.init === "function") {
        return virtualDom.init()
    } else if (isVirtualTextNode(virtualDom)) {
        return doc.createTextNode(virtualDom.text)
    } else if (isString(virtualDom)) {
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

        if (typeof propValue === "function") {
            propValue(node, propName)
        } else if(propName === "style" && typeof propValue === "string") {
            node.style.cssText = propValue
        } else if (isObject(propValue)) {
            if (!node[propName]) {
                node[propName] = {}
            }

            var nodeValue = node[propName]
            for (var k in propValue) {
                nodeValue[k] = propValue[k]
            }
        } else if (propName.substr(0, 5) === "data-") {
            DataSet(node)[propName.substr(5)] = propValue
        } else {
            node[propName] = propValue
        }
    }
}
