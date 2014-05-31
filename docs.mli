type VThunk := {
    type: 'Thunk',
    vnode: VNode
}

type VHook := {
    hook: () => void
}

type VNode := {
    tagName: String,
    properties: Object,
    children: Array<VTree>,
    key: String | undefined,
    namespace: String | null,
    type: 'VirtualNode',
    version: String,

    count: Number,
    hasWidgets: Boolean,
    hooks?: Object<String, VHook>,
    descendantHooks: Boolean
}

type VWidget := {
    type: 'Widget'
}

type VPatch := {
    type: Number,
    vNode: VNode,
    patch: Any,
    version: String,
    type: 'VirtualPatch'
}

type VText := {
    text: String,
    version: String,
    type: 'VirtualText'
}

type VTree := VNode | VText | VWidget | VThunk

type VPatches := Object<String, VPatch> & {
    a: VTree
}

virtual-dom/vtree/diff := (
    left: VTree,
    right: VTree
) => VPatches
virtual-dom/vtree/is-thunk := (maybeThunk: Any) => Boolean
virtual-dom/vtree/is-vhook := (maybeHook: Any) => Boolean
virtual-dom/vtree/is-vtext := (maybeText: Any) => Boolean
virtual-dom/vtree/is-vnode := (maybeNode: Any) => Boolean
virtual-dom/vtree/is-widget := (maybeWidget: Any) => Widget
virtual-dom/vtree/vnode := (
    tagName: String,
    properties?: Object,
    children?: Array<VTree>
    key?: String,
    namespace?: String
) => VNode
virtual-dom/vtree/vpatch := (
    type: String,
    vNode: VTree,
    patch: Any
) => VPatch
virtual-dom/vtree/vtext := (text: String) => VText

virtual-dom/vdom/create-element := (
    vnode: VTree,
    opts?: {
        document? DOMDocument,
        warn: Boolean
    }
) => DOMElement
virtual-dom/vdom/patch := (
    rootNode: DOMElement,
    patches: VPatches
) => DOMElement

virtual-dom/h/index := (
    tagName: String,
    properties?: Object & {
        key?: String
    },
    children?: Array<VTree> | String
)
