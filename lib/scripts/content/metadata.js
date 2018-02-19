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
        'init': async function () {
            console.log('[Content] Metadata.init()');

            browser.runtime.onMessage.addListener(this.onMessage.bind(this));

            this.watchForNewThumbs();

            const { cacheMetadata } = browser.storage.sync.get('cacheMetadata');
            this.useCache = cacheMetadata;

            //TODO: this is mostly the same as the logic in watchForNewThumbs() (minus the call to initMetadataDB)
            //      there should probably be a wrapper function to pass the thumbnail NodeList to and let that do the rest...
            if (this.useCache) {
                await this.initMetadataDB();

                // try to load metadata from the IndexedDB first, then fallback to loading via the API
                const metadata = await this.getMetadataForThumbsFromDB(document.querySelectorAll('span.thumb'));
                if (metadata.length) {
                    this.setMetadataOnThumbnails(metadata, true);
                } else {
                    browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                }
            } else {
                browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                this.clearMetadataDB();
            }
        },

        /**
         *
         */
        'onMessage': function (message) {
            console.log('[Content] Metadata.onMessage()', message);

            switch (message.action) {
                case 'set-metadata':
                    if (this.useCache) {
                        this.saveMetadataToDB(message.data.metadata);
                    }
                    this.setMetadataOnThumbnails(message.data.metadata, false);
                    break;

                case 'toggle-metadata-cache':
                    //TODO: this logic should(?) be identical to the logic in init(), so it there should be a function for it
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
         * @param {Object[]} metadata -
         * @param {boolean} [requestMissingMetadata=false] - Request missing metadata after processing
         */
        'setMetadataOnThumbnails': function (metadata, requestMissingMetadata = false) {
            console.log('[Content] Metadata.setMetadataOnDeviations()', metadata);

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
                }
            });

            const thumbs = document.querySelectorAll('span.thumb:not([data-deviation-uuid])');
            if (thumbs.length) {
                console.error(`[Content] Metadata.setMetadataOnDeviations() :: There are ${thumbs.length} thumbnails missing metadata (of ${document.querySelectorAll('span.thumb').length} total thumbnails) after inserting metadata`);
                if (requestMissingMetadata) {
                    browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                }
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
                        mutations.forEach(async (mutation) => {
                            if (mutation.addedNodes !== null) {
                                const newThumbs = [];
                                for (const node of mutation.addedNodes) {
                                    if ((node.tagName.toLowerCase() === 'span') && (node.className.split(' ').indexOf('thumb') !== -1)) {
                                        newThumbs.push(node);
                                    }
                                }

                                if (newThumbs.length) {
                                    if (this.useCache) {
                                        const metadata = await this.getMetadataForThumbsFromDB(newThumbs);
                                        if (metadata.length) {
                                            this.setMetadataOnThumbnails(metadata, true);
                                        } else {
                                            browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                                        }
                                    } else {
                                        browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                                    }
                                }
                            }
                        });
                    });

                    observer.observe(target, { 'childList': true, 'subtree': true });
                }
            }
        },

        /**
         * Retrieves metadata for the specified thumbs from the IndexedDB
         * @param {NodeList} thumbs
         */
        'getMetadataForThumbsFromDB': async function (thumbs) {
            console.log('[Content] Metadata.getMetadataForThumbsFromDB()', thumbs);

            const urls = [];
            thumbs.forEach((thumb) => {
                const link = thumb.querySelector('a');
                if (link !== undefined && link !== null) {
                    urls.push(link.getAttribute('href'));
                }
            });

            const allMetadata = await this.getMetadataFromDB();

            const metadata = [];
            allMetadata.forEach((meta) => {
                if (urls.indexOf(meta.url) !== -1) {
                    metadata.push(meta);
                }
            });

            console.log('[Content] Metadata.getMetadataForThumbsFromDB() :: Return', metadata);
            return metadata;
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
        'saveMetadataToDB': function (metadata) {
            console.log('[Content] Metadata.saveMetadataToDB()', metadata);

            return this.getMetadataKeysFromDB().then((cached) => {
                // ensure we only attempt to store new, unique metadata obects in the IndexedDB
                const newMetadata = metadata.filter((val, idx, arr) => (cached.indexOf(val.url) === -1) && (arr.indexOf(val) === idx));

                console.log('[Content] Metadata.saveMetadataToDB() :: New Metadata', newMetadata);

                if (!newMetadata.length) {
                    console.log('[Content] Metadata.saveMetadataToDB() :: No New Metadata to Save');
                    return Promise.resolve();
                }

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
                        console.error('[Content] Metadata.saveMetadataToDB :: Transaction Error', event);
                        reject(event.target.error);
                    };

                    DBTransaction.oncomplete = (event) => {
                        console.log('[Content] Metadata.saveMetadataToDB() :: Transaction Complete', event);
                        resolve();
                    };

                    newMetadata.forEach((meta) => {
                        /**
                         * @type IDBRequest
                         */
                        const DBRequest = DBObjectStore.add(meta);
                        DBRequest.onsuccess = (event) => {
                            console.log('[Content] Metadata.saveMetadataToDB() :: Transaction Success', event);
                        };
                    });
                });
            });
        },

        /**
         * Returns all metadata currently stored in the IndexedDB
         * @return {Object[]}
         */
        'getMetadataFromDB': function () {
            console.log('[Content] Metadata.getMetadataFromDB()');

            return new Promise((resolve, reject) => {
                if (this.metadataDB === null) {
                    //TODO: maybe use a setInterval to re-attempt after a few seconds have passed instead...
                    reject(new Error('Metadata IndexedDB is not intialized'));
                    return;
                }

                /**
                 * @type IDBTransaction
                 */
                const DBTransaction = this.metadataDB.transaction([DB_STORE_NAME], 'readonly');

                /**
                 * @type IDBObjectStore
                 */
                const DBObjectStore = DBTransaction.objectStore(DB_STORE_NAME);

                const metadata = [];
                DBObjectStore.openCursor().onsuccess = (event) => {
                    /**
                     * @type IDBCursor
                     */
                    var cursor = event.target.result;
                    if (cursor) {
                        metadata.push(cursor.value);
                        cursor.continue();
                    } else {
                        console.log('[Content] Metadata.getMetadataFromDB() :: Return', metadata);
                        resolve(metadata);
                    }
                };
            });
        },

        /**
         * Returns the keys of all metadata currently stored in the IndexedDB
         * @return {string[]}
         */
        'getMetadataKeysFromDB': function () {
            console.log('[Content] Metadata.getMetadataKeysFromDB()');

            return new Promise((resolve, reject) => {
                if (this.metadataDB === null) {
                    //TODO: maybe use a setInterval to re-attempt after a few seconds have passed instead...
                    reject(new Error('Metadata IndexedDB is not intialized'));
                    return;
                }

                /**
                 * @type IDBTransaction
                 */
                const DBTransaction = this.metadataDB.transaction([DB_STORE_NAME], 'readonly');

                /**
                 * @type IDBObjectStore
                 */
                const DBObjectStore = DBTransaction.objectStore(DB_STORE_NAME);

                const keys = [];
                DBObjectStore.openKeyCursor().onsuccess = (event) => {
                    /**
                     * @type IDBCursor
                     */
                    var cursor = event.target.result;
                    if (cursor) {
                        keys.push(cursor.key);
                        cursor.continue();
                    } else {
                        console.log('[Content] Metadata.getMetadataKeysFromDB() :: Return', keys);
                        resolve(keys);
                    }
                };
            });

        }
    };

    return Metadata;

})();

export default Metadata;
