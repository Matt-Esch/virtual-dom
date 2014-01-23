var extend = require("extend")

var isArray = require("./lib/is-array")
var isString = require("./lib/is-string")
var parseTag = require("./lib/parse-tag")

var VirtualDOMNode = require("./virtual-dom-node.js")

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


    if (children) {
        if (isArray(children)) {
            childNodes.push.apply(childNodes, children)
        } else {
            childNodes.push(children)
        }
    }

    return new VirtualDOMNode(tag, props, childNodes)
}

function isChild(x) {
    return isString(x) || (x instanceof VirtualDOMNode)
}

function isChildren(x) {
    return isChild(x) || isArray(x)
}
