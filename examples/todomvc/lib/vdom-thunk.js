module.exports = partial

function partial(fn, data, customCompare) {
    return {
        thunk: fn, // function that evaluates to vdom tree
        type: fn, // type property for type comparison of thunks
        arg: data, // the argument to evaluate the thunk with
        // comparison function, allows you to skip evaluation
        // if the `type` of the curr & next thunk are the same
        // and if `next.compare(curr.arg, next.arg)` === true
        compare: customCompare || function (left, right) {
            return left === right
        }
    }
}
