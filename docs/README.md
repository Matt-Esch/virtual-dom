# virtual-dom documentation
This documentation is aimed at people who would like to work with virtual-dom directly, or gain a deeper understanding of how their virtual-dom based framework works. If you would rather be working at a higher level, you may find the [mercury framework](https://github.com/Raynos/mercury) a better place to start.

## Overview

virtual-dom consists of four main parts:

[vtree](https://github.com/Matt-Esch/virtual-dom/tree/master/vtree) - responsible for diffing two virtual representations DOM nodes  
[vdom](https://github.com/Matt-Esch/virtual-dom/tree/master/vdom) - responsible for taking the [patch](https://github.com/Matt-Esch/virtual-dom/blob/master/vdom/patch.js) genereated by [vtree/diff](https://github.com/Matt-Esch/virtual-dom/blob/master/vtree/diff.js) and using it to modify the rendered DOM  
[vnode](https://github.com/Matt-Esch/virtual-dom/tree/master/vnode) - virtual representation of dom elements  
[virtual-hyperscript](https://github.com/Matt-Esch/virtual-dom/tree/master/virtual-hyperscript) - an interface for generating VNodes from simple data structures

Newcomers should start by reading the VNode and VText documentation, as virtual nodes are central to the operation of virtual-dom. Hooks, Thunks, and Widgets are more advanced features, and you will find both documentation of their interfaces and several examples on their respective pages.

## Contents

[VNode](vnode.md) - A representation of a DOM element

[VText](vtext.md) - A representation of a text node

[Hooks](hooks.md) - The mechanism for executing functions after a new node has been created

[Thunk](thunk.md) - The mechanism for taking control of diffing a specific DOM sub-tree

[Widget](widget.md) - The mechanism for taking control of node patching: DOM Element creation, updating, and removal.

[CSS animations](css-animations.md)
