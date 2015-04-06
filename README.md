# virtual-dom

A JavaScript [DOM model](#dom-model) supporting [element creation](#element-creation), [diff computation](#diff-computation) and [patch operations](#patch-operations) for efficient re-rendering

[![build status][1]][2]
[![NPM version][3]][4]
[![Coverage Status][5]][6]
[![Davis Dependency status][7]][8]
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/mattesch.svg)](https://saucelabs.com/u/mattesch)

## Motivation

Manual DOM manipulation is messy and keeping track of the previous DOM state is hard. A solution to this problem is to write your code as if you were recreating the entire DOM whenever state changes. Of course, if you actually recreated the entire DOM every time your application state changed, your app would be very slow and your input fields would lose focus.

`virtual-dom` is a collection of modules designed to provide a declarative way of representing the DOM for your app. So instead of updating the DOM when your application state changes, you simply create a virtual tree or `VTree`, which looks like the DOM state that you want. `virtual-dom` will then figure out how to make the DOM look like this efficiently without recreating all of the DOM nodes.

`virtual-dom` allows you to update a view whenever state changes by creating a full `VTree` of the view and then patching the DOM efficiently to look exactly as you described it. This results in keeping manual DOM manipulation and previous state tracking out of your application code, promoting clean and maintainable rendering logic for web applications.

## Example

```javascript
var h = require('virtual-dom/h');
var diff = require('virtual-dom/diff');
var patch = require('virtual-dom/patch');
var createElement = require('virtual-dom/create-element');

// 1: Create a function that declares what the DOM should look like
function render(count)  {
    return h('div', {
        style: {
            textAlign: 'center',
            lineHeight: (100 + count) + 'px',
            border: '1px solid red',
            width: (100 + count) + 'px',
            height: (100 + count) + 'px'
        }
    }, [String(count)]);
}

// 2: Initialise the document
var count = 0;      // We need some app data. Here we just store a count.

var tree = render(count);               // We need an initial tree
var rootNode = createElement(tree);     // Create an initial root DOM node ...
document.body.appendChild(rootNode);    // ... and it should be in the document

// 3: Wire up the update logic
setInterval(function () {
      count++;

      var newTree = render(count);
      var patches = diff(tree, newTree);
      rootNode = patch(rootNode, patches);
      tree = newTree;
}, 1000);
```
[View on RequireBin](http://requirebin.com/?gist=5492847b9a9025e64bab)

## Documentation

You can find the documentation for the seperate components
  in their READMEs

 - For `create-element.js` see the [vdom README](vdom/README.md)
 - For `diff.js` see the [vtree README](vtree/README.md)
 - For `h.js` see the [virtual-hyperscript README](virtual-hyperscript/README.md)
 - For `patch.js` see the [vdom README](vdom/README.md)

For information about the type signatures of these modules feel
  free to read the [javascript signature definition](docs.jsig)

## DOM model

`virtual-dom` exposes a set of objects designed for representing DOM nodes. A "Document Object Model Model" might seem like a strange term, but it is exactly that. It's a native JavaScript tree structure that represents a native DOM node tree. We call this a **VTree**

We can create a VTree using the objects directly in a verbose manner, or we can use the more terse virtual-hyperscript.

### Example - creating a VTree using the objects directly

```javascript
var VNode = require('virtual-dom/vnode/vnode');
var VText = require('virtual-dom/vnode/vtext');

function render(data) {
    return new VNode('div', {
        className: "greeting"
    }, [
        new VText("Hello " + String(data.name))
    ]);
}

module.exports = render;
```

### Example - creating a VTree using virtual-hyperscript

```javascript
var h = require('virtual-dom/h');

function render(data) {
    return h('.greeting', ['Hello ' + data.name]);
}

module.exports = render;
```

The DOM model is designed to be efficient to create and read from. The reason why we don't just create a real DOM tree is that creating DOM nodes and reading the node properties is an expensive operation which is what we are trying to avoid. Reading some DOM node properties even causes side effects, so recreating the entire DOM structure with real DOM nodes simply isn't suitable for high performance rendering and it is not easy to reason about either.

A `VTree` is designed to be equivalent to an immutable data structure. While it's not actually immutable, you can reuse the nodes in multiple places and the functions we have exposed that take VTrees as arguments never mutate the trees. We could freeze the objects in the model but don't for efficiency. (The benefits of an immutable-equivalent data structure will be documented in vtree or blog post at some point)



## Element creation

```haskell
createElement(tree:VTree) -> DOMNode
```

Given that we have created a `VTree`, we need some way to translate this into a real DOM tree of some sort. This is provided by `create-element.js`. When rendering for the first time we would pass a complete `VTree` to create-element function to create the equivalent DOM node.

## Diff computation

```haskell
diff(previous:VTree, current:VTree) -> PatchObject
```

The primary motivation behind virtual-dom is to allow us to write code independent of previous state. So when our application state changes we will generate a new `VTree`. The `diff` function creates a set of DOM patches that, based on the difference between the previous `VTree` and the current `VTree`, will update the previous DOM tree to match the new `VTree`.

## Patch operations

```haskell
patch(rootNode:DOMNode, patches:PatchObject) -> DOMNode newRootNode
```

Once we have computed the set of patches required to apply to the DOM, we need a function that can apply those patches. This is provided by the `patch` function. Given a DOM root node and a set of DOM patches, the `patch` function will update the DOM. After applying the patches to the DOM, the DOM should look like the new `VTree`.


## Original motivation

virtual-dom is heavily inspired by the inner workings of React by facebook. This project originated as a gist of ideas, which [we have linked to provide some background context](https://gist.github.com/Raynos/8414846).

## Tools

* [html2hscript](https://github.com/twilson63/html2hscript) - Parse HTML into hyperscript
* [html2hscript.herokuapp.com](http://html2hscript.herokuapp.com/) - Online Tool that converts html snippets to hyperscript
* [html2hyperscript](https://github.com/unframework/html2hyperscript) - Original commandline utility to convert legacy HTML markup into hyperscript


[1]: https://secure.travis-ci.org/Matt-Esch/virtual-dom.svg
[2]: https://travis-ci.org/Matt-Esch/virtual-dom
[3]: https://badge.fury.io/js/virtual-dom.svg
[4]: https://badge.fury.io/js/virtual-dom
[5]: http://img.shields.io/coveralls/Matt-Esch/virtual-dom.svg
[6]: https://coveralls.io/r/Matt-Esch/virtual-dom
[7]: https://david-dm.org/Matt-Esch/virtual-dom.svg
[8]: https://david-dm.org/Matt-Esch/virtual-dom
