'use strict';

module.exports = PropertyHook;

function PropertyHook(value) {
    if (!(this instanceof PropertyHook)) {
        return new PropertyHook(value);
    }

    this.value = value;
}

PropertyHook.prototype.hook = function (node, prop, prev) {
    if (prev && prev.type === 'PropertyHook' &&
        prev.value === this.value) {
        return;
    }

    node[prop] = this.value;
};

PropertyHook.prototype.unhook = function (node, prop, next) {
    if (next && next.type === 'PropertyHook') {
        return;
    }

    delete node[prop];
};

PropertyHook.prototype.type = 'PropertyHook';
