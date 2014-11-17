import { Vtree, VNode, VHook } from "vtree"

virtual-hyperscript : (
    tagName: String,
    properties?: Object<String, String | Hook | Object> & {
        key: String,
        namespace: String
    },
    children?: Array<VTree> | Vtree | String
) => VNode

virtual-hyperscript/svg : (
    tagName: String,
    properties?: Object<String, String | Object | VHook>,
    children?: Array<VTree> | Vtree | String
) => VNode

virtual-hyperscript/hooks/attribute-hook := (value: Any) => VHook

virtual-hyperscript/hooks/data-set-hook := (value: Any) => VHook

virtual-hyperscript/hooks/ev-hook := (value: Any) => VHook

virtual-hyperscript/hooks/soft-set-hook := (value: Any) => VHook
