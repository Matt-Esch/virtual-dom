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
    var tag, props, childNodes

    if (!children) {
        if (isChildren(properties)) {
            children = properties
            properties = undefined
        }
    }

    tag = parseTag(tagName, properties)

    if (!isString(tag)) {
        props = tag.properties
        tag = tag.tagName
    } else {
        props = properties
    }

    if (isArray(children)) {
        var len = children.length

        for (var i = 0; i < len; i++) {
            var child = children[i]
            if (isString(child)) {
                children[i] = new VText(child)
            }
        }

        childNodes = children
    } else if (isString(children)) {
        childNodes = [new VText(children)]
    } else if (isChild(children)) {
        childNodes = [children]
    }

    return new VNode(tag, props, childNodes)
}

function isChild(x) {
    return isVNode(x) || isVText(x) || isWidget(x)
}

function isChildren(x) {
    return isArray(x) || isString(x) || isChild(x)
}
