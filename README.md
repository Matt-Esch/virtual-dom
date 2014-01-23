# Virtual DOM and diffing algorithm

There was a [great article][1] about how react implements it's
  virtual DOM. There are some really interesting ideas in there
  but they are deeply buried in the implementation of the React
  framework.

However, it's possible to implement just the virtual DOM and
  diff algorithm on it's own as a set of independent modules.

## Motivation

The reason we wan't a diff engine is so that we can write our
  templates as plain javascript functions that take in our
  current application state and returns a visual representation
  of the view for that state.

However normally when you do this, you would have to re-create
  the entire DOM for that view each time the state changed and
  swap out the root node for your view. This is terrible for
  performance but also blows away temporary state like user input
  focus.

A virtual DOM approach allows you to re-create a virtual DOM
  for the view each time the state changes. Creating a virtual
  DOM in JavaScript is cheap compared to DOM operations. You can
  then use the 60 fps batched DOM writer to apply differences
  between the current DOM state and the new virtual DOM state.

One important part of the virtual DOM approach is that it is a
  **module** and it **should do one thing well**. The virtual DOM
  is only concerned with representing the virtual DOM. The `diff`
  `batch` and `patch` functions are only concerned with the
  relevant algorithms for the virtual dom.

The virtual DOM has nothing to do with events or representing
  application state. The below example demonstrates the usage
  of state with `observ` and events with `dom-delegator`. It
  could just as well have used `knockout` or `backbone` for state
  and used `jQuery` or `component/events` for events.

## Example

**Warning:** Vaporware. The `virtual-dom` is not implemented yet.

```js
var h = require("virtual-dom/h")
var render = require("virtual-dom/render")
var raf = require("raf").polyfill
var Observ = require("observ")
var ObservArray = require("observ-array")
var computed = require("observ/computed")
var Delegator = require("dom-delegator")
var diff = require("virtual-dom-diff")
var patch require("virtual-dom-patch")
var batch = require("virtual-dom-batch")

// logic that takes state and renders your view.
function TodoList(items) {
    return h("ul", items.map(function (text) {
        return h("li", text)
    }))
}

function TodoApp(state) {
    return h("div", [
        h("h3", "TODO"),
        { render: TodoList, data: state.items },
        h("div", { "data-submit": "addTodo" }, [
            h("input", { value: state.text, name: "text" }),
            h("button", "Add # " + state.items.length + 1)
        ])
    ])
}

// model the state of your app
var state = {
    text: Observ(""),
    items: ObservArray([])
}

// react to inputs and change state
var delegator = Delegator(document.body)
delegator.on("addTodo", function (ev) {
    state.items.push(ev.currentValue.text)
    state.text.set("")
})

// render initial state
var currTree = TodoApp({ text: state.text(), items: state.items().value })
var elem = render(currTree)

document.body.appendChild(elem)

// when state changes diff the state
var diffQueue = []
var applyUpdate = false
computed([state.text, state.items], function () {
    // only call `update()` in next tick.
    // this allows for multiple synchronous changes to the state
*    // in the current tick without re-rendering the virtual DOM
    if (applyUpdate === false) {
        applyUpdate = true
        setImmediate(function () {
            update()
            applyUpdate = false
        })
    }
})

function update() {
    var newTree = TodoApp({ text: state.text(), items: state.items().value })

    // calculate the diff from currTree to newTree
    var patches = diff(currTree, newTree)
    diffQueue = diffQueue.concat(patches)
    currTree = newTree
}

// at 60 fps, batch all the patches and then apply them
raf(function renderDOM() {
    var patches = batch(diffQueue)
    patch(elem, patches)

    raf(renderDOM)
})
```

## Documentation

### `var virtualDOM = h(tagName, props?, children?)`

`h` creates a virtual DOM tree. You can give it a `tagName` and
  optionally DOM properties & optionally an array of children.

### `var elem = render(virtualDOM)`

`render` takes a virtual DOM tree and turns it into a DOM element
  that you can put in your DOM. Use this to render the initial
  tree.

### `var patches = diff(previousTree, currentTree)`

`diff` takes two virtual DOM tree and returns an array of virtual
  DOM patches that you would have to apply to the `previousTree`
  to create the `currentTree`

This function is used to determine what has changed in the
  virtual DOM tree so that we can later apply a minimal set of
  patches to the real DOM, since touching the real DOM is slow.

### `var patches = batch(patches)`

`batch` can be used to take a large array of patches, generally
  more then what is returned by a single `diff` call and will
  then use a set of global heuristics to produce a smaller more
  optimal set of patches to apply to a DOM tree.

Generally you want to call `batch` 60 or 30 times per second to
  compute the optimal set of DOM mutations to apply. This is
  great if your application has large spikes of state changes
  that you want to condense into a smaller more optimal set of
  DOM mutations.

`batch` also does other useful things like re-ordering mutations
  to avoid reflows.

### `patch(elem, patches)`

`patch` will take a real DOM element and apply the DOM mutations
  in order. This is the only part that actually does the
  expensive work of mutating the DOM.

We recommend you do this in a `requestAnimationFrame` handler.

## Concept

The goal is to represent your template as plain old javascript
  functions. Using actual `if` statements instead of
  `{{#if }} ... {{/if}}` and all other flow control build into
  javascript.

One approach that works very well is [hyperscript][2] however
  that will re-create a DOM node each time you re-render your
  view which is expensive.

A better solution is to have a `h` function that returns a
  virtual DOM tree. Creating a virtual DOM in JavaScript is
  cheap compared to manipulating the DOM directly.

Once we have two virtual DOM trees. One for the current application
  state and one for the previous we can use the `diff` function
  to produce a minimal set of patches from the previous virtual
  DOM to the current virtual DOM.

Once you have a set of patches, you could apply them immediately
  but it's better to queue them and flush this queue at a fixed
  interval like 60 times per second. Only doing our DOM
  manipulation with the callback to `requestAnimationFrame` will
  give us a performance boost and minimize the number of DOM
  operations we do. We also call `batch` in before we apply
  our patches to squash our list of diffs to the minimal set of
  operations.

Another important thing to note is that our virtual DOM tree
  contains a notion of a `Component` which is
  `{ render: function (data) { return tree }, data: { ... } }`.

This is an important part of making the virtual DOM fast. Calling
  `render()` is cheap because it only renders a single layer and
  embeds components for all it's child views. The `diff` engine
  then has the option to compare the `data` key of a component
  between the current and previous one, if the `data` hasn't
  changed then it doesn't have to re-render that component.

The `component` can also implement a `compare` function to
  compare the data between the previous and current to tell us
  whether or not the change requires a re-render.

This means you only have to re-render the components that have
  changed instead of re-rendering the entire virtual DOM tree
  any time a piece of application state changes.


  [1]: http://calendar.perfplanet.com/2013/diff/
  [2]: https://github.com/dominictarr/hyperscript