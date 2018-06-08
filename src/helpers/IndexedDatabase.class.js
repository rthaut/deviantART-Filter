import idb from 'idb';

const IndexedDatabase = (() => {

    class IndexedDatabase {

        /**
         * Constructor for IndexedDatabase
         * @param {string} databaseName the name of the database
         * @param {string} storeName the name of the store
         * @param {number} version the version of the database
         * @param {Callback} upgradeCallback the callback function to invoke when the database is opened or upgraded
         */
        constructor(databaseName, storeName, version, upgradeCallback) {
            this._storeName = storeName;

            this.openDB = idb.open(databaseName, version, upgradeCallback);
        }

        /**
         * Retrieves a record from the the object store
         * @param {*} key the key or key range that identifies the record to be retrieved
         * @returns {Promise<Object>} the retrieved record
         */
        Get(key) {
            return this.openDB.then(db => {
                return db.transaction(this._storeName).objectStore(this._storeName).get(key);
            });
        }

        /**
         * Retrieves all record from the the object store
         * @returns {Promise<Object[]>} the retrieved records
         */
        GetAll() {
            return this.openDB.then(db => {
                return db.transaction(this._storeName).objectStore(this._storeName).getAll();
            });
        }

        /**
         * Retrieves all keys from the the object store
         * @returns {Promise<Object[]>} the retrieved records
         */
        GetAllKeys() {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName);
                const keys = [];
                const store = tx.objectStore(this._storeName);
                (store.iterateKeyCursor || store.iterateCursor).call(store, cursor => {
                    if (!cursor) return;
                    keys.push(cursor.key);
                    cursor.continue();
                });
                return tx.complete.then(() => keys);
            });
        }

        /**
         * Updates an existing record in the the object store
         * @param {object} value the object to store
         * @param {*} [key] the key that identifies the record to be stored
         * @returns {Promise<void>}
         */
        Put(value, key = null) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).put(value, key);
                return tx.complete;
            });
        }

        /**
         * Updates multiple existing records in the the object store
         * @param {object[]} values the objects to store
         * @returns {Promise<IDBValidKey[]>} the keys of the updated records
         */
        PutMany(values) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                const store = tx.objectStore(this._storeName);
                return Promise.all(values.map(value => store.put(value)));
            });
        }

        /**
         * Inserts a record into the the object store
         * @param {object} value the object to store
         * @param {*} [key] the key that identifies the record to be stored
         * @returns {Promise<void>}
         */
        Add(value, key = null) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).add(value, key);
                return tx.complete;
            });
        }

        /**
         * Inserts multiple records into the the object store
         * @param {object[]} values the objects to store
         * @returns {Promise<IDBValidKey[]>} the keys of the inserted records
         */
        AddMany(values) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                const store = tx.objectStore(this._storeName);
                return Promise.all(values.map(value => store.add(value)));
            });
        }

        /**
         * Removes all records from the object store
         * @returns {Promise<void>}
         */
        Clear() {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).clear();
                return tx.complete;
            });
        }

        /**
         * Removes a record or range of records from the object store
         * @param {*} key the key or key range that identifies the record(s) to be removed
         * @returns {Promise<void>}
         */
        Delete(key) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).delete(key);
                return tx.complete;
            });
        }

        /**
         * Removes a range of records from the object store
         * @param {Index} [index] the index to use when iterating through the store
         * @param {string|number|IDBKeyRange|Date} range the key to or range of records to remove
         * @returns {Promise<void>}
         */
        DeleteRange(index, range) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                let store = tx.objectStore(this._storeName);
                if (index !== undefined && index !== null) {
                    store = store.index(index);
                }
                store.openCursor(range).then(function iterate(cursor) {
                    if (!cursor) return;
                    cursor.delete();
                    return cursor.continue().then(iterate);
                });
                return tx.complete;
            });
        }

    }

    return IndexedDatabase;

})();

export default IndexedDatabase;
