module.exports = assertChildNodesFromArray;

function assertChildNodesFromArray(assert, items, childNodes) {
    // ensure that the output has the same number of nodes as required
    assert.equal(childNodes.length, items.length)

    for (var i = 0; i < items.length; i++) {
        var key = items[i]
        assert.equal(childNodes[i].id, key != null ? String(key) : 'no-key-' + i)
    }
}
