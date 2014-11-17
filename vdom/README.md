# vdom

A DOM render and patch algorithm for vtree

## Motivation

Given a `vtree` structure representing a DOM structure, we would like to either
render the structure to a DOM node using `vdom/create-element` or we would like
to update the DOM using the results of `vtree/diff` by patching the DOM with
`vdom/patch`

This module is currently re-exporting the `vdom` from `virtual-dom`, but the
aim is to eventually make this a standalone module and have `virtual-dom`
depend on `vdom` instead.

## Example

```js
var VNode = require("vtree/vnode")
var diff = require("vtree/diff")

var createElement = require("vdom/create-element")
var patch = require("vdom/patch")

var leftNode = new VNode("div")
var rightNode = new VNode("text")

// Render the left node to a DOM node
var rootNode = createElement(leftNode)
document.body.appendChild(rootNode)

// Update the DOM with the results of a diff
var patches = diff(leftNode, rightNode)
patch(rootNode, patches)
```

## Installation

`npm install vdom`

## Contributors

 - Matt Esch

## MIT Licenced
