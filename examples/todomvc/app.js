var h = require("virtual-dom/h")
var partial = require("./lib/vdom-thunk.js")

var footer = infoFooter()

module.exports = App

/* state is a plain JS object */
function App(state) {
    return h(".todomvc-wrapper", [
        h("section.todoapp", [
            partial(header, state.todoField, state.evs.todos),
            partial(mainSection, state.todos, state.route, state.evs),
            partial(statsSection, state.todos, state.route)
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

function mainSection(todos, route, evs) {
    var allCompleted = todos.every(function (todo) {
        return todo.completed
    })
    var visibleTodos = todos.filter(function (todo) {
        return route === "completed" && todo.completed ||
            route === "active" && !todo.completed ||
            route === "all"
    })

    return h("section.main", { hidden: !todos.length }, [
        h("input#toggle-all.toggle-all", {
            type: "checkbox",
            checked: allCompleted,
            "data-change": event(evs.todos, "toggleAll")
        }),
        h("label", { htmlFor: "toggle-all" }, "Mark all as complete"),
        h("ul.todolist", visibleTodos.map(function (todo) {
            return partial(todoItem, todo, evs)
        }))
    ])
}

function todoItem(todo, evs) {
    var className = (todo.completed ? "completed " : "") +
        (todo.editing ? "editing" : "")

    return h("li", { className: className }, [
        h(".view", [
            h("input.toggle", {
                type: "checkbox",
                checked: todo.completed,
                "data-change": event(evs.todo, "toggle", todo.completed)
            }),
            h("label", {
                "data-dblclick": event(evs.todo, "editing")
            }, todo.title),
            h("button.destroy", {
                "data-click": event(evs.todo, "destroy", todo.id)
            })
        ]),
        h("input.edit", {
            value: todo.title,
            name: "title",
            // when we need an RPC invocation we add a 
            // custom mutable operation into the tree to be
            // invoked at patch time
            "data-focus": todo.editing ? doMutableFocus : null,
            "data-change": event(evs.todo, "textChange"),
            "data-submit": event(evs.todo, "edit"),
            "data-blur": event(evs.todo, "edit")
        })
    ])
}

var document = require("global/document")

function doMutableFocus(node, property) {
    if (document.activeElement !== node) {
        node.focus();
    }
}

function statsSection(todos, route) {
    var todosLeft = todos.filter(function (todo) {
        return !todo.completed
    }).length

    return h("footer.footer", { hidden: !todos.length }, [
        h("span.todo-count", [
            h("strong", todosLeft),
            todosLeft === 1 ? " item" : " items",
            " left"
        ]),
        h("ul.filters", [
            link("#/", "All", route === "all"),
            link("#/active", "Active", route === "active"),
            link("#/completed", "Completed", route === "completed")
        ])
    ])
}

function link(uri, text, isSelected) {
    return h("li", [
        h("a", { className: isSelected ? "selected" : "", href: uri }, text)
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
