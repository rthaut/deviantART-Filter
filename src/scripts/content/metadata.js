import MetadataCache from './metadata-cache';
import { DEVIATION_SLUG_REGEX as SLUG_REGEX } from '../../helpers/constants';

const Metadata = (() => {

    const Metadata = {

        'useCache': false,

        /**
         *
         */
        'init': async function () {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            const { metadataCacheTTL } = await browser.storage.sync.get('metadataCacheTTL');
            this.useCache = parseInt(metadataCacheTTL, 10) > 0;

            this.handleThumbs(document.querySelectorAll('span.thumb'));

            if (this.useCache) {
                MetadataCache.trim(metadataCacheTTL);
            } else {
                MetadataCache.clear();
            }

            const { metadataDebug } = await browser.storage.sync.get('metadataDebug');
            console.log('[Content] Metadata.init() :: Debug Enabled', metadataDebug);
            document.querySelector('body').classList.toggle('debug-metadata', metadataDebug);
        },

        /**
         * Event listener for browser runtime messages
         * @param {object} message The message
         * @param {runtime.MessageSender} sender The sender of the message
         */
        'onMessage': function (message, sender) {
            console.log('[Content] Metadata.onMessage()', message, sender);

            if (message.action !== undefined) {
                switch (message.action) {
                    case 'set-metadata':
                        if (this.useCache) {
                            MetadataCache.save(message.data.metadata);
                        }
                        this.setMetadataOnThumbnails(message.data.metadata, false);
                        break;

                    case 'metadata-cache-ttl-changed':
                        this.useCache = parseInt(message.data.metadataCacheTTL, 10) > 0;
                        if (this.useCache) {
                            MetadataCache.trim(message.data.metadataCacheTTL);
                        } else {
                            MetadataCache.clear();
                        }
                        break;

                    case 'toggle-metadata-debug':
                        document.querySelector('body').classList.toggle('debug-metadata', message.data.metadataDebug);
                        break;
                }
            }

            return true;
        },

        /**
         * Sets metadata as data- attributes on the corresponding thumbnails
         * @param {Object[]} metadata The array of metadata objects to process
         * @param {boolean} [requestMissingMetadata=false] Request missing metadata after processing
         */
        'setMetadataOnThumbnails': function (metadata, requestMissingMetadata = false) {
            console.log('[Content] Metadata.setMetadataOnDeviations()', metadata, requestMissingMetadata);

            metadata.forEach((meta) => {
                const href = (meta.slug !== undefined && meta.slug !== null) ? meta.slug : meta.url;
                const links = document.querySelectorAll(`a[href*="${href}"]`);

                links.forEach((link) => {
                    if (link !== undefined && link !== null) {
                        const thumb = link.closest('span.thumb');
                        const target = (thumb !== undefined && thumb !== null) ? thumb : link;

                        if (meta.uuid) {
                            target.setAttribute('data-deviation-uuid', meta.uuid);
                        }

                        if (meta.category_name) {
                            target.setAttribute('data-category', meta.category_name);
                        }

                        if (meta.category_path) {
                            target.setAttribute('data-category-path', meta.category_path);
                        }

                        if (meta.tags && meta.tags.length) {
                            target.setAttribute('data-tags', meta.tags.join(' '));
                        }
                    }
                });
            });

            const thumbs = document.querySelectorAll('span.thumb:not([data-deviation-uuid])');
            if (thumbs.length) {
                console.info(`[Content] Metadata.setMetadataOnDeviations() :: There are ${thumbs.length} thumbnails missing metadata (of ${document.querySelectorAll('span.thumb').length} total thumbnails) after inserting metadata`);
                if (requestMissingMetadata) {
                    this.requestMetadataForURL();
                }
            }

            return;
        },

        /**
         * Requests metadata for the specified URL.
         * If no URL is supplied, it will be determined automatically from the current page's URL and DOM content.
         * @param {string} [url]
         */
        'requestMetadataForURL': function (url) {
            console.log('[Content] Metadata.requestMetadataForURL()', url);

            if (url === undefined || url === null) {
                const active = document.querySelector('#browse-sidemenu div.browse-facet-order ul li a.selected');
                const sort = active.textContent.replace(/\s/g, '-').replace(/[\']/g, '').toLowerCase();
                let pathname = window.location.pathname;
                console.log('[Content] Metadata.requestMetadataForURL() :: Pathname', pathname);
                if (pathname === undefined || pathname === null || pathname === '' || pathname === '/') {
                    console.log(`[Content] Metadata.requestMetadataForURL() :: Using "${sort}" as Location Pathname`);
                    pathname += sort;
                }
                url = `${window.location.protocol}//${window.location.hostname}${pathname}${window.location.search}`;
            }

            console.log('[Content] Metadata.requestMetadataForURL() :: Requesting Metadata for URL', url);

            return browser.runtime.sendMessage({
                'action': 'send-metadata-to-tab',
                'data': {
                    'url': url
                }
            });
        },

        /**
         * Handles metadata retrieval and/or insertion for the supplied thumbnails
         * @param {NodeList} thumbs
         */
        'handleThumbs': async function (thumbs) {
            console.log('[Content] Metadata.handleThumbs()', thumbs);

            if (!thumbs.length) {
                return;
            }

            // try to load metadata from the IndexedDB first
            if (this.useCache) {
                // try to load metadata from the IndexedDB first, then fallback to passively requesting via the API
                const slugs = [];
                thumbs.forEach((thumb) => {
                    const link = thumb.querySelector('a');
                    if (link !== undefined && link !== null) {
                        slugs.push(SLUG_REGEX.exec(link.getAttribute('href'))[1]);
                    }
                });

                const metadata = await MetadataCache.get(slugs);
                if (metadata.length) {
                    this.setMetadataOnThumbnails(metadata, true);
                    return;
                }
            }

            // if the cache is disabled, or if there was no cached metadata for the thumbs, use the API
            this.requestMetadataForURL();
        }
    };

    return Metadata;

})();

export default Metadata;
