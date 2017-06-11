/**
 * Capitalizes the first letter of a string
 */
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Converts a string value to the specified type
 * @param {String} type
 */
String.prototype.cast = function (type) {
    switch (type.toLowerCase()) {
        case 'boolean': return this.toLowerCase() == "true";
        case 'float': return parseFloat(this);
        case 'integer': return parseInt(this, 10);
    }
}
