const Utils = (() => {

    const Utils = {

        /**
         * Finds the object in an array of objects
         * @param {object} needle - The object for which to search
         * @param {object[]} haystack - The array of objects through which to search
         * @param {string[]} [properties] - An array of properties to search against (uses all properties from `needle` by default)
         * @returns {number} - The index of the object in the array
         */
        FindObjectInArray: function (needle, haystack, properties) {

            if (properties === 'undefined' || properties === null) {
                properties = Object.keys(needle);
            }

            let match, property;

            for (let i = 0; i < haystack.length; i++) {
                match = true;

                // loop through all properties and track if all of them matched or not
                for (let j = 0; j < properties.length; j++) {
                    property = properties[j];
                    if (typeof haystack[i][property] !== 'undefined' && haystack[i][property] !== null) {
                        match &= (haystack[i][property] === needle[property]);
                    }
                }

                // if every property matched, then consider the item found
                if (match) {
                    return i;
                }
            }

            return -1;
        }

    }

    return Utils;

})();

export default Utils;
