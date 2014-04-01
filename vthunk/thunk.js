var cuid = require("cuid")

var dom = require("../vdom/create-element")
var diff = require("../vtree/diff")
var patch = require("../vdom/patch")
var isString = require("../util-wtf/is-string")

/* Usage
var h = require("virtual-dom/h")
var thunk = require("virtual-dom/thunk")

module.exports = thunk("myThunk", render, shouldUpdate)

function render(state) {
    return h("div", state.value)
}

function shouldUpdate(prev, curr) {
    return prev.value !== curr.value
}
*/

/* Function signature

thunk(render<Function>) : <Widget>
thunk(type<String>, render<Function>) : <Widget>
thunk(render<Function>, shouldUpdate<Function|Boolean>) : <Widget>
thunk(type<String>, render<Function>, shouldUpdate<Function|Boolean>) : <Widget>

*/
module.exports = thunk

function thunk(type, render, shouldUpdate) {
    if (arguments.length === 2) {
        if (!isString(type)) {
            shouldUpdate = render
            render = type
            type = null
        }
    } else if (arguments.length === 1) {
        render = type
        type = null
    }

    function Thunk(state) {
        if (!(this instanceof Thunk)) {
            return new Thunk(state)
        }

        this.state = state
    }

    Thunk.prototype.init = initThunk
    Thunk.prototype.update = updateThunk

    Thunk.prototype.type = isString(type) ? type : cuid()
    Thunk.prototype.render = render
    Thunk.prototype.shouldUpdate = getUpdate(shouldUpdate)

    return Thunk
}

function initThunk() {
    var vnode = this.vnode = this.render(this.state)
    return dom(vnode)
}

function updateThunk(previous, domNode) {
    var currentState = this.state
    var render = this.render
    var shouldUpdate = this.shouldUpdate

    if (shouldUpdate === false || (shouldUpdate !== true &&
            !shouldUpdate(previous.state, currentState))) {
        this.vnode = previous.vnode
        return
    }

    // Render is pure, so currentState will always yield the same value
    var vnode = this.vnode = (this.vnode || render(currentState))
    patch(domNode, diff(previous.vnode, vnode))
}

function getUpdate(shouldUpdate) {
    var type = typeof shouldUpdate
    if (type === "boolean" || type === "function") {
        return shouldUpdate
    } else {
        return shouldUpdateDefault
    }
}

function shouldUpdateDefault(previous, current) {
    return previous === current
}
