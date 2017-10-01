const Utils = (() => {

    const Utils = {

        /**
         * Finds the object in an array of objects
         * @param {object} needle - The object for which to search
         * @param {object[]} haystack - The array of objects through which to search
         * @param {string[]} [properties] - An array of properties to search against (uses all properties from `needle` by default)
         * @returns {number} - The index of the object in the array
         */
        'FindObjectInArray': function (needle, haystack, properties) {

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
        },

        /**
         * Uses the Fetch API to make a network request and return the response as parsed JSON
         * @param {string} method - the HTTP method
         * @param {USVString|Request} input - the resource to fetch
         * @param {Blob|BufferSource|FormData|URLSearchParams|USVString} [data] - the data to send
         * @returns {Promise<object>}
         */
        'FetchJSON': function (method, input, data = null) {

            const init = {
                'method': method.toUpperCase()
            };

            //@TODO set Accept header to application/json

            if (data !== null) {
                console.log('data:', data);
                if (init.method === 'GET') {
                    // convert the data to a query string
                    let queryString;

                    //@TODO handle the other data types
                    //@TODO there must be a simpler way to handle this...
                    if (typeof data === FormData) {
                        queryString = data.keys.map((key) => {
                            if (Array.isArray(data.get(key))) {
                                return data.get(key).map((value) => {
                                    return encodeURIComponent(key) + '[]=' + encodeURIComponent(value);
                                }).join('&');
                            } else {
                                return encodeURIComponent(key) + '=' + encodeURIComponent(data.get(key));
                            }
                        }).join('&');
                    } else if (typeof data === 'object') {
                        queryString = Object.keys(data).map((key) => {
                            if (Array.isArray(data[key])) {
                                return data[key].map((value) => {
                                    return encodeURIComponent(key) + '[]=' + encodeURIComponent(value);
                                }).join('&');
                            } else {
                                return encodeURIComponent(key) + '=' + encodeURIComponent(data[key]);
                            }
                        }).join('&');
                    }

                    if (typeof input === Request) {
                        input.url += (input.url.indexOf('?') === -1) ? '?' : '&';
                        input.url += queryString;
                    } else {
                        input += (input.indexOf('?') === -1) ? '?' : '&';
                        input += queryString;
                    }
                } else {
                    init.body = data;
                }
            }

            return fetch(input, init).then((response) => {
                if (response.ok) {
                    var contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('application/json')) {
                        return response.json();
                    } else {
                        throw new Error('Network response was content type was not JSON');
                    }
                } else {
                    throw new Error('Network response was not OK');
                }
            });
        }

    };

    return Utils;

})();

export default Utils;
