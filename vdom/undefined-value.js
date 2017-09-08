//Magic value to map keys with a value of undefined to in JSON form since JSON
//won't preserve those.  This is necessary because in patches, the removal of
//a property is represented by the property name mapped to undefined
var UNDEFINED = '____UnDeFiNeD____';

function isUndefined(value) {
    return value === undefined || value === UNDEFINED;
}

module.exports = {
    isUndefined: isUndefined,
    undefinedConst: UNDEFINED
};
