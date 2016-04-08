var VText = require('../vnode/vtext.js');

module.exports = parseStyles;

function parseStyles(properties){
	
	var props = properties || []

	var content = JSON.stringify(props)
	content = content
		.substring(1,content.length -1)
		.replace(/\'|\"/g,'')
		.replace(/\:\{/g,'{')
		.replace(/\}\,/g,'}')

	return [new VText(content)];
}