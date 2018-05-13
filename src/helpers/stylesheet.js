const StyleSheet = (() => {

    const StyleSheet = {

        'Create': function (css = '') {
            var style = document.createElement('style');
            style.appendChild(document.createTextNode(css));
            document.head.appendChild(style);
            return style.sheet;
        },

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
