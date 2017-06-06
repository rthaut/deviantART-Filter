/**
 * Capitalizes the first letter of a string
 */
String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

/**
 * Creates a new HTML Style Sheet with optional CSS content
 * @param {String} [css]
 */
function addStyleSheet(css) {
    var style = document.createElement('style');
    if (css !== undefined && css !== null) {
        style.appendChild(document.createTextNode(css));
    }
    document.head.appendChild(style);
    return style.sheet;
}

/**
 * Deletes all rules from the supplied HTML Style Sheet
 * @param {StyleSheet} sheet
 */
function resetStyleSheet(sheet) {
    if (sheet && sheet.cssRules) {
        while (sheet.cssRules.length > 0) {
            sheet.deleteRule(0);
        }
    }
}

/**
 * Basic alert replacement modal using HTML5 dialog element and polyfill
 * @param {String} content
 * @param {String} [title]
 */
function alertModal(content, title) {
    var dialog = document.createElement('dialog');
    dialog.className = 'daDialog';

    if (title !== undefined && title !== null) {
        var header = document.createElement('header');
        var heading = document.createElement('h3');
        heading.innerText = title;
        header.appendChild(heading);
        dialog.appendChild(header);
    }

    var text = document.createElement('p');
    text.innerText = content;
    dialog.appendChild(text);

    var footer = document.createElement('footer');

    var close = document.createElement('button');
    close.className = 'smbutton smbutton-lightgreen smbutton-size-large smbutton-shadow';
    close.innerText = 'OK';
    close.addEventListener('click', function (event) {
        dialog.close();
        dialog.parentNode.removeChild(dialog);
    });
    footer.appendChild(close);
    dialog.appendChild(footer);

    document.body.appendChild(dialog);

    if (typeof dialogPolyfill !== 'undefined') {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.showModal();

    return dialog;
}

/**
 * Stores data in local storage
 * @param {String} key
 * @param {*} [def]
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
 * @param {*} [def]
 */
function setStoredJSON(key, value) {
    setStoredValue(key, JSON.stringify(value));
}

/**
 * Retrieves data from local storage
 * @param {String} key
 * @param {*} [def]
 * @return {String}
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
 * @return {*}
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
