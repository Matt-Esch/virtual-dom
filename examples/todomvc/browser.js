var document = require("global/document")

var main = require("./lib/main.js")

var State = require("./state.js")
var App = require("./app.js")

var state = State()
var surface = document.createElement("div")
main(state, App, surface)
