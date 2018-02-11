const Metadata = (() => {

    const Metadata = {

        /**
         *
         */
        'init': function () {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            this.watchForNewThumbs();
        },

        /**
         *
         */
        'onMessage': function (message) {
            console.log('[Content] Metadata.onMessage()', message);

            switch (message.action) {
                case 'set-metadata':
                    this.setMetadataOnThumbnails(message.data.metadata);
                    break;
            }

            return true;
        },

        /**
         * Sets metadata as data- attributes on the corresponding thumbnails
         * @param {Object[]} metadata
         */
        'setMetadataOnThumbnails': function (metadata) {
            console.log('[Content] Metadata.setMetadataOnDeviations()', metadata);

            //TODO: store the metadata in localStorage so it can be re-used

            metadata.forEach((meta) => {
                const link = document.querySelector(`a[href*="${meta.url}"]`);

                if (link !== undefined && link !== null) {
                    const thumb = link.parentElement;
                    const target = (thumb !== undefined && thumb !== null) ? thumb : link;

                    if (meta.id) {
                        target.setAttribute('data-deviation-uuid', meta.id);
                    }

                    if (meta.category) {
                        target.setAttribute('data-category', meta.category);
                    }

                    if (meta.category_path) {
                        target.setAttribute('data-category-path', meta.category_path);
                    }

                    if (meta.tags && meta.tags.length) {
                        target.setAttribute('data-tags', meta.tags.join(' '));
                    }
                } else {
                    //TODO: this should probably be a warning, but I filter out warnings on the console...
                    console.error('[Content] Metadata.setMetadataOnDeviations() :: Could not Find Thumbnail for Metadata', meta);
                }
            });

            const thumbs = document.querySelectorAll('span.thumb:not([data-deviation-uuid])');
            if (thumbs.length) {
                //TODO: this should probably be a warning, but I filter out warnings on the console...
                console.error(`[Content] Metadata.setMetadataOnDeviations() :: There are ${thumbs.length} thumbnails missing metadata (of ${document.querySelectorAll('span.thumb').length} total thumbnails) after inserting metadata`);
            }
        },

        /**
         * Uses a MutationObserver to watch for the insertion of new thumb DOM nodes on the Browse Results page
         */
        'watchForNewThumbs' : function () {
            console.log('[Content] Metadata.watchForNewThumbs()');

            const browse = document.querySelector('#browse-results');
            if (browse !== undefined && browse !== null) {
                const target = browse.querySelector('.results-page-thumb'); //TODO: handle the "full view" browse mode

                if (target !== undefined && target !== null) {

                    const observer = new MutationObserver((mutations) => {
                        mutations.forEach((mutation) => {
                            if (mutation.addedNodes !== null) {
                                const newThumbs = [];
                                for (const node of mutation.addedNodes) {
                                    if ((node.tagName.toLowerCase() === 'span') && (node.className.split(' ').indexOf('thumb') !== -1)) {
                                        newThumbs.push(node);
                                    }
                                }

                                if (newThumbs.length) {
                                    //TODO: once metadata is saved in localStorage, check new thumbs against the stored data first
                                    browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                                    //this.getMetadataForThumbs(newThumbs);
                                }
                            }
                        });
                    });

                    observer.observe(target, { 'childList': true, 'subtree': true });
                }
            }
        },

        /**
         * Retrieves metadata for a specific range of thumbnails based on the URL and the thumbs in the DOM
         * @param {NodeList} newThumbs
         * @todo TODO: this doesn't work correctly after the page starts removing thumbnails from the top of the page
         */
        'getMetadataForThumbs': function (newThumbs) {
            console.log('[Content] Metadata.getMetadataForThumbs()', newThumbs);

            const thumbs = document.querySelectorAll('span.thumb');
            let offset = 0;
            for (offset = thumbs.length - 1; offset >= 0; offset--) {
                const uuid = thumbs[offset].getAttribute('data-deviation-uuid');
                if (uuid !== undefined && uuid !== null && uuid !== '') {
                    break;
                }
            }

            //TODO: once the page starts removing thumbs from the top, we can no longer simply add the offset from the URL to
            //      the calculated offset (as the URL offset may say 48, but in reality maybe only 24 have been removed)
            //      this would require a MutationObserver to track how many thumbnails have actually been removed and
            //      adjust the offset accordingly, and then the background script would need to ignore the URL offset altogether

            browser.runtime.sendMessage({
                'action': 'get-metadata-for-url',
                'data': {
                    'url': window.location.href,
                    'offset': offset,
                    'minimum': newThumbs.length
                }
            }).then(this.setMetadataOnThumbnails);
        }
    };

    return Metadata;

})();

export default Metadata;
