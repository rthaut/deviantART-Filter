import BrowserTabs from './browser-tabs';
import DeviantArtAPI from '../../helpers/DeviantArtAPI.class';
import { URL, DEVIATION_SLUG_REGEX as SLUG_REGEX } from '../../helpers/constants';
import Utils from '../../helpers/utils';


const Metadata = (() => {

    const METADATA_LIMIT = 96;

    const REQUEST_DEFAULTS = {
        'limit': 48,    //TODO: the API limits differ per resource... this is the lowest of the used APIs
        'offset': 0
    };

    /**
     * Determines which API resource to use (and optional request parameters) based on the supplied URL
     * @param {string} url a DeviantArt website URL
     * @returns {object} the API resource and request parameters
     */
    const _getRequestDataFromURL = function (url) {
        console.log('[Background] Metadata._getRequestDataFromURL()', url);

        const result = URL.REGEX.exec(url);
        if (result === null) {
            throw new Error('Tab URL did not match pattern');   //TODO: i18n? for now this is only internal...
        }

        let subdomain = '';
        let path = '';
        const query = {};

        if (result.length > 1 && result[1] !== undefined) {
            subdomain = result[1];
            console.log('[Background] Metadata._getRequestDataFromURL() :: Subdomain', subdomain);
        }

        if (result.length > 2 && result[2] !== undefined) {
            path = result[2].replace(/\/+$/, '').split('/').filter((value) => value.length);
            console.log('[Background] Metadata._getRequestDataFromURL() :: Path', path);
        }

        if (result.length > 3 && result[3] !== undefined) {
            result[3].split('&').forEach((param) => {
                param = param.split('=');
                query[param[0]] = decodeURIComponent(param[1]);
            });
            console.log('[Background] Metadata._getRequestDataFromURL() :: Query', query);
        }

        if (subdomain !== null && subdomain !== 'www') {
            //TODO: this may not actually need to be an error, but it prevents attempting to load metadata when viewing a specific deviation or a user's profile page
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
            console.log('[Background] Metadata._getRequestDataFromURL() :: Sort Method', sort);

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
            console.log('[Background] Path information unavailable; assuming "What\'s Hot"');
            resource = '/browse/hot';
        }

        if (resource === null || resource === '') {
            throw new Error('Unable to determine DeviantArt API resource equivalent for URL');   //TODO: i18n? for now this is only internal...
        }

        console.log('[Background] Metadata._getRequestDataFromURL() :: Resource', resource);
        console.log('[Background] Metadata._getRequestDataFromURL() :: Data', data);

        return {
            'resource': resource,
            'data': data
        };
    };

    const Metadata = {

        /**
         * Sends a message to the specified tab with metadata for the deviations displayed on that tab
         * @param {tab} tab the tab for which metadata should be retrieved
         * @param {string} [url] the URL for which metadata should be retrieved
         */
        'sendMetadataToTab': function (tab, url) {
            console.log('[Background] Metadata.getMetadataForTab()', tab, url);

            if (url === undefined || url === null) {
                url = tab.url;
            }

            //TODO: it would be better to send each chunk of metadata to the tab as soon as it is returned rather than waiting for all chunks to return and combining the results before sending, but that will require changes to sendMetadataToTab() and getMetadata(), which would then negatively impact getMetadataForURL() (because it should NOT send the metadata, but return all of it)... the solution is probably to have getMetadata() return the array of promises for each chunk, then have sendMetadataToTab() do the sending as each promise resolves, but have getMetadataForURL() wait for them all to resolve

            return this.getMetadataForURL(url).then((metadata) => {
                return BrowserTabs.sendMessageToTab(tab, {
                    'action': 'set-metadata',
                    'data': {
                        'metadata': metadata
                    }
                });
            });
        },

        /**
         * Retrieves metadata for deviations for a supplied URL
         * @param {string} url the URL for which metadata should be retrieved
         */
        'getMetadataForURL': function (url) {
            console.log('[Background] Metadata.getMetadataForURL()', url);

            let request = {
                'resource': null,
                'data': null
            };

            try {
                request = Object.assign({}, request, _getRequestDataFromURL(url));
            } catch (error) {
                console.error('[Background] Metadata.getMetadataForURL() :: Error', error);
                return; // return Promise.reject(error);
                // this doesn't currently reject/return the error,
                // as we don't want to inadvertently send it back to the Content Script
            }

            return this.getMetadata(request.resource, request.data);
        },

        /**
         * Retrieves metadata for deviations from an API resource
         * @param {string} resource the API resource path
         * @param {FormData} data GET parameters for the API request
         * @returns {object[]} the array of metadata objects with deviation IDs and URLs
         */
        'getMetadata': async function (resource, data) {
            console.log('[Background] Metadata.getMetadata()', resource, data);

            let _deviations = [];
            const _metadata = [];

            let response;
            do {
                response = await DeviantArtAPI.GET(resource, data);
                _deviations = _deviations.concat(response.results.slice());
                data.offset = response.next_offset;
            } while (response && response.has_more && _deviations.length < METADATA_LIMIT);

            console.log('[Background] Metadata.getMetadata() :: Deviations', _deviations);

            const metadataRequests = [];
            Utils.ChunkArray(_deviations, REQUEST_DEFAULTS.limit).forEach((deviations) => {
                metadataRequests.push(DeviantArtAPI.GET('/deviation/metadata', {
                    'deviationids': deviations.map(deviation => deviation.deviationid)
                }));
            });

            return Promise.all(metadataRequests).then((responses) => {
                responses.forEach((response) => {
                    response.metadata.forEach((metadata) => {
                        const deviation = _deviations.find((deviation) => deviation.deviationid === metadata.deviationid);
                        if (deviation !== undefined && deviation !== null) {
                            _metadata.push({
                                'uuid': deviation.deviationid,
                                'url': deviation.url,
                                'slug': SLUG_REGEX.exec(deviation.url)[1],
                                'category_name': deviation.category,
                                'category_path': deviation.category_path,
                                'tags': metadata.tags.map(tag => tag.tag_name)
                            });
                        }
                    });
                });
                console.log('[Background] Metadata.getMetadata() :: Metadata', _metadata);
                return _metadata;
            });
        },

        /**
         * Returns the Category Hierarchy (one level) for the specified category path
         * @param {FormData} data GET parameters for the API request
         * @returns {object} the Category Hierarchy data
         */
        'getCategoryHierarchy': function (data) {
            console.log('[Background] Metadata.getCategoryHierarchy()', data);

            return DeviantArtAPI.GET('/browse/categorytree', data).then((response) => {
                console.log('[Background] Metadata.getCategoryHierarchy() :: Response', response);

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
