var h = require("./h")
var diff = require("./diff")
var patch = require("./patch")
var render = require("./render")

var hello = h("div", "hello")
var goodbye = h("div", "goodbye")

var rootNode = render(hello)
var patches = diff(hello, goodbye)

patch(rootNode, patches)