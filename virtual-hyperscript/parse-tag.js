'use strict';

module.exports = parseTag;

function parseTag(tag, props) {
    if (!tag) {
        return 'DIV';
    }

    var noId = !(props.hasOwnProperty('id'));

    var tagParts = splitTag(tag);

    var tagName = tagParts[0] || 'DIV';

    var classes, part, type, i;

    for (i = 1; i < tagParts.length; i++) {
        part = tagParts[i];

        if (!part) {
            continue;
        }

        type = part.charAt(0);

        if (type === '.') {
            classes = classes || [];
            classes.push(part.substring(1, part.length));
        } else if (type === '#' && noId) {
            props.id = part.substring(1, part.length);
        }
    }

    if (classes) {
        if (props.className) {
            classes.push(props.className);
        }

        props.className = classes.join(' ');
    }

    return props.namespace ? tagName : tagName.toUpperCase();
}


function splitTag(tag) {

    var classIndex, idIndex,
        remaining = tag,
        parts = [],
        last = '';

    do {
        idIndex = remaining.indexOf('#');
        classIndex = remaining.indexOf('.');
        if ((idIndex === -1 || idIndex > classIndex) && classIndex !== -1) {
            parts.push(last + remaining.substr(0, classIndex));
            last = '.';
            remaining = remaining.substr(classIndex + 1);
        } else if (idIndex !== -1){
            parts.push(last + remaining.substr(0, idIndex));
            last = '#';
            remaining = remaining.substr(idIndex + 1);
        }

    } while(idIndex !== -1 || classIndex !== -1)

    parts.push(last + remaining);

    return parts;
}
