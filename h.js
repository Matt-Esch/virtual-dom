var extend = require("extend")

var isArray = require("./lib/is-array")
var isString = require("./lib/is-string")
var parseTag = require("./lib/parse-tag")
var isVirtualDOMNode = require("./lib/is-virtual-dom")
var isVirtualTextNode = require("./lib/is-virtual-text")

var VirtualDOMNode = require("./virtual-dom-node.js")
var VirtualTextNode = require("./virtual-text-node.js")

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


    if (children || children === '') {
        if (isArray(children)) {
            for (var i =0; i < children.length; i++) {
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
