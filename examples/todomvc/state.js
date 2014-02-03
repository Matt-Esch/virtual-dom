var ObservHash = require("./lib/observ-hash.js")
var ObservArray = require("./lib/observ-array.js")
var Observ = require("./lib/observ.js")

var defaultState = {
    todos: [],
    route: "all"
}

module.exports = State

function State(initialState) {
    initialState = initialState || defaultState

    var state = ObservHash({
        todos: ObservArray(initialState.todos),
        route: Observ(initialState.route)
    })

    return state
}
