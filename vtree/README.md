# vtree

A realtime tree diffing algorithm

## Motivation

`vtree` currently exists as part of `virtual-dom`. It is used for imitating
diff operations between two `vnode` structures that imitate the structure of
the active DOM node structure in the browser.

## Example

```js
var h = require("virtual-dom/h")
var diff = require("virtual-dom/diff")

var leftNode = h("div")
var rightNode = h("text")

var patches = diff(leftNode, rightNode)
/*
  -> {
    a: leftNode,
    0: vpatch<REPLACE>(rightNode) // a replace operation for the first node
  }
*/
```

## Installation

`npm install virtual-dom`

## Contributors

 - Matt Esch

## MIT Licenced
