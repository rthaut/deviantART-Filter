/**
 * Base list object for filterable deviantART objects
 */
class FilterList {

    /**
     * Constructor
     * @param {String} listKey
     * @param {String} listObjectName
     */
    constructor(listKey, listObjectName) {
        this._listKey = listKey;
        this.listObjectName = listObjectName;

        this.data = getStoredJSON(this._listKey, []);
    }

    /**
     * Stores the list of FilterObjects
     */
    save() {
        console.log(this.listObjectName + '.save()');

        setStoredJSON(this._listKey, this.data);

        var event = new CustomEvent('daFilter-list-saved', { detail: { listObjectName: this.listObjectName } });
        window.dispatchEvent(event);

        console.log(this.listObjectName + '.save() :: Complete');
    }

    /**
     * Cleans all FilterObjects in the FilterList
     * @param {Boolean} [strict=false]
     * @returns {Boolean}
     */
    clean(strict = false) {
        console.log(this.listObjectName + '.clean()');

        var changed = false;

        var event = new CustomEvent('daFilter-list-cleaned', { detail: { listObjectName: this.listObjectName } });
        window.dispatchEvent(event);

        console.log(this.listObjectName + '.clean() :: Return', changed);
        return changed;
    }

    /**
     * Cleans the stored FilterList of hidden users asynchronously
     * @param {Boolean} [strict=false]
     * @returns {Boolean}
     */
    cleanAsync(strict = false) {
        console.log(this.listObjectName + '.cleanAsync()');

        var self = this;
        var promise = new Promise(function (resolve, reject) {
            try {
                var changed = self.clean(strict);
                console.log(self.listObjectName + '.cleanAsync() :: Resolve', changed);
                resolve(changed);
            } catch (error) {
                console.error(error);
                console.log(self.listObjectName + '.cleanAsync() :: Reject', error.message);
                reject(error.message);
            }
        });

        console.log(this.listObjectName + '.cleanAsync() :: Return', promise);
        return promise;
    }

    /**
     * Removes all FilterObjects from the FilterList
     */
    reset() {
        console.log(this.listObjectName + '.reset()');

        this.data = [];
        this.save();

        var event = new CustomEvent('daFilter-list-reset', { detail: { listObjectName: this.listObjectName } });
        window.dispatchEvent(event);

        console.log(this.listObjectName + '.reset() :: Complete');
    }

    /**
     * Adds/removes the provided FilterObject to/from the current FilterList
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @returns {Number}
     */
    toggle(filterObject, save = true) {
        console.log(this.listObjectName + '.toggle()');

        var idx = this.find(filterObject);

        if (idx >= 0) {
            this.data.splice(idx, 1);
        } else {
            this.data.push(filterObject);
            idx = this.data.length - 1;
        }

        if (save) {
            this.save();
        }

        console.log(this.listObjectName + '.toggle() :: Return', idx);
        return idx;
    }

    /**
     * Adds the provided FilterObject to the current FilterList
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @returns {Boolean}
     */
    add(filterObject, save = true) {
        console.log(this.listObjectName + '.add()');

        var idx = this.find(filterObject);
        var found = (idx >= 0);

        if (!found) {
            this.data.push(filterObject);
            if (save) {
                this.save();
            }
        }

        // this returns true if the FilterObject was added to the FilterList (hence the negation on found)
        console.log(this.listObjectName + '.add() :: Return', !found);
        return !found;
    }

    /**
     * Removes the provided FilterObject from the current FilterList
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @returns {Boolean}
     */
    remove(filterObject, save = true) {
        console.log(this.listObjectName + '.remove()');

        var idx = this.find(filterObject);
        var found = (idx >= 0);

        if (found) {
            this.data.splice(idx, 1);
            if (save) {
                this.save();
            }
        }

        console.log(this.listObjectName + '.remove() :: Return', found);
        return found;
    }

    /**
     * Finds the provided FilterObject in this FilterList
     * @param {FilterObject} filterObject
     * @returns {Number}
     */
    find(filterObject) {
        console.log(this.listObjectName + '.find()');

        console.log(this.listObjectName + '.find() :: Looping through ' + this.data.length + ' object(s) in ' + this.listObjectName);
        var idx = -1,
            property;
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < filterObject._uniqueProperties.length; j++) {
                property = filterObject._uniqueProperties[j];
                if (typeof this.data[i][property] !== 'undefined' && this.data[i][property] !== null) {
                    if (this.data[i][property] === filterObject[property]) {
                        console.log(this.listObjectName + '.find() :: Found ' + filterObject._objectName + ' by ' + property + ' at index ' + i + '.');
                        idx = i;
                        break;
                    }
                }
            }
        }

        console.log(this.listObjectName + '.find() :: Return', idx);
        return idx;
    }
}
