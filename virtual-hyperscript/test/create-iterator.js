var SYMBOL_ITERATOR = require("../iterable").SYMBOL_ITERATOR

function createIterator(array) {
    var it = {}
    it[SYMBOL_ITERATOR] = {
        next: function() {
            if (array.length > 0) {
                var first = array.shift()
                return {
                    value: first,
                    done: false
                }
            } else {
                return {
                    done: true
                }
            }
        }
    }
    return it
}

module.exports = createIterator
