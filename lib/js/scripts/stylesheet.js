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
