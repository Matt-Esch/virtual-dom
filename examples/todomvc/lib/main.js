var toElement = require("virtual-dom/render")
var diff = require("virtual-dom/diff")
var patch = require("virtual-dom/patch")
var raf = require("raf").polyfill

module.exports = main

function main(obs, render, elem) {
    var currTree = render(obs())
    var rootNode = toElement(currTree)
    var nextState = false

    obs(function (state) {
        nextState = state
    })

    raf(function renderDOM() {
        if (!nextState) {
            return raf(renderDOM)
        }

        var nextTree = render(nextState)
        var patches = diff(currTree, nextTree)
        rootNode = patch(rootNode, patches)

        currTree = nextTree
        nextState = false

        raf(renderDOM)
    })


    elem.appendChild(rootNode)
}

