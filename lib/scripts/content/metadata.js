const Metadata = (() => {

    /**
     * @type IDBFactory
     */
    const DBFactory = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

    const DB_NAME = 'metadata';
    const DB_STORE_NAME = 'metadata';
    const DB_VERSION = 1;

    /**
     * Returns an Object Store for the given IndexedDB
     * @param {IDBDatabase} DBDatabase
     * @param {IDBTransactionMode} [DBTransactionMode=readonly]
     * @param {function} [resolve]
     * @param {function} [reject]
     */
    const _getDBObjectStore = function (DBDatabase, DBTransactionMode='readonly', resolve, reject) {
        console.log('Metadata._getDBObjectStore()', DBDatabase, DBTransactionMode, resolve, reject);

        const DBTransaction = DBDatabase.transaction([DB_STORE_NAME], DBTransactionMode);

        DBTransaction.onerror = (event) => {
            console.error('IDBTransaction Error', event);
            if (typeof reject === 'function') {
                reject(event.target.error);
            }
        };

        DBTransaction.oncomplete = (event) => {
            console.log('IDBTransaction Complete', event);
            if (typeof resolve === 'function') {
                resolve(event);
            }
        };

        const DBObjectStore = DBTransaction.objectStore(DB_STORE_NAME);

        console.log('Metadata._getDBObjectStore() :: Return', DBObjectStore);
        return DBObjectStore;
    };

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

            await this.initMetadataDB();

            const { metadataCacheTTL } = await browser.storage.sync.get('metadataCacheTTL');
            this.useCache = parseInt(metadataCacheTTL, 10) > 0;

            this.handleThumbs(document.querySelectorAll('span.thumb'));

            if (this.useCache) {
                //TODO: clear out "old" entries in the IndexedDB
            } else {
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

                case 'metadata-cache-ttl-changed':
                    //TODO: if the new cache TTL is > 0, clear out anything older than the new cache TTL
                    //TODO: else if the new cache TTL <= 0, clear the entire Metadata DB and negate the useCache flag
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
         * Handles metadata retrieval and/or insertion for the supplied thumbnails
         * @param {NodeList} thumbs
         */
        'handleThumbs': async function (thumbs) {
            console.log('[Content] Metadata.handleThumbs()', thumbs);

            if (!thumbs.length) {
                return false;
            }

            if (this.useCache) {
                // try to load metadata from the IndexedDB first, then fallback to passively requesting via the API
                const metadata = await this.getMetadataForThumbsFromDB(thumbs);
                if (metadata.length) {
                    this.setMetadataOnThumbnails(metadata, true);
                } else {
                    browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
                }
            } else {
                browser.runtime.sendMessage({ 'action': 'send-metadata-to-tab' });
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

            //TODO: maybe set a new flag to indicate the DB is being initialized? and store the promise as a class property?
            //      that way whenever a method that needs the DB is called, it can wait for the promise to resolve when needed

            return new Promise((resolve, reject) => {
                const DBOpenRequest = DBFactory.open(DB_NAME, DB_VERSION);
                console.log('[Content] Metadata.initMetadataDB :: DBOpenRequest', DBOpenRequest);

                DBOpenRequest.onerror = (event) => {
                    console.error('[Content] Metadata.initMetadataDB :: DBOpenRequest Error', event);
                    reject(event.target.error);
                };

                DBOpenRequest.onsuccess = (event) => {
                    console.log('[Content] Metadata.initMetadataDB() :: DBOpenRequest Success', event);

                    this.metadataDB = DBOpenRequest.result;

                    resolve();
                };

                DBOpenRequest.onupgradeneeded = (event) => {
                    console.log('[Content] Metadata.initMetadataDB() :: DBOpenRequest UpgradeNeeded', event);

                    const DBDatabase = event.target.result;

                    DBDatabase.onerror = function (event) {
                        console.error('[Content] Metadata.initMetadataDB :: DBOpenRequest UpgradeNeeded Error', event);
                        reject(event.target.error);
                    };

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
                    reject(new Error('Metadata IndexedDB is not initialized'));
                    return;
                }

                const DBObjectStore = _getDBObjectStore(this.metadataDB, 'readwrite', resolve, reject);

                DBObjectStore.clear().onsuccess = (event) => {
                    console.log('[Content] Metadata.clearMetadataDB() :: Transaction Success', event);
                };
            });
        },

        /**
         * Deletes the IndexedDB used to store metadata locally
         */
        'deleteMetadataDB': function () {
            console.log('[Content] Metadata.deleteMetadataDB()');

            //TODO: temporarily(?) disabled to prevent blocking access to the database...
            //      it seems if an IndexedDB is deleted, it cannot be used again (re-initialized) during the same browser session
            //      so this means the user cannot toggle the cache setting w/o restarting their browser
            //      (unless I am missing something, or doing something incorrectly, either here or during [re-]initialization)
            return Promise.resolve();

            // eslint-disable-next-line no-unreachable
            return new Promise((resolve, reject) => {
                const DBDeleteRequest = window.indexedDB.deleteDatabase(DB_NAME);

                DBDeleteRequest.onerror = (event) => {
                    console.error('[Content] Metadata.deleteMetadataDB :: DBDeleteRequest Error', event);
                    reject(event.target.error);
                };

                DBDeleteRequest.onsuccess = (event) => {
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
                // ensure we only attempt to store new, unique metadata objects in the IndexedDB
                const newMetadata = metadata.filter((val, idx, arr) => (cached.indexOf(val.url) === -1) && (arr.indexOf(val) === idx));

                console.log('[Content] Metadata.saveMetadataToDB() :: New Metadata', newMetadata);

                if (!newMetadata.length) {
                    console.log('[Content] Metadata.saveMetadataToDB() :: No New Metadata to Save');
                    return Promise.resolve();
                }

                return new Promise((resolve, reject) => {
                    if (this.metadataDB === null) {
                        //TODO: maybe use a setInterval to re-attempt after a few seconds have passed instead...
                        reject(new Error('Metadata IndexedDB is not initialized'));
                        return;
                    }

                    const DBObjectStore = _getDBObjectStore(this.metadataDB, 'readwrite', resolve, reject);

                    newMetadata.forEach((meta) => {
                        // store the time this value was added to the IndexedDB so we can remove stale data
                        meta.date_created = new Date();
                        DBObjectStore.add(meta).onsuccess = (event) => {
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
                    reject(new Error('Metadata IndexedDB is not initialized'));
                    return;
                }

                const DBObjectStore = _getDBObjectStore(this.metadataDB, 'readonly', resolve, reject);

                const metadata = [];
                DBObjectStore.openCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
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
                    reject(new Error('Metadata IndexedDB is not initialized'));
                    return;
                }

                const DBObjectStore = _getDBObjectStore(this.metadataDB, 'readonly', resolve, reject);

                const keys = [];
                DBObjectStore.openKeyCursor().onsuccess = (event) => {
                    const cursor = event.target.result;
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
