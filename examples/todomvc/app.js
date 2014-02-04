var h = require("virtual-dom/h")
var partial = require("./lib/vdom-thunk.js")

var footer = infoFooter()

module.exports = App

function App(state) {
    return h("div.todomvc-wrapper", [
        h("section.todoapp", [
            partial(header, state.todoField, state.evs.todos),
            partial(mainSection, state),
            partial(statsSection, state)
        ]),
        footer
    ])
}

function header(todoField, evsTodos) {
    return h("header.header", {
        "data-submit": event(evsTodos, "add"),
        "data-change": event(evsTodos, "textChange")
    }, [
        h("h1", "Todos"),
        h("input.new-todo", {
            placeholder: "What needs to be done?",
            autofocus: true,
            value: todoField,
            name: "newTodo"
        })
    ])
}

function mainSection() {}

function statsSection(state) {
    var todosLeft = state.todos.filter(function (todo) {
        return !todo.completed
    }).length

    return h("footer.footer", {
        hidden: state.todos.length === 0
    }, [
        h("span.todo-count", [
            h("strong", todosLeft),
            todosLeft === 1 ? " item" : " items",
            " left"
        ]),
        h("ul.filters", [
            link("#/", "All", state.route === "all"),
            link("#/active", "Active", state.route === "active"),
            link("#/completed", "Completed", state.route === "completed")
        ])
    ])
}

function link(uri, text, isSelected) {
    return h("li", [
        h("a", {
            className: isSelected ? "selected" : "",
            href: uri
        }, text)
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
