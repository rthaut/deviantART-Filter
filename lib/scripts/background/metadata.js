import DeviantArtAPI from '../../helpers/DeviantArtAPI.class.js';
import BrowserTabs from './browser-tabs';

const Metadata = (() => {

    const REGEX = /^https ?:\/\/(?:(\S+)\.)?deviantart\.com\/([^\?]*)(?:\?(.*))?/i;
    const DEFAULTS = {
        'limit': 24,
        'offset': 0
    };

    const _getRequestDataFromURL = function (url) {
        const result = REGEX.exec(url);
        if (result === null) {
            throw new Error('Tab URL did not match pattern');
        }

        let subdomain = '';
        let path = '';
        const query = {};

        if (result.length > 1 && result[1] !== undefined) {
            subdomain = result[1];
        }

        if (result.length > 2 && result[2] !== undefined) {
            path = result[2].replace(/\/+$/, '').split('/');
        }

        if (result.length > 3 && result[3] !== undefined) {
            result[3].split('&').forEach((param) => {
                param = param.split('=');
                query[param[0]] = decodeURIComponent(param[1]);
            });
        }

        if (subdomain !== null && subdomain !== 'www') {
            //@TODO this may not actually need to be an error,
            //      but it prevents attempting to load metadata when viewing a specific deviation or a user's profile page
            throw new Error('Unable to load metadata for subdomains');
        }

        let resource;
        const data = Object.assign({}, DEFAULTS, query);

        if (path !== null && path.length > 0) {
            if (path[0] === 'morelikethis') {
                // More Like This (for a specific deviation)
                // unfortunately the URL doesn't provide a UUID, but the API requires a UUID as the "seed"
                // until there's a way to take a numeric deviation ID and get the UUID, this isn't supported
                throw new Error('"More Like This" is not supported');
            }

            // the "sort" indicator is the last part of the path (except for "More Like This"...)
            const sort = path.slice(-1);

            // the category path (when used) is everything before the "sort" indicator
            if (path.length > 1) {
                data.category_path = path.slice(0, -1).join('/');
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
        }

        if (resource === null || resource === '') {
            throw new Error('Unable to determine DeviantArt API resource equivalent for URL');
        }

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
            console.log('TagsFilter.loadFilterData()', tab);

            let request = {
                'resource': null,
                'data': null
            };

            try {
                request = Object.assign({}, request, _getRequestDataFromURL(tab.url));
            } catch (error) {
                console.error(error);
                return;
            }

            let _deviations;
            const _metadata = [];

            return DeviantArtAPI.GET(request.resource, request.data).then((response) => {
                if (!response.results || !response.results.length) {
                    throw new Error('No results');
                }

                _deviations = response.results.slice();

                const deviationIDs = response.results.map(result => result.deviationid);
                return DeviantArtAPI.GET('/deviation/metadata', {
                    'deviationids': deviationIDs
                });
            }).then((response) => {
                if (!response.metadata || !response.metadata.length) {
                    throw new Error('No metadata');
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
    }

    return new Metadata();

})();

export default Metadata;
