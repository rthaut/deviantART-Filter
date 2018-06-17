import IndexedDatabase from '../../helpers/IndexedDatabase.class';

const MetadataCache = (() => {

    const DB_NAME = 'metadata';
    const DB_STORE_NAME = 'metadata';
    const DB_VERSION = 1;
    const DB_KEY_PATH = 'url';

    const MetadataDB = new IndexedDatabase(DB_NAME, DB_STORE_NAME, DB_VERSION, (DBDatabase) => {
        console.log('[Content] MetadataDB UpgradeDB Callback', DBDatabase);

        const DBObjectStore = DBDatabase.createObjectStore(DB_STORE_NAME, {
            'keyPath': DB_KEY_PATH
        });

        DBObjectStore.createIndex('uuid', 'uuid', {
            'unique': true
        });

        DBObjectStore.createIndex('date_cached', 'date_cached', {
            'unique': false
        });
    });

    const MetadataCache = {

        /**
         * Retrieves metadata for the specified thumbs from the IndexedDB
         * @param {NodeList} thumbs
         */
        'get': function (thumbs) {
            console.log('[Content] MetadataCache.get()', thumbs);

            const urls = [];
            thumbs.forEach((thumb) => {
                const link = thumb.querySelector('a');
                if (link !== undefined && link !== null) {
                    urls.push(link.getAttribute('href'));
                }
            });

            return MetadataDB.GetAll().then((cached) => {
                const metadata = [];
                cached.forEach((meta) => {
                    if (urls.indexOf(meta.url) !== -1) {
                        metadata.push(meta);
                    }
                });

                console.log('[Content] MetadataCache.get() :: Return', metadata);
                return metadata;
            });
        },

        /**
         * Stores metadata in the IndexedDB
         * @param {Object[]} metadata
         */
        'save': function (metadata) {
            console.log('[Content] MetadataCache.save()', metadata);

            metadata.map((meta) => {
                meta.date_cached = new Date();
                return meta;
            });

            return MetadataDB.PutMany(metadata).then((results) => {
                console.log('[Content] MetadataCache.save() :: Complete', results);
            }).catch((error) => {
                console.error('[Content] MetadataCache.save() :: Error', error);
            });
        },

        /**
         * Removes all data from the IndexedDB that is older than the supplied number of days
         * @param {number} days
         */
        'trim': function (days) {
            console.log('[Content] MetadataCache.trim()');

            const date = new Date();
            date.setDate(date.getDate() - days);
            console.log('[Content] MetadataCache.trim() :: Deleting Entries Created At/Before', date);

            const range = IDBKeyRange.upperBound(date);

            return MetadataDB.DeleteRange('date_cached', range).then(() => {
                console.log('[Content] MetadataCache.trim() :: Complete');
            }).catch((error) => {
                console.error('[Content] MetadataCache.trim() :: Error', error);
            });
        },

        /**
         * Completely removes all data from the IndexedDB
         */
        'clear': function () {
            console.log('[Content] MetadataCache.clear()');

            return MetadataDB.Clear().then(() => {
                console.log('[Content] MetadataCache.clear() :: Complete');
            });
        }

    };

    return MetadataCache;

})();

export default MetadataCache;
