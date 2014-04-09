var document = require("global/document")
var isObject = require("x-is-object")

var isVNode = require("../vtree/is-vnode")
var isVText = require("../vtree/is-vtext")
var isWidget = require("../vtree/is-widget")
var isHook = require("../vtree/is-vhook")

module.exports = createElement

function createElement(vnode, opts) {
    var doc = opts ? opts.document || document : document
    var warn = opts ? opts.warn : null

    if (isWidget(vnode)) {
        return vnode.init()
    } else if (isVText(vnode)) {
        return doc.createTextNode(vnode.text)
    } else if (!isVNode(vnode)) {
        if (warn) {
            warn("Item is not a valid virtual dom node", vnode)
        }
        return null
    }

    var node = (vnode.namespace === null) ?
        doc.createElement(vnode.tagName) :
        doc.createElementNS(vnode.namespace, vnode.tagName)

    applyProperties(node, vnode.properties)
    var children = vnode.children

    for (var i = 0; i < children.length; i++) {
        var childNode = createElement(children[i], opts)
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
        } else if (isHook(propValue)) {
            propValue.hook(node, propName)
        } else if (isObject(propValue)) {
            if (!node[propName]) {
                node[propName] = {}
            }

            var nodeValue = node[propName]
            for (var k in propValue) {
                nodeValue[k] = propValue[k]
            }
        } else {
            node[propName] = propValue
        }
    }
}
