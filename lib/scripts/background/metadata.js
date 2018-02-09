import BrowserTabs from './browser-tabs';

import DeviantArtAPI from '../../helpers/DeviantArtAPI.class';

import { URL } from '../../helpers/constants';


const Metadata = (() => {

    const REQUEST_DEFAULTS = {
        'limit': 48,    //TODO: the API limits differ per resource... this is the lowest of the used APIs
        'offset': 0
    };

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
            //      but it prevents attempting to load metadata
            //      when viewing a specific deviation or a user's profile page
            throw new Error('Unable to load metadata for subdomains');   //TODO: i18n? for now this is only internal...
        }

        let resource;
        const data = Object.assign({}, REQUEST_DEFAULTS, query);

        if (data.limit !== undefined) {
            data.limit = parseInt(data.limit, 10);
        }

        if (data.offset !== undefined) {
            data.offset = parseInt(data.offset, 10);
        }

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
         * @param {string} url
         */
        'getMetadataForURL': function (url) {
            console.log('Metadata.getMetadataForURL()', url);

            let request = {
                'resource': null,
                'data': null
            };

            try {
                request = Object.assign({}, request, _getRequestDataFromURL(url));
            } catch (error) {
                console.error('Metadata.getMetadataForURL() :: Error', error);
                return; // return Promise.reject(error);
                // this doesn't currently reject/return the error,
                // as we don't want to inadvertently send it back to the Content Script
            }

            return this.getMetadata(request.resource, request.data);
        },

        /**
         * Retrieves metadata for the deviations on the tab's page
         * @param {tab} tab
         */
        'sendMetadataToTab': function (tab) {
            console.log('Metadata.getMetadataForTab()', tab);

            return this.getMetadataForURL(tab.url).then((metadata) => {
                return BrowserTabs.sendMessageToTab(tab, {
                    'action': 'set-metadata',
                    'data': {
                        'metadata': metadata
                    }
                });
            });
        },

        'getMetadata': async function (resource, data) {
            console.log('Metadata.getMetadata()', resource, data);

            let _deviations = [];
            const _metadata = [];

            //TODO: this while thing should potentially loop a couple of times...
            //      the Metadata API is limited to 50 deviations (so we get the IDs for up to 48, then get the metadata)
            //      but often there are more than just 50 thumbnails loaded on the Browse Results page at a time

            //      alternatively, maybe have the Content Script actively request metadata for thumbs
            //      (i.e. when they are inserted into the DOM using a MutationObserver)
            //      and include how many thumbs are currently loaded when sending the message to the Background Script,
            //      then loop here until we have metadata for at least that many deviations before sending it back

            //TODO: another good enhancement would be to use localStorage in the Content Script to save the metadata
            //      and use it whenever thumbs are injected into the page (or when the page first loads) to potentially
            //      save some API hits (but that would really only make a difference when ALL of the loaded thumbs
            //      had stored metadata, which may not be that often, given how frequently Deviations are submitted)

            let response;
            do {
                response = await DeviantArtAPI.GET(resource, data);
                _deviations = _deviations.concat(response.results.slice());
                data.offset = response.next_offset;
            } while (response && response.has_more && _deviations.length < REQUEST_DEFAULTS.limit);

            return DeviantArtAPI.GET('/deviation/metadata', {
                'deviationids': _deviations.map(deviation => deviation.deviationid)
            }).then((response) => {
                console.log('Metadata.getMetadataForTab() :: Metadata', response);
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
