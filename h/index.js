var extend = require("xtend")
var isArray = require("x-is-array")
var isString = require("x-is-string")

var VNode = require("../vtree/vnode.js")
var VText = require("../vtree/vtext.js")
var isVNode = require("../vtree/is-vnode")
var isVText = require("../vtree/is-vtext")
var isWidget = require("../vtree/is-widget")

var parseTag = require("./parse-tag")

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

    return new VNode(tag, props, childNodes)
}

function addChild(c, childNodes) {
    if (isString(c)) {
        childNodes.push(new VText(c))
    } else if (isVNode(c) || isWidget(c)) {
        childNodes.push(c)
    }
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x)
}

function isChildren(x) {
    return isChild(x) || isArray(x) || isString(x)
}
