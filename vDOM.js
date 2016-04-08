var diff = require("./diff.js")
var patch = require("./patch.js")
var h = require("./h.js")
var create = require("./create-element.js")

function vDOM(){
    
  var tree = h('#root','');
  var rootNode = create(tree);
  document.body.appendChild(rootNode);

  function update(newTree){
    var patches = diff(tree, newTree);
    rootNode = patch(rootNode, patches);
    tree = newTree;
  }
  
  return{
      
    render: function(tree){
      update(tree);
    }
     
  };
    
}
