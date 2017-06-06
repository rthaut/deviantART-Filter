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
        console.group(this.listObjectName + '.save()');

        setStoredJSON(this._listKey, this.data);

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Cleans all FilterObjects in the FilterList
     */
    clean() {
        throw 'Not Implemented';
    }

    /**
     * Removes all FilterObjects from the FilterList
     */
    reset() {
        console.group(this.listObjectName + '.reset()');

        this.data = [];
        this.save();

        console.log('Complete');
        console.groupEnd();
    }

    /**
     * Adds/removes the provided FilterObject to/from the current FilterList
     * @param {FilterObject} filterObject
     * @return {Number}
     */
    toggle(filterObject) {
        console.group(this.listObjectName + '.toggle()');

        var idx = this.find(filterObject);

        if (idx >= 0) {
            this.data.splice(idx, 1);
        } else {
            this.data.push(filterObject);
            idx = this.data.length - 1;
        }

        this.save();

        console.log('Return', idx);
        console.log('Complete');
        console.groupEnd();

        return idx;
    }

    /**
     * Adds the provided FilterObject to the current FilterList
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    add(filterObject) {
        console.group(this.listObjectName + '.add()');

        var idx = this.find(filterObject);
        var found = (idx >= 0);

        if (!found) {
            this.data.push(filterObject);
            this.save();
        }

        console.log('Return', found);
        console.log('Complete');
        console.groupEnd();

        return found;
    }

    /**
     * Removes the provided FilterObject from the current FilterList
     * @param {FilterObject} filterObject
     * @return {Boolean}
     */
    remove(filterObject) {
        console.group(this.listObjectName + '.remove()');

        var idx = this.find(filterObject);
        var found = (idx >= 0);

        if (found) {
            this.data.splice(idx, 1);
            this.save();
        }

        console.log('Return', found);
        console.log('Complete');
        console.groupEnd();

        return found;
    }

    /**
     * Finds the provided FilterObject in this FilterList
     * @param {FilterObject} filterObject
     * @return {Number}
     */
    find(filterObject) {
        console.group(this.listObjectName + '.find()');

        console.log('Looping through ' + this.data.length + ' object(s) in ' + this.listObjectName);
        var idx = -1,
            property;
        for (var i = 0; i < this.data.length; i++) {
            for (var j = 0; j < filterObject._uniqueProperties.length; j++) {
                property = filterObject._uniqueProperties[j];
                if (typeof this.data[i][property] !== 'undefined' && this.data[i][property] !== null) {
                    if (this.data[i][property] === filterObject[property]) {
                        console.log('Found ' + filterObject._objectName + ' by ' + property + ' at index ' + i + '.');
                        idx = i;
                        break;
                    }
                }
            }
        }

        console.log('Return', idx);
        console.log('Complete');
        console.groupEnd();

        return idx;
    }
}
