var h = require("virtual-dom/h")
var partial = require("./lib/vdom-thunk.js")

var footer = infoFooter()

module.exports = App

function App(state) {
    return h("div.todomvc-wrapper", [
        h("section.todoapp", [
            partial(header, state, function comp(left, right) {
                return left.todoField === right.todoField
            })
        ]),
        footer
    ])
}

function header(state) {
    return h("header.header", {
        "data-submit": event(state.evs.todos, "add"),
        "data-change": event(state.evs.todos, "textChange")
    }, [
        h("h1", "Todos"),
        h("input.new-todo", {
            placeholder: "What needs to be done?",
            autofocus: true,
            value: state.todoField,
            name: "newTodo"
        })
    ])
}

function infoFooter() {
    return h("footer.info", [
        h("p", "Double-click to edit a todo"),
        h("p", [
            "Written by ",
            h("a", { href: "https://github.com/Raynos" }, "Raynos")
        ]),
        h("p", [
            "Part of ",
            h("a", { href: "http://todomvc.com" }, "TodoMVC")
        ])
    ])
}

// belongs in dom-delegator
function event() {

}
