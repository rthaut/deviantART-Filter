/**
 * Stores data in local storage
 * @param {String} key
 * @param {*} value
 */
function setStoredValue(key, value) {
    if (typeof GM_setValue === 'function') {
        GM_setValue(key, value);
    }

    localStorage.setItem(key, value);
}

/**
 * Stores data as JSON in local storage
 * @param {String} key
 * @param {*} value
 */
function setStoredJSON(key, value) {
    setStoredValue(key, JSON.stringify(value));
}

/**
 * Retrieves data from local storage
 * @param {String} key
 * @param {*} [def]
 * @returns {String}
 */
function getStoredValue(key, def) {
    if (typeof GM_getValue === 'function') {
        return GM_getValue(key, def);
    }

    var value = localStorage.getItem(key);
    if (value !== undefined && value !== null) {
        return value;
    }

    if (typeof def !== 'undefined') {
        return def;
    }

    return undefined;
}

/**
 * Retrieves and parses JSON data from local storage
 * @param {String} key
 * @param {*} [def]
 * @returns {*}
 */
function getStoredJSON(key, def) {
    var value = getStoredValue(key, def);
    if (value !== undefined && value !== null) {
        if (typeof value === 'string' && value !== '') {
            value = JSON.parse(value);
        }
        return value;
    }

    if (typeof def !== 'undefined') {
        return def;
    }

    return undefined;
}
