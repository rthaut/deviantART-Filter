const Metadata = (() => {

    const DB_NAME = 'metadata';
    const DB_STORE_NAME = 'metadata';
    const DB_VERSION = 1;

    const Metadata = {

        'useCache': false,

        /**
         * @type IDBDatabase
         */
        'metadataDB': null,

        /**
         *
         */
        'init': function () {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            this.watchForNewThumbs();

            browser.storage.sync.get('cacheMetadata').then(({ cacheMetadata }) => {
                this.useCache = cacheMetadata;
                if (this.useCache) {
                    this.initMetadataDB();
                } else {
                    this.clearMetadataDB();
                }
            });
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

                case 'toggle-metadata-cache':
                    //TODO: this logic is identical to the .then() in init() above... so it should only be defined once
                    this.useCache = message.data.cacheMetadata;
                    if (this.useCache) {
                        this.initMetadataDB();
                    } else {
                        this.clearMetadataDB();
                    }
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

            if (this.useCache) {
                this.saveMetadata(metadata);
            }

            metadata.forEach((meta) => {
                const link = document.querySelector(`a[href*="${meta.url}"]`);

                if (link !== undefined && link !== null) {
                    const thumb = link.parentElement;
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
        },

        /**
         * Initializes the IndexedDB for storing metadata locally
         */
        'initMetadataDB': function () {
            console.log('[Content] Metadata.initMetadataDB()');

            return new Promise((resolve, reject) => {
                const DBFactory = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

                /**
                 * @type IDBOpenDBRequest
                 */
                const DBOpenRequest = DBFactory.open(DB_NAME, DB_VERSION);
                console.log('[Content] Metadata.initMetadataDB :: DBOpenRequest', DBOpenRequest);

                DBOpenRequest.onerror = (event) => {
                    console.error('[Content] Metadata.initMetadataDB :: DBOpenRequest Error', event);
                    reject(event.target.error);
                };

                DBOpenRequest.onsuccess = (event) => {
                    console.log('[Content] Metadata.initMetadataDB() :: DBOpenRequest Success', event);

                    /**
                     * @type IDBDatabase
                     */
                    this.metadataDB = DBOpenRequest.result;

                    //TODO: we should clear out "old" metadata from the DB (presumably anything older than X days)

                    resolve();
                };

                DBOpenRequest.onupgradeneeded = (event) => {
                    console.log('[Content] Metadata.initMetadataDB() :: DBOpenRequest UpgradeNeeded', event);

                    /**
                     * @type IDBDatabase
                     */
                    const DBDatabase = event.target.result;

                    DBDatabase.onerror = function (event) {
                        console.error('[Content] Metadata.initMetadataDB :: DBOpenRequest UpgradeNeeded Error', event);
                        reject(event.target.error);
                    };

                    /**
                     * @type IDBObjectStore
                     */
                    const DBObjectStore = DBDatabase.createObjectStore(DB_STORE_NAME, { 'keyPath': 'url' });

                    DBObjectStore.createIndex('uuid', 'uuid', { 'unique': true });
                    DBObjectStore.createIndex('date_created', 'date_created', { 'unique': false });
                };
            });
        },

        /**
         * Clears all data from the IndexedDB used to store metadata locally
         */
        'clearMetadataDB': function () {
            console.log('[Content] Metadata.clearMetadataDB()');

            return new Promise((resolve, reject) => {

                if (this.metadataDB === null) {
                    //TODO: maybe use a setInterval to re-attempt after a few seconds have passed instead...
                    reject(new Error('Metadata IndexedDB is not intialized'));
                    return;
                }

                /**
                 * @type IDBTransaction
                 */
                const DBTransaction = this.metadataDB.transaction([DB_STORE_NAME], 'readwrite');

                /**
                 * @type IDBObjectStore
                 */
                const DBObjectStore = DBTransaction.objectStore(DB_STORE_NAME);

                DBTransaction.onerror = (event) => {
                    console.error('[Content] Metadata.clearMetadataDB :: Transaction Error', event);
                    reject(event.target.error);
                };

                DBTransaction.oncomplete = (event) => {
                    console.log('[Content] Metadata.clearMetadataDB() :: Transaction Complete', event);
                    resolve();
                };

                /**
                 * @type IDBRequest
                 */
                const DBRequest = DBObjectStore.clear();
                DBRequest.onsuccess = (event) => {
                    console.log('[Content] Metadata.clearMetadataDB() :: Transaction Success', event);
                };
            });
        },

        /**
         * Deletes the IndexedDB used to store metadata locally
         */
        'deleteMetadataDB': function () {
            console.log('[Content] Metadata.deleteMetadataDB()');

            //TODO: temporarilly(?) disabled to prevent blocking access to the database...
            //      it seems if an IndexedDB is deleted, it cannot be used again during that same browser session
            //      so this means the user cannot toggle the cache setting w/o restarting their browser
            //      (unless I am missing something, or doing something incorrectly, either here or during [re-]initialization)
            return Promise.resolve();

            // eslint-disable-next-line no-unreachable
            return new Promise((resolve, reject) => {
                /**
                 * @type IDBOpenDBRequest
                 */
                const DBDeleteRequest = window.indexedDB.deleteDatabase(DB_NAME);

                DBDeleteRequest.onerror = function (event) {
                    console.error('[Content] Metadata.deleteMetadataDB :: DBDeleteRequest Error', event);
                    reject(event.target.error);
                };

                DBDeleteRequest.onsuccess = function (event) {
                    console.log('[Content] Metadata.deleteMetadataDB :: DBDeleteRequest Success', event);
                    resolve();
                };
            });
        },

        /**
         * Stores metadata in the IndexedDB
         * @param {Object[]} metadata
         */
        'saveMetadata': function (metadata) {
            console.log('[Content] Metadata.saveMetadata()', metadata);

            return new Promise((resolve, reject) => {
                if (this.metadataDB === null) {
                    //TODO: maybe use a setInterval to re-attempt after a few seconds have passed instead...
                    reject(new Error('Metadata IndexedDB is not intialized'));
                    return;
                }

                /**
                 * @type IDBTransaction
                 */
                const DBTransaction = this.metadataDB.transaction([DB_STORE_NAME], 'readwrite');

                /**
                 * @type IDBObjectStore
                 */
                const DBObjectStore = DBTransaction.objectStore(DB_STORE_NAME);

                DBTransaction.onerror = (event) => {
                    console.error('[Content] Metadata.saveMetadata :: Transaction Error', event);
                    reject(event.target.error);
                };

                DBTransaction.oncomplete = (event) => {
                    console.log('[Content] Metadata.saveMetadata() :: Transaction Complete', event);
                    resolve();
                };

                metadata.forEach((meta) => {
                    //TODO: it seems we need to check if an entry for the current deviation already exists in the database...
                    //      otherwise, if there is a duplicate, we encounter a constraint error, which then prevents subsequent
                    //      requests in the transaction from succeeding, even if they are new/unique
                    //      it might be best to do that at the start of the function rather than one-by-one
                    //      (i.e. reduce the metadata array to just the new entries intially, then add them here)

                    /**
                     * @type IDBRequest
                     */
                    const DBRequest = DBObjectStore.add(meta);
                    DBRequest.onsuccess = (event) => {
                        console.log('[Content] Metadata.saveMetadata() :: Transaction Success', event);
                    };
                });
            });
        }
    };

    return Metadata;

})();

export default Metadata;
