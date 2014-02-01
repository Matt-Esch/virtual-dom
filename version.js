var pj = require("./package.json")
var semver = require("semver")

module.exports = semver.clean(pj.version)
