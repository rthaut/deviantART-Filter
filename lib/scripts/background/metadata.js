import BrowserTabs from './browser-tabs';

import DeviantArtAPI from '../../helpers/DeviantArtAPI.class.js';

import { URL } from '../../helpers/constants.js';


const Metadata = (() => {

    const DEFAULTS = {
        'limit': 24,    //TODO: once the pagination loop is implemented, bump this up
        'offset': 0
    };

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
        const data = Object.assign({}, DEFAULTS, query);

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

    class Metadata {

        /**
         * Injects additional metadata for deviations as data-* attributes on thumbnails
         * @param {tab} tab
         */
        insertMetadata(tab) {
            console.log('Metadata.insertMetadata()', tab);

            let request = {
                'resource': null,
                'data': null
            };

            try {
                request = Object.assign({}, request, _getRequestDataFromURL(tab.url));
            } catch (error) {
                console.error('Metadata.insertMetadata() :: Error', error);
                return;
            }

            let _deviations;
            const _metadata = [];

            return DeviantArtAPI.GET(request.resource, request.data).then((response) => {
                console.log('Metadata.insertMetadata() :: Deviations ', response);
                if (!response.results || !response.results.length) {
                    throw new Error('No deviations returned');   //TODO: i18n? for now this is only internal...
                }

                //TODO: use the "has_more" flag from the response to paginate the request (with the "next_offset")
                //      to get deviations until the desired limit is actually met, as the API doesn't actually
                //      return the amount of results requested with the "limit" parameter

                _deviations = response.results.slice();

                const deviationIDs = response.results.map(result => result.deviationid);
                return DeviantArtAPI.GET('/deviation/metadata', {
                    'deviationids': deviationIDs
                });
            }).then((response) => {
                console.log('Metadata.insertMetadata() :: Metadata ', response);
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
        }

        getCategoryHierarchy(data) {
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
    }

    return new Metadata();

})();

export default Metadata;
