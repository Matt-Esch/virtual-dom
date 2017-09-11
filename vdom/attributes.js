var booleanAttributes = [
    'checked',
    'disabled',
    'hidden',
    'ismap',
    'multiple',
    'noresize',
    'readonly',
    'selected',
];

function isBooleanAttribute(attr) {
    return booleanAttributes.indexOf(attr) >= 0;
}

/**
 * Get property value by corresponding attribute value
 * @param name
 * @param value
 * @returns {*} updated value
 */
function attributeToPropertyValue(name, value) {
    // sometimes boolean attributes have empty string value in DOM; but it doesn't work when setting corresponding prop,
    // so we always transform it to true (when it is false attribute is absent in DOM at all)
    if (isBooleanAttribute(name))
      value = true;

    return value;
}

module.exports = {
    isBooleanAttribute: isBooleanAttribute,
    attributeToPropertyValue: attributeToPropertyValue
};
