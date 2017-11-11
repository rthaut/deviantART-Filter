import BrowserTabs from './browser-tabs';

import DeviantArtAPI from '../../helpers/DeviantArtAPI.class';

import { URL } from '../../helpers/constants';


const Metadata = (() => {

    const REQUEST_DEFAULTS = {
        'limit': 48,
        'offset': 0
    };

    const RESPONSE_COUNT = 24;

    /**
     * Determines which API resource to use (and optional request paramters) based on the supplied URL
     * @param {string} url - a DeviantArt website URL
     * @returns {object} - the API resource and request parameters
     */
    const _getRequestDataFromURL = function (url) {
        console.log('Metadata._getRequestDataFromURL()', url);

        const result = URL.REGEX.exec(url);
        if (result === null) {
            throw new Error('Tab URL did not match pattern');   //TODO: i18n? for now this is only internal...
        }

        let subdomain = '';
        let path = '';
        const query = {};

        if (result.length > 1 && result[1] !== undefined) {
            subdomain = result[1];
            console.log('Metadata._getRequestDataFromURL() :: Subdomain', subdomain);
        }

        if (result.length > 2 && result[2] !== undefined) {
            path = result[2].replace(/\/+$/, '').split('/').filter((value) => value.length);
            console.log('Metadata._getRequestDataFromURL() :: Path', path);
        }

        if (result.length > 3 && result[3] !== undefined) {
            result[3].split('&').forEach((param) => {
                param = param.split('=');
                query[param[0]] = decodeURIComponent(param[1]);
            });
            console.log('Metadata._getRequestDataFromURL() :: Query', query);
        }

        if (subdomain !== null && subdomain !== 'www') {
            //TODO: this may not actually need to be an error,
            //      but it prevents attempting to load metadata when viewing a specific deviation or a user's profile page
            throw new Error('Unable to load metadata for subdomains');   //TODO: i18n? for now this is only internal...
        }

        let resource;
        const data = Object.assign({}, REQUEST_DEFAULTS, query);

        if (path !== null && path.length > 0) {
            if (path[0] === 'morelikethis') {
                // More Like This (for a specific deviation)
                // unfortunately the URL doesn't provide a UUID, but the API requires a UUID as the "seed"
                // until there's a way to take a numeric deviation ID and get the UUID, this isn't supported
                throw new Error('"More Like This" is not supported');   //TODO: i18n? for now this is only internal...
            }

            // the "sort" indicator is the last part of the path (except for "More Like This"...)
            const sort = path.slice(-1)[0];
            console.log('Metadata._getRequestDataFromURL() :: Sort Method', sort);

            // the category path (when used) is everything before the "sort" indicator
            if (path.length > 1) {
                data.category_path = path.slice(0, -1).join('/');
                console.log('Metadata._getRequestDataFromURL() :: Category', data.category_path);
            }

            if (/popular-(\w+)-(\w+)/i.test(sort)) {
                // Popular (with a time range)
                resource = '/browse/popular';

                // extract the time range from the friendly URL
                const pathParts = /popular-(\w+)-(\w+)/i.exec(sort);

                if (pathParts !== null) {
                    if (pathParts[2].toLowerCase() === 'hours') {
                        pathParts[2] = 'hr';
                    }
                    data.timerange = pathParts[1].toLowerCase() + pathParts[2].toLowerCase();
                }
            } else if (/whats-hot/i.test(sort)) {
                // What's Hot
                resource = '/browse/hot';
            } else {
                // everything else (Newest, Undiscovered, etc.)
                resource = '/browse/' + sort.replace('-', '');
            }
        } else {
            console.log('Path information unavailable; assuming "What\'s Hot"');
            resource = '/browse/hot';
        }

        if (resource === null || resource === '') {
            throw new Error('Unable to determine DeviantArt API resource equivalent for URL');   //TODO: i18n? for now this is only internal...
        }

        console.log('Metadata._getRequestDataFromURL() :: Resource', resource);
        console.log('Metadata._getRequestDataFromURL() :: Data', data);

        return {
            'resource': resource,
            'data': data
        };
    };

    const Metadata = {

        /**
         * Retrieves metadata for the deviations on the tab's page
         * @param {tab} tab
         */
        'getMetadataForTab': function (tab) {
            console.log('Metadata.getMetadataForTab()', tab);

            let request = {
                'resource': null,
                'data': null
            };

            try {
                request = Object.assign({}, request, _getRequestDataFromURL(tab.url));
            } catch (error) {
                console.error('Metadata.getMetadataForTab() :: Error', error);
                return;
            }

            let _deviations = [];
            const _metadata = [];

            //TODO: until async/await (ES8/ES2017) has better adoption, we have to make an assumption about the amount
            //      of results returned (since we aren't actually waiting for the response before continuing the loop)
            const promises = [];
            while (promises.length < Math.ceil(REQUEST_DEFAULTS.limit / RESPONSE_COUNT)) {
                promises.push(DeviantArtAPI.GET(request.resource, request.data));
            }

            //TODO: ES8 / ES2017 version - this would also require the first .then() block to be removed...
            /*
            while (_deviations.length < DEFAULTS.limit) {
                const response = await DeviantArtAPI.GET(request.resource, request.data);
                _deviations = _deviations.concat(response.results.slice());
            }

            return DeviantArtAPI.GET('/deviation/metadata', {
                'deviationids': _deviations.map(deviation => deviation.deviationid)
            }).then() ...;
            */
            return Promise.all(promises).then((responses) => {
                console.log('Metadata.getMetadataForTab() :: Responses ', responses);

                for (const response of responses) {
                    console.log('Metadata.getMetadataForTab() :: Deviations ', response);
                    if (!response.results || !response.results.length) {
                        throw new Error('No deviations returned');   //TODO: i18n? for now this is only internal...
                    }

                    _deviations = _deviations.concat(response.results.slice());
                }

                return DeviantArtAPI.GET('/deviation/metadata', {
                    'deviationids': _deviations.map(deviation => deviation.deviationid)
                });
            }).then((response) => {
                console.log('Metadata.getMetadataForTab() :: Metadata ', response);
                if (!response.metadata || !response.metadata.length) {
                    throw new Error('No metadata returned for deviations');   //TODO: i18n? for now this is only internal...
                }

                response.metadata.forEach((metadata) => {
                    const deviation = _deviations.find((deviation) => deviation.deviationid === metadata.deviationid);
                    if (deviation !== undefined && deviation !== null) {
                        _metadata.push({
                            'id': deviation.deviationid,
                            'url': deviation.url,
                            'category': deviation.category,
                            'category_path': deviation.category_path,
                            'tags': metadata.tags.map(tag => tag.tag_name)
                        });
                    }
                });

                return _metadata;
            }).then((metadata) => {
                return BrowserTabs.sendMessageToTab(tab, {
                    'action': 'set-metadata',
                    'data': {
                        'metadata': metadata
                    }
                });
            });
        },

        /**
         * Returns the Category Hierarchy (one level) for the specified category path
         * @param {FormData} data - GET parameters for the API request
         */
        'getCategoryHierarchy': function (data) {
            console.log('Metadata.getCategoryHierarchy()', data);

            return DeviantArtAPI.GET('/browse/categorytree', data).then((response) => {
                console.log('Metadata.getCategoryHierarchy() :: Response', response);

                if (!response.categories || !response.categories.length) {
                    throw new Error('No categories returned for category path');   //TODO: i18n? for now this is only internal...
                }

                return {
                    'data': response
                };
            });
        }

    };

    return Metadata;

})();

export default Metadata;
