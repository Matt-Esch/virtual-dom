# FAQ

These are frequently asked questions. If you have any questions
not on this list, then **please** [open an issue and ask][new-issue].

[new-issue]: https://github.com/Matt-Esch/virtual-dom/issues/new

## How do I do custom rendering

If you want to embed a custom piece of rendering machinery in
  the virtual DOM you can use widgets.

A widget is a object with an `init()` and `update()` method and a `type` attribute with the "Widget" value.

```js
function GoogleMapWidget(initialPosition) {
    this.type = 'Widget'
    this.position = initialPosition
}

GoogleMapWidget.prototype.init = function () {
    var elem = document.createElement('div')
    this.map = GoogleMap(elem)
    this.map.setPosition(this.position)
    return elem
}

GoogleMapWidget.prototype.update = function (prev, elem) {
    this.map = this.map || prev.map
    this.map.setPosition(this.position)
}

h('div', [
    new GoogleMapWidget({ x: 0, y: 0 })
])
```

The rules for a widget is that the first time it's seen we call
  `init()`, we expect `init()` to return a DOM element.

The DOM element you return is yours to keep & mutate, virtual
  DOM will not touch it or its children. However you should never
  touch `elem.parentNode` as that does not belong to the widget

The second method is `update()` if we see a widget and we have
  the same widget in the previous tree we call `update(prev, elem)`
  instead. `update()` is a good place to copy over any stateful
  things from the `prev` widget instance and then to update the
  state with the current properties by accessing them with `this`

For another example of a widget see the
    [canvas demo](examples/canvas.js)

## How do I update custom properties

If you want to update a custom property on a DOM element, like
  calling `setAttribute()` or calling `focus()` then you can
  use a hook

```js
function AttributeHook(value) {
    this.value = value
}

AttributeHook.prototype.hook = function (elem, prop) {
    elem.setAttribute(prop, this.value)
}

h('div', {
    class: new AttributeHook('some-class-name')
})
```

For another example of a hook see
  [TodoMVC focus hook](https://github.com/Raynos/mercury/blob/master/examples/lib/focus-hook.js)

## How do I get life cycle hooks for VNodes

`VNode` only exposes one life cycle mechanism. which is the hook
  mechanism.

### Hooking into VNode creation

If you want to do some custom DOM logic immediately once a VNode
  is created you can add a hook, I normally add them to
  `ev-foo` properties.

```js
function MyHook(args) {
  this.args = args
}

MyHook.prototype.hook = function (elem, propName) {
  /* do DOM stuff */
}

h('div', {
    'ev-myHook': new MyHook(args)
})
```

### Hooking into VNode after it's in the DOM

If you want to a hook to fire after the DOM element has been
  appended into the DOM you will have to delay the hook manually

```js
function MyHook(args) {
  this.args = args
}

MyHook.prototype.hook = function (elem, propName) {
  setImmediate(function () {
    // DOM element will be in the real DOM by now
    // do DOM stuff
  })
}

h('div', {
    'ev-myHook': new MyHook(args)
})
```

We only have one type of hook as maintaining both life cycles
  separately is very complex when it can simply be done at
  the user level with a `setImmediate`

We have the hook fire immediately by default because sometimes
  you need to run DOM logic BEFORE the element is in the DOM.

Firing the hook when the element is in the DOM makes it
  impossible to fire it when it's not in the DOM.

