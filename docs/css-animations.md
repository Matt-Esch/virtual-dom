# CSS animations
Based on a discusison in [question](https://github.com/Matt-Esch/virtual-dom/issues/104#issuecomment-68611995).

You should be activating the CSS transitions using hooks and nextTick. Here is a basic example of inserting an element through transition:
```javascript
Item.render = function(state) {
  return h('li', {
    'class' : new ItemInsertHook('item'),
  }, [
    h('div.text', state.text), 
    h('button', {
      'ev-click' : mercury.event(...)
    }, 'Remove or something...'),
  ]);
}

function ItemInsertHook(value) {
  this.value = value;
}

ItemInsertHook.prototype.hook = function(elem, propName) {
  
  // Here we want to see if this is a newly created dom element
  // or an element that was inserted before and is revisited.
  // The way to check for that in this case is see if the element is 
  // attached to the dom.
  // Newly created element will not be attached to the dom when hook is executed.
  
  if (!document.body.contains(elem)) {
    elem.setAttribute(propName, this.value + ' inserting');

    nextTick(function () {
      elem.setAttribute(propName, this.value + '');
    }.bind(this))
  }
}

//Elswhere at the top level of application:
function renderItemsList(state) {
  return h('ul#item-list', [
    state.items.map(function(item) {return Item.render(item);})
  ]);
}
```

And css:
```css
li.item.inserting { opacity : 0.01; }
li.item { transition: opacity 0.2s ease-in-out; }
li.item { opacity : 0.99; }
```

See full example on requirebin: http://requirebin.com/?gist=250e6e59aa40d5ff0fcc

In a more complex case it may be necessary to encode animation state in the model. You should know exactly which nodes you wish to animate based on your data, and you should use that data to add a transition hook based on next tick.

You don't have to do animations with JS, prefer CSS transitions, but you do need to model your expectations properly in your data model and apply transitions to the nodes using that data. Generic transitions that rely on the way in which the DOM is mutated isn't going to work consistently.

For example, if you want an inserted transition, you might add a wasInserted boolean flag to your model.

On rendering that item, if wasInserted is true, you add an animation hook which, on next tick, adds a css class like .inserted. You code your CSS transitions against this class.

On next tick your hook will add the class and the transition will happen. Further to that you will want to clear the wasInserted flag, probably also on next tick.

There are tons of these flag situations which should not trigger re-render. I think mercury needs to add something like this as a primitive type but that's outside the scope of virtual-dom.

But as you can see, the animation works because you have recorded the state and necessity for the transition, and did not rely simply on the insertion of the node to trigger that animation.
