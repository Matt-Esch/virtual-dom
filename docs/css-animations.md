> Below is a comment stolen from a controlling position ( https://github.com/Matt-Esch/virtual-dom/issues/104#issuecomment-68611995 ) question.

You should be activating the CSS transitions using hooks and nextTick. That is, you should know exactly which nodes you wish to animate based on your data, and you should use that data to add a transition hook based on next tick.

This is where the flaw in this topic is; the lack of encoding of the animation state. You don't have to do animations with JS, I don't recommed it over CSS transitions, but you do need to model your expectations properly in your data model and apply transitions to the nodes using that data. Generic transitions that rely on the way in which the DOM is mutated isn't going to work consistently.

For example, if you want an inserted transition, you might add a wasInserted boolean flag to your model.

On rendering that item, if wasInserted is true, you add an animation hook which, on next tick, adds a css class like .inserted. You code your CSS transitions against this class.

On next tick your hook will add the class and the transition will happen. Further to that you will want to clear the wasInserted flag, probably also on next tick.

There are tons of these flag situations which should not trigger re-render. I think mercury needs to add something like this as a primitive type but that's outside the scope of virtual-dom.

But as you can see, the animation works because you have recorded the state and necessity for the transition, and did not rely simply on the insertion of the node to trigger that animation.
