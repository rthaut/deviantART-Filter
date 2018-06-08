const StyleSheet = (() => {

    const StyleSheet = {

        /**
         * Creates a new stylesheet (with optional CSS rules)
         * @param {string} [css] CSS rules to insert into the stylesheet
         * @returns {StyleSheet} the inserted stylesheet
         */
        'Create': function (css = '') {
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
            return style.sheet;
        },

        /**
         * Deletes all CSS rules from the specified stylesheet
         * @param {StyleSheet} sheet the stylesheet to reset
         */
        'Reset': function (sheet) {
            if (sheet && sheet.cssRules) {
                while (sheet.cssRules.length > 0) {
                    sheet.deleteRule(0);
                }
            }
        }
    };

    return StyleSheet;

})();

export default StyleSheet;
