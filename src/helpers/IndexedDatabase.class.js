import idb from 'idb';

const IndexedDatabase = (() => {

    class IndexedDatabase {

        constructor(databaseName, storeName, version, upgradeCallback) {
            this._storeName = storeName;

            this.openDB = idb.open(databaseName, version, upgradeCallback);
        }

        Get(key) {
            return this.openDB.then(db => {
                return db.transaction(this._storeName).objectStore(this._storeName).get(key);
            });
        }

        GetAll() {
            return this.openDB.then(db => {
                return db.transaction(this._storeName).objectStore(this._storeName).getAll();
            });
        }

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

        Put(value, key = null) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).put(value, key);
                return tx.complete;
            });
        }

        PutMany(values) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                const store = tx.objectStore(this._storeName);
                return Promise.all(values.map(value => store.put(value)));
            });
        }

        Add(value, key = null) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).add(value, key);
                return tx.complete;
            });
        }

        AddMany(values) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                const store = tx.objectStore(this._storeName);
                return Promise.all(values.map(value => store.add(value)));
            });
        }

        Clear() {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).clear();
                return tx.complete;
            });
        }

        Delete(key) {
            return this.openDB.then(db => {
                const tx = db.transaction(this._storeName, 'readwrite');
                tx.objectStore(this._storeName).delete(key);
                return tx.complete;
            });
        }

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
