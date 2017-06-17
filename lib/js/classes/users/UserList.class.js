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
    clean(strict = false) {
        console.log(this.listObjectName + '.clean()');

        var dirty = this.data,
            clean = [];
        var user;
        var changed = false;

        console.log(this.listObjectName + '.clean() :: Dirty Users', dirty);

        for (var i = 0; i < dirty.length; i++) {
            console.log(this.listObjectName + '.clean() :: Dirty User', dirty[i]);
            delete dirty[i]['userid'];
            dirty[i]['username'] = dirty[i]['username'].toLowerCase();
            user = new UserObject(dirty[i]['username']);

            if (strict) {
                if (user.isComplete()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            } else {
                if (user.isValid()) {
                    clean.push(dirty[i]);
                } else {
                    changed = true;
                }
            }
        }

        console.log(this.listObjectName + '.clean() :: Clean Users', clean);

        this.data = clean;
        this.save();

        console.log(this.listObjectName + '.clean() :: Return', changed);
        return changed;
    }
}
