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
     * @param {Boolean} strictFiltering
     * @return {Boolean}
     */
    clean(strictFiltering = false) {
        console.group(this.listObjectName + '.clean()');

        var dirty = this.data,
            clean = [];
        var user;
        var changed = false;

        console.log('Dirty Users', dirty);

        for (var i = 0; i < dirty.length; i++) {
            console.log('Dirty User', dirty[i]);
            delete dirty[i]['userid'];
            dirty[i]['username'] = dirty[i]['username'].toLowerCase();
            user = new UserObject(dirty[i]['username']);

            if (strictFiltering) {
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

        console.log('Clean Users', clean);

        this.data = clean;
        this.save();

        console.log('Return', changed);
        console.log('Complete');
        console.groupEnd();

        return changed;
    }
}
