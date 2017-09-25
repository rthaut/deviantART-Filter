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

            if (haystack.length < 1) {
                console.log('Haystack is empty');
                return -1;
            }

            if (properties === 'undefined' || properties === null) {
                console.log('No properties provided to search against');
                properties = Object.keys(needle);
            }

            if (properties.length < 1) {
                throw new Error('No object properties to search against');
            }

            let match, property;

            for (let i = 0; i < haystack.length; i++) {
                match = true;

                // loop through all properties and track if all of them matched or not
                for (let j = 0; j < properties.length; j++) {
                    property = properties[j];
                    if (typeof haystack[i][property] !== 'undefined' && haystack[i][property] !== null) {
                        console.log(`Comparing property "${property}" of needle ("${needle[property]}") against element ${i} ("${haystack[i][property]}") of haystack`);
                        match &= (needle[property] === haystack[i][property]);
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
