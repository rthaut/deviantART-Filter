/**
 * Base object for deviantART filters (sort of a wrapper for FilterObjects and FilterLists)
 */
class Filter {

    /**
     * Constructor
     * @param {String} label
     * @param {FilterList} list
     */
    constructor(label, list) {
        this.label = label;
        this.list = list;
    }

    /**
     * Imports an array of FilterObjects asynchronously
     * @param {Array<FilterObject>} data
     * @returns {Promise}
     */
    import(data) {
        console.log(this.label + '.import()');

        var self = this;
        var promise = new Promise(function (resolve, reject) {
            var results = {
                'total': data.length,
                'duplicate': 0,
                'invalid': 0,
                'success': 0
            };

            try {
            data.forEach(function (properties) {
                var filterObject = self.create(properties);
                if (!filterObject.isValid()) {
                    results.invalid++;
                } else {
                    if (self.hide(filterObject, false, false)) {
                        results.success++;
                    } else {
                        results.duplicate++;
                    }
                }
            });
            } catch (error) {
                console.error(error);
                consoe.log(self.label + '.import() :: Reject', error.message);
                reject(error.message);
            }

            self.list.save();
            self.apply();

            console.log(self.label + '.import() :: Resolve', results);
            resolve(results);
        });

        console.log(this.label + '.import() :: Return', promise);
        return promise;
    }

    /**
     * Creates a new FilterObject with the supplied properties
     * @param {Object} properties
     * @returns {FilterObject}
     */
    create(properties) {
        return new FilterObject('');
    }

    /**
     * Inserts DOM controls specific to the FilterList
     */
    insertDOMControls() {
        throw 'Not Implemented';
    }

    /**
     * Updates the DOM after changes are made to the list of FilterObjects
     */
    apply() {
        console.log(this.label + '.apply()');

        this.showAll();
        this.hideAll();

        console.log(this.label + '.apply() :: Complete');
    }

    /**
     * Hides all FilterObjects on the FilterList
     */
    hideAll() {
        throw 'Not Implemented';
    }

    /**
     * Shows all FilterObjects on the FilterList
     */
    showAll() {
        throw 'Not Implemented';
    }

    /**
     * Builds the table for managing the FilterList
     */
    getTable() {
        throw 'Not Implemented';
    }

    /**
     * Click event handler for the Clean Filter button
     * @param {Event} event
     */
    //@TODO the corresponding table (in the modal) needs to be refreshed/rebuilt (only if changes were made)
    cleanFilterListClickEventHandler(event) {
        console.log(this.label + '.cleanFilterListClickEventHandler()');

        event.preventDefault();

        var dialog = daDialog.modal('Your filters are currently being cleaned. You will be notified when this process is compete.', 'Importing Filters');

        var self = this;
        setTimeout(function () {
            self.list.cleanAsync().then(function (cleaned) {
                dialog.close();

                daDialog.alert('Your Filtered ' + self.label + ' have been cleaned successfully.')

                console.log(self.label + '.cleanFilterListClickEventHandler() :: Complete');
            });
        });
    }

    /**
     * Click event handler for the Reset Filter button
     * @param {Event} event
     */
    //@TODO the corresponding table (in the modal) needs to be refreshed/rebuilt
    resetFilterListClickEventHandler(event) {
        console.log(this.label + '.resetFilterListClickEventHandler()');

        event.preventDefault();

        var text = 'Are you sure you want to reset your Hidden ' + this.label + '?';
        var title = 'Confirm Reset';

        var self = this;

        daDialog.confirm(text, title, function (confirmed) {
            if (confirmed) {
                self.list.reset();
                daDialog.alert('All of your Filtered ' + this.label + ' have been reset successfully.')
            }
        });


        console.log(this.label + '.resetFilterListClickEventHandler() :: Complete');
    }

    /**
     * Determines if the specified FilterObject is currently hidden
     * @param {FilterObject} filterObject
     * @returns {Boolean}
     */
    isHidden(filterObject) {
        console.log(this.label + '.isHidden()');

        var idx = this.list.find(filterObject);
        var result = (idx >= 0);

        console.log(this.label + '.isHidden() :: Return', result);
        return result;
    }

    /**
     * Hides the specified FilterObject
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @param {Boolean} [apply=true]
     * @returns {Boolean}
     */
    hide(filterObject, apply = true, save = true) {
        console.log(this.label + '.hide()');

        var result = this.list.add(filterObject, save);

        if (apply) {
            this.apply();
        }

        console.log(this.label + '.hide() :: Return', result);
        return result;
    }

    /**
     * Shows the specified FilterObject
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @param {Boolean} [apply=true]
     * @returns {Boolean}
     */
    show(filterObject, apply = true, save = true) {
        console.log(this.label + '.show()');

        var result = this.list.remove(filterObject, save);

        if (apply) {
            this.apply();
        }

        console.log(this.label + '.show() :: Return', result);
        return result;
    }

    /**
     * Toggles the specified FilterObject
     * @param {FilterObject} filterObject
     * @param {Boolean} [save=true]
     * @param {Boolean} [apply=true]
     * @returns {Boolean}
     */
    toggle(filterObject, apply = true, save = true) {
        console.log(this.label + '.toggle()');

        var result = this.list.toggle(filterObject, save);

        if (apply) {
            this.apply();
        }

        console.log(this.label + '.toggle() :: Return', result);
        return result;
    }
}
