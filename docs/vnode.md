# VNode

A VNode is a representation of a dom node. Most end users will probably have their VNodes generated through [virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript), but understanding the VNode interface can be useful.

In virtual-dom, VNodes are turned from virtual nodes into real nodes with the createElement function. You can read the code at [vdom/create-element](https://github.com/Matt-Esch/virtual-dom/blob/master/vdom/create-element.js)

## Arguments

**tagName**  
A string, e.g. 'div', 'span', 'article'

**properties** *(optional)*  
An object that maps property names to their values, e.g. `{ id: "foo", className: "bar" }`

**children** *(optional)*  
An array of any combination of VNodes, VText, Widgets, or Thunks

**key** *(optional)*  
An identifying string used to differentiate this node from others. Used internally by vtree/diff to do node reordering.

**namespace** *(optional*)  
A string specifying the namespace uri to associate with the element. VNodes created with a namespace will use [Document#createElementNS](https://developer.mozilla.org/en-US/docs/Web/API/document.createElementNS)

### A full example
```javascript
var VNode = require("virtual-dom").VNode
var createElement = require("virtual-dom").create

var Hook = function(){}
Hook.prototype.hook = function(elem, key, previousValue) {
  console.log("Hello from " + elem.id + "!\nMy key was: " + key)
}

var tagName = "div"
var style = "width: 100px; height: 100px; background-color: #FF0000;"
var attributes = {"class": "red box", style: style }
var key = "my-unique-red-box"
var namespace = "http://www.w3.org/1999/xhtml"
var properties = {
  attributes: attributes,
  id: "my-red-box",
  "a hook can have any property key": new Hook()
}
var childNode = new VNode("div", {id: "red-box-child"})

RedBoxNode = new VNode(tagName, properties, [childNode], key, namespace)
RedBoxElem = createElement(RedBoxNode)
document.body.appendChild(RedBoxElem)

// Will result in html that looks like
// <div class="red box" style="width: 100px; height: 100px; background-color: #FF0000;" id="my-red-box">
//   <div id="red-box-child"></div>
// </div>
```


### properties
Keys in properties have several special cases. 
#### properties.attributes
Everything in the `properties.attributes` object will be set on the rendered dom node using `Element#setAttribute(key, value)`, and removed using `Element#removeAttribute`. Refer to [MDN HTML Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes) for available attributes. 

#### Hook Objects
Any key whose value is an object with an inherited key called "hook" is considered a hook. Hooks are used to run functions at render time. Refer to the [hook documentation](hooks.md) for more information.

#### Other Objects
Any key in `properties` that is an object, but whose value isn't a hook and isn't in the attributes key, will set the rendered elements property to the given object.

```javascript
createElement(new VNode('div', { style: { width: "100px", height: "100px"}}))
// When added to the dom, the resulting element will look like <div style="width: 100px; height: 100px"><div>
```

#### Other Values
Most attributes can be set using properties. During element creation, keys and values in the `properties.attributes` get set using `Element#setAttribute(key, value)`, whereas keys other than `attributes` present in properties get set using `element[key] = value`.

```javascript
foo = new VNode('div', { id: 'foo'})
// will render the same as
foo = new VNode('div', { attributes: { id: 'foo' }})
```

This can, however, cause some unexpected behavior, particularly if you are unfamiliar with the differences between setting an element property directly vs. setting it using an attribute. Refer to [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) and [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) for some common property behaviors.

#### properties.style vs properties.attributes.style
`properties.style` expects an object, while `properties.attributes.style` expects a string.

```javascript
// using attributes
var redBox = new VNode('div', { attributes: { style: "width: 100px; height: 100px; background-color: #FF0000;" }})
// using a property
var anotherRedBox = new VNode('div', { style: { width: "100px", height: "100px", backgroundColor: "#FF0000" }})
```

When using `properties.style`, if the styles have changed since the last render and are being updated, keys that are not in the new style definition will be set to an empty string. This differs from the normal behavior, which sets old object keys to undefined.

#### properties.className vs properties.attributes.class
Set the class attribute value using `className` key in properties, and the `class` key in attributes.

```javascript
var redBox = new VNode('div', { className: "red box" })
// will render the same as
var anotherRedBox = new VNode('div', { attributes: { "class": "red box" }})
```

#### Custom attributes (data-\*)
Custom attributes won't be rendered if set directly in properties. Set them in properties.attributes.

```javascript
var doThis = new VNode('div', { attributes: { "data-example": "I will render" }})
var notThis = new VNode('div', { "data-example": "I will not render" })
```

Alternately, you can use the [dataset](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement.dataset) property to set data-\* attributes.

```javascript
new VNode('div', { attributes: { "data-greeting": "Hello" }})
new VNode('div', { dataset: { greeting: "Hello" }})
// Will both generate <div data-greeting="Hello"></div>
```

#### ARIA attributes
Like custom attributes, ARIA attributes are also set in `properties.attributes`.

```javascript
var ariaExample = new VNode('div', { attributes: { "aria-checked": "true" }})
```

Unlike data-\* attributes, they cannot be set directly via properties.

#### properties.value, properties.defaultValue, and properties.attributes.value
If an input element is reset, its value will be returned to its value set in `properties.attributes.value`. If you've set the value using `properties.value`, this will not happen. However, you may set `properties.defaultValue` to get the desired result.
