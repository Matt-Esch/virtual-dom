# Hooks
Hooks are functions that execute after turning a VNode into an Element. They are set by passing a VNode any property key with an object that has a function called hook that has not been directly assigned. The simplest way to ensure that a function isn't directly assigned is for it to be a prototype on an object.

Will Work
```javascript
var Hook = function(){}
Hook.prototype.hook = function(node, propertyName, previousValue) { 
  console.log("Hello, World")
}
createElement(h('div', { "my-hook": new Hook() }))
```

Won't Work
```javascript
var hook = { hook: function(node, propertyName, previousvalue) { console.log("Hello, World") } }
createElement(h('div', { "my-hook": hook }))
```

## Arguments
Your hook function will be given the following arguments

**node**  
The Element generated from the VNode.

```javascript
var Hook = function(){}
Hook.prototype.hook = function(node, propertyName, previousValue) {
  console.log("type: ", node.constructor.name)
}
createElement(h('div', { "my-hook": new Hook() }))
// logs "type: HTMLDivElement"
```

**propertyName**  
String, key of the property this hook was assigned from.

```javascript
var Hook = function(){}
Hook.prototype.hook = function(node, propertyName, previousValue) { 
  console.log("name: " + propertyName)
}
createElement(h('div', { "my-hook": new Hook() }))
// logs "name: my-hook"
```

**previousValue** *(optional)*  
If this node is having just its properties changed during a patch, it will receive the value that was previously assigned to the key. Otherwise, this argument will be undefined.

## Other Examples
[virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript) uses hooks for several things, including setting up events and returning focus to input elements after a render. You can view these hooks in the [virtual-hyperscript/hooks](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript/hooks) folder.
