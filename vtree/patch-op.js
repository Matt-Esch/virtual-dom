module.exports = createPatch

function createPatch(vNode, patch) {
    return new PatchOp(vNode, patch)
}

function PatchOp(vNode, patch) {
    this.vNode = vNode
    this.patch = patch
}
