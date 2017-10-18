import Utils from './utils';

const DeviantArtAPI = (() => {

    const BASE_PATH = 'https://www.deviantart.com/api/v1/oauth2';

    const CLIENT_ID = '{{API.CLIENT_ID}}';
    const CLIENT_SECRET = '{{API.CLIENT_SECRET}}';

    let _token = null;

    /**
     * Makes an HTTP request to the DeviantArt API
     * @param {string} method - the HTTP method
     * @param {string} path - the resource path
     * @param {Blob|BufferSource|FormData|URLSearchParams|USVString} [data] - the optional paramaters
     */
    const _request = function (method, path, data) {
        console.log('DeviantArtAPI._request()', method, path, data);

        return _getToken().then((token) => {
            if (data === undefined || data === null) {
                data = new FormData();
            }

            //TODO: handle the other data types
            //TODO: there must be a simpler way to handle this...
            if ((typeof data === FormData) || typeof data === URLSearchParams) {
                if (!data.has('access_token')) {
                    data.append('access_token', token);
                }

                if (!data.has('mature_content')) {
                    data.appeend('mature_content', 'true');
                }
            } else if (typeof data === 'object') {
                const keys = Object.keys(data);
                if (keys.indexOf('access_token') === -1) {
                    data.access_token = token;
                }

                if (keys.indexOf('mature_content') === -1) {
                    data.mature_content = 'true';
                }
            }

            return Utils.FetchJSON(method.toUpperCase(), BASE_PATH + path, data);
        });
    };

    /**
     * Returns a valid token
     * @returns {string}
     */
    const _getToken = function () {
        console.log('DeviantArtAPI._getToken()');

        if (_token === null) {
            return _getNewClientAccessToken();
        }

        return _validateClientAccessToken(_token).then((valid) => {
            if (valid) {
                return _token;
            } else {
                return _getNewClientAccessToken().then((token) => {
                    _token = token;
                    return token;
                });
            }
        });
    };

    /**
     * Retrieves a new token
     * @returns {string}
     */
    const _getNewClientAccessToken = function () {
        console.log('DeviantArtAPI._getNewClientAccessToken()');

        const data = new FormData();
        data.append('grant_type', 'client_credentials');
        data.append('client_id', CLIENT_ID);
        data.append('client_secret', CLIENT_SECRET);

        return Utils.FetchJSON('POST', 'https://www.deviantart.com/oauth2/token', data).then((json) => {
            if (json.status === 'success') {
                return json.access_token;
            } else {
                throw new Error('Response did not indicate success');   //TODO: i18n? for now this is only internal...
            }
        }).catch((error) => {
            console.error(error);
            return null;
        });
    };

    /**
     * Determines if the supplied token is still valid
     * @param {string} token
     * @returns {boolean}
     */
    const _validateClientAccessToken = function (token) {
        console.log('DeviantArtAPI._validateClientAccessToken()', token);

        const data = new FormData();
        data.append('access_token', token);

        return Utils.FetchJSON('GET', BASE_PATH + '/placebo', data).then((json) => {
            return (json.status === 'success');
        }).catch((error) => {
            console.error(error);
            return false;
        });
    };

    class DeviantArtAPI {

        /**
         * Makes a GET request to the DeviantArt API
         * @param {string} path - the resource path
         * @param {FormData} [data] - the optional GET paramaters
         */
        GET(path, data) {
            console.log('DeviantArtAPI.GET()', path, data);
            return _request('GET', path, data);
        }

        /**
         * Makes a POST request to the DeviantArt API
         * @param {string} path - the resource path
         * @param {FormData} [data] - the optional POST paramaters
         */
        POST(path, data) {
            console.log('DeviantArtAPI.POST()', path, data);
            return _request('POST', path, data);
        }

    }

    return new DeviantArtAPI();

})();

export default DeviantArtAPI;
