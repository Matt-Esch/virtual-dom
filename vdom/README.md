# vdom

A DOM render and patch algorithm for vtree

## Motivation

Given a `vtree` structure representing a DOM structure, we would like to either
render the structure to a DOM node using `vdom/create-element` or we would like
to update the DOM using the results of `vtree/diff` by patching the DOM with
`vdom/patch`

## Example

```js
var h = require("virtual-dom/h")
var diff = require("virtual-dom/diff")

var createElement = require("virtual-dom/create-element")
var patch = require("virtual-dom/patch")

var leftNode = h("div")
var rightNode = h("text")

// Render the left node to a DOM node
var rootNode = createElement(leftNode)
document.body.appendChild(rootNode)

// Update the DOM with the results of a diff
var patches = diff(leftNode, rightNode)
patch(rootNode, patches)
```

## Installation

`npm install virtual-dom`

## Contributors

 - Matt Esch

## MIT Licenced
