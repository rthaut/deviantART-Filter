/* global FilterList, UserObject */

/**
 * List of User objects representing deviantART users (a.k.a. deviants)
 * @extends FilterList
 */
class UserList extends FilterList {

    /**
     * Constructor
     */
    constructor() {
        super('hiddenUsers', 'Users');

        this._sheet;
    }

    /**
     * Cleans the stored FilterList of hidden users
     * @param {Boolean} [strict=false]
     * @returns {Boolean}
     */
    //@TODO move this to the Filter object and make it more generic?
    clean(strict = false) {
        console.log(this.listObjectName + '.clean()');

        var dirty = this.data,
            clean = [];
        var filterObject;
        var changed = false;

        console.log(this.listObjectName + '.clean() :: Dirty List Data', dirty);

        for (var i = 0; i < dirty.length; i++) {
            console.log(this.listObjectName + '.clean() :: Dirty FilterObject', dirty[i]);

            // changes specific to this type of FilterObject
            delete dirty[i]['userid'];
            dirty[i]['username'] = dirty[i]['username'].toLowerCase();
            filterObject = new UserObject(dirty[i]);

            // logic that should be standard for all FilterObject types
            if (strict) {
                if (filterObject.isComplete()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            } else {
                if (filterObject.isValid()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            }

        }

        console.log(this.listObjectName + '.clean() :: Cleaned List Data', clean);

        this.data = clean;
        this.save();

        if (changed) {
            var event = new CustomEvent('daFilter-list-cleaned', { 'detail': { 'listObjectName': this.listObjectName } });
            window.dispatchEvent(event);
        }

        console.log(this.listObjectName + '.clean() :: Return', changed);
        return changed;
    }
}
