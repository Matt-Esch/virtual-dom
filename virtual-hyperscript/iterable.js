var window = require('global/window');

var ES2015_SYMBOL_ITERATOR = window.Symbol && window.Symbol.iterator;
var LEGACY_SYMBOL_ITERATOR = '@@iterator';
var SYMBOL_ITERATOR = ES2015_SYMBOL_ITERATOR || LEGACY_SYMBOL_ITERATOR;

function getIterator(x) {
    return x && x[SYMBOL_ITERATOR];
}

function isIterable(x) {
    return !! getIterator(x);
}

module.exports = {
    SYMBOL_ITERATOR: SYMBOL_ITERATOR,
    getIterator: getIterator,
    isIterable: isIterable
}
