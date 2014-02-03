var document = require("global/document")

var main = require("./lib/main.js")

var State = require("./state.js")
var App = require("./app.js")

main(State(), App, document.body)
