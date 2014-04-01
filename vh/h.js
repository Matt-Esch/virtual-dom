var extend = require("extend")

var isArray = require("../util-wtf/is-array")
var isString = require("../util-wtf/is-string")
var parseTag = require("./parse-tag")
var isVirtualDOMNode = require("../vtree/is-virtual-dom")
var isVirtualTextNode = require("../vtree/is-virtual-text")

var VirtualDOMNode = require("../vtree/virtual-dom-node.js")
var VirtualTextNode = require("../vtree/virtual-text-node.js")

module.exports = h

function h(tagName, properties, children) {
    var childNodes = []
    var tag, props

    if (!children) {
        if (isChildren(properties)) {
            children = properties
            props = {}
        }
    }

    props = props || extend({}, properties)
    tag = parseTag(tagName, props)


    if (children != null) {
        if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                addChild(children[i], childNodes)
            }
        } else {
            addChild(children, childNodes)
        }
    }

    return new VirtualDOMNode(tag, props, childNodes)
}

function addChild(c, childNodes) {
    if (isString(c)) {
        childNodes.push(new VirtualTextNode(c))
    } else {
        // For now, we push all objects regardless of type
        childNodes.push(c)
    }
}

function isChild(x) {
    return isVirtualDOMNode(x) || isVirtualTextNode(x)
}

function isChildren(x) {
    return isChild(x) || isArray(x) || isString(x)
}
