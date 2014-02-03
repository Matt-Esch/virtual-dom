var http = require("http")
var console = require("console")
var ServeBrowserify = require("serve-browserify")

http.createServer(function (req, res) {
    if (req.url === "/browser") {
        ServeBrowserify({ root: __dirname })(req, res)
    } else {
        res.end("<script src=\"/browser.js\"></script>")
    }
}).listen(8000, function () {
    console.log("listening on port 8000")
})
