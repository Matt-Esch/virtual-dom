// Perform dom manipulation through Polymer.dom if available

var Dom;

if(Polymer && typeof Polymer.dom === 'function') {
    // Bind to Polymer.dom
    Dom = Polymer.dom.bind(Polymer);
} else {
    // Identity function
    Dom = function(x) {return x;};
}

module.exports = Dom;
